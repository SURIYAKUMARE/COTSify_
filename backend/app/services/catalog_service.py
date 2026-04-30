"""Engineering catalog service - RS Components style product data."""
from typing import List, Optional
from pydantic import BaseModel


class CatalogProduct(BaseModel):
    id: str
    name: str
    part_number: str
    category: str
    subcategory: str
    description: str
    specifications: dict
    price_inr: Optional[float] = None
    price_usd: Optional[float] = None
    currency: str = "INR"
    availability: str = "in_stock"
    stock_qty: Optional[int] = None
    image_url: str
    datasheet_url: Optional[str] = None
    buy_urls: dict
    alternatives: List[str] = []
    tags: List[str] = []
    manufacturer: str = ""
    rating: Optional[float] = None
    reviews: Optional[int] = None


CATALOG: dict = {
    "arduino uno": CatalogProduct(
        id="MCU-001", name="Arduino Uno R3", part_number="A000066",
        category="Electrical", subcategory="Microcontrollers",
        description="8-bit ATmega328P microcontroller, 14 digital I/O pins, 6 analog inputs, 16MHz clock, USB interface.",
        specifications={"MCU": "ATmega328P", "Clock": "16 MHz", "Flash": "32KB", "SRAM": "2KB", "Digital I/O": "14", "Analog In": "6", "Operating Voltage": "5V"},
        price_inr=649.0, price_usd=7.8, availability="in_stock", stock_qty=250,
        image_url="https://store.arduino.cc/cdn/shop/files/A000066_03.front_1000x750.jpg",
        datasheet_url="https://docs.arduino.cc/resources/datasheets/A000066-datasheet.pdf",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=arduino+uno+r3", "Flipkart": "https://www.flipkart.com/search?q=arduino+uno", "Robu.in": "https://robu.in/?s=arduino+uno"},
        alternatives=["ESP32 DevKit", "Arduino Nano", "Raspberry Pi Pico"],
        tags=["microcontroller", "arduino", "atmega", "iot"], manufacturer="Arduino", rating=4.5, reviews=12400
    ),
    "esp8266": CatalogProduct(
        id="MCU-002", name="ESP8266 NodeMCU V3", part_number="ESP8266-12E",
        category="Electrical", subcategory="WiFi Modules",
        description="WiFi-enabled microcontroller module with 80MHz Tensilica L106 core, 4MB flash, 802.11 b/g/n support.",
        specifications={"MCU": "Tensilica L106", "Clock": "80/160 MHz", "Flash": "4MB", "WiFi": "802.11 b/g/n", "GPIO": "11", "Operating Voltage": "3.3V"},
        price_inr=299.0, price_usd=3.6, availability="in_stock", stock_qty=180,
        image_url="https://robu.in/wp-content/uploads/2019/01/NodeMCU-ESP8266-Pinout.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=esp8266+nodemcu", "Flipkart": "https://www.flipkart.com/search?q=esp8266", "Robu.in": "https://robu.in/?s=esp8266"},
        alternatives=["ESP32 DevKit", "Arduino Uno + WiFi Shield", "Raspberry Pi Zero W"],
        tags=["wifi", "iot", "esp8266", "nodemcu"], manufacturer="Espressif", rating=4.4, reviews=9800
    ),
    "esp32": CatalogProduct(
        id="MCU-003", name="ESP32 DevKit V1", part_number="ESP32-WROOM-32",
        category="Electrical", subcategory="WiFi/BT Modules",
        description="Dual-core 240MHz microcontroller with WiFi and Bluetooth, 4MB flash, 38 GPIO pins.",
        specifications={"MCU": "Xtensa LX6 Dual Core", "Clock": "240 MHz", "Flash": "4MB", "WiFi": "802.11 b/g/n", "Bluetooth": "4.2 BLE", "GPIO": "38"},
        price_inr=399.0, price_usd=4.8, availability="in_stock", stock_qty=320,
        image_url="https://robu.in/wp-content/uploads/2019/01/ESP32-DevKitC-pinout.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=esp32+devkit", "Flipkart": "https://www.flipkart.com/search?q=esp32", "Robu.in": "https://robu.in/?s=esp32"},
        alternatives=["ESP8266 NodeMCU", "Arduino Uno + BT Module", "Raspberry Pi Pico W"],
        tags=["wifi", "bluetooth", "iot", "esp32"], manufacturer="Espressif", rating=4.6, reviews=15200
    ),
    "soil moisture sensor": CatalogProduct(
        id="SEN-001", name="Capacitive Soil Moisture Sensor v2.0", part_number="SEN-SOIL-CAP",
        category="Electrical", subcategory="Sensors",
        description="Corrosion-resistant capacitive soil moisture sensor, analog output 0-3V, compatible with Arduino/ESP32.",
        specifications={"Output": "Analog 0-3V", "Supply Voltage": "3.3-5.5V", "Current": "5mA", "Length": "98mm", "Interface": "Analog"},
        price_inr=149.0, price_usd=1.8, availability="in_stock", stock_qty=450,
        image_url="https://robu.in/wp-content/uploads/2019/06/Capacitive-Soil-Moisture-Sensor-v1.2.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=capacitive+soil+moisture+sensor", "Flipkart": "https://www.flipkart.com/search?q=soil+moisture+sensor", "Robu.in": "https://robu.in/?s=soil+moisture"},
        alternatives=["Resistive Soil Moisture Sensor", "DHT11 + Soil Probe", "SHT31 Sensor"],
        tags=["sensor", "soil", "moisture", "agriculture", "iot"], manufacturer="Generic", rating=4.2, reviews=3200
    ),
    "dht11": CatalogProduct(
        id="SEN-002", name="DHT11 Temperature & Humidity Sensor", part_number="DHT11",
        category="Electrical", subcategory="Sensors",
        description="Digital temperature and humidity sensor, range 0-50C / 20-90% RH, single-wire interface.",
        specifications={"Temperature Range": "0-50 C", "Humidity Range": "20-90% RH", "Accuracy Temp": "+-2 C", "Accuracy Humidity": "+-5% RH", "Supply Voltage": "3-5.5V", "Interface": "Single-wire"},
        price_inr=119.0, price_usd=1.4, availability="in_stock", stock_qty=600,
        image_url="https://robu.in/wp-content/uploads/2019/01/DHT11-Temperature-Humidity-Sensor.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=dht11+sensor", "Flipkart": "https://www.flipkart.com/search?q=dht11", "Robu.in": "https://robu.in/?s=dht11"},
        alternatives=["DHT22 Sensor", "SHT31 Sensor", "BME280 Sensor"],
        tags=["sensor", "temperature", "humidity", "dht11"], manufacturer="Aosong", rating=4.3, reviews=14200
    ),
    "relay module": CatalogProduct(
        id="ELC-001", name="5V Single Channel Relay Module", part_number="REL-5V-1CH",
        category="Electrical", subcategory="Switching",
        description="Optocoupler-isolated relay module, 5V coil, 10A/250VAC contact rating, active-low trigger.",
        specifications={"Coil Voltage": "5V DC", "Contact Rating": "10A 250VAC / 10A 30VDC", "Trigger": "Active Low", "Isolation": "Optocoupler", "Indicator": "LED"},
        price_inr=89.0, price_usd=1.1, availability="in_stock", stock_qty=800,
        image_url="https://robu.in/wp-content/uploads/2019/01/5V-1-Channel-Relay-Module.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=5v+relay+module", "Flipkart": "https://www.flipkart.com/search?q=relay+module", "Robu.in": "https://robu.in/?s=relay+module"},
        alternatives=["4-Channel Relay Module", "Solid State Relay", "MOSFET Switch Module"],
        tags=["relay", "switching", "actuator", "iot"], manufacturer="Generic", rating=4.1, reviews=6700
    ),
    "water pump": CatalogProduct(
        id="MEC-001", name="Mini Submersible Water Pump 3-6V", part_number="PUMP-3V-MINI",
        category="Mechanical", subcategory="Pumps",
        description="Miniature DC submersible pump, 3-6V operation, 80-120L/H flow rate, suitable for irrigation and fountains.",
        specifications={"Voltage": "3-6V DC", "Current": "130-220mA", "Flow Rate": "80-120 L/H", "Max Head": "40-110cm", "Outlet Diameter": "7.5mm"},
        price_inr=199.0, price_usd=2.4, availability="in_stock", stock_qty=150,
        image_url="https://robu.in/wp-content/uploads/2019/01/Mini-Submersible-Water-Pump.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=mini+submersible+water+pump", "Flipkart": "https://www.flipkart.com/search?q=submersible+pump", "Robu.in": "https://robu.in/?s=water+pump"},
        alternatives=["12V Submersible Pump", "Peristaltic Pump", "Solenoid Valve"],
        tags=["pump", "water", "irrigation", "mechanical"], manufacturer="Generic", rating=4.0, reviews=2800
    ),
    "breadboard": CatalogProduct(
        id="TOL-001", name="830-Point Solderless Breadboard", part_number="BB-830",
        category="Tools", subcategory="Prototyping",
        description="Full-size 830-point solderless breadboard with 2 power rails, ABS plastic, nickel-plated contacts.",
        specifications={"Points": "830", "Tie Points": "630", "Power Rails": "4 x 50", "Contact Material": "Nickel-plated phosphor bronze", "Dimensions": "165 x 55 x 9mm"},
        price_inr=79.0, price_usd=0.95, availability="in_stock", stock_qty=1200,
        image_url="https://robu.in/wp-content/uploads/2019/01/830-Point-Solderless-Breadboard.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=830+breadboard", "Flipkart": "https://www.flipkart.com/search?q=breadboard", "Robu.in": "https://robu.in/?s=breadboard"},
        alternatives=["400-Point Mini Breadboard", "PCB Prototype Board", "Stripboard"],
        tags=["breadboard", "prototyping", "tools"], manufacturer="Generic", rating=4.4, reviews=8900
    ),
    "jumper wires": CatalogProduct(
        id="TOL-002", name="Jumper Wire Kit 120pcs (M-M, M-F, F-F)", part_number="JW-120-KIT",
        category="Tools", subcategory="Wiring",
        description="120-piece assorted jumper wire kit, 40 each of male-male, male-female, female-female, 20cm length.",
        specifications={"Total Pieces": "120", "Types": "M-M, M-F, F-F", "Length": "20cm", "Wire Gauge": "26 AWG", "Colors": "10 colors"},
        price_inr=99.0, price_usd=1.2, availability="in_stock", stock_qty=950,
        image_url="https://robu.in/wp-content/uploads/2019/01/Jumper-Wire-Kit.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=jumper+wires+kit", "Flipkart": "https://www.flipkart.com/search?q=jumper+wires", "Robu.in": "https://robu.in/?s=jumper+wires"},
        alternatives=["Dupont Cables", "Ribbon Cable", "Solid Core Wire"],
        tags=["wires", "jumper", "prototyping", "tools"], manufacturer="Generic", rating=4.3, reviews=11200
    ),
    "l298n": CatalogProduct(
        id="ELC-002", name="L298N Dual H-Bridge Motor Driver", part_number="L298N-MODULE",
        category="Electrical", subcategory="Motor Drivers",
        description="Dual H-bridge motor driver module, drives 2 DC motors or 1 stepper, 2A per channel, 5-35V supply.",
        specifications={"Driver IC": "L298N", "Max Voltage": "35V", "Max Current": "2A per channel", "Logic Voltage": "5V", "Channels": "2 DC / 1 Stepper"},
        price_inr=149.0, price_usd=1.8, availability="in_stock", stock_qty=420,
        image_url="https://robu.in/wp-content/uploads/2019/01/L298N-Motor-Driver-Module.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=l298n+motor+driver", "Flipkart": "https://www.flipkart.com/search?q=l298n", "Robu.in": "https://robu.in/?s=l298n"},
        alternatives=["L293D Motor Driver", "TB6612FNG Driver", "DRV8833 Module"],
        tags=["motor driver", "h-bridge", "robot", "l298n"], manufacturer="STMicroelectronics", rating=4.3, reviews=7600
    ),
    "ir sensor": CatalogProduct(
        id="SEN-003", name="IR Infrared Obstacle Avoidance Sensor", part_number="IR-OBS-MOD",
        category="Electrical", subcategory="Sensors",
        description="Adjustable IR obstacle detection module, 2-30cm range, digital output, onboard LED indicator.",
        specifications={"Detection Range": "2-30cm", "Output": "Digital TTL", "Supply Voltage": "3.3-5V", "Wavelength": "940nm", "Adjustment": "Potentiometer"},
        price_inr=59.0, price_usd=0.7, availability="in_stock", stock_qty=750,
        image_url="https://robu.in/wp-content/uploads/2019/01/IR-Obstacle-Avoidance-Sensor.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=ir+sensor+module", "Flipkart": "https://www.flipkart.com/search?q=ir+sensor", "Robu.in": "https://robu.in/?s=ir+sensor"},
        alternatives=["Ultrasonic HC-SR04", "TCRT5000 Line Sensor", "Sharp GP2Y0A21"],
        tags=["sensor", "ir", "infrared", "obstacle", "robot"], manufacturer="Generic", rating=4.1, reviews=5400
    ),
    "ultrasonic sensor": CatalogProduct(
        id="SEN-004", name="HC-SR04 Ultrasonic Distance Sensor", part_number="HC-SR04",
        category="Electrical", subcategory="Sensors",
        description="Ultrasonic ranging module, 2cm-400cm range, 3mm accuracy, 5V operation, TTL output.",
        specifications={"Range": "2-400cm", "Accuracy": "3mm", "Frequency": "40kHz", "Supply Voltage": "5V DC", "Trigger Pulse": "10us TTL", "Beam Angle": "15 degrees"},
        price_inr=89.0, price_usd=1.1, availability="in_stock", stock_qty=680,
        image_url="https://robu.in/wp-content/uploads/2019/01/HC-SR04-Ultrasonic-Sensor.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=hc-sr04+ultrasonic", "Flipkart": "https://www.flipkart.com/search?q=ultrasonic+sensor", "Robu.in": "https://robu.in/?s=hc-sr04"},
        alternatives=["VL53L0X ToF Sensor", "Sharp IR Distance Sensor", "JSN-SR04T Waterproof"],
        tags=["sensor", "ultrasonic", "distance", "robot"], manufacturer="Generic", rating=4.5, reviews=18900
    ),
    "raspberry pi": CatalogProduct(
        id="MCU-004", name="Raspberry Pi 4 Model B 4GB", part_number="SC0194",
        category="Electrical", subcategory="Single Board Computers",
        description="Quad-core 1.8GHz ARM Cortex-A72, 4GB LPDDR4, dual 4K HDMI, USB 3.0, Gigabit Ethernet, WiFi/BT.",
        specifications={"CPU": "ARM Cortex-A72 Quad-core 1.8GHz", "RAM": "4GB LPDDR4", "Storage": "MicroSD", "USB": "2x USB3.0 + 2x USB2.0", "Display": "2x micro-HDMI 4K", "Network": "Gigabit Ethernet + WiFi 5 + BT 5.0"},
        price_inr=5499.0, price_usd=66.0, availability="in_stock", stock_qty=45,
        image_url="https://www.raspberrypi.com/app/uploads/2022/02/RASPBERRY-PI-4-MODEL-B-4GB_1.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=raspberry+pi+4+4gb", "Flipkart": "https://www.flipkart.com/search?q=raspberry+pi+4", "Robu.in": "https://robu.in/?s=raspberry+pi+4"},
        alternatives=["Raspberry Pi 3B+", "Orange Pi 5", "Jetson Nano"],
        tags=["sbc", "linux", "raspberry pi", "iot", "ai"], manufacturer="Raspberry Pi Foundation", rating=4.8, reviews=32000
    ),
    "dc motor": CatalogProduct(
        id="MEC-002", name="DC Gear Motor 6V 200RPM", part_number="GM-6V-200",
        category="Mechanical", subcategory="Motors",
        description="DC gear motor with metal gearbox, 6V operation, 200RPM no-load speed, 0.8kgcm torque.",
        specifications={"Voltage": "6V DC", "No-load Speed": "200 RPM", "Stall Torque": "0.8 kgcm", "No-load Current": "60mA", "Stall Current": "500mA", "Shaft Diameter": "3mm"},
        price_inr=179.0, price_usd=2.2, availability="in_stock", stock_qty=220,
        image_url="https://robu.in/wp-content/uploads/2019/01/DC-Gear-Motor-6V.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=dc+gear+motor+6v", "Flipkart": "https://www.flipkart.com/search?q=dc+gear+motor", "Robu.in": "https://robu.in/?s=dc+gear+motor"},
        alternatives=["Servo Motor SG90", "Stepper Motor 28BYJ-48", "N20 Micro Gear Motor"],
        tags=["motor", "dc", "gear", "robot", "mechanical"], manufacturer="Generic", rating=4.2, reviews=4100
    ),
    "servo motor": CatalogProduct(
        id="MEC-003", name="SG90 Micro Servo Motor 9g", part_number="SG90",
        category="Mechanical", subcategory="Servos",
        description="Miniature servo motor, 180-degree rotation, 1.8kgcm torque, PWM control, 4.8-6V operation.",
        specifications={"Torque": "1.8 kgcm at 4.8V", "Speed": "0.1s/60deg at 4.8V", "Rotation": "0-180 degrees", "Control": "PWM 50Hz", "Weight": "9g", "Voltage": "4.8-6V"},
        price_inr=129.0, price_usd=1.6, availability="in_stock", stock_qty=380,
        image_url="https://robu.in/wp-content/uploads/2019/01/SG90-Servo-Motor.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=sg90+servo+motor", "Flipkart": "https://www.flipkart.com/search?q=sg90+servo", "Robu.in": "https://robu.in/?s=sg90"},
        alternatives=["MG996R Servo", "DS3218 Servo", "SG5010 Servo"],
        tags=["servo", "motor", "robot", "mechanical", "pwm"], manufacturer="Tower Pro", rating=4.3, reviews=9800
    ),
    "lipo battery": CatalogProduct(
        id="ELC-003", name="Li-Po Battery 7.4V 1000mAh 2S", part_number="LIPO-7V4-1000",
        category="Electrical", subcategory="Power",
        description="2-cell lithium polymer battery pack, 7.4V nominal, 1000mAh capacity, 20C discharge, JST connector.",
        specifications={"Voltage": "7.4V nominal (8.4V max)", "Capacity": "1000mAh", "Cells": "2S", "Discharge Rate": "20C (20A)", "Connector": "JST-XH 2.54mm", "Weight": "58g"},
        price_inr=699.0, price_usd=8.4, availability="in_stock", stock_qty=90,
        image_url="https://robu.in/wp-content/uploads/2019/01/LiPo-Battery-7.4V-1000mAh.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=lipo+battery+7.4v+1000mah", "Flipkart": "https://www.flipkart.com/search?q=lipo+battery", "Robu.in": "https://robu.in/?s=lipo+battery"},
        alternatives=["18650 Li-Ion Battery", "9V Alkaline Battery", "LiPo 11.1V 2200mAh"],
        tags=["battery", "lipo", "power", "robot"], manufacturer="Generic", rating=4.1, reviews=2300
    ),
    "pir sensor": CatalogProduct(
        id="SEN-005", name="PIR Motion Sensor HC-SR501", part_number="HC-SR501",
        category="Electrical", subcategory="Sensors",
        description="Passive infrared motion detection sensor, 3-7m range, 110-degree cone, adjustable sensitivity and delay.",
        specifications={"Detection Range": "3-7m", "Detection Angle": "110 degrees", "Supply Voltage": "4.5-20V", "Output": "Digital TTL 3.3V", "Delay Time": "0.3-200s adjustable", "Sensitivity": "Adjustable"},
        price_inr=79.0, price_usd=0.95, availability="in_stock", stock_qty=520,
        image_url="https://robu.in/wp-content/uploads/2019/01/PIR-Motion-Sensor-HC-SR501.jpg",
        buy_urls={"Amazon": "https://www.amazon.in/s?k=pir+sensor+hc-sr501", "Flipkart": "https://www.flipkart.com/search?q=pir+sensor", "Robu.in": "https://robu.in/?s=pir+sensor"},
        alternatives=["RCWL-0516 Microwave Sensor", "AM312 Mini PIR", "Ultrasonic HC-SR04"],
        tags=["sensor", "pir", "motion", "security", "iot"], manufacturer="Generic", rating=4.4, reviews=12600
    ),
}


def search_catalog(query: str) -> List[CatalogProduct]:
    """Search catalog by keyword."""
    q = query.lower()
    results = []
    for key, product in CATALOG.items():
        if (q in key or q in product.name.lower() or
                any(q in tag for tag in product.tags) or
                q in product.category.lower() or
                q in product.subcategory.lower()):
            results.append(product)
    return results


def get_by_id(product_id: str) -> Optional[CatalogProduct]:
    for p in CATALOG.values():
        if p.id == product_id:
            return p
    return None


def get_catalog_for_components(component_names: List[str]) -> List[CatalogProduct]:
    """Match component names to catalog entries."""
    results = []
    seen_ids = set()
    for name in component_names:
        name_lower = name.lower()
        best_match = None
        best_score = 0
        for key, product in CATALOG.items():
            score = 0
            if key in name_lower or name_lower in key:
                score += 10
            for tag in product.tags:
                if tag in name_lower or name_lower in tag:
                    score += 3
            if product.name.lower() in name_lower or name_lower in product.name.lower():
                score += 5
            if score > best_score:
                best_score = score
                best_match = product
        if best_match and best_score > 0 and best_match.id not in seen_ids:
            seen_ids.add(best_match.id)
            results.append(best_match)
    return results
