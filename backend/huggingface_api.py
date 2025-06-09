import os
import logging
from typing import Dict, List, Any
from dotenv import load_dotenv
from huggingface_hub import AsyncInferenceClient

from prompts import AVA_SYSTEM_PROMPT

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class HuggingFaceAPI:
    def __init__(self):
        self.api_key = os.getenv("HUGGINGFACE_API_KEY")
        if not self.api_key:
            raise ValueError("HUGGINGFACE_API_KEY environment variable is not set")
            
        # Инициализируем AsyncInferenceClient с указанием провайдера
        self.client = AsyncInferenceClient(token=self.api_key, provider="novita")
        self.model_name = "deepseek-ai/DeepSeek-V3-0324" # Используем модель из примера Hugging Face
        logger.info("Initialized HuggingFaceAPI with AsyncInferenceClient")

        self.system_prompt = AVA_SYSTEM_PROMPT

    async def get_response(self, message: str, chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Get response from Hugging Face API using InferenceClient for chat completions
        """
        try:
            messages = []
            # Добавляем системный промпт
            messages.append({"role": "system", "content": self.system_prompt})

            if chat_history:
                for msg in chat_history:
                    messages.append({"role": msg["role"], "content": msg["content"]})
            
            messages.append({"role": "user", "content": message})

            logger.info(f"Sending chat completion request to Hugging Face API for model {self.model_name}")
            
            # Используем chat_completion из InferenceClient с await
            completion = await self.client.chat_completion(
                model=self.model_name,
                messages=messages,
                temperature=0.7,
                max_tokens=500,
                stream=False
            )
                
            logger.info(f"Hugging Face API response: {completion}")

            if completion.choices and len(completion.choices) > 0 and completion.choices[0].message and completion.choices[0].message.content:
                generated_text = completion.choices[0].message.content.strip()
                return {
                    "status": "success",
                    "message": generated_text,
                    "role": "assistant"
                }
            else:
                return {
                    "status": "error",
                    "message": "Неожиданный формат ответа от AI",
                    "role": "system"
                }

        except Exception as e:
            logger.error(f"Error getting response from Hugging Face API: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "message": f"Произошла ошибка при получении ответа от AI: {str(e)}",
                "role": "system"
            }