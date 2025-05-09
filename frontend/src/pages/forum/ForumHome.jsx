import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import Container from '../../components/Container';
import { useAuth } from '../../context/AuthContext';

export default function ForumHome() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['forum-questions', currentPage],
    queryFn: async () => {
      const response = await api.get(`/v1/forum/questions?page=${currentPage}`);
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <Container>
        <div className="py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-100 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="py-8">
          <div className="text-red-500">Error loading questions. Please try again later.</div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Forum</h1>
          {user && (
            <Link
              to="/forum/ask"
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Ask Question
            </Link>
          )}
        </div>

        <div className="space-y-6">
          {data?.questions.map(question => (
            <div key={question._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                {/* Score */}
                <div className="flex flex-col items-center text-gray-500">
                  <span className="text-xl font-semibold">{question.score}</span>
                  <span className="text-sm">votes</span>
                </div>

                {/* Answers count */}
                <div className="flex flex-col items-center text-gray-500">
                  <span className="text-xl font-semibold">{question.answersCount}</span>
                  <span className="text-sm">answers</span>
                </div>

                {/* Question content */}
                <div className="flex-1">
                  <Link 
                    to={`/forum/${question.slug}`}
                    className="text-xl font-semibold text-gray-900 hover:text-red-600 transition-colors"
                  >
                    {question.title}
                  </Link>
                  <p className="mt-2 text-gray-600 line-clamp-2">{question.body}</p>
                  
                  {/* Author and date */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    <span>Asked by {question.authorId.firstName} {question.authorId.lastName}</span>
                    <span>•</span>
                    <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {data?.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {[...Array(data.totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded ${
                  currentPage === i + 1
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
} 