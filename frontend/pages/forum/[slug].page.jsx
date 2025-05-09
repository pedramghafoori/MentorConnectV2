import { Helmet } from 'react-helmet-async';
import ThreadPage from '../../src/pages/forum/ThreadPage';

export { Page };

function Page({ pageProps }) {
  const { question, answers, error, slug } = pageProps;

  if (error) {
    return (
      <>
        <Helmet>
          <title>Question Not Found · LifeguardHub Forum</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="text-red-500">Question not found</div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{question.title} · LifeguardHub Forum</title>
        <meta name="description" content={question.body.slice(0, 140)} />
        <link rel="canonical" href={`https://lifeguardhub.ca/forum/${slug}`} />
      </Helmet>
      <ThreadPage initialData={{ question, answers }} />
    </>
  );
} 