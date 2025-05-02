import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import api from '../../lib/api';

const fetchReviews = async ({ pageParam = 1, userId }) => {
  const response = await api.get(`/users/${userId}/reviews?page=${pageParam}`);
  return response.data;
};

export default function ReviewsSection({ userId }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['reviews', userId],
    queryFn: ({ pageParam = 1 }) => fetchReviews({ pageParam, userId }),
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  const reviews = data?.pages.flatMap(page => page.reviews) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#d33]"></div>
      </div>
    );
  }

  return (
    <section className="mt-8">
      {reviews.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          You don't have any reviews yet, any new reviews will immediately appear here for you to view.
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">
                    {review.reviewerName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{review.reviewerName}</h3>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
      {hasNextPage && reviews.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="px-5 py-2 bg-[#d33] text-white rounded-[9999px] hover:bg-[#b22] transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </section>
  );
} 