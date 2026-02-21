'use client';
// src/components/VoiceAssistant.jsx
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, X, Volume2, Loader2, Bug, RefreshCw } from 'lucide-react';
import { getNetworkStats } from '@/services/riskEngine';
import { useData } from '@/contexts/DataContext';

const MODEL = "models/gemini-2.5-flash-native-audio-preview-12-2025";
const HOST = "generativelanguage.googleapis.com";

export default function VoiceAssistant() {
    const { nodes, alerts, events, orders, routes } = useData();
    const networkStats = getNetworkStats(nodes || [], events || []);
    const [open, setOpen] = useState(false);
    const [connected, setConnected] = useState(false);
    const [listening, setListening] = useState(false);
    const [volume, setVolume] = useState(0);
    const [aiSpeaking, setAiSpeaking] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [showDebug, setShowDebug] = useState(false);
    const [debugLog, setDebugLog] = useState([]);

    const wsRef = useRef(null);
    const audioContextRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const sourceNodeRef = useRef(null);
    const processorNodeRef = useRef(null);
    const audioOutputQueueRef = useRef([]);
    const isPlayingRef = useRef(false);
    const nextPlayTimeRef = useRef(0); // Audio smoothing

    const logDebug = (msg) => {
        setDebugLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()} - ${msg}`]);
    };

    // Initialize Web Socket connection when modal opens
    useEffect(() => {
        if (!open) return;
        connectWebSocket();

        return () => {
            disconnectAll();
        };
    }, [open]);

    const connectWebSocket = () => {
        logDebug("Attempting WebSocket Connection...");
        setErrorMessage('');

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
        if (!apiKey || apiKey === "your_gemini_api_key_here") {
            setErrorMessage("Error: Missing valid Gemini API Key in .env.local");
            logDebug("Failed: Missing API Key");
            return;
        }

        const WS_URL = `wss://${HOST}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
        wsRef.current = new WebSocket(WS_URL);

        wsRef.current.onopen = () => {
            logDebug("WebSocket Opened. Sending Setup...");
            setConnected(true);
            setErrorMessage('');
            sendSetupMessage();
        };

        wsRef.current.onclose = (event) => {
            logDebug(`WebSocket Closed (Code: ${event.code})`);
            setConnected(false);
            stopRecording();

            if (event.code !== 1000 && event.code !== 1005 && !errorMessage) {
                setErrorMessage(`Connection closed unexpectedly (Code: ${event.code})`);
            }
        };

        wsRef.current.onerror = (e) => {
            console.error("WebSocket Error: ", e);
            logDebug("WebSocket Error occurred");
            setErrorMessage("WebSocket Connection error occurred. Please try reconnecting.");
        };

        wsRef.current.onmessage = async (event) => {
            if (event.data instanceof Blob) {
                const text = await event.data.text();
                handleServerMessage(JSON.parse(text));
            } else {
                handleServerMessage(JSON.parse(event.data));
            }
        };
    };

    const disconnectAll = () => {
        logDebug("Disconnecting everything...");
        stopRecording();
        if (wsRef.current) {
            wsRef.current.close(1000, "User closed modal");
        }
        setConnected(false);
        audioOutputQueueRef.current = [];
        isPlayingRef.current = false;
        nextPlayTimeRef.current = 0;
    };

    const sendSetupMessage = () => {
        const contextData = `You are a real-time vocal AI assistant named SupplyGuard AI. You are helping manage a supply chain platform.
IMPORTANT INSTRUCTION: Automatically detect the language the user is speaking in, and respond in that EXACT same language naturally and fluently. Switch languages dynamically if the user switches languages mid-conversation.
Current Network Status:
- Average Risk Score: ${networkStats.avg}/100
- High Risk Nodes: ${networkStats.high}
- Active Alerts: ${(alerts || []).length}

LIVE SUPPLY CHAIN DATA:
Nodes (Cities/Hubs): ${JSON.stringify((nodes || []).map(n => ({ id: n.id, name: n.name, type: n.type, region: n.region, reliability: n.reliability })))}
Active Disruption Events: ${JSON.stringify((events || []).map(e => ({ title: e.title, type: e.type, severity: e.severity, affectedNodes: e.affectedNodes })))}
Active Orders: ${JSON.stringify((orders || []).map(o => ({ id: o.id, name: o.name, status: o.status, origin: o.origin, dest: o.destination, delayDays: o.delayDays, riskReason: o.riskReason })))}

Speak naturally and concisely since this is a real-time voice conversation. Answer any questions the user has about their supply chain, orders, or delays based ONLY on the data provided above. Keep answers to less than 3 sentences.`;

        const setupMessage = {
            setup: {
                model: MODEL,
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: "Aoede" // Other options: Puck, Charon, Kore, Fenrir
                            }
                        }
                    }
                },
                systemInstruction: {
                    parts: [{ text: contextData }]
                }
            }
        };
        logDebug("Sent setup message.");
        wsRef.current?.send(JSON.stringify(setupMessage));
    };

    const handleServerMessage = (data) => {
        if (data.serverContent) {
            const turn = data.serverContent.modelTurn;
            if (turn && turn.parts) {
                turn.parts.forEach(part => {
                    if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                        playAudioChunk(part.inlineData.data);
                    }
                });
            }
            if (data.serverContent.turnComplete) {
                logDebug("AI Turn Complete.");
            }
        }
        if (data.setupComplete) {
            logDebug("Setup Complete. Ready for audio.");
        }
    };

    // --- Audio Playback (Server to Client - Smooth Continuous Streaming) ---
    const playAudioChunk = async (base64Audio) => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
        }

        const binaryString = window.atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
        }

        const audioBuffer = audioContextRef.current.createBuffer(1, float32Array.length, 24000);
        audioBuffer.getChannelData(0).set(float32Array);

        // Continuous buffering logic for smoother playback
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);

        const currentTime = audioContextRef.current.currentTime;
        if (currentTime < nextPlayTimeRef.current) {
            source.start(nextPlayTimeRef.current);
            nextPlayTimeRef.current += audioBuffer.duration;
        } else {
            source.start(currentTime);
            nextPlayTimeRef.current = currentTime + audioBuffer.duration;
        }

        setAiSpeaking(true);
        isPlayingRef.current = true;

        source.onended = () => {
            // Check if we've reached the end of the buffered audio
            if (audioContextRef.current.currentTime >= nextPlayTimeRef.current - 0.1) {
                isPlayingRef.current = false;
                setAiSpeaking(false);
            }
        };
    };

    // --- Audio Recording (Client to Server) ---
    const startRecording = async () => {
        if (!connected) {
            setErrorMessage("Cannot start recording. WebSocket not connected.");
            return;
        }
        try {
            logDebug("Requesting Microhpone...");
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
            } else if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            sourceNodeRef.current = audioContextRef.current.createMediaStreamSource(stream);
            processorNodeRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

            processorNodeRef.current.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);

                let sum = 0.0;
                for (let i = 0; i < inputData.length; i++) {
                    sum += inputData[i] * inputData[i];
                }
                setVolume(Math.sqrt(sum / inputData.length));

                const pcmData = new Int16Array(inputData.length);
                for (let i = 0; i < inputData.length; i++) {
                    let s = Math.max(-1, Math.min(1, inputData[i]));
                    pcmData[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Base64 encoding the raw bits
                let binary = '';
                const bytes = new Uint8Array(pcmData.buffer);
                for (let i = 0; i < bytes.byteLength; i++) {
                    binary += String.fromCharCode(bytes[i]);
                }
                const base64Audio = btoa(binary);

                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                        realtimeInput: {
                            mediaChunks: [{
                                mimeType: "audio/pcm;rate=16000",
                                data: base64Audio
                            }]
                        }
                    }));
                }
            };

            sourceNodeRef.current.connect(processorNodeRef.current);
            processorNodeRef.current.connect(audioContextRef.current.destination);

            setListening(true);
            logDebug("Recording started stream.");
            setErrorMessage('');
        } catch (err) {
            console.error("Failed to start recording:", err);
            logDebug("Microphone access denied.");
            setErrorMessage("Microphone access denied. Please approve browser permissions.");
        }
    };

    const stopRecording = () => {
        if (processorNodeRef.current && sourceNodeRef.current) {
            sourceNodeRef.current.disconnect();
            processorNodeRef.current.disconnect();
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }

        if (listening) {
            setListening(false);
            setVolume(0);
            logDebug("Recording stopped. Turn Complete sent.");

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    clientContent: {
                        turnComplete: true
                    }
                }));
            }
        }
    };

    const toggleListen = () => {
        setErrorMessage('');
        if (listening) {
            stopRecording();
        } else {
            if (!connected) {
                // Attempt to reconnect if disconnected, then user must click again
                connectWebSocket();
            } else {
                startRecording();
            }
        }
    };

    const handleReconnect = () => {
        disconnectAll();
        setTimeout(() => connectWebSocket(), 500);
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                title="Open Voice Assistant"
                style={{
                    position: 'fixed',
                    bottom: '28px', right: '28px',
                    width: '56px', height: '56px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                    border: 'none',
                    cursor: 'pointer',
                    display: open ? 'none' : 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(34,211,238,0.4), 0 4px 20px rgba(0,0,0,0.3)',
                    zIndex: 200,
                    animation: 'pulse-glow 2s ease-in-out infinite',
                }}>
                <Mic size={22} color="#fff" />
                <style>{`
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 20px rgba(34,211,238,0.4), 0 4px 20px rgba(0,0,0,0.3); }
            50% { box-shadow: 0 0 40px rgba(34,211,238,0.7), 0 4px 20px rgba(0,0,0,0.3); }
          }
        `}</style>
            </button>

            {open && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 200,
                    display: 'flex',
                    alignItems: 'flex-end', justifyContent: 'flex-end',
                    padding: '28px',
                }} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
                    <div style={{
                        width: '420px',
                        height: '520px',
                        display: 'flex',
                        flexDirection: 'column',
                        background: '#0d1424',
                        border: '1px solid rgba(34,211,238,0.2)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 0 60px rgba(34,211,238,0.15), 0 20px 60px rgba(0,0,0,0.5)',
                        position: 'relative'
                    }}>
                        <div style={{
                            padding: '16px 20px',
                            background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(139,92,246,0.1))',
                            borderBottom: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            flexShrink: 0
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '32px', height: '32px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Volume2 size={14} color="#fff" />
                                </div>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#f1f5f9' }}>SupplyGuard LIVE</div>
                                    <div style={{ fontSize: '11px', color: connected ? '#22c55e' : (errorMessage ? '#ef4444' : '#f59e0b') }}>
                                        {connected ? '● Connected to Gemini Live' : (errorMessage ? 'Connection Failed' : 'Connecting to Live API...')}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button onClick={() => setShowDebug(!showDebug)} title="Debug Info" style={{ background: 'none', border: 'none', color: showDebug ? '#22d3ee' : '#475569', cursor: 'pointer' }}>
                                    <Bug size={16} />
                                </button>
                                <button onClick={handleReconnect} title="Force Reconnect" style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                                    <RefreshCw size={16} />
                                </button>
                                <button onClick={() => setOpen(false)} title="Close" style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer' }}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Debug Panel Overlay */}
                        {showDebug && (
                            <div style={{
                                position: 'absolute',
                                top: '65px', left: '10px', right: '10px',
                                background: 'rgba(15, 23, 42, 0.95)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(34,211,238,0.3)',
                                borderRadius: '8px',
                                padding: '12px',
                                zIndex: 10,
                                fontSize: '11px',
                                color: '#38bdf8',
                                pointerEvents: 'none',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                            }}>
                                <h4 style={{ margin: '0 0 6px 0', color: '#fff' }}>Debug Info</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                                    <div>WS State: {wsRef.current ? wsRef.current.readyState : 'Null'}</div>
                                    <div>Connected: {connected.toString()}</div>
                                    <div>Listening: {listening.toString()}</div>
                                    <div>AI Speaking: {aiSpeaking.toString()}</div>
                                    <div>Volume Level: {volume.toFixed(3)}</div>
                                </div>
                                <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
                                    <span style={{ color: '#94a3b8' }}>Event Log:</span>
                                    {debugLog.map((log, i) => <div key={i} className="truncate">{log}</div>)}
                                </div>
                            </div>
                        )}

                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '40px',
                            position: 'relative'
                        }}>
                            <div style={{
                                width: '140px',
                                height: '140px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0d1424, #1e293b)',
                                boxShadow: aiSpeaking
                                    ? '0 0 50px rgba(139,92,246,0.6), inset 0 0 20px rgba(139,92,246,0.5)'
                                    : (listening ? '0 0 30px rgba(239,68,68,0.3), inset 0 0 10px rgba(239,68,68,0.1)' : '0 0 20px rgba(34,211,238,0.2), inset 0 0 10px rgba(34,211,238,0.1)'),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid rgba(255,255,255,0.1)',
                                transition: 'all 0.1s ease',
                                transform: aiSpeaking ? `scale(${1 + Math.random() * 0.08})` : (listening ? `scale(${1 + volume * 2.5})` : 'scale(1)')
                            }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: aiSpeaking
                                        ? 'linear-gradient(135deg, #8b5cf6, #d946ef)'
                                        : (listening ? 'linear-gradient(135deg, #ef4444, #f97316)' : 'linear-gradient(135deg, #22d3ee, #3b82f6)'),
                                    opacity: 0.8,
                                    filter: 'blur(8px)',
                                    animation: aiSpeaking ? 'pulse-glow 1s infinite alternate' : 'pulse-glow 3s infinite alternate'
                                }}></div>
                            </div>

                            <div style={{
                                marginTop: '40px',
                                fontSize: '14px',
                                color: '#94a3b8',
                                textAlign: 'center',
                                minHeight: '40px'
                            }}>
                                {errorMessage ? (
                                    <div className="text-red-400 max-w-xs">{errorMessage}</div>
                                ) : !connected ? (
                                    <div className="flex items-center gap-2 text-cyan-400">
                                        <Loader2 size={16} className="animate-spin" />
                                        Initializing connection...
                                    </div>
                                ) : (
                                    aiSpeaking ? "AI is speaking..." :
                                        listening ? "Listening... Speak now." :
                                            "Click the microphone to start."
                                )}
                            </div>

                            {listening && !aiSpeaking && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '20px',
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    width: '120px',
                                    height: '4px',
                                    background: 'rgba(255,255,255,0.1)',
                                    borderRadius: '2px',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        width: `${Math.min(100, volume * 1000)}%`,
                                        height: '100%',
                                        background: '#ef4444',
                                        transition: 'width 0.05s linear'
                                    }}></div>
                                </div>
                            )}
                        </div>

                        <div style={{
                            padding: '24px',
                            background: 'rgba(13, 20, 36, 0.95)',
                            borderTop: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <button onClick={toggleListen} title={listening ? "Stop Recording" : (connected ? "Start Recording" : "Reconnect")} style={{
                                width: '70px', height: '70px',
                                borderRadius: '50%',
                                background: listening ? 'rgba(239,68,68,0.2)' : 'rgba(34,211,238,0.15)',
                                border: `1px solid ${listening ? '#ef4444' : 'rgba(34,211,238,0.3)'}`,
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                                opacity: 1,
                                transition: 'all 0.2s ease',
                                boxShadow: listening ? '0 0 20px rgba(239,68,68,0.4)' : (!connected ? 'inset 0 0 10px rgba(0,0,0,0.5)' : 'none')
                            }}>
                                {listening
                                    ? <MicOff size={28} color="#ef4444" />
                                    : (!connected ? <RefreshCw size={28} color="#64748b" /> : <Mic size={28} color="#22d3ee" />)
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
