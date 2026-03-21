from sqlalchemy.orm import Session
from models import Memory


# ✅ SAVE MEMORY
def save_memory(db: Session, user_id: int, key: str, value: str):
    existing = db.query(Memory).filter_by(
        user_id=user_id,
        key=key
    ).first()

    if existing:
        existing.value = value
    else:
        new_memory = Memory(
            user_id=user_id,
            key=key,
            value=value
        )
        db.add(new_memory)

    db.commit()


# ✅ GET MEMORY CONTEXT
def get_memory_context(db: Session, user_id: int):
    memories = db.query(Memory).filter_by(user_id=user_id).all()

    if not memories:
        return ""

    return " | ".join([
        f"{m.key}: {m.value}" for m in memories
    ])