import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  MonitorOff,
  Circle,
  Square,
  LogOut,
  MessageSquare,
  FileText,
} from 'lucide-react';
import VideoGrid from '../components/VideoGrid';
import TranscriptPanel from '../components/TranscriptPanel';
import ChatPanel from '../components/ChatPanel';
import RecordingControls from '../components/RecordingControls';
import useWebRTC from '../hooks/useWebRTC';
import useRecording from '../hooks/useRecording';
import useWebSocket from '../hooks/useWebSocket';

function MeetingRoom() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const localVideoRef = useRef(null);
  const screenStreamRef = useRef(null);

  // WebSocket connection
  const { socket, sendMessage, transcripts, chatMessages } = useWebSocket(meetingId);

  // WebRTC for peer-to-peer video
  const { localStream, remoteStreams, startCall } = useWebRTC(meetingId, socket);

  // Recording functionality
  const {
    isRecording,
    startRecording,
    stopRecording,
    recordingDuration,
  } = useRecording(meetingId);

  useEffect(() => {
    // Initialize media devices
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Start WebRTC connection
        startCall(stream);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Không thể truy cập camera/microphone. Vui lòng kiểm tra quyền truy cập.');
      }
    };

    initMedia();

    // Cleanup
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [meetingId]);

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: 'screen' },
          audio: true,
        });

        screenStreamRef.current = screenStream;
        setIsScreenSharing(true);

        // Replace video track with screen share
        const screenTrack = screenStream.getVideoTracks()[0];
        screenTrack.onended = () => {
          setIsScreenSharing(false);
          toggleScreenShare();
        };

        // Update local video
        if (localVideoRef.current) {
          const newStream = new MediaStream([
            screenTrack,
            ...localStream.getAudioTracks(),
          ]);
          localVideoRef.current.srcObject = newStream;
        }
      } else {
        // Stop screen sharing
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Restore camera video
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }

        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const handleRecordingToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      const streams = [localStream, ...Array.from(remoteStreams.values())];
      startRecording(streams);
    }
  };

  const handleLeaveMeeting = () => {
    if (confirm('Bạn có chắc muốn rời khỏi cuộc họp?')) {
      // Stop all streams
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      // Stop recording if active
      if (isRecording) {
        stopRecording();
      }

      // Navigate to meeting details
      navigate(`/details/${meetingId}`);
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 px-6 py-3 flex items-center justify-between border-b border-gray-700">
        <div>
          <h1 className="text-white font-semibold">Meeting ID: {meetingId}</h1>
          <p className="text-gray-400 text-sm">
            {isRecording && `Recording: ${recordingDuration}s`}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className={`p-2 rounded-lg transition ${
              showTranscript
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Transcript"
          >
            <FileText className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-2 rounded-lg transition ${
              showChat
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title="Chat"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Area */}
        <div className="flex-1 relative">
          <VideoGrid
            localVideoRef={localVideoRef}
            remoteStreams={remoteStreams}
            isCameraOn={isCameraOn}
          />

          {/* Controls Bar */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="bg-gray-800 rounded-full px-6 py-4 flex items-center gap-4 shadow-2xl">
              <button
                onClick={toggleMic}
                className={`p-4 rounded-full transition ${
                  isMicOn
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={isMicOn ? 'Tắt mic' : 'Bật mic'}
              >
                {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
              </button>

              <button
                onClick={toggleCamera}
                className={`p-4 rounded-full transition ${
                  isCameraOn
                    ? 'bg-gray-700 hover:bg-gray-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={isCameraOn ? 'Tắt camera' : 'Bật camera'}
              >
                {isCameraOn ? (
                  <VideoIcon className="w-6 h-6" />
                ) : (
                  <VideoOff className="w-6 h-6" />
                )}
              </button>

              <button
                onClick={toggleScreenShare}
                className={`p-4 rounded-full transition ${
                  isScreenSharing
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                title={isScreenSharing ? 'Dừng chia sẻ' : 'Chia sẻ màn hình'}
              >
                {isScreenSharing ? (
                  <MonitorOff className="w-6 h-6" />
                ) : (
                  <Monitor className="w-6 h-6" />
                )}
              </button>

              <div className="w-px h-10 bg-gray-600" />

              <button
                onClick={handleRecordingToggle}
                className={`p-4 rounded-full transition ${
                  isRecording
                    ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                title={isRecording ? 'Dừng ghi' : 'Bắt đầu ghi'}
              >
                {isRecording ? <Square className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
              </button>

              <div className="w-px h-10 bg-gray-600" />

              <button
                onClick={handleLeaveMeeting}
                className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition"
                title="Rời cuộc họp"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Side Panels */}
        {(showTranscript || showChat) && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
            {showTranscript && (
              <div className="flex-1 overflow-hidden">
                <TranscriptPanel transcripts={transcripts} />
              </div>
            )}

            {showChat && (
              <div className="flex-1 overflow-hidden border-t border-gray-700">
                <ChatPanel
                  messages={chatMessages}
                  onSendMessage={(message) => sendMessage({ type: 'chat', message })}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MeetingRoom;
