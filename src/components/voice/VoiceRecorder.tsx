'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Square, Play, Pause, RotateCcw, Send, CheckSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

import Button from '@/components/ui/Button';
import { useAuthStore, useAppStore } from '@/lib/store';
import { VoiceSession, Client } from '@/types';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  client?: Client;
  onTranscriptionComplete?: (transcription: string) => void;
}

export default function VoiceRecorder({ client, onTranscriptionComplete }: VoiceRecorderProps) {
  const { user } = useAuthStore();
  const { activeVoiceSession, setActiveVoiceSession, addVoiceSession, clients } = useAppStore();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [duration, setDuration] = useState(0);
  const [selectedClient, setSelectedClient] = useState<Client | null>(client || null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize voice session
  const initializeSession = () => {
    const session: VoiceSession = {
      id: uuidv4(),
      worker_id: user?.id || '',
      case_id: selectedClient?.id,
      client_id: selectedClient?.id, 
      transcription: '',
      duration: 0,
      status: 'recording',
      created_at: new Date().toISOString(),
    };
    
    setActiveVoiceSession(session);
    return session;
  };

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setIsPaused(false);
      
      const session = initializeSession();
      
      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  // Pause recording
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      toast.success('Recording paused');
    }
  };

  // Resume recording
  const resumeRecording = () => {
    if (mediaRecorderRef.current && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
      
      toast.success('Recording resumed');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      toast.success('Recording stopped');
    }
  };

  // Process recording with AI
  const processRecording = async () => {
    if (!activeVoiceSession || audioChunksRef.current.length === 0) {
      toast.error('No recording to process');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert to base64 for API
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        try {
          // Send to our API for processing
          const response = await fetch('/api/voice/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              audioData: base64Audio,
              sessionId: activeVoiceSession.id,
              clientId: selectedClient?.id,
              duration: duration,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to process audio');
          }

          const result = await response.json();
          
          // Update session with results
          const updatedSession: VoiceSession = {
            ...activeVoiceSession,
            transcription: result.transcription,
            duration: duration,
            status: 'completed',
            ai_analysis: result.analysis,
          };
          
          setActiveVoiceSession(updatedSession);
          addVoiceSession(updatedSession);
          setTranscription(result.transcription);
          
          if (onTranscriptionComplete) {
            onTranscriptionComplete(result.transcription);
          }
          
          toast.success('Recording processed successfully!');
        } catch (error) {
          console.error('Processing error:', error);
          toast.error('Failed to process recording');
        }
      };
    } catch (error) {
      console.error('Error processing recording:', error);
      toast.error('Failed to process recording');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset recording
  const resetRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setTranscription('');
    setActiveVoiceSession(null);
    audioChunksRef.current = [];
    
    toast.success('Recording reset');
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isRecording]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="space-y-6">
        {/* Client Selection */}
        {!client && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Client (Optional)
            </label>
            <select
              value={selectedClient?.id || ''}
              onChange={(e) => {
                const clientId = e.target.value;
                const client = clients.find(c => c.id === clientId);
                setSelectedClient(client || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No client selected</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Recording Status */}
        <div className="text-center">
          <div className={cn(
            'inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 transition-colors',
            isRecording 
              ? (isPaused ? 'bg-yellow-100' : 'bg-red-100 animate-pulse')
              : 'bg-gray-100'
          )}>
            {isRecording ? (
              isPaused ? (
                <Pause className="w-8 h-8 text-yellow-600" />
              ) : (
                <Mic className="w-8 h-8 text-red-600" />
              )
            ) : (
              <MicOff className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          <div className="text-2xl font-mono font-bold text-gray-900 mb-2">
            {formatDuration(duration)}
          </div>
          
          <p className="text-sm text-gray-600">
            {isRecording 
              ? (isPaused ? 'Recording paused' : 'Recording in progress...')
              : 'Ready to record'
            }
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-3">
          {!isRecording ? (
            <Button
              variant="primary"
              size="lg"
              onClick={startRecording}
              className="px-8"
            >
              <Mic className="mr-2 h-5 w-5" />
              Start Recording
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={resumeRecording}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Resume
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={pauseRecording}
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
              )}
              
              <Button
                variant="danger"
                size="lg"
                onClick={stopRecording}
              >
                <Square className="mr-2 h-4 w-4" />
                Stop
              </Button>
            </>
          )}
          
          {duration > 0 && !isRecording && (
            <>
              <Button
                variant="outline"
                size="lg"
                onClick={resetRecording}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
              
              <Button
                variant="primary"
                size="lg"
                onClick={processRecording}
                loading={isProcessing}
              >
                <Send className="mr-2 h-4 w-4" />
                Process
              </Button>
            </>
          )}
        </div>

        {/* Transcription Result */}
        {transcription && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Transcription
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">
                {transcription}
              </p>
            </div>
            
            {activeVoiceSession?.ai_analysis && (
              <div className="mt-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">AI Summary</h4>
                  <p className="text-gray-700 text-sm">
                    {activeVoiceSession.ai_analysis.summary}
                  </p>
                </div>
                
                {activeVoiceSession.ai_analysis.tasks.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Identified Tasks</h4>
                    <ul className="space-y-2">
                      {activeVoiceSession.ai_analysis.tasks.map((task, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-center">
                          <CheckSquare className="h-4 w-4 mr-2 text-green-600" />
                          {task.title}: {task.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="text-center text-sm text-gray-500 border-t pt-4">
          <p>Speak naturally about your case notes, observations, or action items.</p>
          <p>The AI will automatically extract tasks and generate professional documentation.</p>
        </div>
      </div>
    </div>
  );
} 