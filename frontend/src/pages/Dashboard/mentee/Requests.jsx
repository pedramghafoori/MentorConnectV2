import { useMentorshipRequests } from '../../../hooks/useMentorship';

const Requests = () => {
  const { data: requests, isLoading } = useMentorshipRequests('sent');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">My Mentorship Requests</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {requests?.map((request) => (
          <div key={request.id} className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center space-x-4">
              {request.mentor.avatarUrl && (
                <img
                  src={request.mentor.avatarUrl}
                  alt={request.mentor.firstName}
                  className="h-12 w-12 rounded-full"
                />
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {request.mentor.firstName} {request.mentor.lastName}
                </h3>
                <p className="text-sm text-gray-500">{request.mentor.email}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Status</h4>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                request.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                request.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {request.status}
              </span>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Message</h4>
              <p className="mt-1 text-sm text-gray-600">{request.message}</p>
            </div>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900">Sent</h4>
              <p className="mt-1 text-sm text-gray-600">
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
        
        {requests?.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            You haven't sent any mentorship requests yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests; 