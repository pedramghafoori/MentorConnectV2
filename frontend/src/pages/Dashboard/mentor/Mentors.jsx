import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const Mentors = () => {
  const { data: mentors, isLoading } = useQuery({
    queryKey: ['mentors'],
    queryFn: async () => {
      const { data } = await axios.get('/api/mentor/mentors');
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Fellow Mentors</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mentors?.map((mentor) => (
          <div key={mentor.id} className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center gap-4">
              <img
                src={mentor.avatar || '/default-avatar.png'}
                alt={mentor.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold">{mentor.name}</h3>
                <p className="text-sm text-gray-500">{mentor.expertise}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{mentor.bio}</p>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium">Expertise Areas:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {mentor.skills?.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <button className="w-full px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                Connect
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Mentors; 