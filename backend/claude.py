# Claude API logic
import os
import httpx 
import logging
import json
from typing import Dict, List, Any
from dotenv import load_dotenv
import asyncio

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
logger.info("Loading environment variables from .env file")

class ClaudeAPI:
    def __init__(self):
        self.api_key = os.getenv("ANTHROPIC_API_KEY")
        logger.info(f"API Key loaded: {'Yes' if self.api_key else 'No'}")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable is not set")
            
        # Убираем возможные пробелы и переносы строк
        self.api_key = self.api_key.strip()
        
        # Подробное логирование для отладки
        logger.info(f"API Key length: {len(self.api_key)}")
        logger.info(f"API Key prefix: {self.api_key[:15]}...")
        
        if not self.api_key.startswith("sk-ant-api03-"):
            raise ValueError("ANTHROPIC_API_KEY must start with 'sk-ant-api03-'")
        if len(self.api_key) < 50:
            raise ValueError("ANTHROPIC_API_KEY seems too short")
            
        self.model = "claude-2.1"
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key,
            "anthropic-version": "2023-01-01"
        }
        logger.info(f"Initialized ClaudeAPI with model: {self.model}")
        logger.info(f"API Key format check: {'Valid' if self.api_key.startswith('sk-ant-api03-') else 'Invalid'}")
        
        # Проверяем API ключ при инициализации
        asyncio.create_task(self.validate_api_key())

    async def validate_api_key(self):
        """Подробная проверка API ключа"""
        try:
            async with httpx.AsyncClient() as client:
                # Пробуем разные версии API
                api_versions = ["2023-06-01", "2024-02-15"]
                for version in api_versions:
                    headers = self.headers.copy()
                    headers["anthropic-version"] = version
                    
                    logger.info(f"\nTesting API key with version {version}")
                    logger.info(f"Headers: {json.dumps(headers, indent=2)}")
                    
                    try:
                        response = await client.post(
                            "https://api.anthropic.com/v1/messages",
                            headers=headers,
                            json={
                                "model": self.model,
                                "max_tokens": 1,
                                "messages": [{"role": "user", "content": "test"}],
                                "stream": False
                            },
                            timeout=10.0
                        )
                        
                        logger.info(f"Response status: {response.status_code}")
                        logger.info(f"Response headers: {json.dumps(dict(response.headers), indent=2)}")
                        logger.info(f"Response body: {response.text}")
                        
                        if response.status_code == 200:
                            logger.info(f"✅ API key works with version {version}")
                            return True
                        elif response.status_code == 401:
                            error_data = response.json()
                            logger.error(f"❌ Authentication error with version {version}: {error_data}")
                        else:
                            logger.error(f"❌ Unexpected error with version {version}: {response.text}")
                            
                    except Exception as e:
                        logger.error(f"❌ Error testing version {version}: {str(e)}")
                
                logger.error("❌ API key validation failed with all versions")
                return False
                
        except Exception as e:
            logger.error(f"❌ Error in API key validation: {str(e)}")
            return False

    async def check_model_access(self):
        """Проверка доступа к модели"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers=self.headers,
                    json={
                        "model": self.model,
                        "max_tokens": 1,
                        "messages": [{"role": "user", "content": "test"}],
                        "stream": False
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    logger.info(f"Model {self.model} is accessible")
                    return True
                elif response.status_code == 400 and "model" in response.text.lower():
                    logger.error(f"Model {self.model} is not accessible. Response: {response.text}")
                    return False
                else:
                    logger.error(f"Unexpected response checking model access: {response.status_code} - {response.text}")
                    return False
        except Exception as e:
            logger.error(f"Error checking model access: {e}")
            return False

    async def chat(self, message: str) -> str:
        """
        Asynchronous method to get response from Claude
        """
        try:
            # Проверяем доступ к модели перед отправкой сообщения
            if not await self.check_model_access():
                return "Ошибка: модель недоступна. Пожалуйста, проверьте настройки API ключа."
                
            response = await self.get_response(message)
            if response["status"] == "error":
                raise Exception(response["message"])
            return response["message"]
        except Exception as e:
            logger.error(f"Error in chat method: {str(e)}", exc_info=True)
            raise

    async def get_response(self, message: str, chat_history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Get response from Claude API for general chat
        """
        try:
            # Фильтруем только user/assistant сообщения из истории
            messages = []
            if chat_history:
                messages = [msg for msg in chat_history if msg["role"] in ["user", "assistant"]]
            
            # Добавляем новое сообщение пользователя
            messages.append({
                "role": "user",
                "content": message
            })

            payload = {
                "model": self.model,
                "max_tokens": 1000,
                "messages": messages,
                "temperature": 0.5,
                "system": "Hi! I'm AVA, your IT assistant. I'll provide a step-by-step solution.",
                "stream": False
            }

            logger.info(f"Request headers: {json.dumps(self.headers, indent=2)}")
            logger.info(f"Request payload: {json.dumps(payload, indent=2)}")

            async with httpx.AsyncClient() as client:
                try:
                    response = await client.post(
                        "https://api.anthropic.com/v1/messages",
                        headers=self.headers,
                        json=payload,
                        timeout=60.0
                    )
                    
                    response.raise_for_status()
                    
                    data = response.json()
                    logger.info(f"Response data: {json.dumps(data, indent=2)}")
                    
                    if "content" not in data or not data["content"]:
                        raise ValueError("Invalid response format from API")
                    
                    return {
                        "status": "success",
                        "message": data["content"][0]["text"],
                        "role": "assistant"
                    }
                except httpx.HTTPStatusError as e:
                    error_detail = f"HTTP error {e.response.status_code}: {e.response.text}"
                    logger.error(f"HTTP error occurred: {error_detail}")
                    
                    # Более понятные сообщения об ошибках
                    if e.response.status_code == 401:
                        error_message = "Ошибка аутентификации: неверный API ключ. Пожалуйста, проверьте настройки."
                    elif e.response.status_code == 429:
                        error_message = "Превышен лимит запросов. Пожалуйста, подождите немного."
                    elif e.response.status_code == 400:
                        error_message = "Неверный формат запроса. Пожалуйста, проверьте введенные данные."
                    else:
                        error_message = f"Ошибка API: {error_detail}"
                    
                    return {
                        "status": "error",
                        "message": error_message,
                        "role": "system"
                    }

        except httpx.TimeoutException as e:
            logger.error(f"Request timed out: {str(e)}")
            return {
                "status": "error",
                "message": "Request timed out. Please try again.",
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
            system_prompt = """You are AVA (Advanced Virtual Assistant), a professional system administrator and IT specialist with extensive experience in network equipment, servers, and corporate IT systems. 
            You provide clear, structured, step-by-step solutions to technical problems. 
            Always respond in this format:
              🔧 PROBLEM: [brief description]
              📋 SOLUTION: 1. [First step with specific commands/actions] 2. [Second step with expected result] 3. [Continue with numbered steps...] 
              ⚡ QUICK CHECK: [how to verify the problem is solved] 
              ⚠️ WARNING: [important warnings if any] 
              🔍 ADDITIONAL: [alternative solutions or advanced info] 
              Your expertise covers: Network equipment (Cisco, Juniper, MikroTik, HP/Aruba), Servers & OS (Windows Server, Linux, VMware), Network protocols (TCP/IP, VPN, OSPF, BGP, VLAN, QoS), Security (Firewalls, IDS/IPS, SSL/TLS), Monitoring (SNMP, Nagios, Zabbix), Cloud platforms (AWS, Azure, Google Cloud). 
              Always provide specific commands, configuration examples in code blocks, mention software versions when relevant, warn about risks, and recommend backups when necessary. Use technical terms but explain them when needed. 
              Start responses with 'Hi! I'm AVA, your IT assistant. I'll provide a step-by-step solution.'"""

            # Фильтруем только user/assistant сообщения из истории
            messages = []
            if chat_history:
                messages = [msg for msg in chat_history if msg["role"] in ["user", "assistant"]]
            
            # Добавляем новое сообщение пользователя
            messages.append({
                "role": "user",
                "content": message
            })

            payload = {
                "model": self.model,
                "max_tokens": 1000,
                "messages": messages,
                "temperature": 0.5,
                "system": system_prompt,  # System prompt как отдельный параметр
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