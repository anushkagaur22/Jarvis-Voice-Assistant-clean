from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from pydantic import BaseModel
from fastapi.responses import RedirectResponse

from database import get_db, engine
from models import Base, User, Conversation, Message, ProductivitySnapshot, Memory
from auth import (
    get_current_user,
    verify_password,
    hash_password,
    create_access_token
)

from integrations.github import get_github_stats
from integrations.leetcode import get_leetcode_stats
from performance.scoring import calculate_performance_score
from ai import ask_ai
from memory_service import save_memory, get_memory_context, extract_memory

# ---------------- APP ----------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# ---------------- SCHEMAS ----------------

class SignupRequest(BaseModel):
    email: str
    password: str
    github_username: str | None = None
    leetcode_username: str | None = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ChatRequest(BaseModel):
    message: str
    conversation_id: int | None = None

class SettingsRequest(BaseModel):
    profileName: str | None = None
    theme: str | None = None
    darkMode: bool | None = None
    voiceInput: bool | None = None
    voiceRate: float | None = None
    apiKey: str | None = None

# ---------------- AUTH ----------------

@app.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()

    if existing:
        raise HTTPException(400, "User already exists")

    user = User(
        email=data.email,
        password=hash_password(data.password),
        github_username=data.github_username,
        leetcode_username=data.leetcode_username
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"user_id": user.id})

    return {"access_token": token, "token_type": "bearer"}

@app.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(404, "User not found")

    if not verify_password(data.password, user.password):
        raise HTTPException(401, "Invalid password")

    token = create_access_token({"user_id": user.id})

    return {"access_token": token, "token_type": "bearer"}

@app.get("/auth/google")
def google_login():
    return RedirectResponse("https://accounts.google.com/o/oauth2/v2/auth")

# ---------------- CHAT ----------------

@app.post("/chat")
def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if req.conversation_id:
        convo = db.query(Conversation).filter(Conversation.id == req.conversation_id).first()

        if not convo:
            raise HTTPException(status_code=404, detail="Conversation not found")

        if convo.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Unauthorized access")

    else:
        # Create new conversation if no ID provided
        convo = Conversation(user_id=current_user.id, title="New Chat")
        db.add(convo)
        db.commit()
        db.refresh(convo)

    # Save User Message
    db.add(Message(conversation_id=convo.id, role="user", content=req.message))
    db.commit()

    # Memory Save
    memory = extract_memory(req.message)
    if memory:
        key, value = memory
        save_memory(db, current_user.id, key, value)

    # Memory Load
    memory_context = get_memory_context(db, current_user.id)

    # Load Chat History
    history = db.query(Message).filter(
        Message.conversation_id == convo.id
    ).order_by(Message.id.asc()).limit(20).all()

    messages = []
    if memory_context:
        messages.append({"role": "system", "content": f"User info:\n{memory_context}"})

    for m in history:
        messages.append({"role": m.role, "content": m.content})

    # AI Request
    reply = ask_ai(messages)

    # Save AI Message
    db.add(Message(conversation_id=convo.id, role="assistant", content=reply))
    db.commit()

    return {"reply": reply, "conversation_id": convo.id}

# ---------------- HISTORY ----------------

@app.get("/conversations")
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conversations = db.query(Conversation).filter(
        Conversation.user_id == current_user.id
    ).order_by(Conversation.updated_at.desc()).all()

    result = []
    for c in conversations:
        message_count = db.query(func.count(Message.id)).filter(
            Message.conversation_id == c.id
        ).scalar()

        last_msg = db.query(Message).filter(
            Message.conversation_id == c.id
        ).order_by(Message.id.desc()).first()

        preview = last_msg.content[:60] if last_msg else "No messages yet..."

        result.append({
            "id": c.id,
            "title": c.title,
            "updated_at": c.updated_at,
            "preview": preview,
            "message_count": message_count
        })

    return result

@app.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    convo = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()

    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.id.asc()).all()

    return {"id": convo.id, "title": convo.title, "messages": messages}

# ---------------- PERFORMANCE / DASHBOARD ----------------

@app.post("/performance/sync")
def sync_productivity(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    github = get_github_stats(current_user.github_username)
    leetcode = get_leetcode_stats(current_user.leetcode_username)

    commits = github.get("commits", 0)
    solved = leetcode.get("solved", 0)
    score = calculate_performance_score(commits, solved, 0, 0)

    snapshot = ProductivitySnapshot(
        user_id=current_user.id,
        github_commits=commits,
        leetcode_solved=solved,
        productivity_score=score
    )

    db.add(snapshot)
    db.commit()

    return {
        "github_commits": commits,
        "leetcode_solved": solved,
        "productivity_score": score
    }

@app.get("/dashboard/summary")
def dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    latest = db.query(ProductivitySnapshot).filter(
        ProductivitySnapshot.user_id == current_user.id
    ).order_by(ProductivitySnapshot.created_at.desc()).first()

    if not latest:
        return {"message": "No data"}

    return {
        "github_commits": latest.github_commits,
        "leetcode_solved": latest.leetcode_solved,
        "productivity_score": latest.productivity_score
    }

# ✅ FIXED: Routes are now /dashboard/weekly and /dashboard/heatmap to match React
@app.get("/dashboard/weekly")
def get_weekly_trend(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch the last 7 days of productivity snapshots
    recent_snapshots = db.query(ProductivitySnapshot).filter(
        ProductivitySnapshot.user_id == current_user.id
    ).order_by(ProductivitySnapshot.created_at.desc()).limit(7).all()

    # Format for Recharts area chart
    trend_data = []
    for snap in reversed(recent_snapshots): # Reverse so chronological order
        trend_data.append({
            "date": snap.created_at.isoformat(),
            "score": snap.productivity_score
        })
        
    # Provide mock data if the user is brand new so the chart isn't empty
    if not trend_data:
        return [{"date": str(datetime.now().date()), "score": 0}]

    return trend_data

@app.get("/dashboard/heatmap")
def get_heatmap_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch all snapshots to populate the heatmap grid
    snapshots = db.query(ProductivitySnapshot).filter(
        ProductivitySnapshot.user_id == current_user.id
    ).all()
    
    heatmap = []
    for snap in snapshots:
        # Determine color intensity based on score (1 to 4)
        intensity = 1
        if snap.productivity_score > 20: intensity = 2
        if snap.productivity_score > 50: intensity = 3
        if snap.productivity_score > 80: intensity = 4
            
        heatmap.append({
            "date": snap.created_at.date().isoformat(),
            "count": intensity 
        })
        
    return heatmap

# ---------------- SETTINGS ----------------

@app.get("/settings")
def get_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(Memory).filter(Memory.user_id == current_user.id).all()
    return {s.key: s.value for s in settings}

@app.post("/settings")
def save_settings(
    data: SettingsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    for key, value in data.model_dump(exclude_none=True).items():
        existing = db.query(Memory).filter(
            Memory.user_id == current_user.id,
            Memory.key == key
        ).first()

        if existing:
            existing.value = str(value)
        else:
            db.add(Memory(user_id=current_user.id, key=key, value=str(value)))

    db.commit()
    return {"message": "Settings saved"}