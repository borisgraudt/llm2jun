import os
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
import httpx
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import shutil
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext

load_dotenv()

TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")
TOGETHER_MODEL = os.getenv("TOGETHER_MODEL", "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free")

app = FastAPI()

# Разрешаем CORS для фронта (localhost:5173 — стандартный порт Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --- База данных ---
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")
print("DATABASE_URL:", SQLALCHEMY_DATABASE_URL)
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

Base.metadata.create_all(bind=engine)

# --- Пароли ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

# --- Pydantic схемы ---
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# --- Зависимость для сессии ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Эндпоинт регистрации ---
@app.post("/api/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    hashed = get_password_hash(data.password)
    new_user = User(email=data.email, hashed_password=hashed)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"ok": True, "id": new_user.id, "email": new_user.email}

@app.post("/api/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not pwd_context.verify(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль")
    return {"ok": True, "email": user.email}

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str

@app.post("/api/ai-chat", response_model=ChatResponse)
async def ai_chat(request: ChatRequest):
    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": TOGETHER_MODEL,
        "prompt": f"Ты — AI-ассистент, отвечай на русском языке. Вопрос пользователя: {request.message}\nAI:",
        "max_tokens": 100,
        "temperature": 0.7,
        "stop": ["Пользователь:", "AI:"]
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.together.xyz/v1/completions",
            headers=headers,
            json=payload
        )
        if response.status_code == 401:
            return {"reply": "[Ошибка: Together API ключ неверный или не указан. Проверьте TOGETHER_API_KEY в .env]"}
        if response.status_code != 200:
            return {"reply": f"[Ошибка Together API: {response.status_code}]"}
        data = response.json()
        reply = data.get('choices', [{}])[0].get('text', '[Нет ответа от Together API]')
        return {"reply": reply.strip()}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    # Разрешённые типы файлов
    allowed_types = [
        "image/png", "image/jpeg", "text/plain", "application/octet-stream"
    ]
    allowed_ext = [".png", ".jpg", ".jpeg", ".txt", ".log"]
    ext = os.path.splitext(file.filename)[1].lower()
    if file.content_type not in allowed_types and ext not in allowed_ext:
        return JSONResponse(status_code=400, content={"error": "Недопустимый тип файла"})
    save_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    url = f"/uploads/{file.filename}"
    return {"url": url, "filename": file.filename} 