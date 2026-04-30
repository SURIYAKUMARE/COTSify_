"""LLM service – uses OpenAI to extract components from a project title."""
import json
from app.core.config import settings
from app.models.schemas import Component, AnalyzeResponse


def _get_client():
    """Lazy-init OpenAI client so import never fails without the key."""
    from openai import AsyncOpenAI
    return AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


SYSTEM_PROMPT = """You are an expert electronics and software engineer.
Given a technical project title, extract ALL required components.
Return ONLY valid JSON matching this exact schema:
{
  "summary": "2-3 sentence project overview",
  "hardware": [
    {
      "name": "Component Name",
      "category": "hardware",
      "description": "What it does in this project",
      "quantity": 1,
      "search_query": "optimised Amazon/Flipkart search string"
    }
  ],
  "software": [
    {
      "name": "Tool/Library Name",
      "category": "software",
      "description": "Role in the project",
      "quantity": 1,
      "search_query": "buy software license or download link query"
    }
  ]
}
Be thorough – include every sensor, microcontroller, power supply, wire, resistor, IDE, library, cloud service, etc."""


async def analyze_project(project_title: str) -> AnalyzeResponse:
    """Call OpenAI and parse the structured component list."""
    client = _get_client()
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Project: {project_title}"},
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )
    raw = response.choices[0].message.content
    data = json.loads(raw)
    hardware = [Component(**c) for c in data.get("hardware", [])]
    software = [Component(**c) for c in data.get("software", [])]
    return AnalyzeResponse(
        project_title=project_title,
        summary=data.get("summary", ""),
        hardware=hardware,
        software=software,
    )


# ── Fallback mock data (used when OPENAI_API_KEY is not set) ──────────────────
FALLBACK_DATA = {
    "smart irrigation": {
        "summary": "An IoT-based irrigation system that monitors soil moisture and automates watering using sensors and a microcontroller connected to the cloud.",
        "hardware": [
            {"name": "Arduino Uno", "category": "hardware", "description": "Main microcontroller", "quantity": 1, "search_query": "Arduino Uno R3 microcontroller board"},
            {"name": "Soil Moisture Sensor", "category": "hardware", "description": "Detects soil water level", "quantity": 2, "search_query": "capacitive soil moisture sensor module"},
            {"name": "ESP8266 WiFi Module", "category": "hardware", "description": "WiFi connectivity", "quantity": 1, "search_query": "ESP8266 NodeMCU WiFi module"},
            {"name": "Relay Module 5V", "category": "hardware", "description": "Controls water pump", "quantity": 1, "search_query": "5V relay module single channel"},
            {"name": "Water Pump 12V", "category": "hardware", "description": "Pumps water to plants", "quantity": 1, "search_query": "12V mini submersible water pump"},
            {"name": "DHT11 Sensor", "category": "hardware", "description": "Temperature and humidity", "quantity": 1, "search_query": "DHT11 temperature humidity sensor module"},
            {"name": "Jumper Wires", "category": "hardware", "description": "Circuit connections", "quantity": 20, "search_query": "jumper wires male female breadboard"},
            {"name": "Breadboard", "category": "hardware", "description": "Prototyping board", "quantity": 1, "search_query": "830 point solderless breadboard"},
        ],
        "software": [
            {"name": "Arduino IDE", "category": "software", "description": "Programming environment", "quantity": 1, "search_query": "Arduino IDE download free"},
            {"name": "Blynk IoT Platform", "category": "software", "description": "Cloud dashboard", "quantity": 1, "search_query": "Blynk IoT platform subscription"},
            {"name": "PubSubClient MQTT Library", "category": "software", "description": "Messaging protocol", "quantity": 1, "search_query": "PubSubClient MQTT Arduino library"},
        ],
    },
    "line following robot": {
        "summary": "A robot that follows a black line on a white surface using IR sensors and a motor driver controlled by a microcontroller.",
        "hardware": [
            {"name": "Arduino Uno", "category": "hardware", "description": "Main controller", "quantity": 1, "search_query": "Arduino Uno R3 board"},
            {"name": "IR Sensor Module", "category": "hardware", "description": "Detects line", "quantity": 2, "search_query": "IR infrared sensor module"},
            {"name": "L298N Motor Driver", "category": "hardware", "description": "Controls DC motors", "quantity": 1, "search_query": "L298N dual H-bridge motor driver"},
            {"name": "DC Gear Motor", "category": "hardware", "description": "Drives wheels", "quantity": 2, "search_query": "DC gear motor 6V robot"},
            {"name": "Chassis Kit", "category": "hardware", "description": "Robot body", "quantity": 1, "search_query": "2WD robot car chassis kit"},
            {"name": "Li-Po Battery 7.4V", "category": "hardware", "description": "Power supply", "quantity": 1, "search_query": "7.4V LiPo battery 1000mAh"},
        ],
        "software": [
            {"name": "Arduino IDE", "category": "software", "description": "Programming environment", "quantity": 1, "search_query": "Arduino IDE download"},
        ],
    },
    "home automation": {
        "summary": "A Raspberry Pi-based home automation system that controls lights, fans, and appliances via a web interface or voice commands.",
        "hardware": [
            {"name": "Raspberry Pi 4", "category": "hardware", "description": "Main controller", "quantity": 1, "search_query": "Raspberry Pi 4 Model B 4GB"},
            {"name": "Relay Module 4-Channel", "category": "hardware", "description": "Controls appliances", "quantity": 1, "search_query": "4 channel relay module 5V"},
            {"name": "DHT22 Sensor", "category": "hardware", "description": "Temperature/humidity", "quantity": 1, "search_query": "DHT22 temperature humidity sensor"},
            {"name": "PIR Motion Sensor", "category": "hardware", "description": "Motion detection", "quantity": 2, "search_query": "PIR motion sensor HC-SR501"},
            {"name": "MicroSD Card 32GB", "category": "hardware", "description": "OS storage", "quantity": 1, "search_query": "32GB microSD card class 10"},
        ],
        "software": [
            {"name": "Raspberry Pi OS", "category": "software", "description": "Operating system", "quantity": 1, "search_query": "Raspberry Pi OS download"},
            {"name": "Home Assistant", "category": "software", "description": "Automation platform", "quantity": 1, "search_query": "Home Assistant installation"},
            {"name": "Node-RED", "category": "software", "description": "Flow-based programming", "quantity": 1, "search_query": "Node-RED IoT automation"},
            {"name": "MQTT Broker (Mosquitto)", "category": "software", "description": "Message broker", "quantity": 1, "search_query": "Mosquitto MQTT broker"},
        ],
    },
}

_DEFAULT = {
    "summary": "A technical project requiring various hardware components and software tools.",
    "hardware": [
        {"name": "Arduino Uno", "category": "hardware", "description": "Main microcontroller", "quantity": 1, "search_query": "Arduino Uno R3 microcontroller"},
        {"name": "Breadboard", "category": "hardware", "description": "Prototyping board", "quantity": 1, "search_query": "830 point breadboard"},
        {"name": "Jumper Wires", "category": "hardware", "description": "Connections", "quantity": 20, "search_query": "jumper wires kit"},
        {"name": "Resistor Kit", "category": "hardware", "description": "Various resistors", "quantity": 1, "search_query": "resistor assortment kit"},
        {"name": "LED Pack", "category": "hardware", "description": "Indicator LEDs", "quantity": 1, "search_query": "LED assorted pack 5mm"},
    ],
    "software": [
        {"name": "Arduino IDE", "category": "software", "description": "Development environment", "quantity": 1, "search_query": "Arduino IDE free download"},
        {"name": "VS Code", "category": "software", "description": "Code editor", "quantity": 1, "search_query": "VS Code download free"},
    ],
}


async def analyze_project_fallback(project_title: str) -> AnalyzeResponse:
    """Return mock data when no API key is configured."""
    title_lower = project_title.lower()
    matched = next((v for k, v in FALLBACK_DATA.items() if k in title_lower), _DEFAULT)
    return AnalyzeResponse(
        project_title=project_title,
        summary=matched["summary"],
        hardware=[Component(**c) for c in matched["hardware"]],
        software=[Component(**c) for c in matched["software"]],
    )
