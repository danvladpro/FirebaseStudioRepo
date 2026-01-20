
"use client";

import { Suspense } from 'react';
import DrillResultsDisplay from '@/components/drill-results-display';

function DrillResultsPageContent() {
  return <DrillResultsDisplay />;
}

export default function DrillResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center"><p>Loading results...</p></div>}>
      <DrillResultsPageContent />
    </Suspense>
  );
}
