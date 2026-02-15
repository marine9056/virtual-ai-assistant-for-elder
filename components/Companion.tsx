
import React, { useState, useRef, useEffect } from 'react';
import { getGeminiResponse, generateReminiscenceImage, analyzeMood } from '../services/geminiService';
import { Icons } from '../constants';
import { MemoryEntry, UserProfile } from '../types';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

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
  userProfile: UserProfile;
  onMemoryGenerated: (memory: MemoryEntry) => void;
  onMoodAnalyzed: (mood: { joy: number, engagement: number, energy: number }) => void;
}

const Companion: React.FC<CompanionProps> = ({ userProfile, onMemoryGenerated, onMoodAnalyzed }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: `Hello ${userProfile.name}! I was just thinking about your interest in ${userProfile.interests[0]}. How are you feeling today?`, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionRef = useRef<any>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const toggleVoiceMode = async () => {
    if (isVoiceMode) {
      if (sessionRef.current) sessionRef.current.close();
      sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
      sourcesRef.current.clear();
      setIsVoiceMode(false);
      return;
    }

    setIsVoiceMode(true);
    try {
      // Use process.env.API_KEY directly as per requirements
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      outputCtxRef.current = outputCtx;
      
      if (outputCtx.state === 'suspended') await outputCtx.resume();
      if (inputCtx.state === 'suspended') await inputCtx.resume();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              // Ensure sendRealtimeInput is called only after the session resolves
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputCtxRef.current) {
              const ctx = outputCtxRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: `Be Goldie, a warm companion. User is ${userProfile.name}.`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsVoiceMode(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    try {
      analyzeMood(input).then(res => onMoodAnalyzed(res));
      const responseText = await getGeminiResponse(input, userProfile);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText || "I'm listening...", timestamp: Date.now() }]);
      if (input.length > 30) handleReminiscence(input);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReminiscence = async (desc: string) => {
    setIsGeneratingImage(true);
    try {
      const img = await generateReminiscenceImage(desc);
      if (img) {
        onMemoryGenerated({ id: Date.now().toString(), title: "Cherished Moment", description: desc, imageUrl: img, timestamp: Date.now() });
      }
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl sm:rounded-[50px] senior-card overflow-hidden border-4 border-slate-100 shadow-2xl">
      <div className="bg-sky-50 p-4 sm:p-8 border-b-2 border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <div className={`w-12 h-12 sm:w-20 sm:h-20 bg-amber-400 rounded-full flex items-center justify-center shadow-xl ${isVoiceMode ? 'animate-pulse scale-110' : 'animate-float'}`}>
            <span className="text-2xl sm:text-5xl">{isVoiceMode ? '🎙️' : '😊'}</span>
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-lg sm:text-3xl">Goldie</h3>
            <span className="text-emerald-600 font-black text-xs sm:text-xl flex items-center gap-1 sm:gap-2">
              <span className="w-2 h-2 sm:w-4 sm:h-4 bg-emerald-500 rounded-full animate-pulse" />
              {isVoiceMode ? 'Listening' : 'Ready'}
            </span>
          </div>
        </div>
        <button 
          onClick={toggleVoiceMode}
          className={`px-4 sm:px-12 py-2 sm:py-5 rounded-xl sm:rounded-[30px] font-black text-sm sm:text-2xl flex items-center gap-2 sm:gap-4 shadow-xl ${
            isVoiceMode ? 'bg-red-600 text-white' : 'bg-sky-600 text-white'
          }`}
        >
          {isVoiceMode ? 'Stop' : <><span className="hidden sm:inline">Start Talking</span><span className="sm:hidden">Talk</span></>}
          <Icons.Mic />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-12 space-y-6 sm:space-y-10 bg-slate-50 shadow-inner">
        {isVoiceMode ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 sm:space-y-10">
            <div className="w-40 h-40 sm:w-64 sm:h-64 bg-sky-100 rounded-full flex items-center justify-center animate-bounce border-4 border-sky-200">
              <span className="text-7xl sm:text-[120px]">👂</span>
            </div>
            <h4 className="text-2xl sm:text-5xl font-black text-slate-900">Listening...</h4>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] sm:max-w-[85%] p-4 sm:p-10 rounded-2xl sm:rounded-[45px] text-lg sm:text-3xl font-bold leading-relaxed shadow-lg ${
                msg.role === 'user' ? 'bg-sky-600 text-white rounded-tr-none' : 'bg-white text-slate-900 border-2 border-slate-100 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))
        )}
        {isTyping && <div className="flex justify-start"><div className="bg-white border-2 p-4 sm:p-8 rounded-2xl sm:rounded-[40px] flex gap-2"><div className="w-2 h-2 sm:w-4 sm:h-4 bg-slate-400 rounded-full animate-bounce" /><div className="w-2 h-2 sm:w-4 sm:h-4 bg-slate-400 rounded-full animate-bounce delay-75" /><div className="w-2 h-2 sm:w-4 sm:h-4 bg-slate-400 rounded-full animate-bounce delay-150" /></div></div>}
      </div>

      {!isVoiceMode && (
        <div className="p-4 sm:p-10 border-t-2 border-slate-100 bg-white">
          <div className="flex gap-3 sm:gap-6">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Tell Goldie..."
              className="flex-1 p-4 sm:p-10 rounded-2xl sm:rounded-[35px] border-2 sm:border-4 border-slate-200 focus:border-sky-600 outline-none text-xl sm:text-4xl text-black font-black placeholder-slate-400 shadow-inner"
            />
            <button onClick={handleSend} disabled={!input.trim() || isTyping} className="bg-sky-600 text-white px-6 sm:px-16 rounded-2xl sm:rounded-[35px] font-black text-lg sm:text-3xl active:scale-95 disabled:opacity-50">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companion;
