# FastAPI entrypoint

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from claude import ClaudeAPI

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    expert_mode: bool = False

class ChatResponse(BaseModel):
    reply: str
    role: str

# Initialize Claude API
claude_api = ClaudeAPI()

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # Convert messages to the format expected by Claude API
        chat_history = [{"role": msg.role, "content": msg.content} for msg in request.messages[:-1]]
        current_message = request.messages[-1].content

        # Choose the appropriate method based on expert mode
        if request.expert_mode:
            response = await claude_api.analyze_network_issue(current_message, chat_history)
        else:
            response = await claude_api.get_response(current_message, chat_history)

        if response["status"] == "error":
            raise HTTPException(status_code=500, detail=response["message"])

        return ChatResponse(
            reply=response["message"],
            role=response["role"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}") 