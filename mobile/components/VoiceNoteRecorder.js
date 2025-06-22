import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import api from '../lib/api';

const VoiceNoteRecorder = ({ 
  visible, 
  onClose, 
  clientId, 
  onNoteCreated,
  title = "Voice Note" 
}) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [processingStep, setProcessingStep] = useState('');
  const [recordingMode, setRecordingMode] = useState('options'); // 'options', 'recording', 'upload'
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Request audio permissions on mount
    requestPermissions();
    
    // Cleanup on unmount
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    // Pulse animation for recording indicator
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  useEffect(() => {
    // Reset state when dialog opens/closes
    if (!visible) {
      resetRecording();
    }
  }, [visible]);

  const resetRecording = () => {
    setIsRecording(false);
    setIsProcessing(false);
    setRecordingDuration(0);
    setProcessingStep('');
    setRecordingMode('options');
    
    if (recording) {
      recording.stopAndUnloadAsync();
      setRecording(null);
    }
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant microphone permission to record voice notes.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting audio permissions:', error);
      return false;
    }
  };

  const startLiveRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setRecordingMode('recording');
      
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      const timer = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

      // Store timer reference for cleanup
      newRecording._timer = timer;

      console.log('🎤 Live recording started');
    } catch (error) {
      console.error('Failed to start live recording:', error);
      Alert.alert('Error', 'Failed to start recording. Please try again.');
      setRecordingMode('options');
    }
  };

  const stopLiveRecording = async () => {
    try {
      if (!recording) return;

      console.log('🛑 Stopping live recording');
      
      // Clear timer
      if (recording._timer) {
        clearInterval(recording._timer);
      }

      setIsRecording(false);
      await recording.stopAndUnloadAsync();

      const uri = recording.getURI();
      console.log('📁 Recording saved to:', uri);

      setRecording(null);
      
      if (uri) {
        await processRecordedAudio(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
      setRecordingMode('options');
    }
  };

  const processRecordedAudio = async (audioUri) => {
    try {
      setIsProcessing(true);
      setProcessingStep('Processing recording...');

      console.log('🔄 Processing recorded audio file...');

      // Prepare audio file for upload
      const audioFile = {
        uri: audioUri,
        type: 'audio/m4a', // Ensure we use the correct MIME type
        name: `voice_note_${Date.now()}.m4a`,
      };

      setProcessingStep('Transcribing audio...');

      // Upload and transcribe
      const response = await api.uploadAudioForTranscription(audioFile, clientId);

      console.log('✅ Voice note processed:', response);

      setProcessingStep('Creating case note...');

      // Clean up audio file
      try {
        await FileSystem.deleteAsync(audioUri);
      } catch (cleanupError) {
        console.warn('Failed to clean up audio file:', cleanupError);
      }

      // Small delay for user feedback
      setTimeout(() => {
        Alert.alert(
          'Success!',
          'Voice note has been transcribed and saved as a case note.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onNoteCreated) {
                  onNoteCreated(response.case_note);
                }
                onClose();
              },
            },
          ]
        );
      }, 1000);

    } catch (error) {
      console.error('Failed to process recorded audio:', error);
      Alert.alert(
        'Processing Failed',
        'Failed to transcribe voice note. Please check your connection and try again.'
      );
      setRecordingMode('options');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const pickAudioFile = async () => {
    try {
      setRecordingMode('upload');
      setProcessingStep('Selecting audio file...');
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setProcessingStep('');
        setRecordingMode('options');
        return;
      }

      const audioFile = result.assets[0];
      
      if (!audioFile) {
        Alert.alert('Error', 'No audio file selected');
        setProcessingStep('');
        setRecordingMode('options');
        return;
      }

      await processUploadedAudioFile(audioFile);

    } catch (error) {
      console.error('Error picking audio file:', error);
      Alert.alert('Error', 'Failed to select audio file. Please try again.');
      setProcessingStep('');
      setRecordingMode('options');
    }
  };

  const processUploadedAudioFile = async (audioFile) => {
    try {
      setIsProcessing(true);
      setProcessingStep('Processing audio file...');

      console.log('🔄 Processing uploaded audio file:', audioFile.name);

      // Prepare audio file for upload
      const formattedFile = {
        uri: audioFile.uri,
        type: audioFile.mimeType || 'audio/mpeg',
        name: audioFile.name || `voice_note_${Date.now()}.mp3`,
      };

      setProcessingStep('Transcribing audio...');

      // Upload and transcribe
      const response = await api.uploadAudioForTranscription(formattedFile, clientId);

      console.log('✅ Voice note processed:', response);

      setProcessingStep('Creating case note...');

      // Small delay for user feedback
      setTimeout(() => {
        Alert.alert(
          'Success!',
          'Voice note has been transcribed and saved as a case note.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onNoteCreated) {
                  onNoteCreated(response.case_note);
                }
                onClose();
              },
            },
          ]
        );
      }, 1000);

    } catch (error) {
      console.error('Failed to process uploaded audio file:', error);
      Alert.alert(
        'Processing Failed',
        'Failed to transcribe voice note. Please check your connection and try again.'
      );
      setRecordingMode('options');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const createTextNote = () => {
    Alert.alert(
      'Create Text Note',
      'Would you like to create a text note instead?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create Text Note', 
          onPress: () => {
            Alert.alert('Coming Soon', 'Text note creation will be available in the next update.');
            onClose();
          }
        }
      ]
    );
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderOptionsView = () => (
    <>
      <View style={styles.optionsContainer}>
        {/* Live Recording Option */}
        <TouchableOpacity
          style={[styles.optionButton, styles.primaryOption]}
          onPress={startLiveRecording}
        >
          <View style={styles.optionIcon}>
            <Ionicons name="mic" size={32} color="white" />
          </View>
          <Text style={styles.optionTitle}>Record Live</Text>
          <Text style={styles.optionDescription}>
            Record directly in the app
          </Text>
        </TouchableOpacity>

        {/* Upload Audio File Option */}
        <TouchableOpacity
          style={[styles.optionButton, styles.secondaryOption]}
          onPress={pickAudioFile}
        >
          <View style={styles.optionIconSecondary}>
            <Ionicons name="cloud-upload" size={32} color="#10b981" />
          </View>
          <Text style={styles.optionTitleSecondary}>Upload Audio File</Text>
          <Text style={styles.optionDescriptionSecondary}>
            Select an audio recording from your device
          </Text>
        </TouchableOpacity>

        {/* Text Note Option */}
        <TouchableOpacity
          style={[styles.optionButton, styles.tertiaryOption]}
          onPress={createTextNote}
        >
          <View style={styles.optionIconTertiary}>
            <Ionicons name="document-text" size={32} color="#6b7280" />
          </View>
          <Text style={styles.optionTitleTertiary}>Create Text Note</Text>
          <Text style={styles.optionDescriptionTertiary}>
            Traditional text-based case note
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Supported Audio Formats:</Text>
        <Text style={styles.instructionText}>
          MP3, WAV, M4A, MP4, WEBM
        </Text>
        <Text style={styles.instructionTitle}>How it works:</Text>
        <Text style={styles.instructionText}>
          • Record or upload your audio{'\n'}
          • AI will transcribe the audio{'\n'}
          • Organized case note will be created{'\n'}
          • Keywords and urgency will be detected
        </Text>
      </View>
    </>
  );

  const renderRecordingView = () => (
    <>
      <View style={styles.recordingIndicator}>
        <Animated.View
          style={[
            styles.recordButton,
            {
              backgroundColor: '#ef4444',
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={stopLiveRecording}
            style={styles.recordButtonInner}
            disabled={isProcessing}
          >
            <Ionicons name="stop" size={32} color="white" />
          </TouchableOpacity>
        </Animated.View>
      </View>

      <Text style={styles.instruction}>
        Tap to stop recording and create note
      </Text>

      <View style={styles.recordingInfo}>
        <View style={styles.durationContainer}>
          <View style={styles.recordingDot} />
          <Text style={styles.durationText}>
            {formatDuration(recordingDuration)}
          </Text>
        </View>
        <Text style={styles.recordingSubtext}>
          Speak clearly for best transcription
        </Text>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionTitle}>Recording Tips:</Text>
        <Text style={styles.instructionText}>
          • Speak clearly and at normal pace{'\n'}
          • Minimize background noise{'\n'}
          • Hold device steady while recording{'\n'}
          • Include all relevant case details
        </Text>
      </View>
    </>
  );

  const renderProcessingView = () => (
    <View style={styles.processingContainer}>
      <ActivityIndicator size="large" color="#10b981" />
      <Text style={styles.processingText}>
        {processingStep || 'Processing...'}
      </Text>
      <Text style={styles.processingSubtext}>
        Please wait while we process your voice note
      </Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {isProcessing ? renderProcessingView() : (
              recordingMode === 'recording' ? renderRecordingView() : renderOptionsView()
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  processingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginTop: 16,
    textAlign: 'center',
  },
  processingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  recordingIndicator: {
    alignItems: 'center',
    marginVertical: 20,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  recordButtonInner: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instruction: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 20,
  },
  recordingInfo: {
    alignItems: 'center',
    marginVertical: 20,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  durationText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  recordingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  primaryOption: {
    backgroundColor: '#10b981',
  },
  secondaryOption: {
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#10b981',
  },
  tertiaryOption: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  optionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionIconSecondary: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dcfce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionIconTertiary: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  optionTitleSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10b981',
    marginBottom: 4,
  },
  optionTitleTertiary: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  optionDescriptionSecondary: {
    fontSize: 12,
    color: '#059669',
    textAlign: 'center',
  },
  optionDescriptionTertiary: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
  },
  instructionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
    marginTop: 8,
  },
  instructionText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 4,
  },
});

export default VoiceNoteRecorder; 