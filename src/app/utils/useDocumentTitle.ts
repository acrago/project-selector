import * as React from 'react';

// a custom hook for setting the page title (no-op when title is undefined)
export function useDocumentTitle(title: string | undefined) {
  React.useEffect(() => {
    if (title === undefined) return;
    const originalTitle = document.title;
    document.title = title;

    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
