'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useAuthStore, useAppStore } from '@/lib/store';
import AppLayout from '@/components/layout/AppLayout';
import VoiceRecorder from '@/components/voice/VoiceRecorder';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function VoicePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const { clients, addCaseNote } = useAppStore();
  
  const [transcription, setTranscription] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, router]);

  const handleTranscriptionComplete = (newTranscription: string) => {
    setTranscription(newTranscription);
    
    // Auto-generate title from first sentence
    const firstSentence = newTranscription.split('.')[0];
    if (firstSentence.length > 5) {
      setNoteTitle(firstSentence.substring(0, 50) + (firstSentence.length > 50 ? '...' : ''));
    }
  };

  const handleSaveNote = async () => {
    if (!transcription.trim()) {
      toast.error('No transcription to save');
      return;
    }

    if (!noteTitle.trim()) {
      toast.error('Please enter a title for the case note');
      return;
    }

    setIsSaving(true);

    try {
      const client = clients.find(c => c.id === selectedClient);
      
      const caseNote = {
        id: Date.now().toString(),
        case_id: selectedClient || 'general',
        client_id: selectedClient || '',
        worker_id: user?.id || '',
        title: noteTitle,
        content: transcription,
        transcription: transcription,
        ai_generated: true,
        priority: 'medium' as const,
        mood_assessment: 'Generated from voice recording',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      addCaseNote(caseNote);
      toast.success('Case note saved successfully!');
      
      // Reset form
      setTranscription('');
      setNoteTitle('');
      setSelectedClient('');
      
    } catch (error) {
      console.error('Error saving case note:', error);
      toast.error('Failed to save case note');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Voice Dictation</h1>
              <p className="text-gray-600">Record your case notes and observations</p>
            </div>
          </div>
        </div>

        {/* Voice Recorder */}
        <VoiceRecorder
          client={selectedClient ? clients.find(c => c.id === selectedClient) : undefined}
          onTranscriptionComplete={handleTranscriptionComplete}
        />

        {/* Transcription Results */}
        {transcription && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Case Note
              </h2>
            </div>

            <div className="space-y-4">
              {/* Client Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Client
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">General Note (No specific client)</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Note Title */}
              <Input
                label="Note Title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter a title for this case note"
                fullWidth
                required
              />

              {/* Transcription Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transcription
                </label>
                <textarea
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Your transcribed notes will appear here..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTranscription('');
                    setNoteTitle('');
                    setSelectedClient('');
                  }}
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSaveNote}
                  loading={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Case Note
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use Voice Dictation</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              Click "Start Recording" and speak naturally about your case observations
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              Include client names, activities, concerns, and any action items needed
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              The AI will automatically transcribe your speech and extract tasks
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">4.</span>
              Review the transcription, edit if needed, then save as a case note
            </li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
} 