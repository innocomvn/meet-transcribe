import { useEffect, useState, useRef, useCallback } from 'react';
import SimplePeer from 'simple-peer';

function useWebRTC(meetingId, socket) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState(new Map());
  const peersRef = useRef(new Map());

  const createPeer = useCallback(
    (stream, initiator = false, peerId) => {
      const peer = new SimplePeer({
        initiator,
        trickle: false,
        stream,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      peer.on('signal', (signal) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: 'signaling',
              signal,
              peerId,
              meetingId,
            })
          );
        }
      });

      peer.on('stream', (remoteStream) => {
        console.log('Received remote stream from peer:', peerId);
        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.set(peerId, remoteStream);
          return newMap;
        });
      });

      peer.on('error', (error) => {
        console.error('Peer error:', error);
      });

      peer.on('close', () => {
        console.log('Peer connection closed:', peerId);
        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.delete(peerId);
          return newMap;
        });
        peersRef.current.delete(peerId);
      });

      return peer;
    },
    [socket, meetingId]
  );

  const startCall = useCallback(
    (stream) => {
      setLocalStream(stream);

      if (!socket) return;

      // Listen for signaling messages
      const handleSignaling = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === 'signaling') {
            const { signal, peerId } = data;

            let peer = peersRef.current.get(peerId);

            if (!peer) {
              // Create new peer for incoming connection
              peer = createPeer(stream, false, peerId);
              peersRef.current.set(peerId, peer);
            }

            peer.signal(signal);
          }
        } catch (error) {
          console.error('Error handling signaling:', error);
        }
      };

      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.addEventListener('message', handleSignaling);
      }

      return () => {
        if (socket) {
          socket.removeEventListener('message', handleSignaling);
        }
      };
    },
    [socket, createPeer]
  );

  useEffect(() => {
    return () => {
      // Cleanup all peer connections
      peersRef.current.forEach((peer) => {
        peer.destroy();
      });
      peersRef.current.clear();
    };
  }, []);

  return {
    localStream,
    remoteStreams,
    startCall,
  };
}

export default useWebRTC;
