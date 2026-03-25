import os
from datetime import datetime
from dotenv import load_dotenv

# FastAPI & Starlette Imports
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from starlette.middleware.sessions import SessionMiddleware

# Database & Authlib Imports
from sqlalchemy.orm import Session
from sqlalchemy import func
from authlib.integrations.starlette_client import OAuth

# Load environment variables first
load_dotenv()

# Local Application Imports
from database import get_db, engine
from models import Base, User, Conversation, Message, ProductivitySnapshot, Memory
from auth import (
    get_current_user,
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token
)
from integrations.github import get_github_stats
from integrations.leetcode import get_leetcode_stats
from performance.scoring import calculate_performance_score
from ai import ask_ai
from memory_service import save_memory, get_memory_context, extract_memory

# ---------------- APP INITIALIZATION ----------------

app = FastAPI()

# ✅ 1. SESSION MUST COME FIRST
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SESSION_SECRET", "jarvis-super-secret-session-key")
)

# ✅ 2. THEN CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://jarvisvoiceassistant220.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 3. THEN DATABASE
Base.metadata.create_all(bind=engine)


# ---------------- OAUTH (GOOGLE) SETUP ----------------

oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

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

class RefreshRequest(BaseModel):
    refresh_token: str

# ---------------- ROOT ----------------

@app.get("/")
def read_root():
    return {"status": "Jarvis Backend is successfully running!"}

# ---------------- AUTH ROUTES ----------------

@app.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

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
        raise HTTPException(status_code=404, detail="User not found")
    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid password")

    access_token = create_access_token({"user_id": user.id})
    refresh_token = create_refresh_token(user.id)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@app.post("/refresh")
def refresh_token(req: RefreshRequest):
    user_id = verify_refresh_token(req.refresh_token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    new_access = create_access_token({"user_id": user_id})
    return {"access_token": new_access}


@app.get("/auth/google")
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    if not user_info or not user_info.get("email"):
        raise HTTPException(status_code=400, detail="Failed to fetch user info from Google")

    email = user_info["email"]
    user = db.query(User).filter(User.email == email).first()

    if not user:
        user = User(email=email, password="google_user")
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token({"user_id": user.id})
    refresh_token = create_refresh_token(user.id)

    FRONTEND_URL = os.getenv("FRONTEND_URL", "https://jarvisvoiceassistant220.vercel.app")
    return RedirectResponse(
        url=f"{FRONTEND_URL}/auth-success?token={access_token}&refresh={refresh_token}"
    )

# ---------------- CHAT ROUTES ----------------

@app.post("/chat")
def chat(
    req: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        if req.conversation_id:
            convo = db.query(Conversation).filter(
                Conversation.id == req.conversation_id
            ).first()
            if not convo:
                raise HTTPException(status_code=404, detail="Conversation not found")
            if convo.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Unauthorized")
        else:
            convo = Conversation(user_id=current_user.id, title="New Chat")
            db.add(convo)
            db.commit()
            db.refresh(convo)

        db.add(Message(conversation_id=convo.id, role="user", content=req.message))
        db.commit()

        # Memory extraction & retrieval
        memory = extract_memory(req.message)
        if memory:
            key, value = memory
            save_memory(db, current_user.id, key, value)

        memory_context = get_memory_context(db, current_user.id)

        history = db.query(Message).filter(
            Message.conversation_id == convo.id
        ).order_by(Message.id.asc()).limit(20).all()

        messages = []
        if memory_context:
            messages.append({"role": "system", "content": f"User info:\n{memory_context}"})
        for m in history:
            messages.append({"role": m.role, "content": m.content})

        try:
            reply = ask_ai(messages)
        except Exception as e:
            print("AI ERROR:", e)
            reply = "AI is temporarily unavailable."

        db.add(Message(conversation_id=convo.id, role="assistant", content=reply))
        db.commit()

        return {"reply": reply, "conversation_id": convo.id}

    except HTTPException:
        raise
    except Exception as e:
        print("CHAT ERROR:", e)
        raise HTTPException(status_code=500, detail=str(e))

# ---------------- CONVERSATION ROUTES ----------------

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

# ---------------- PERFORMANCE / DASHBOARD ROUTES ----------------

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
        return {"message": "No data yet. Run /performance/sync first."}

    return {
        "github_commits": latest.github_commits,
        "leetcode_solved": latest.leetcode_solved,
        "productivity_score": latest.productivity_score
    }


@app.get("/dashboard/weekly")
def get_weekly_trend(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    recent_snapshots = db.query(ProductivitySnapshot).filter(
        ProductivitySnapshot.user_id == current_user.id
    ).order_by(ProductivitySnapshot.created_at.desc()).limit(7).all()

    trend_data = [
        {
            "date": snap.created_at.isoformat(),
            "score": snap.productivity_score
        }
        for snap in reversed(recent_snapshots)
    ]

    if not trend_data:
        return [{"date": str(datetime.now().date()), "score": 0}]

    return trend_data


@app.get("/dashboard/heatmap")
def get_heatmap_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    snapshots = db.query(ProductivitySnapshot).filter(
        ProductivitySnapshot.user_id == current_user.id
    ).all()

    def score_to_intensity(score: float) -> int:
        if score > 80: return 4
        if score > 50: return 3
        if score > 20: return 2
        return 1

    return [
        {
            "date": snap.created_at.date().isoformat(),
            "count": score_to_intensity(snap.productivity_score)
        }
        for snap in snapshots
    ]

# ---------------- SETTINGS ROUTES ----------------

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