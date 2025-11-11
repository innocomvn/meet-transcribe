import { useState, useRef, useCallback } from 'react';
import RecordRTC from 'recordrtc';
import axios from 'axios';

function useRecording(meetingId) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recorderRef = useRef(null);
  const durationIntervalRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = useCallback(
    async (streams) => {
      try {
        // Get screen + audio stream
        let screenStream;
        try {
          screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { mediaSource: 'screen' },
            audio: true,
          });
        } catch (error) {
          console.log('Screen sharing denied, recording audio only');
          // Fallback to audio only
          screenStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false,
          });
        }

        // Combine all streams
        const combinedStream = new MediaStream([
          ...screenStream.getVideoTracks(),
          ...screenStream.getAudioTracks(),
        ]);

        // Create recorder
        const recorder = new RecordRTC(combinedStream, {
          type: 'video',
          mimeType: 'video/webm;codecs=vp9',
          videoBitsPerSecond: 2500000,
          audioBitsPerSecond: 128000,
          frameRate: 30,
        });

        recorder.startRecording();
        recorderRef.current = recorder;
        setIsRecording(true);
        setRecordingDuration(0);

        // Start duration counter
        durationIntervalRef.current = setInterval(() => {
          setRecordingDuration((prev) => prev + 1);
        }, 1000);

        // Handle screen share stop
        screenStream.getVideoTracks()[0]?.addEventListener('ended', () => {
          stopRecording();
        });

        console.log('Recording started');
      } catch (error) {
        console.error('Error starting recording:', error);
        alert('Không thể bắt đầu ghi. Vui lòng kiểm tra quyền truy cập màn hình.');
      }
    },
    [meetingId]
  );

  const stopRecording = useCallback(async () => {
    if (!recorderRef.current) return;

    return new Promise((resolve) => {
      recorderRef.current.stopRecording(async () => {
        const blob = recorderRef.current.getBlob();

        // Clear interval
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }

        setIsRecording(false);

        // Upload recording
        try {
          const formData = new FormData();
          formData.append(
            'file',
            blob,
            `recording_${Date.now()}.webm`
          );

          await axios.post(
            `/api/recordings/upload/${meetingId}?recording_type=screen`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          console.log('Recording uploaded successfully');
        } catch (error) {
          console.error('Error uploading recording:', error);
          alert('Không thể tải lên bản ghi. Vui lòng thử lại.');
        }

        // Cleanup
        recorderRef.current.destroy();
        recorderRef.current = null;

        resolve();
      });
    });
  }, [meetingId]);

  return {
    isRecording,
    recordingDuration,
    startRecording,
    stopRecording,
  };
}

export default useRecording;
