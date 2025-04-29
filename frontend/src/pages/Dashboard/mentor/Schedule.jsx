import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const Schedule = () => {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['mentor-schedule'],
    queryFn: async () => {
      const { data } = await axios.get('/api/mentor/schedule');
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Schedule</h1>
      <div className="grid gap-4">
        {sessions?.map((session) => (
          <div key={session.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{session.mentee.name}</h3>
                <p className="text-sm text-gray-500">{session.topic}</p>
                <p className="text-sm text-gray-500">
                  {new Date(session.startTime).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">
                  Join
                </button>
                <button className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200">
                  Cancel
                </button>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{session.description}</p>
            </div>
            {session.notes && (
              <div className="mt-4">
                <p className="text-sm font-medium">Session Notes:</p>
                <p className="mt-1 text-sm text-gray-600">{session.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule; 