"use client";
import { useState, useEffect } from "react";
import { Cpu, Zap, TrendingUp, MapPin, BarChart3, ArrowRight, Sparkles } from "lucide-react";

const EXAMPLE_PROJECTS = [
  { title: "Smart Irrigation System using IoT", tags: ["Arduino", "Soil Sensor", "ESP8266", "Relay"], color: "from-cyan-500 to-blue-600" },
  { title: "Line Following Robot", tags: ["Arduino", "IR Sensor", "L298N", "DC Motor"], color: "from-blue-500 to-purple-600" },
  { title: "Home Automation with Raspberry Pi", tags: ["Raspberry Pi", "Relay", "PIR Sensor", "WiFi"], color: "from-purple-500 to-pink-600" },
  { title: "Gesture Controlled Robotic Arm", tags: ["Arduino", "Servo Motor", "MPU6050", "Flex Sensor"], color: "from-pink-500 to-red-600" },
  { title: "Air Quality Monitoring Station", tags: ["ESP32", "MQ135", "DHT22", "OLED Display"], color: "from-green-500 to-cyan-600" },
  { title: "Automatic Plant Watering System", tags: ["Arduino Nano", "Soil Sensor", "Water Pump", "RTC"], color: "from-amber-500 to-orange-600" },
];

const STATS = [
  { icon: <Cpu className="w-5 h-5" />, value: "500+", label: "Components", color: "text-cyan-400" },
  { icon: <TrendingUp className="w-5 h-5" />, value: "3", label: "Platforms", color: "text-blue-400" },
  { icon: <MapPin className="w-5 h-5" />, value: "Local", label: "Store Finder", color: "text-purple-400" },
  { icon: <BarChart3 className="w-5 h-5" />, value: "Live", label: "Price Compare", color: "text-green-400" },
];

const TYPING_TEXTS = [
  "Smart Irrigation System using IoT",
  "Line Following Robot",
  "Home Automation with Raspberry Pi",
  "Gesture Controlled Robotic Arm",
  "Air Quality Monitoring Station",
  "Bluetooth Controlled Car",
];

export default function SearchEmptyState({ onSelect }: { onSelect: (title: string) => void }) {
  const [typingText, setTypingText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Typewriter effect
  useEffect(() => {
    const current = TYPING_TEXTS[textIndex];
    const timeout = setTimeout(() => {
      if (!deleting) {
        if (charIndex < current.length) {
          setTypingText(current.slice(0, charIndex + 1));
          setCharIndex(c => c + 1);
        } else {
          setTimeout(() => setDeleting(true), 1800);
        }
      } else {
        if (charIndex > 0) {
          setTypingText(current.slice(0, charIndex - 1));
          setCharIndex(c => c - 1);
        } else {
          setDeleting(false);
          setTextIndex(i => (i + 1) % TYPING_TEXTS.length);
        }
      }
    }, deleting ? 35 : 65);
    return () => clearTimeout(timeout);
  }, [charIndex, deleting, textIndex]);

  return (
    <div className="w-full">
      {/* Typewriter hint */}
      <div className="text-center mb-10">
        <p className="text-gray-500 text-sm mb-2">Try searching for:</p>
        <div className="inline-flex items-center gap-2 text-cyan-400 text-lg font-medium min-h-[2rem]">
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          <span>{typingText}</span>
          <span className="w-0.5 h-5 bg-cyan-400 animate-pulse inline-block" />
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {STATS.map((s) => (
          <div key={s.label} className="bg-gray-900/60 border border-gray-800 rounded-2xl p-4 text-center hover:border-gray-600 transition-colors">
            <div className={`flex justify-center mb-2 ${s.color}`}>{s.icon}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Project cards */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-5">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h2 className="text-white font-semibold">Popular Projects</h2>
          <span className="text-gray-500 text-sm">— click to analyze instantly</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EXAMPLE_PROJECTS.map((project, i) => (
            <button
              key={project.title}
              onClick={() => onSelect(project.title)}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
              className="group text-left bg-gray-900/60 border border-gray-800 hover:border-cyan-700 rounded-2xl p-5 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10"
            >
              {/* Gradient top bar */}
              <div className={`h-1 w-full rounded-full bg-gradient-to-r ${project.color} mb-4 transition-all ${hoveredCard === i ? "opacity-100" : "opacity-50"}`} />

              <h3 className="text-white font-medium text-sm mb-3 leading-snug group-hover:text-cyan-300 transition-colors">
                {project.title}
              </h3>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {project.tags.map(tag => (
                  <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-1 text-xs text-cyan-500 group-hover:text-cyan-400 transition-colors">
                <span>Analyze now</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* How it works mini */}
      <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-5 text-center">How COTsify works</h3>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { step: "1", icon: "✏️", title: "Enter project title", desc: "Type any project name above" },
            { step: "2", icon: "🤖", title: "AI extracts components", desc: "GPT identifies every part needed" },
            { step: "3", icon: "🛒", title: "Compare & source", desc: "Find prices across Amazon, Flipkart, Robu.in" },
          ].map(item => (
            <div key={item.step} className="text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <div className="text-xs font-bold text-cyan-500 tracking-widest mb-1">STEP {item.step}</div>
              <div className="text-white text-sm font-medium mb-1">{item.title}</div>
              <div className="text-gray-500 text-xs">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
