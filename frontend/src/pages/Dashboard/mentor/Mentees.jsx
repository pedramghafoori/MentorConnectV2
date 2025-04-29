import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const Mentees = () => {
  const { data: mentees, isLoading } = useQuery({
    queryKey: ['mentees'],
    queryFn: async () => {
      const { data } = await axios.get('/api/mentor/mentees');
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Mentees</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mentees?.map((mentee) => (
          <div key={mentee.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center gap-4">
              <img
                src={mentee.avatar || '/default-avatar.png'}
                alt={mentee.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{mentee.name}</h3>
                <p className="text-sm text-gray-500">{mentee.email}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{mentee.bio}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                Message
              </button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mentees; 