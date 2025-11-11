import { useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';

function useWebSocket(meetingId) {
  const [socket, setSocket] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket
    const wsUrl = `ws://localhost:8000/ws/${meetingId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'transcript':
            setTranscripts((prev) => [
              ...prev,
              {
                text: data.text,
                timestamp: data.timestamp,
                speaker: data.speaker || 'Unknown',
                confidence: data.confidence,
              },
            ]);
            break;

          case 'chat':
            setChatMessages((prev) => [
              ...prev,
              {
                message: data.message,
                sender: data.sender,
                timestamp: data.timestamp,
              },
            ]);
            break;

          case 'user_joined':
            console.log('User joined:', data);
            break;

          case 'user_left':
            console.log('User left:', data);
            break;

          case 'recording_status':
            console.log('Recording status:', data);
            break;

          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    };

    socketRef.current = ws;
    setSocket(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [meetingId]);

  const sendMessage = useCallback(
    (message) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify(message));
      }
    },
    []
  );

  const sendAudioChunk = useCallback(
    (audioData) => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            type: 'audio_chunk',
            audio: audioData,
          })
        );
      }
    },
    []
  );

  return {
    socket,
    connected,
    transcripts,
    chatMessages,
    sendMessage,
    sendAudioChunk,
  };
}

export default useWebSocket;
