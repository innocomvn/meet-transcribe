import React, { useEffect, useRef } from 'react';
import { FileText } from 'lucide-react';

function TranscriptPanel({ transcripts }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to bottom when new transcript arrives
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcripts]);

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-400" />
          <h3 className="font-semibold text-white">Phiên Âm Trực Tiếp</h3>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {transcripts.length} dòng phiên âm
        </p>
      </div>

      {/* Transcript list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {transcripts.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Chưa có phiên âm nào</p>
            <p className="text-xs mt-1">Phiên âm sẽ hiển thị khi có người nói</p>
          </div>
        ) : (
          transcripts.map((transcript, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded-lg p-3 animate-fade-in"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-400">
                  {new Date(transcript.timestamp).toLocaleTimeString('vi-VN')}
                </span>
                {transcript.speaker && (
                  <>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-indigo-400 font-semibold">
                      {transcript.speaker}
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-white leading-relaxed">
                {transcript.text}
              </p>
              {transcript.confidence && (
                <div className="mt-2">
                  <div className="w-full bg-gray-600 rounded-full h-1">
                    <div
                      className="bg-indigo-500 h-1 rounded-full transition-all"
                      style={{ width: `${transcript.confidence * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TranscriptPanel;
