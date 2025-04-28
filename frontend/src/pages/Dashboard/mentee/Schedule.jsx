import { useMentorshipConnections } from '../../../hooks/useMentorship';

const Schedule = () => {
  const { data: connections, isLoading } = useMentorshipConnections();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Mentorship Schedule</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {connections?.map((connection) => (
          <div key={connection.id} className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center space-x-4">
              {connection.mentor.avatarUrl && (
                <img
                  src={connection.mentor.avatarUrl}
                  alt={connection.mentor.firstName}
                  className="h-12 w-12 rounded-full"
                />
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {connection.mentor.firstName} {connection.mentor.lastName}
                </h3>
                <p className="text-sm text-gray-500">{connection.mentor.email}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Expertise</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {connection.mentor.mentorProfile.expertise.map((skill) => (
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
              <p className="mt-1 text-sm text-gray-600">
                {connection.mentor.mentorProfile.availability}
              </p>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Connection Status</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                connection.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {connection.status}
              </span>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Connected Since</h4>
              <p className="mt-1 text-sm text-gray-600">
                {new Date(connection.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
        
        {connections?.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            You don't have any active mentorship connections yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule; 