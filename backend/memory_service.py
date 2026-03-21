from sqlalchemy.orm import Session
from models import Memory


def save_memory(db: Session, user_id: int, key: str, value: str):
    existing = db.query(Memory).filter(
        Memory.user_id == user_id,
        Memory.key == key
    ).first()

    if existing:
        existing.value = value
    else:
        mem = Memory(user_id=user_id, key=key, value=value)
        db.add(mem)

    db.commit()


def get_memory_context(db: Session, user_id: int):
    memories = db.query(Memory).filter(
        Memory.user_id == user_id
    ).all()

    return "\n".join([f"{m.key}: {m.value}" for m in memories])

# memory_service.py

def extract_memory(text: str):
    text = text.lower()

    if "my name is" in text:
        return ("name", text.split("my name is")[-1].strip())

    if "i like" in text:
        return ("likes", text.split("i like")[-1].strip())

    if "i am" in text:
        return ("identity", text.split("i am")[-1].strip())

    return None