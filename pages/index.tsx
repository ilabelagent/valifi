'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the App component with no SSR
const App = dynamic(() => import('../App'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center h-screen bg-background">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Valifi...</p>
      </div>
    </div>
  ),
});

export default function Home() {
  return <App />;
}