import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import { AudioEncodingAndroid } from "expo-speech-recognition";
import { Platform } from "react-native";
import { useState } from "react";

// Transcribe an Audio File (recording) using the Speech Recognition API
export default function TranscribeAudioFile(uri: string /* ex. "file:///path/to/audio.wav" */) {
    ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        // Recommended: true on iOS, false on Android, unless the speech model is installed, which you can check with `getSupportedLocales()`
        requiresOnDeviceRecognition: Platform.OS === "ios",
        audioSource: {
            /** Local file URI */
            uri: uri,
            /** [Android only] The number of channels in the source audio. */
            audioChannels: 1,
            /** [Android only] A value from AudioFormat - https://developer.android.com/reference/android/media/AudioFormat */
            audioEncoding: AudioEncodingAndroid.ENCODING_PCM_16BIT,
            /** [Android only] Audio sampling rate in Hz. */
            sampleRate: 16000,
            /**
             * The delay between chunks of audio to stream to the speech recognition service.
             * Use this setting to avoid being rate-limited when using network-based recognition.
             * If you're using on-device recognition, you may want to increase this value to avoid unprocessed audio chunks.
             * Default: 50ms for network-based recognition, 15ms for on-device recognition
             */
            chunkDelayMillis: undefined,
        },
    });
};