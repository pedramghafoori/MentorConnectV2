import { Helmet } from 'react-helmet-async';
import AskQuestionPage from '../../src/pages/forum/AskQuestionPage';

export { Page };

function Page() {
  return (
    <>
      <Helmet>
        <title>Ask a Question · MentorConnect Forum</title>
        <meta name="description" content="Ask a question to the MentorConnect community." />
        <link rel="canonical" href="https://mentorconnect.ca/forum/ask" />
      </Helmet>
      <AskQuestionPage />
    </>
  );
} 