import React from 'react';
import { VideoOff, User } from 'lucide-react';

function VideoGrid({ localVideoRef, remoteStreams, isCameraOn }) {
  const remoteStreamArray = Array.from(remoteStreams.values());

  return (
    <div className="w-full h-full bg-gray-900 p-4">
      {remoteStreamArray.length === 0 ? (
        /* Solo view - just local video */
        <div className="w-full h-full flex items-center justify-center">
          <div className="relative w-full max-w-4xl aspect-video bg-gray-800 rounded-lg overflow-hidden">
            {isCameraOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <VideoOff className="w-16 h-16 mb-4" />
                <p>Camera tắt</p>
              </div>
            )}
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-black bg-opacity-50 text-white text-sm rounded">
              Bạn
            </div>
          </div>
        </div>
      ) : (
        /* Grid view - multiple participants */
        <div className={`grid gap-4 h-full ${
          remoteStreamArray.length === 1
            ? 'grid-cols-2'
            : remoteStreamArray.length <= 4
            ? 'grid-cols-2 grid-rows-2'
            : 'grid-cols-3'
        }`}>
          {/* Local video */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden">
            {isCameraOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <User className="w-12 h-12 mb-2" />
                <p className="text-sm">Camera tắt</p>
              </div>
            )}
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
              Bạn
            </div>
          </div>

          {/* Remote videos */}
          {remoteStreamArray.map((stream, index) => (
            <div key={index} className="relative bg-gray-800 rounded-lg overflow-hidden">
              <video
                autoPlay
                playsInline
                ref={(el) => {
                  if (el) el.srcObject = stream;
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                Người tham gia {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VideoGrid;
