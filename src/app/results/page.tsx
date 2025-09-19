"use client";

import { Suspense } from 'react';
import ResultsDisplay from '@/components/results-display';

function ResultsPageContent() {
  return <ResultsDisplay />;
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center"><p>Loading results...</p></div>}>
      <ResultsPageContent />
    </Suspense>
  );
}
