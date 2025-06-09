# FastAPI entrypoint
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import logging
import json
import asyncio
from contextlib import asynccontextmanager
from huggingface_api import HuggingFaceAPI

# Настраиваем логирование
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Инициализируем Hugging Face API
ai_api = HuggingFaceAPI()

# Модель для запроса чата
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    is_expert_mode: Optional[bool] = False
    chat_history: Optional[List[Dict]] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

# Создаем FastAPI приложение
app = FastAPI(lifespan=lifespan)

# Настраиваем CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/chat")
async def chat(request: ChatRequest):
    """Endpoint для обработки сообщений от веб-интерфейса"""
    try:
        logger.info(f"Received message: {request.message}")
        response = await ai_api.get_response(request.message, request.chat_history)
        logger.info(f"AI response: {response}")
        
        if response.get("status") == "error":
            return {
                "status": "error",
                "message": response.get("message", "Произошла ошибка при обработке запроса"),
                "role": "system"
            }
            
        return {
            "status": "success",
            "response": response.get("message", ""),
            "role": response.get("role", "assistant")
        }
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return {
            "status": "error",
            "message": "Произошла ошибка при обработке запроса. Пожалуйста, попробуйте позже.",
            "role": "system"
        }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint для обработки сообщений от веб-интерфейса"""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            response = await ai_api.get_response(message["message"])
            await websocket.send_json(response)
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"Error in websocket: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 