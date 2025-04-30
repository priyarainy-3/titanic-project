
import React, { useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Droplets, Syringe, AlertCircle } from 'lucide-react';
import { 
  combinedDataset, 
  calculateMissingValues,
  processDataForML
} from '@/data/titanic/titanicData';

const DataCleaning = () => {
  const [activeTab, setActiveTab] = useState("strategies");
  const [ageStrategy, setAgeStrategy] = useState("median");
  const [fareStrategy, setFareStrategy] = useState("median");
  const [embarkedStrategy, setEmbarkedStrategy] = useState("mode");
  const [processResult, setProcessResult] = useState<any>(null);
  
  // Calculate missing values
  const missingValues = calculateMissingValues(combinedDataset);
  
  const applyImputation = () => {
    const result = processDataForML({
      ageStrategy,
      fareStrategy,
      embarkedStrategy
    });
    
    setProcessResult(result);
    setActiveTab("results");
    
    toast("Data cleaning applied successfully", {
      description: "Missing values have been imputed according to your strategy.",
    });
  };
  
  // Missing values data for critical features
  const criticalMissingValues = ["Age", "Cabin", "Embarked", "Fare"]
    .filter(feature => missingValues[feature]?.count > 0)
    .map(feature => ({
      feature,
      count: missingValues[feature]?.count || 0,
      percentage: missingValues[feature]?.percentage || 0
    }));

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="text-2xl text-ocean-800">Phase 2: Data Cleaning</CardTitle>
        <CardDescription>
          Handling missing values and data inconsistencies to prepare for feature engineering
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-4">
            <TabsTrigger value="strategies">Imputation Strategies</TabsTrigger>
            <TabsTrigger value="issues">Data Issues</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="strategies" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Droplets className="h-5 w-5 text-ocean-500 mr-2" />
                    Age Imputation
                  </CardTitle>
                  <CardDescription>
                    {missingValues['Age']?.percentage.toFixed(1)}% of Age values are missing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={ageStrategy} onValueChange={setAgeStrategy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="median">Global Median</SelectItem>
                      <SelectItem value="mean">Global Mean</SelectItem>
                      <SelectItem value="byGroup">Group-based (by Pclass & Sex)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-4 text-sm">
                    <h4 className="font-medium">Justification:</h4>
                    {ageStrategy === "median" && (
                      <p className="text-slate-600 mt-1">
                        Median is robust to outliers and preserves the overall age distribution. Good general choice.
                      </p>
                    )}
                    {ageStrategy === "mean" && (
                      <p className="text-slate-600 mt-1">
                        Mean uses all available age data but can be influenced by outliers (very young or old passengers).
                      </p>
                    )}
                    {ageStrategy === "byGroup" && (
                      <p className="text-slate-600 mt-1">
                        Group-based imputation accounts for differences in age patterns across passenger class and gender.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Droplets className="h-5 w-5 text-ocean-500 mr-2" />
                    Fare Imputation
                  </CardTitle>
                  <CardDescription>
                    {missingValues['Fare']?.percentage.toFixed(1) || 0}% of Fare values are missing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={fareStrategy} onValueChange={setFareStrategy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="median">Median Fare</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-4 text-sm">
                    <h4 className="font-medium">Justification:</h4>
                    <p className="text-slate-600 mt-1">
                      Median is used because fare values have outliers (very expensive tickets) that would skew a mean value.
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Droplets className="h-5 w-5 text-ocean-500 mr-2" />
                    Embarked Imputation
                  </CardTitle>
                  <CardDescription>
                    {missingValues['Embarked']?.percentage.toFixed(1) || 0}% of Embarked values are missing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select value={embarkedStrategy} onValueChange={setEmbarkedStrategy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mode">Most Frequent Port (Mode)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="mt-4 text-sm">
                    <h4 className="font-medium">Justification:</h4>
                    <p className="text-slate-600 mt-1">
                      For categorical values like embarkation port, using the most common value (Southampton) is a standard approach.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex justify-center mt-6">
              <Button 
                className="bg-ocean-600 hover:bg-ocean-700"
                onClick={applyImputation}
              >
                <Syringe className="h-4 w-4 mr-2" />
                Apply Imputation Strategies
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="issues">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Critical Data Issues</CardTitle>
                <CardDescription>
                  Issues identified during data exploration that require cleaning
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-md font-semibold mb-2">Missing Values</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Feature</TableHead>
                        <TableHead>Missing Count</TableHead>
                        <TableHead>Missing Percentage</TableHead>
                        <TableHead>Impact</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {criticalMissingValues.map((item) => (
                        <TableRow key={item.feature}>
                          <TableCell className="font-medium">{item.feature}</TableCell>
                          <TableCell>{item.count}</TableCell>
                          <TableCell>{item.percentage.toFixed(1)}%</TableCell>
                          <TableCell>
                            {item.feature === 'Age' && 'High - Important predictor'}
                            {item.feature === 'Cabin' && 'Medium - Could extract cabin location'}
                            {item.feature === 'Embarked' && 'Low - Few missing values'}
                            {item.feature === 'Fare' && 'Low - Single missing value'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-md font-semibold mb-2 flex items-center">
                    <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                    Cabin Feature Strategy
                  </h3>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                    <p className="text-sm text-amber-800">
                      The Cabin feature has {missingValues['Cabin']?.percentage.toFixed(0) || 0}% missing values. 
                      Rather than simple imputation, we'll create two new features:
                    </p>
                    <ul className="list-disc list-inside mt-2 text-sm text-amber-800">
                      <li>
                        <span className="font-medium">HasCabin</span>: Binary feature indicating if cabin information exists
                      </li>
                      <li>
                        <span className="font-medium">Deck</span>: Extracted from first letter of cabin (e.g., "C85" → "C")
                      </li>
                    </ul>
                    <p className="mt-2 text-sm text-amber-800">
                      This approach preserves the signal that having a cabin record likely indicates higher passenger class
                      while also extracting the deck information which may correlate with survival rates.
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-md font-semibold mb-2">Other Data Considerations</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-ocean-100 border border-ocean-200 flex items-center justify-center text-ocean-600 text-xs mr-2 mt-0.5">1</div>
                      <div>
                        <p className="font-medium">Outliers in Fare</p>
                        <p className="text-sm text-slate-600">Some passengers paid significantly higher fares. These are valid data points representing luxury accommodations, not errors.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-ocean-100 border border-ocean-200 flex items-center justify-center text-ocean-600 text-xs mr-2 mt-0.5">2</div>
                      <div>
                        <p className="font-medium">Age Distribution</p>
                        <p className="text-sm text-slate-600">Ages span from infants to elderly passengers, with concentrations in young adults and middle-aged passengers.</p>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-ocean-100 border border-ocean-200 flex items-center justify-center text-ocean-600 text-xs mr-2 mt-0.5">3</div>
                      <div>
                        <p className="font-medium">Duplicate Tickets</p>
                        <p className="text-sm text-slate-600">Some passengers share ticket numbers, indicating traveling groups/families.</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results">
            {processResult ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Cleaning Results</CardTitle>
                  <CardDescription>
                    Missing values have been successfully handled using your selected strategies
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-md font-semibold mb-2">Applied Strategies</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-md border border-green-200">
                        <p className="font-medium text-green-800">Age Imputation</p>
                        <p className="text-sm text-green-700 mt-1">
                          Strategy: {ageStrategy === 'byGroup' ? 'Group-based' : 
                          ageStrategy === 'mean' ? 'Global Mean' : 'Global Median'}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-md border border-green-200">
                        <p className="font-medium text-green-800">Fare Imputation</p>
                        <p className="text-sm text-green-700 mt-1">
                          Strategy: Median Fare
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-md border border-green-200">
                        <p className="font-medium text-green-800">Embarked Imputation</p>
                        <p className="text-sm text-green-700 mt-1">
                          Strategy: Most Frequent (Mode)
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-md font-semibold mb-2">Sample Data After Cleaning</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>PassengerId</TableHead>
                            <TableHead>Pclass</TableHead>
                            <TableHead>Sex</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Fare</TableHead>
                            <TableHead>Embarked</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {processResult.processedTrain.slice(0, 5).map((passenger: any) => (
                            <TableRow key={passenger.PassengerId}>
                              <TableCell>{passenger.PassengerId}</TableCell>
                              <TableCell>{passenger.Pclass}</TableCell>
                              <TableCell>{passenger.Sex}</TableCell>
                              <TableCell>{passenger.Age ? passenger.Age.toFixed(1) : '-'}</TableCell>
                              <TableCell>{passenger.Fare ? passenger.Fare.toFixed(2) : '-'}</TableCell>
                              <TableCell>{passenger.Embarked}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                    <h3 className="text-md font-semibold text-blue-800 mb-1">Data Cleaning Summary</h3>
                    <p className="text-sm text-blue-700">
                      All missing values have been successfully handled. The data is now ready for feature engineering.
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium text-blue-800">Training Samples:</span>
                        <span className="ml-2 text-blue-700">{processResult.processedTrain.length}</span>
                      </div>
                      <div>
                        <span className="font-medium text-blue-800">Test Samples:</span>
                        <span className="ml-2 text-blue-700">{processResult.processedTest.length}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <p className="text-muted-foreground mb-4">
                  No data cleaning has been applied yet.
                </p>
                <Button 
                  onClick={() => setActiveTab("strategies")}
                  variant="outline"
                >
                  Select Imputation Strategies
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataCleaning;
