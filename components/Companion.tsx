
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse, generateReminiscenceImage, analyzeMood } from '../services/geminiService';
import { Icons } from '../constants';
import { MemoryEntry } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// Helpers for Audio Processing
function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface CompanionProps {
  onMemoryGenerated: (memory: MemoryEntry) => void;
  onMoodAnalyzed: (mood: { joy: number, engagement: number }) => void;
}

const Companion: React.FC<CompanionProps> = ({ onMemoryGenerated, onMoodAnalyzed }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: "Hello there! I'm Goldie. I was just thinking about the power of memories. Do you have a favorite childhood memory you'd like to tell me about?", timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Live Voice Refs
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const toggleVoiceMode = async () => {
    if (isVoiceMode) {
      if (sessionRef.current) sessionRef.current.close();
      setIsVoiceMode(false);
      setIsLiveConnected(false);
      return;
    }

    setIsVoiceMode(true);
    try {
      // Must use named parameter for apiKey
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputAudioContextRef.current = outputCtx;
      
      // Ensure audio context is resumed
      if (outputCtx.state === 'suspended') await outputCtx.resume();
      if (inputCtx.state === 'suspended') await inputCtx.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsLiveConnected(true);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => { setIsLiveConnected(false); setIsVoiceMode(false); },
          onerror: (e) => { console.error("Live Error", e); setIsLiveConnected(false); setIsVoiceMode(false); },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: "You are Goldie, a warm, patient, and nostalgic voice companion for seniors. Use gentle language, ask about their past, and provide emotional validation. Speak clearly and at a moderate pace."
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("Voice connection failed", err);
      setIsVoiceMode(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    try {
      analyzeMood(input).then(mood => onMoodAnalyzed(mood));
      const responseText = await getGeminiResponse(input);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText || "I'm here for you.", timestamp: Date.now() }]);
      if (input.toLowerCase().includes('remember') || input.toLowerCase().includes('memory')) handleReminiscence(input);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReminiscence = async (description: string) => {
    setIsGeneratingImage(true);
    try {
      const imageUrl = await generateReminiscenceImage(description);
      if (imageUrl) {
        onMemoryGenerated({ id: Date.now().toString(), title: "Memory Visual", description, imageUrl, timestamp: Date.now() });
        setMessages(prev => [...prev, { id: `img-${Date.now()}`, role: 'model', text: "Look! I've tried to capture that beautiful memory in a painting for you.", timestamp: Date.now() }]);
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px] bg-white rounded-[40px] senior-card overflow-hidden border-2 border-slate-100">
      <div className="bg-sky-50 p-6 border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 bg-amber-400 rounded-full flex items-center justify-center shadow-md ${isVoiceMode ? 'animate-pulse scale-110' : 'animate-float'}`}>
            <span className="text-3xl">{isVoiceMode ? '🎙️' : '😊'}</span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-xl">Goldie</h3>
            <span className="text-emerald-600 font-bold text-sm flex items-center gap-1 uppercase tracking-tighter">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {isVoiceMode ? 'Listening to you...' : 'Ready to Chat'}
            </span>
          </div>
        </div>
        <button 
          onClick={toggleVoiceMode}
          className={`px-8 py-3 rounded-2xl font-black text-lg transition-all flex items-center gap-3 shadow-lg ${
            isVoiceMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-sky-600 text-white hover:bg-sky-700'
          }`}
        >
          {isVoiceMode ? 'Stop Voice' : 'Talk with Voice'}
          <Icons.Mic />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50">
        {isVoiceMode && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="w-40 h-40 bg-sky-100 rounded-full flex items-center justify-center animate-bounce shadow-inner border-4 border-sky-200">
              <span className="text-7xl">👂</span>
            </div>
            <h4 className="text-3xl font-black text-slate-900">I'm listening, dear...</h4>
            <p className="text-slate-600 text-xl font-medium max-w-sm">Just start talking. Tell me about your childhood or what's on your mind today.</p>
          </div>
        )}
        {!isVoiceMode && messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-3xl text-xl font-medium leading-relaxed shadow-sm ${
              msg.role === 'user' ? 'bg-sky-600 text-white rounded-tr-none' : 'bg-white text-slate-900 border-2 border-slate-100 rounded-tl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && <div className="flex justify-start"><div className="bg-white border-2 p-4 rounded-3xl rounded-tl-none flex gap-1"><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" /><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'150ms'}} /><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay:'300ms'}} /></div></div>}
        {isGeneratingImage && <div className="flex justify-start"><div className="bg-sky-50 border-2 border-sky-200 p-5 rounded-3xl flex items-center gap-3"><div className="w-6 h-6 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" /><span className="text-sky-800 font-bold italic">Painting your memory...</span></div></div>}
      </div>

      {!isVoiceMode && (
        <div className="p-6 border-t bg-white">
          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message here..."
              className="flex-1 p-6 rounded-2xl border-4 border-slate-200 bg-white focus:border-sky-600 outline-none text-2xl text-black font-bold placeholder-slate-400 shadow-inner"
            />
            <button 
              onClick={handleSend} 
              disabled={!input.trim() || isTyping} 
              className="bg-sky-600 text-white px-10 rounded-2xl font-black text-xl hover:bg-sky-700 active:scale-95 shadow-lg disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companion;
