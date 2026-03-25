from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Float, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

# ---------------- USER ----------------

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))

    github_username = Column(String(255))
    leetcode_username = Column(String(255))

# ---------------- CHAT ----------------

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))

    title = Column(String(255), default="New Conversation")

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # 🔥 FIXED: The relationship block is now correctly inside the class!
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete",
        lazy="selectin"
    )

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"))

    role = Column(String(50))
    content = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")

# ---------------- PRODUCTIVITY ----------------

class ProductivitySnapshot(Base):
    __tablename__ = "productivity_snapshots"

    id = Column(Integer, primary_key=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    github_commits = Column(Integer, default=0)
    leetcode_solved = Column(Integer, default=0)
    calendar_events = Column(Integer, default=0)
    notion_tasks_completed = Column(Integer, default=0)

    productivity_score = Column(Float)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
# ---------------- AI MEMORY ----------------

class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    key = Column(String(100))
    value = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())