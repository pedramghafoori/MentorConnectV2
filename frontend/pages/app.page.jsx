import { PageContextProvider } from './usePageContext';
import { HelmetProvider } from 'react-helmet-async';

export { PageShell };

function PageShell({ children, pageContext }) {
  return (
    <HelmetProvider>
      <PageContextProvider pageContext={pageContext}>
        {children}
      </PageContextProvider>
    </HelmetProvider>
  );
} 