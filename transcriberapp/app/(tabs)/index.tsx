import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { Text, TouchableOpacity, Platform } from "react-native";
import { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from '@/components/styles/button';
import { useAudioRecorder, RecordingPresets, AudioModule } from "expo-audio";

export default function Home() {
  const [recording, setRecording] = useState("none");
  const [transcription, setTranscription] = useState("");

  // ----------- audio recording setup ---------------
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const record = async () => {
    try {
      audioRecorder.record(); // set function "record" to record audio
      setRecording("recording");
    } catch (error) {
      console.error("Error during audio recording setup:", error);
    };
  };

  const stopRecording = async () => {
    try {
      await audioRecorder.stop(); // set function "stop" to stop recording audio
      setRecording("complete");

      // Start transcription
      if (audioRecorder.uri) {
        setRecording("transcribing");
        setTranscription("Transcribing...");
        await transcribeAudioFile(audioRecorder.uri);
        setRecording("none");
      } else {
        console.warn("Recording not complete or AudioURI not found");
      }
    } catch (error) {
      console.error("Error during audio recording setup:", error);
    };
  };

  // ----------- speech recognition setup ---------------
  useSpeechRecognitionEvent("result", (event) => {
    setTranscription(event.results[0]?.transcript);
  });
  useSpeechRecognitionEvent("error", (event) => {
    console.log("error code:", event.error, "error message:", event.message);
  });

  // transcription service
  const transcribeAudioFile = async (audioFile: string) => {
    try {
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        // Recommended: true on iOS, false on Android, unless the speech model is installed, which you can check with `getSupportedLocales()`
        requiresOnDeviceRecognition: Platform.OS === "ios",
        audioSource: {
          /** Local file URI */
          uri: audioFile,
          /**
         * chunkDelayMillis: The delay between chunks of audio to stream to the speech recognition service.
         * Use this setting to avoid being rate-limited when using network-based recognition.
         * If you're using on-device recognition, you may want to increase this value to avoid unprocessed audio chunks.
         * Default: 50ms for network-based recognition, 15ms for on-device recognition
         */
          chunkDelayMillis: undefined
        },
      });
    } catch (error) {
      console.error("Error during transcription.", error);
    }
  };

  // -------------- handle recording & transcribe ---------------
  const handleStart = async () => {
    try {
      const recordingPermissions = await AudioModule.getRecordingPermissionsAsync();
      console.log("recordingStatus:", recordingPermissions.status);
      console.log("recordingGranted:", recordingPermissions.granted);
      console.log("recordingCan ask again:", recordingPermissions.canAskAgain);
      console.log("recordingExpires:", recordingPermissions.expires);

      const speechRecognitionPermissions = await ExpoSpeechRecognitionModule.getSpeechRecognizerPermissionsAsync();
      console.log("recognitionStatus:", speechRecognitionPermissions.status);
      console.log("recognitionGranted:", speechRecognitionPermissions.granted);
      console.log("recognitionCan ask again:", speechRecognitionPermissions.canAskAgain);
      console.log("recognitionExpires:", speechRecognitionPermissions.expires);

      // Request permissions if not granted
      if (!recordingPermissions.granted || !speechRecognitionPermissions.granted) {
        const recordPermission = await AudioModule.requestRecordingPermissionsAsync();
        const speechPermission = await ExpoSpeechRecognitionModule.requestSpeechRecognizerPermissionsAsync();

        if (!recordPermission || !speechPermission) {
          console.warn("Permissions not granted");
          return;
        }
      };

      // Start speech recording
      if (recording == "none" || recording == "complete") {
        await record();
      } else { 
        await stopRecording();
      };

    } catch (error) {
      console.error("Error during speech recognition setup:", error);
    }
  };

  return (
    <SafeAreaView>
      <Text>
        This is a simple speech recognition example. Click the "Start" button to begin
      </Text>

      {recording != "recording" ? (
        <TouchableOpacity
          onPress={handleStart}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => stopRecording()}
          style={[
            styles.button,
            { backgroundColor: '#FF0000' }
          ]}
        >
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      )}

      <Text>
        {"transcription: " + transcription}
      </Text>
    </SafeAreaView>
  );
};