import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Users, FileText } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

function MeetingHistory() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await axios.get('/api/meetings/');
      setMeetings(response.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { color: 'bg-blue-100 text-blue-800', text: 'Đã lên lịch' },
      active: { color: 'bg-green-100 text-green-800', text: 'Đang diễn ra' },
      ended: { color: 'bg-gray-100 text-gray-800', text: 'Đã kết thúc' },
    };

    const badge = badges[status] || badges.scheduled;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Lịch Sử Cuộc Họp</h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có cuộc họp nào
            </h3>
            <p className="text-gray-600 mb-6">
              Tạo cuộc họp đầu tiên của bạn để bắt đầu
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Tạo Cuộc Họp
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                onClick={() => navigate(`/details/${meeting.id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition p-6 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {meeting.title}
                    </h3>
                    {meeting.description && (
                      <p className="text-gray-600 mb-3">{meeting.description}</p>
                    )}
                  </div>
                  {getStatusBadge(meeting.status)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Chủ trì: {meeting.host_name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{format(new Date(meeting.start_time), 'dd/MM/yyyy')}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(meeting.start_time), 'HH:mm')}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>ID: {meeting.id.substring(0, 8)}...</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MeetingHistory;
