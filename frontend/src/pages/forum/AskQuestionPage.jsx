import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../lib/api';
import Container from '../../components/Container';
import { useAuth } from '../../context/AuthContext';
import RichTextEditor from '../../components/RichTextEditor';

export default function AskQuestionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [validationError, setValidationError] = useState('');

  const createQuestionMutation = useMutation({
    mutationFn: async ({ title, body }) => {
      const response = await api.post('/v1/forum/questions', { 
        title, 
        body
      });
      return response.data;
    },
    onSuccess: (data) => {
      navigate(`/forum/${data.slug}`);
    },
    onError: (error) => {
      if (error.response?.data?.error?.errors?.body?.kind === 'minlength') {
        setValidationError('Question body must be at least 30 characters long');
      } else {
        setValidationError(error.response?.data?.message || 'Error creating question');
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim() || !body.trim()) {
      setValidationError('Please fill in all fields');
      return;
    }

    // Remove HTML tags for length validation
    const plainText = body.replace(/<[^>]*>/g, '');
    if (plainText.length < 30) {
      setValidationError('Question body must be at least 30 characters long');
      return;
    }

    createQuestionMutation.mutate({ title, body });
  };

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Ask a Question</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="What's your question? Be specific."
              required
              minLength={10}
              maxLength={300}
            />
          </div>

          {/* Body input */}
          <div>
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
              Body
            </label>
            <RichTextEditor
              content={body}
              onChange={setBody}
              placeholder="Describe your question in detail. Use the toolbar above to format your text."
            />
            <p className="mt-2 text-sm text-gray-500">
              Use the toolbar above to format your text. You can add bold, italic, code blocks, lists, and links.
            </p>
          </div>

          {/* Error message */}
          {(validationError || createQuestionMutation.error) && (
            <div className="text-red-500 text-sm">
              {validationError || createQuestionMutation.error?.response?.data?.message || 'Error creating question'}
            </div>
          )}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={createQuestionMutation.isLoading}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {createQuestionMutation.isLoading ? 'Posting...' : 'Post Question'}
            </button>
          </div>
        </form>
      </div>
    </Container>
  );
} 