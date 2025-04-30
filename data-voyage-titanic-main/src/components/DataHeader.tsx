
import React from 'react';
import { Ship, Anchor, Compass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

const DataHeader = () => {
  return (
    <div className="w-full mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        <div className="flex items-center">
          <Ship className="h-10 w-10 text-ocean-600 mr-2 animate-float" />
          <h1 className="text-3xl font-bold text-ocean-800">
            Data Voyage: Titanic
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Anchor className="h-5 w-5 text-ocean-500" />
          <span className="text-ocean-600 text-sm">Data Cleaning & Feature Engineering</span>
          <Compass className="h-5 w-5 text-ocean-500 ml-2" />
        </div>
      </div>
      
      <Card className="bg-gradient-to-r from-ocean-50 to-ocean-100 border-ocean-200">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-ocean-800 mb-2">Project Overview</h2>
          <p className="text-ocean-700">
            This application guides you through the comprehensive process of preparing the Titanic dataset for machine learning. 
            Follow each step of data exploration, cleaning, and feature engineering to transform raw data into meaningful predictors.
          </p>
          <Separator className="my-4 bg-ocean-200" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <h3 className="font-medium text-ocean-800">Phase 1</h3>
              <p className="text-ocean-600 text-sm">Initial Exploration</p>
            </div>
            <div>
              <h3 className="font-medium text-ocean-800">Phase 2</h3>
              <p className="text-ocean-600 text-sm">Data Cleaning</p>
            </div>
            <div>
              <h3 className="font-medium text-ocean-800">Phase 3</h3>
              <p className="text-ocean-600 text-sm">Feature Engineering</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataHeader;
