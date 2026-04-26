import React from 'react';

export interface PageLoadingProps {
  title?: string;
  subtitle?: string;
}

/**
 * Full-page loading block used while route data is being fetched.
 */
export default function PageLoading({
  title = 'Loading data...',
  subtitle = 'Preparing this page for you.',
}: PageLoadingProps) {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-10 shadow-sm shadow-gray-200/60">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <div
          className="relative mb-5 h-14 w-14"
          role="status"
          aria-live="polite"
          aria-label="Loading"
        >
          <span className="absolute inset-0 rounded-full border-4 border-gray-200" />
          <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-brand" />
        </div>

        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="mt-2 text-sm text-gray-500">{subtitle}</p>

        <div className="mt-6 flex items-center gap-2" aria-hidden="true">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand [animation-delay:0ms]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand [animation-delay:150ms]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-brand [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
