import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import MeetingRoom from './pages/MeetingRoom';
import MeetingHistory from './pages/MeetingHistory';
import MeetingDetails from './pages/MeetingDetails';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/meeting/:meetingId" element={<MeetingRoom />} />
          <Route path="/history" element={<MeetingHistory />} />
          <Route path="/details/:meetingId" element={<MeetingDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
