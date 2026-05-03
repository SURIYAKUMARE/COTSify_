from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import json, re
from app.core.config import settings

router = APIRouter()

SYSTEM_PROMPT = """You are COTsify AI, an expert engineering assistant for electronics, IoT, embedded systems, and hardware projects.

Help users with:
- Component identification and BOM generation
- Price estimates in INR across Amazon, Flipkart, Robu.in
- Technical specifications and comparisons
- Wiring and circuit diagrams (text format)
- Project planning and cost estimation
- Arduino, Raspberry Pi, ESP32, sensors, motors guidance

Always be concise, technical, and include INR prices when mentioning components."""

# ── Smart local knowledge base ────────────────────────────────────────────────
KNOWLEDGE = {
    "arduino": "**Arduino Uno R3** - ATmega328P, 14 digital I/O, 6 analog, 16MHz\n- Amazon: ₹649 | Flipkart: ₹599 | Robu.in: ₹349\n- Best for: beginners, IoT, robotics, automation",
    "esp32": "**ESP32 DevKit V1** - Dual-core 240MHz, WiFi+BT 4.2, 38 GPIO\n- Amazon: ₹399 | Flipkart: ₹379 | Robu.in: ₹299\n- Best for: IoT, WiFi projects, BLE applications",
    "esp8266": "**ESP8266 NodeMCU** - 80MHz, WiFi 802.11 b/g/n, 11 GPIO\n- Amazon: ₹299 | Flipkart: ₹279 | Robu.in: ₹199\n- Best for: simple WiFi IoT, low-cost projects",
    "raspberry": "**Raspberry Pi 4 Model B (4GB)** - Quad-core 1.8GHz, 4GB RAM, WiFi+BT\n- Amazon: ₹5,499 | Robu.in: ₹5,200\n- Best for: Linux projects, AI/ML, media center, home automation",
    "dht11": "**DHT11 Sensor** - Temp: 0-50°C (±2°C), Humidity: 20-90% RH\n- Amazon: ₹119 | Flipkart: ₹99 | Robu.in: ₹79\n- Interface: Single-wire digital",
    "dht22": "**DHT22 Sensor** - Temp: -40 to 80°C (±0.5°C), Humidity: 0-100% RH\n- Amazon: ₹249 | Flipkart: ₹229 | Robu.in: ₹189\n- More accurate than DHT11",
    "soil moisture": "**Capacitive Soil Moisture Sensor v2** - Analog 0-3V output, corrosion-resistant\n- Amazon: ₹149 | Flipkart: ₹129 | Robu.in: ₹99\n- Better than resistive type",
    "relay": "**5V Single Channel Relay Module** - 10A/250VAC, optocoupler isolated\n- Amazon: ₹89 | Flipkart: ₹79 | Robu.in: ₹59\n- Controls: pumps, lights, appliances",
    "l298n": "**L298N Motor Driver** - 2A/channel, 5-35V, drives 2 DC or 1 stepper\n- Amazon: ₹149 | Flipkart: ₹129 | Robu.in: ₹99",
    "servo": "**SG90 Servo Motor** - 1.8kg.cm torque, 180° rotation, PWM control\n- Amazon: ₹129 | Flipkart: ₹119 | Robu.in: ₹89",
    "ultrasonic": "**HC-SR04 Ultrasonic Sensor** - 2-400cm range, 3mm accuracy\n- Amazon: ₹89 | Flipkart: ₹79 | Robu.in: ₹59",
    "pir": "**PIR Motion Sensor HC-SR501** - 3-7m range, 110° cone, adjustable\n- Amazon: ₹79 | Flipkart: ₹69 | Robu.in: ₹49",
    "ir sensor": "**IR Obstacle Sensor** - 2-30cm range, digital output, adjustable\n- Amazon: ₹59 | Flipkart: ₹49 | Robu.in: ₹39",
    "breadboard": "**830-Point Breadboard** - Full size, 4 power rails, nickel contacts\n- Amazon: ₹79 | Flipkart: ₹69 | Robu.in: ₹49",
    "jumper": "**Jumper Wire Kit 120pcs** - M-M, M-F, F-F, 20cm, 10 colors\n- Amazon: ₹99 | Flipkart: ₹89 | Robu.in: ₹69",
    "lipo": "**Li-Po Battery 7.4V 1000mAh** - 2S, 20C discharge, JST connector\n- Amazon: ₹699 | Robu.in: ₹599",
    "oled": "**0.96\" OLED Display I2C** - 128x64 pixels, SSD1306, 3.3-5V\n- Amazon: ₹199 | Flipkart: ₹179 | Robu.in: ₹149",
    "lcd": "**16x2 LCD Display** - HD44780, with I2C backpack module\n- Amazon: ₹149 | Flipkart: ₹129 | Robu.in: ₹99",
    "water pump": "**Mini Submersible Pump 3-6V** - 80-120L/H flow, 7.5mm outlet\n- Amazon: ₹199 | Flipkart: ₹179 | Robu.in: ₹149",
    "dc motor": "**DC Gear Motor 6V 200RPM** - 0.8kg.cm torque, 3mm shaft\n- Amazon: ₹179 | Flipkart: ₹159 | Robu.in: ₹129",
    "stepper": "**28BYJ-48 Stepper Motor + ULN2003** - 5V, 64 steps/rev, 1:64 gear\n- Amazon: ₹149 | Flipkart: ₹129 | Robu.in: ₹99",
    "mpu6050": "**MPU6050 Gyroscope+Accelerometer** - 6-axis IMU, I2C interface\n- Amazon: ₹199 | Flipkart: ₹179 | Robu.in: ₹149",
    "bluetooth": "**HC-05 Bluetooth Module** - Classic BT, UART, 10m range\n- Amazon: ₹249 | Flipkart: ₹229 | Robu.in: ₹179",
    "rfid": "**MFRC522 RFID Module** - 13.56MHz, SPI interface, with card+tag\n- Amazon: ₹199 | Flipkart: ₹179 | Robu.in: ₹149",
    "buzzer": "**Active Buzzer 5V** - 85dB, 2.3kHz, PCB mount\n- Amazon: ₹29 | Flipkart: ₹25 | Robu.in: ₹19",
    "led": "**LED Assorted Pack 100pcs** - 5mm, 5 colors, 20mA\n- Amazon: ₹99 | Flipkart: ₹89 | Robu.in: ₹69",
    "resistor": "**Resistor Kit 600pcs** - 30 values 10Ω-1MΩ, 1/4W\n- Amazon: ₹149 | Flipkart: ₹129 | Robu.in: ₹99",
}

PROJECT_TEMPLATES = {
    "irrigation": {
        "name": "Smart Irrigation System",
        "components": ["Arduino Uno R3 (×1) - ₹649", "Soil Moisture Sensor (×2) - ₹149 each", "ESP8266 NodeMCU (×1) - ₹299", "5V Relay Module (×1) - ₹89", "Water Pump 12V (×1) - ₹199", "DHT11 Sensor (×1) - ₹119", "Jumper Wires Kit - ₹99", "Breadboard - ₹79"],
        "software": ["Arduino IDE (free)", "Blynk IoT Platform (free tier)", "PubSubClient MQTT Library"],
        "total": "~₹1,800-2,200",
        "description": "Monitors soil moisture and automates watering. WiFi-connected for remote monitoring."
    },
    "robot": {
        "name": "Line Following Robot",
        "components": ["Arduino Uno R3 (×1) - ₹649", "IR Sensor Module (×2) - ₹59 each", "L298N Motor Driver (×1) - ₹149", "DC Gear Motor 6V (×2) - ₹179 each", "Robot Chassis Kit (×1) - ₹299", "Li-Po Battery 7.4V (×1) - ₹699"],
        "software": ["Arduino IDE (free)"],
        "total": "~₹2,200-2,500",
        "description": "Follows black line on white surface using IR sensors."
    },
    "home automation": {
        "name": "Home Automation System",
        "components": ["Raspberry Pi 4 4GB (×1) - ₹5,499", "4-Channel Relay Module (×1) - ₹149", "DHT22 Sensor (×1) - ₹249", "PIR Motion Sensor (×2) - ₹79 each", "MicroSD 32GB (×1) - ₹399"],
        "software": ["Raspberry Pi OS (free)", "Home Assistant (free)", "Node-RED (free)"],
        "total": "~₹6,500-7,000",
        "description": "Controls lights, fans, appliances via web interface."
    },
}

def smart_response(message: str, history: list) -> str:
    msg = message.lower().strip()

    # Greetings
    if any(w in msg for w in ["hello", "hi", "hey", "namaste"]):
        return "Hello! I'm **COTsify AI** 👋\n\nI can help you with:\n- 🔧 Component lists for any project\n- 💰 Price comparison (Amazon/Flipkart/Robu.in)\n- 📐 Technical specs and wiring\n- 🤖 Arduino, ESP32, Raspberry Pi guidance\n\nWhat project are you building?"

    # Component price queries
    for key, info in KNOWLEDGE.items():
        if key in msg:
            return f"## {key.title()} Info\n\n{info}\n\n💡 Use the **Search** tab to get a full component list for your project!"

    # Project templates
    for key, template in PROJECT_TEMPLATES.items():
        if key in msg or any(w in msg for w in key.split()):
            lines = [f"## {template['name']}", f"\n{template['description']}\n", "### Hardware Components"]
            for c in template["components"]:
                lines.append(f"- {c}")
            lines.append("\n### Software")
            for s in template["software"]:
                lines.append(f"- {s}")
            lines.append(f"\n### Estimated Total Cost\n**{template['total']}**")
            lines.append("\n💡 Click **Search** tab and type the project name for detailed analysis!")
            return "\n".join(lines)

    # Price queries
    if any(w in msg for w in ["price", "cost", "how much", "kitna", "rate"]):
        return "Here are common component prices:\n\n| Component | Amazon | Flipkart | Robu.in |\n|---|---|---|---|\n| Arduino Uno R3 | ₹649 | ₹599 | ₹349 |\n| ESP32 DevKit | ₹399 | ₹379 | ₹299 |\n| ESP8266 NodeMCU | ₹299 | ₹279 | ₹199 |\n| DHT11 Sensor | ₹119 | ₹99 | ₹79 |\n| HC-SR04 Ultrasonic | ₹89 | ₹79 | ₹59 |\n| L298N Motor Driver | ₹149 | ₹129 | ₹99 |\n| SG90 Servo | ₹129 | ₹119 | ₹89 |\n| Raspberry Pi 4 4GB | ₹5,499 | — | ₹5,200 |\n\n�� **Robu.in** is usually cheapest for Indian buyers!"

    # Arduino vs ESP32
    if ("arduino" in msg and "esp" in msg) or ("vs" in msg and ("arduino" in msg or "esp" in msg)):
        return "## Arduino vs ESP32 Comparison\n\n| Feature | Arduino Uno | ESP32 |\n|---|---|---|\n| CPU | 16MHz AVR | 240MHz Dual-core |\n| RAM | 2KB | 520KB |\n| WiFi | ❌ | ✅ Built-in |\n| Bluetooth | ❌ | ✅ BLE 4.2 |\n| GPIO | 14 digital | 38 pins |\n| Price | ₹649 | ₹399 |\n| Best for | Beginners, simple projects | IoT, WiFi, BLE projects |\n\n**Recommendation:** Use ESP32 for IoT projects, Arduino for learning basics."

    # Wiring help
    if any(w in msg for w in ["wire", "connect", "circuit", "pin", "wiring", "schematic"]):
        if "dht11" in msg or "dht22" in msg:
            return "## DHT11/DHT22 Wiring to Arduino\n\n```\nDHT11 Pin → Arduino Pin\nVCC (pin 1) → 5V\nDATA (pin 2) → Digital Pin 2\n[10kΩ resistor between VCC and DATA]\nGND (pin 4) → GND\n```\n\n**Code:**\n```cpp\n#include <DHT.h>\n#define DHTPIN 2\n#define DHTTYPE DHT11\nDHT dht(DHTPIN, DHTTYPE);\nvoid setup() { dht.begin(); }\nvoid loop() {\n  float t = dht.readTemperature();\n  float h = dht.readHumidity();\n}\n```"
        if "ultrasonic" in msg or "hc-sr04" in msg or "sr04" in msg:
            return "## HC-SR04 Wiring to Arduino\n\n```\nHC-SR04 → Arduino\nVCC → 5V\nTRIG → Digital Pin 9\nECHO → Digital Pin 10\nGND → GND\n```\n\n**Code:**\n```cpp\n#define TRIG 9\n#define ECHO 10\nvoid setup() { pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); }\nlong getDistance() {\n  digitalWrite(TRIG, HIGH); delayMicroseconds(10); digitalWrite(TRIG, LOW);\n  return pulseIn(ECHO, HIGH) * 0.034 / 2;\n}\n```"
        return "Please specify which components you want to wire! For example:\n- DHT11 to Arduino\n- HC-SR04 to Arduino\n- L298N motor driver\n- Relay module\n- OLED display"

    # Where to buy
    if any(w in msg for w in ["buy", "purchase", "order", "shop", "store", "where"]):
        return "## Best Places to Buy Electronics in India\n\n**Online:**\n- 🟠 [Amazon.in](https://amazon.in) — Fast delivery, good prices\n- 🔵 [Flipkart](https://flipkart.com) — Competitive prices\n- 🟢 [Robu.in](https://robu.in) — **Cheapest** for components\n- 🔴 [ElectronicsComp](https://electronicscomp.com) — Good variety\n- 🟡 [Quartzcomponents](https://quartzcomponents.com) — Bulk orders\n\n**Offline (major cities):**\n- Mumbai: Lamington Road\n- Delhi: Lajpat Rai Market\n- Bangalore: SP Road\n- Chennai: Ritchie Street\n\n💡 Use the **Nearby Stores** tab in COTsify to find stores near you!"

    # Default helpful response
    return f"I can help you with **\"{message}\"**!\n\nTry asking me:\n- \"What components for a {message}?\"\n- \"Price of Arduino Uno\"\n- \"Arduino vs ESP32 comparison\"\n- \"How to wire DHT11 to Arduino\"\n- \"Where to buy electronics in India\"\n\nOr use the **Search** tab above to get a complete component list with prices! 🔍"


class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    project_context: Optional[str] = None
    stream: bool = False

class ChatResponse(BaseModel):
    message: str
    tokens_used: Optional[int] = None

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest):
    last_msg = request.messages[-1].content if request.messages else ""
    history = [{"role": m.role, "content": m.content} for m in request.messages[:-1]]

    # Try real OpenAI first
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip() and not settings.OPENAI_API_KEY.startswith("sk-proj-Rq"):
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            system = SYSTEM_PROMPT
            if request.project_context:
                system += f"\n\nProject context: {request.project_context}"
            msgs = [{"role": "system", "content": system}]
            for m in request.messages[-20:]:
                msgs.append({"role": m.role, "content": m.content})
            response = await client.chat.completions.create(
                model="gpt-4o-mini", messages=msgs, temperature=0.7, max_tokens=1000
            )
            return ChatResponse(
                message=response.choices[0].message.content,
                tokens_used=response.usage.total_tokens if response.usage else None
            )
        except Exception:
            pass  # Fall through to smart local response

    # Smart local response (no API needed)
    return ChatResponse(message=smart_response(last_msg, history), tokens_used=0)


@router.post("/stream")
async def chat_stream(request: ChatRequest):
    last_msg = request.messages[-1].content if request.messages else ""
    history = [{"role": m.role, "content": m.content} for m in request.messages[:-1]]

    # Try real OpenAI streaming
    if settings.OPENAI_API_KEY and settings.OPENAI_API_KEY.strip() and not settings.OPENAI_API_KEY.startswith("sk-proj-Rq"):
        try:
            from openai import AsyncOpenAI
            client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
            system = SYSTEM_PROMPT
            if request.project_context:
                system += f"\n\nProject context: {request.project_context}"
            msgs = [{"role": "system", "content": system}]
            for m in request.messages[-20:]:
                msgs.append({"role": m.role, "content": m.content})

            async def generate():
                stream = await client.chat.completions.create(
                    model="gpt-4o-mini", messages=msgs, temperature=0.7, max_tokens=1000, stream=True
                )
                async for chunk in stream:
                    delta = chunk.choices[0].delta.content
                    if delta:
                        yield f"data: {json.dumps({'content': delta})}\n\n"
                yield "data: [DONE]\n\n"
            return StreamingResponse(generate(), media_type="text/event-stream")
        except Exception:
            pass

    # Smart local streaming (word by word)
    response_text = smart_response(last_msg, history)
    async def stream_local():
        import asyncio
        for word in response_text.split(" "):
            yield f"data: {json.dumps({'content': word + ' '})}\n\n"
            await asyncio.sleep(0.02)
        yield "data: [DONE]\n\n"
    return StreamingResponse(stream_local(), media_type="text/event-stream")
