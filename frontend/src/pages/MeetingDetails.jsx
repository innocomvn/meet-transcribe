import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Video, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

function MeetingDetails() {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [transcripts, setTranscripts] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [minutes, setMinutes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingMinutes, setGeneratingMinutes] = useState(false);

  useEffect(() => {
    fetchMeetingData();
  }, [meetingId]);

  const fetchMeetingData = async () => {
    try {
      const [meetingRes, transcriptsRes, recordingsRes] = await Promise.all([
        axios.get(`/api/meetings/${meetingId}`),
        axios.get(`/api/transcriptions/meeting/${meetingId}`),
        axios.get(`/api/recordings/meeting/${meetingId}`),
      ]);

      setMeeting(meetingRes.data);
      setTranscripts(transcriptsRes.data);
      setRecordings(recordingsRes.data);

      // Try to fetch minutes
      try {
        const minutesRes = await axios.get(`/api/minutes/${meetingId}`);
        setMinutes(minutesRes.data);
      } catch (error) {
        // Minutes not generated yet
        console.log('Minutes not available yet');
      }
    } catch (error) {
      console.error('Error fetching meeting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMinutes = async (format = 'pdf') => {
    setGeneratingMinutes(true);
    try {
      const response = await axios.post(`/api/minutes/${meetingId}?format=${format}`);
      setMinutes(response.data);
      alert('Biên bản cuộc họp đã được tạo!');
    } catch (error) {
      console.error('Error generating minutes:', error);
      alert('Không thể tạo biên bản. Vui lòng thử lại.');
    } finally {
      setGeneratingMinutes(false);
    }
  };

  const handleDownloadMinutes = async () => {
    try {
      window.open(`/api/minutes/${meetingId}/download`, '_blank');
    } catch (error) {
      console.error('Error downloading minutes:', error);
    }
  };

  const handleDownloadTranscript = async (format = 'txt') => {
    try {
      const response = await axios.get(
        `/api/transcriptions/meeting/${meetingId}/export?format=${format}`
      );

      const blob = new Blob([response.data.content || JSON.stringify(response.data)], {
        type: 'text/plain',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transcript_${meetingId}.${format}`;
      link.click();
    } catch (error) {
      console.error('Error downloading transcript:', error);
    }
  };

  const handleDownloadRecording = (recordingId) => {
    window.open(`/api/recordings/${recordingId}/download`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy cuộc họp
          </h2>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/history')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{meeting.title}</h1>
              <p className="text-gray-600 text-sm">Meeting ID: {meetingId}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Meeting Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Thông Tin Cuộc Họp</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Ngày họp</p>
                <p className="font-semibold">
                  {format(new Date(meeting.start_time), 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">Thời gian</p>
                <p className="font-semibold">
                  {format(new Date(meeting.start_time), 'HH:mm')}
                </p>
              </div>
            </div>
          </div>
          {meeting.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-1">Mô tả</p>
              <p className="text-gray-900">{meeting.description}</p>
            </div>
          )}
        </div>

        {/* Meeting Minutes */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Biên Bản Cuộc Họp</h2>
            {!minutes ? (
              <button
                onClick={() => handleGenerateMinutes('pdf')}
                disabled={generatingMinutes || transcripts.length === 0}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingMinutes ? 'Đang tạo...' : 'Tạo Biên Bản'}
              </button>
            ) : (
              <button
                onClick={handleDownloadMinutes}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-4 h-4" />
                Tải Về
              </button>
            )}
          </div>

          {transcripts.length === 0 && (
            <p className="text-gray-600">
              Không có phiên âm nào để tạo biên bản.
            </p>
          )}

          {minutes && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Tóm tắt</h3>
                <p className="text-gray-700">{minutes.summary}</p>
              </div>

              {minutes.key_points && minutes.key_points.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Điểm chính</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {minutes.key_points.map((point, idx) => (
                      <li key={idx} className="text-gray-700">
                        {point.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {minutes.action_items && minutes.action_items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Nhiệm vụ cần thực hiện
                  </h3>
                  <ul className="list-disc list-inside space-y-1">
                    {minutes.action_items.map((item, idx) => (
                      <li key={idx} className="text-gray-700">
                        {item.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Transcripts */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Phiên Âm ({transcripts.length})
            </h2>
            {transcripts.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadTranscript('txt')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                >
                  Tải TXT
                </button>
                <button
                  onClick={() => handleDownloadTranscript('json')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                >
                  Tải JSON
                </button>
              </div>
            )}
          </div>

          {transcripts.length === 0 ? (
            <p className="text-gray-600">Không có phiên âm nào.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-3">
              {transcripts.map((transcript) => (
                <div key={transcript.id} className="border-l-4 border-indigo-500 pl-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <span>{format(new Date(transcript.timestamp), 'HH:mm:ss')}</span>
                    {transcript.speaker && (
                      <>
                        <span>•</span>
                        <span className="font-semibold">{transcript.speaker}</span>
                      </>
                    )}
                  </div>
                  <p className="text-gray-900">{transcript.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recordings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Bản Ghi ({recordings.length})
          </h2>

          {recordings.length === 0 ? (
            <p className="text-gray-600">Không có bản ghi nào.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {recordings.map((recording) => (
                <div
                  key={recording.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Video className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {recording.type === 'screen' ? 'Màn hình' : 'Video'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {(recording.file_size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadRecording(recording.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    <Download className="w-4 h-4" />
                    Tải Về
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default MeetingDetails;
