import React from 'react';
import { Circle, Square } from 'lucide-react';

function RecordingControls({ isRecording, onToggle, duration }) {
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3">
      {isRecording && (
        <div className="flex items-center gap-2 text-red-500">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="font-mono text-sm">{formatDuration(duration)}</span>
        </div>
      )}

      <button
        onClick={onToggle}
        className={`p-3 rounded-full transition ${
          isRecording
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
        title={isRecording ? 'Dừng ghi' : 'Bắt đầu ghi'}
      >
        {isRecording ? <Square className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
      </button>
    </div>
  );
}

export default RecordingControls;
