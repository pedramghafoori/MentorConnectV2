import React, { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import CourseEditModal from '../../../components/Course/CourseEditModal';

const MyCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const params = /\/courses\/edit\/(\w+)/.exec(location.pathname);
  const editingCourseId = params ? params[1] : null;

  // Function to fetch courses
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/courses?mentorId=' + user._id);
      setCourses(res.data);
    } catch (err) {
      setError('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  // Callback when a course is updated in the modal
  const handleCourseSave = (updatedCourse) => {
    setCourses(prev => prev.map(c => c._id === updatedCourse._id ? updatedCourse : c));
  };

  useEffect(() => {
    if (user && user._id) fetchCourses();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Courses</h1>
      {courses.length === 0 ? (
        <div>No courses found.</div>
      ) : (
        <ul className="space-y-4">
          {courses.map(course => (
            <li
              key={course._id}
              className="p-4 border rounded-lg shadow-sm bg-white hover:bg-gray-100 transition cursor-pointer"
              onClick={() => navigate(`/courses/edit/${course._id}`)}
            >
              <div className="font-semibold text-lg">{course.title}</div>
              <div className="text-gray-600">Participants: {course.maxParticipants}</div>
              <div className="text-gray-600">Price: ${course.price}</div>
              <div className="text-gray-500 text-sm">Status: {course.status}</div>
            </li>
          ))}
        </ul>
      )}
      {editingCourseId && (
        <CourseEditModal
          isOpen={true}
          onClose={() => {
            navigate('/courses/my-courses');
          }}
          onSave={handleCourseSave}
          courseId={editingCourseId}
        />
      )}
    </div>
  );
};

export default MyCourses; 