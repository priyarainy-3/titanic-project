
import React from 'react';
import DataHeader from '@/components/DataHeader';
import DataExploration from '@/components/DataExploration';
import DataCleaning from '@/components/DataCleaning';
import FeatureEngineering from '@/components/FeatureEngineering';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-ocean-50 to-slate-100">
      <div className="container py-8">
        <DataHeader />
        <DataExploration />
        <DataCleaning />
        <FeatureEngineering />
        
        <footer className="text-center text-sm text-slate-500 mt-10 py-4">
          <p>Data Voyage: Titanic - Data Cleaning & Feature Engineering</p>
          <p className="mt-1">
            <span className="font-medium">Created with:</span> React, TypeScript, TailwindCSS & Recharts
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
