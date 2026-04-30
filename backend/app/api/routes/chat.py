from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import json
from app.core.config import settings

router = APIRouter()

SYSTEM_PROMPT = """You are COTsify AI, an expert engineering assistant specializing in electronics, embedded systems, IoT, and hardware projects.

Your role:
- Help users identify components needed for their projects
- Explain technical specifications and differences between components
- Suggest alternatives and cost-saving options
- Provide wiring diagrams in text format
- Estimate project costs
- Recommend suppliers (Amazon India, Flipkart, Robu.in, ElectronicsComp)
- Answer questions about Arduino, Raspberry Pi, ESP32, sensors, motors, etc.

Response style:
- Be concise and technical but friendly
- Use bullet points for component lists
- Include part numbers when known
- Always mention price ranges in INR
- Format code snippets with proper markdown
- When listing components, include: Name, Quantity, Approx Price (INR)

You have access to COTsify platform features:
- Users can search for projects to get component lists
- Users can compare prices across platforms
- Users can find nearby electronics stores
- Users can view the engineering catalog
"""

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    project_context: Optional[str] = None
    stream: bool = False

class ChatResponse(BaseModel):
    message: str
    tokens_used: Optional[int] = None

# Fallback responses when no API key
FALLBACK_RESPONSES = {
    "hello": "Hello! I am COTsify AI. I can help you identify components, compare prices, and plan your electronics projects. What are you building?",
    "component": "To recommend components, please tell me your project title or description. For example: 'Smart Irrigation System using IoT' or 'Line Following Robot'.",
    "price": "I can help compare prices across Amazon, Flipkart, and Robu.in. Use the Search feature to analyze your project and get price comparisons automatically.",
    "arduino": "Arduino Uno R3 is available for approximately INR 649 on Amazon and INR 349 on Robu.in. It features ATmega328P MCU, 14 digital I/O pins, 6 analog inputs, and 16MHz clock speed.",
    "esp32": "ESP32 DevKit V1 costs around INR 399. It has dual-core 240MHz CPU, built-in WiFi and Bluetooth 4.2, 38 GPIO pins - excellent for IoT projects.",
    "raspberry": "Raspberry Pi 4 Model B (4GB) is priced at approximately INR 5,499. It runs full Linux OS, has quad-core 1.8GHz CPU, dual 4K HDMI, USB 3.0, and Gigabit Ethernet.",
    "sensor": "Common sensors and prices:\n- DHT11 (Temp/Humidity): INR 119\n- HC-SR04 (Ultrasonic): INR 89\n- PIR Motion Sensor: INR 79\n- Soil Moisture Sensor: INR 149\n- IR Obstacle Sensor: INR 59",
    "motor": "Motor options:\n- SG90 Servo (9g): INR 129\n- DC Gear Motor 6V: INR 179\n- L298N Motor Driver: INR 149\n- Stepper Motor 28BYJ-48: INR 149",
    "default": "I am COTsify AI assistant. I can help you with:\n\n1. **Component identification** - Tell me your project\n2. **Price comparison** - Across Amazon, Flipkart, Robu.in\n3. **Technical specs** - Detailed component information\n4. **Wiring help** - Connection diagrams\n5. **Alternatives** - Budget-friendly options\n\nWhat would you like help with?"
}

def get_fallback_response(user_message: str) -> str:
    msg_lower = user_message.lower()
    for key, response in FALLBACK_RESPONSES.items():
        if key in msg_lower:
            return response
    return FALLBACK_RESPONSES["default"]

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not settings.OPENAI_API_KEY or not settings.OPENAI_API_KEY.strip():
        last_msg = request.messages[-1].content if request.messages else ""
        return ChatResponse(
            message=get_fallback_response(last_msg),
            tokens_used=0
        )
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        system_content = SYSTEM_PROMPT
        if request.project_context:
            system_content += f"\n\nCurrent project context: {request.project_context}"
        messages = [{"role": "system", "content": system_content}]
        for msg in request.messages[-20:]:  # last 20 messages
            messages.append({"role": msg.role, "content": msg.content})
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.7,
            max_tokens=1000,
        )
        return ChatResponse(
            message=response.choices[0].message.content,
            tokens_used=response.usage.total_tokens if response.usage else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@router.post("/stream")
async def chat_stream(request: ChatRequest):
    if not settings.OPENAI_API_KEY or not settings.OPENAI_API_KEY.strip():
        last_msg = request.messages[-1].content if request.messages else ""
        fallback = get_fallback_response(last_msg)
        async def fallback_gen():
            for word in fallback.split(" "):
                yield f"data: {json.dumps({'content': word + ' '})}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(fallback_gen(), media_type="text/event-stream")
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        system_content = SYSTEM_PROMPT
        if request.project_context:
            system_content += f"\n\nCurrent project context: {request.project_context}"
        messages = [{"role": "system", "content": system_content}]
        for msg in request.messages[-20:]:
            messages.append({"role": msg.role, "content": msg.content})
        async def generate():
            stream = await client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                temperature=0.7,
                max_tokens=1000,
                stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta:
                    yield f"data: {json.dumps({'content': delta})}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(generate(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
