import { Helmet } from 'react-helmet-async';
import AskQuestionPage from '../../src/pages/forum/AskQuestionPage';

export { Page };

function Page() {
  return (
    <>
      <Helmet>
        <title>Ask a Question · LifeguardHub Forum</title>
        <meta name="description" content="Ask a question to the LifeguardHub community." />
        <link rel="canonical" href="https://lifeguardhub.ca/forum/ask" />
      </Helmet>
      <AskQuestionPage />
    </>
  );
} 