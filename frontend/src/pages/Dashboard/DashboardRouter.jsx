import { Routes, Route } from 'react-router-dom';
import DashboardShell from './DashboardShell';
import Requests from './mentor/Requests';
import Mentees from './mentor/Mentees';
import Mentors from './mentor/Mentors';
import Schedule from './mentor/Schedule';
import Search from './mentee/Search';
import MenteeRequests from './mentee/Requests';
import MenteeSchedule from './mentee/Schedule';
import UserSearchResults from './UserSearchResults';
import BookingPage from './mentee/BookingPage';
import MyCourses from './mentor/MyCourses';
import Dashboard from './Dashboard';

const DashboardRouter = () => {
  return (
    <DashboardShell>
      <Routes>
        <Route index element={<Dashboard />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="search" element={<Dashboard />} />
        <Route path="/mentor/requests" element={<Requests />} />
        <Route path="/mentor/mentees" element={<Mentees />} />
        <Route path="/mentor/mentors" element={<Mentors />} />
        <Route path="/mentor/schedule" element={<Schedule />} />
        <Route path="/mentee/search" element={<Search />} />
        <Route path="/mentee/requests" element={<MenteeRequests />} />
        <Route path="/mentee/schedule" element={<MenteeSchedule />} />
        <Route path="/mentee/book/:mentorId" element={<BookingPage />} />
        <Route path="/search" element={<UserSearchResults />} />
        <Route path="/courses/my-courses" element={<MyCourses />} />
      </Routes>
    </DashboardShell>
  );
};

export default DashboardRouter; 