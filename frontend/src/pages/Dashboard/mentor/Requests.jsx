import { useMentorshipRequests, useRespondToRequest } from '../../../hooks/useMentorship';

const Requests = () => {
  const { data: requests, isLoading } = useMentorshipRequests('received');
  const { mutate: respondToRequest } = useRespondToRequest();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Mentorship Requests</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {requests?.map((request) => (
          <div key={request.id} className="bg-white rounded-2xl shadow p-6">
            <div className="flex items-center space-x-4">
              {request.mentee.avatarUrl && (
                <img
                  src={request.mentee.avatarUrl}
                  alt={request.mentee.firstName}
                  className="h-12 w-12 rounded-full"
                />
              )}
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {request.mentee.firstName} {request.mentee.lastName}
                </h3>
                <p className="text-sm text-gray-500">{request.mentee.email}</p>
              </div>
            </div>
            
            <p className="mt-4 text-gray-600">{request.message}</p>
            
            <div className="mt-6 flex space-x-4">
              <button
                onClick={() => respondToRequest({ requestId: request.id, action: 'accept' })}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Accept
              </button>
              <button
                onClick={() => respondToRequest({ requestId: request.id, action: 'decline' })}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Decline
              </button>
            </div>
          </div>
        ))}
        
        {requests?.length === 0 && (
          <div className="col-span-full text-center text-gray-500">
            No pending mentorship requests
          </div>
        )}
      </div>
    </div>
  );
};

export default Requests; 