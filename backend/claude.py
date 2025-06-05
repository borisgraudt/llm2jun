# Claude API logic

import os
import httpx
import logging
import json
from typing import Dict, List, Any
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

class ClaudeAPI:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
        self.model = "claude-3-haiku-20240307"
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01"
        }
        logger.info(f"Initialized ClaudeAPI with model: {self.model}")
        logger.info(f"API Key (first 4 chars): {self.api_key[:4]}...")

    async def get_response(self, message: str, chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Get response from Claude API for general chat
        """
        try:
            messages = []
            if chat_history:
                # Фильтруем системные сообщения из истории
                messages = [msg for msg in chat_history if msg["role"] != "system"]
            
            messages.append({
                "role": "user",
                "content": message
            })

            payload = {
                "model": self.model,
                "max_tokens": 1024,
                "messages": messages,
                "temperature": 0.7,
                "system": "You are a helpful AI assistant. Provide clear and concise responses using Markdown for formatting, including paragraphs, lists, and code blocks where appropriate.",
                "stream": False
            }

            logger.info(f"Request headers: {json.dumps(self.headers, indent=2)}")
            logger.info(f"Request payload: {json.dumps(payload, indent=2)}")

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Error response: {response.status_code} - {response.text}")
                    raise httpx.HTTPStatusError(
                        f"HTTP error {response.status_code}: {response.text}",
                        request=response.request,
                        response=response
                    )
                
                data = response.json()
                logger.info(f"Response data: {json.dumps(data, indent=2)}")
                
                return {
                    "status": "success",
                    "message": data["content"][0]["text"],
                    "role": "assistant"
                }

        except httpx.TimeoutException as e:
            logger.error(f"Request timed out: {str(e)}")
            return {
                "status": "error",
                "message": "Request timed out. Please try again.",
                "role": "system"
            }
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred: {str(e)}")
            error_detail = f"HTTP error {e.response.status_code}: {e.response.text}"
            return {
                "status": "error",
                "message": f"HTTP error occurred: {error_detail}",
                "role": "system"
            }
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return {
                "status": "error",
                "message": f"Error getting response from Claude: {str(e)}",
                "role": "system"
            }

    async def analyze_network_issue(self, message: str, chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Specialized method for network issues analysis
        """
        try:
            system_prompt = """You are a network expert assistant. Analyze the following network issue and provide detailed technical guidance.
            Focus on:
            1. Identifying the root cause
            2. Providing step-by-step troubleshooting steps
            3. Suggesting preventive measures
            4. If needed, recommending when to escalate to a human expert

            Use Markdown for formatting, including paragraphs, lists, and code blocks where appropriate."""

            messages = []
            if chat_history:
                # Фильтруем системные сообщения из истории
                messages = [msg for msg in chat_history if msg["role"] != "system"]
            
            messages.append({
                "role": "user",
                "content": message
            })

            payload = {
                "model": self.model,
                "max_tokens": 1500,
                "messages": messages,
                "temperature": 0.5,
                "system": system_prompt,
                "stream": False
            }

            logger.info(f"Request headers: {json.dumps(self.headers, indent=2)}")
            logger.info(f"Request payload: {json.dumps(payload, indent=2)}")

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers=self.headers,
                    json=payload,
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    logger.error(f"Error response: {response.status_code} - {response.text}")
                    raise httpx.HTTPStatusError(
                        f"HTTP error {response.status_code}: {response.text}",
                        request=response.request,
                        response=response
                    )
                
                data = response.json()
                logger.info(f"Response data: {json.dumps(data, indent=2)}")
                
                return {
                    "status": "success",
                    "message": data["content"][0]["text"],
                    "role": "assistant"
                }

        except httpx.TimeoutException as e:
            logger.error(f"Request timed out: {str(e)}")
            return {
                "status": "error",
                "message": "Request timed out. Please try again.",
                "role": "system"
            }
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error occurred: {str(e)}")
            error_detail = f"HTTP error {e.response.status_code}: {e.response.text}"
            return {
                "status": "error",
                "message": f"HTTP error occurred: {error_detail}",
                "role": "system"
            }
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}")
            return {
                "status": "error",
                "message": f"Error analyzing network issue: {str(e)}",
                "role": "system"
            }