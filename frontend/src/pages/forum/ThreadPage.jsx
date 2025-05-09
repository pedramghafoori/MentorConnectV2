import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import Container from '../../components/Container';
import { useAuth } from '../../context/AuthContext';
import RichTextEditor from '../../components/RichTextEditor';

function AnswerBox({ onSubmit, isLoading }) {
  const [expanded, setExpanded] = useState(false);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  const handleExpand = () => setExpanded(true);
  const handleCancel = () => {
    setExpanded(false);
    setBody('');
    setError('');
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const plainText = body.replace(/<[^>]*>/g, '');
    if (plainText.length < 30) {
      setError('Answer must be at least 30 characters long');
      return;
    }
    onSubmit(body, handleCancel);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8">
      {!expanded ? (
        <input
          className="w-full px-4 py-2 border border-gray-200 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 focus:bg-white focus:outline-none"
          placeholder="Join the conversation"
          onFocus={handleExpand}
          readOnly
        />
      ) : (
        <form onSubmit={handleSubmit}>
          <RichTextEditor
            content={body}
            onChange={setBody}
            placeholder="Write your answer here. Use the toolbar above to format your text."
          />
          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
          <div className="flex gap-2 mt-4 justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Posting...' : 'Comment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ThreadPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["question", slug],
    queryFn: async () => {
      const response = await api.get(`/v1/forum/questions/${slug}`);
      return response.data;
    },
  });

  const createAnswerMutation = useMutation({
    mutationFn: async (body) => {
      const response = await api.post(`/v1/forum/questions/${slug}/answers`, { body });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question", slug] });
    },
  });

  const handleAnswerSubmit = (body, onSuccess) => {
    createAnswerMutation.mutate(body, {
      onSuccess,
    });
  };

  if (isLoading) {
    return (
      <Container>
        <div className="py-8">Loading...</div>
      </Container>
    );
  }

  // Support both { question, answers } and {question} shape
  const question = data?.question || data;
  const answers = data?.answers || question?.answers || [];

  if (!question) {
    return (
      <Container>
        <div className="py-8">Question not found</div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8 max-w-2xl mx-auto">
        {/* Question Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{question.title}</h1>
          <div className="prose max-w-none mb-2" dangerouslySetInnerHTML={{ __html: question.body }} />
          <div className="text-sm text-gray-500 flex items-center gap-2">
            <span>Asked by {question.authorId?.firstName || 'Anonymous'}</span>
            <span>•</span>
            <span>{new Date(question.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        {/* Answer Box */}
        {user && (
          <AnswerBox onSubmit={handleAnswerSubmit} isLoading={createAnswerMutation.isLoading} />
        )}
        {!user && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-8 text-center text-gray-600">
            Please <a href="/login" className="text-red-600 hover:underline">log in</a> to join the conversation.
          </div>
        )}
        {/* Answers Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 border-b border-gray-100 pb-2">
            Answers
          </h2>
          {answers.length === 0 && (
            <div className="text-gray-500 text-center py-8">No answers yet. Be the first to reply!</div>
          )}
          {answers.map((answer) => (
            <div key={answer._id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: answer.body }} />
              <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
                <span>Answered by {answer.authorId?.firstName || answer.author?.name || "Anonymous"}</span>
                <span>•</span>
                <span>{new Date(answer.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
} 