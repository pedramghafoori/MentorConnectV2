import { useState } from 'react';
import { useMentorSearch, useRequestMentorship } from '../../../hooks/useMentorship';

const Search = () => {
  const [filters, setFilters] = useState({
    expertise: '',
    availability: '',
  });
  const { data: mentors, isLoading } = useMentorSearch(filters);
  const { mutate: requestMentorship } = useRequestMentorship();

  const handleRequest = (mentorId) => {
    const message = prompt('Please enter a message for your mentorship request:');
    if (message) {
      requestMentorship({ mentorId, message });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Find a Mentor</h2>
      
      <div className="bg-white rounded-2xl shadow p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Expertise</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., React, Node.js"
              value={filters.expertise}
              onChange={(e) => setFilters({ ...filters, expertise: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Availability</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="e.g., Weekends, Evenings"
              value={filters.availability}
              onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mentors?.map((mentor) => (
            <div key={mentor.id} className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center space-x-4">
                {mentor.avatarUrl && (
                  <img
                    src={mentor.avatarUrl}
                    alt={mentor.firstName}
                    className="h-12 w-12 rounded-full"
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {mentor.firstName} {mentor.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{mentor.email}</p>
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Expertise</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {mentor.mentorProfile.expertise.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900">Availability</h4>
                <p className="mt-1 text-sm text-gray-600">{mentor.mentorProfile.availability}</p>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => handleRequest(mentor.id)}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Request Mentorship
                </button>
              </div>
            </div>
          ))}
          
          {mentors?.length === 0 && (
            <div className="col-span-full text-center text-gray-500">
              No mentors found matching your criteria
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Search; 