import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, History, Plus } from 'lucide-react';
import axios from 'axios';

function Home() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    hostName: '',
  });

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await axios.post('/api/meetings/', {
        title: formData.title,
        description: formData.description,
        host_name: formData.hostName,
      });

      const meetingId = response.data.id;
      navigate(`/meeting/${meetingId}`);
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Không thể tạo cuộc họp. Vui lòng thử lại.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = () => {
    const meetingId = prompt('Nhập Meeting ID:');
    if (meetingId) {
      navigate(`/meeting/${meetingId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900">Meet Transcribe</h1>
            </div>
            <button
              onClick={() => navigate('/history')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <History className="w-5 h-5" />
              <span>Lịch sử cuộc họp</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Họp Online với Ghi Âm & Phiên Âm
          </h2>
          <p className="text-xl text-gray-600">
            Ghi lại màn hình, âm thanh và chuyển đổi giọng nói thành văn bản tự động
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Create Meeting Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                <Plus className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Tạo Cuộc Họp Mới
              </h3>
              <p className="text-gray-600">
                Tạo phòng họp mới với tính năng ghi âm và phiên âm
              </p>
            </div>

            <form onSubmit={handleCreateMeeting} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề cuộc họp *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Ví dụ: Họp team hàng tuần"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Mô tả ngắn về cuộc họp..."
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên chủ trì *
                </label>
                <input
                  type="text"
                  required
                  value={formData.hostName}
                  onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Nhập tên của bạn"
                />
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Đang tạo...' : 'Tạo Cuộc Họp'}
              </button>
            </form>
          </div>

          {/* Join Meeting Card */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Video className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Tham Gia Cuộc Họp
              </h3>
              <p className="text-gray-600">
                Tham gia cuộc họp hiện có bằng Meeting ID
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-4">
                  Có Meeting ID? Nhấn nút bên dưới để tham gia
                </p>
                <button
                  onClick={handleJoinMeeting}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Tham Gia Cuộc Họp
                </button>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold text-gray-900 mb-3">Tính năng nổi bật:</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Ghi màn hình và âm thanh chất lượng cao</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Phiên âm tiếng Việt tự động real-time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Tạo biên bản cuộc họp tự động</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Hỗ trợ làm việc offline</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
