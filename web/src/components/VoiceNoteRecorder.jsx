import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';
import { Progress } from './ui/Progress';
import { Badge } from './ui/Badge';
import { Card, CardContent } from './ui/Card';
import { Mic, MicOff, Square, Upload, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { api } from '../lib/api';
import { logger } from '../lib/logger';

const VoiceNoteRecorder = ({ 
  open, 
  onClose, 
  clientId = null, 
  onNoteCreated,
  title = "Record Voice Note" 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [audioURL, setAudioURL] = useState(null);
  const [recordingStatus, setRecordingStatus] = useState('idle'); // idle, recording, paused, stopped, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const durationTimerRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    // Reset state when dialog opens/closes
    if (!open) {
      resetRecording();
    }
  }, [open]);

  const resetRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setIsProcessing(false);
    setRecordingDuration(0);
    setProcessingProgress(0);
    setAudioURL(null);
    setRecordingStatus('idle');
    setErrorMessage('');
    audioChunksRef.current = [];
    
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } 
      });
      return stream;
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setErrorMessage('Microphone access is required to record voice notes. Please allow microphone access and try again.');
      setRecordingStatus('error');
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      setErrorMessage('');
      const stream = await requestMicrophonePermission();
      
      // Clear any previous recording
      audioChunksRef.current = [];
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
          setRecordingStatus('stopped');
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingStatus('recording');
      setRecordingDuration(0);
      
      // Start duration timer
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
      logger.info('Voice recording started', 'VoiceRecorder');
      
    } catch (error) {
      logger.error('Failed to start recording', error, 'VoiceRecorder');
      setRecordingStatus('error');
      setErrorMessage('Failed to start recording. Please check your microphone and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
    }
    
    logger.info('Voice recording stopped', 'VoiceRecorder');
  };

  const processRecording = async () => {
    if (!audioChunksRef.current.length) {
      setErrorMessage('No audio data available. Please record again.');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingProgress(0);
      setRecordingStatus('processing');
      
      // Simulate processing progress
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Create audio file from recorded chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const audioFile = new File([audioBlob], `voice_note_${Date.now()}.webm`, {
        type: 'audio/webm'
      });

      logger.info(`Processing audio file: ${audioFile.name}, Size: ${audioFile.size} bytes`, 'VoiceRecorder');

      // Upload for transcription
      const response = await api.uploadAudioForTranscription(audioFile, clientId);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      
      logger.info('Voice note processed successfully', response, 'VoiceRecorder');
      
      setTimeout(() => {
        setRecordingStatus('success');
        if (onNoteCreated) {
          onNoteCreated(response.case_note);
        }
      }, 500);

    } catch (error) {
      logger.error('Failed to process voice note', error, 'VoiceRecorder');
      setRecordingStatus('error');
      setErrorMessage('Failed to process voice note. Please check your connection and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (recordingStatus) {
      case 'recording': return 'bg-red-500';
      case 'stopped': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (recordingStatus) {
      case 'recording': return 'Recording...';
      case 'stopped': return 'Ready to Process';
      case 'processing': return 'Processing...';
      case 'success': return 'Success!';
      case 'error': return 'Error';
      default: return 'Ready';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {title}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-auto p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status Badge */}
          <div className="flex justify-center">
            <Badge variant="secondary" className={`${getStatusColor()} text-white`}>
              {getStatusText()}
            </Badge>
          </div>

          {/* Recording Controls */}
          <div className="flex flex-col items-center space-y-4">
            {recordingStatus === 'idle' && (
              <Button
                onClick={startRecording}
                size="lg"
                className="w-24 h-24 rounded-full bg-green-600 hover:bg-green-700 text-white"
              >
                <Mic className="h-8 w-8" />
              </Button>
            )}

            {recordingStatus === 'recording' && (
              <div className="flex flex-col items-center space-y-4">
                <Button
                  onClick={stopRecording}
                  size="lg"
                  className="w-24 h-24 rounded-full bg-red-600 hover:bg-red-700 text-white animate-pulse"
                >
                  <Square className="h-6 w-6" />
                </Button>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatDuration(recordingDuration)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Speak clearly for best transcription
                  </div>
                </div>
              </div>
            )}

            {recordingStatus === 'stopped' && (
              <div className="flex flex-col items-center space-y-4">
                <Button
                  onClick={processRecording}
                  size="lg"
                  className="w-24 h-24 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Upload className="h-6 w-6" />
                </Button>
                <div className="text-center">
                  <div className="text-lg font-semibold">
                    Recording Complete
                  </div>
                  <div className="text-sm text-gray-500">
                    Duration: {formatDuration(recordingDuration)}
                  </div>
                </div>
              </div>
            )}

            {recordingStatus === 'processing' && (
              <div className="flex flex-col items-center space-y-4 w-full">
                <div className="w-24 h-24 rounded-full bg-yellow-500 flex items-center justify-center animate-spin">
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                    <Upload className="h-6 w-6 text-yellow-500" />
                  </div>
                </div>
                <div className="text-center w-full">
                  <div className="text-lg font-semibold mb-2">
                    Processing Voice Note...
                  </div>
                  <Progress value={processingProgress} className="w-full" />
                  <div className="text-sm text-gray-500 mt-2">
                    Transcribing audio and creating case note
                  </div>
                </div>
              </div>
            )}

            {recordingStatus === 'success' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-green-600 flex items-center justify-center">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    Voice Note Created!
                  </div>
                  <div className="text-sm text-gray-500">
                    Your case note has been transcribed and saved
                  </div>
                </div>
              </div>
            )}

            {recordingStatus === 'error' && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-white" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">
                    Error
                  </div>
                  <div className="text-sm text-gray-500">
                    {errorMessage}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Instructions */}
          {recordingStatus === 'idle' && (
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-gray-600">
                  <div className="font-semibold mb-2">How it works:</div>
                  <ul className="space-y-1 text-xs">
                    <li>• Click the microphone to start recording</li>
                    <li>• Speak your case note clearly</li>
                    <li>• Click stop when finished</li>
                    <li>• AI will transcribe and organize your note</li>
                    <li>• Keywords and urgency will be automatically detected</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            {(recordingStatus === 'success' || recordingStatus === 'error') && (
              <Button
                onClick={resetRecording}
                variant="outline"
              >
                Record Another
              </Button>
            )}
            <Button
              onClick={onClose}
              variant={recordingStatus === 'success' ? 'default' : 'outline'}
            >
              {recordingStatus === 'success' ? 'Done' : 'Cancel'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceNoteRecorder; 