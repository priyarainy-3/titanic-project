
import React, { useState } from 'react';
import { 
  Bar, BarChart, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, PlusCircle, Download } from 'lucide-react';
import { toast } from "@/components/ui/sonner";
import { processDataForML } from '@/data/titanic/titanicData';

const FeatureEngineering = () => {
  const [activeTab, setActiveTab] = useState("features");
  const [processedData, setProcessedData] = useState<any>(null);
  
  const engineeredFeatures = [
    {
      name: "Title",
      type: "Categorical",
      source: "Name",
      description: "Extracted titles (Mr, Mrs, Miss, etc.) from passenger names",
      justification: "Titles contain information about social status, gender, and marital status"
    },
    {
      name: "FamilySize",
      type: "Numerical",
      source: "SibSp + Parch + 1",
      description: "Total number of family members on board (including self)",
      justification: "Family size may affect survival chances - small/large families vs traveling alone"
    },
    {
      name: "IsAlone",
      type: "Binary",
      source: "FamilySize",
      description: "1 if traveling alone, 0 if with family members",
      justification: "Simplified version of family size, indicating solo travelers"
    },
    {
      name: "Deck",
      type: "Categorical",
      source: "Cabin",
      description: "Extracted deck letter from cabin (A-G)",
      justification: "Deck location could impact survival (different decks had different access to lifeboats)"
    },
    {
      name: "HasCabin",
      type: "Binary",
      source: "Cabin",
      description: "1 if cabin information exists, 0 if missing",
      justification: "Having cabin information recorded may indicate passenger status"
    },
    {
      name: "AgeBin",
      type: "Categorical",
      source: "Age",
      description: "Age categorized into groups (Child, Teenager, Young Adult, etc.)",
      justification: "Age groups may have different survival patterns than continuous age"
    },
    {
      name: "FareBin",
      type: "Categorical",
      source: "Fare",
      description: "Fare categorized into price ranges",
      justification: "Price brackets may be more predictive than continuous fare values"
    }
  ];
  
  const droppedFeatures = [
    {
      name: "Name",
      reason: "Already extracted useful information into Title feature"
    },
    {
      name: "Ticket",
      reason: "Complex alphanumeric format with limited predictive value"
    },
    {
      name: "Cabin",
      reason: "High number of missing values; converted to Deck and HasCabin features"
    },
    {
      name: "PassengerId",
      reason: "Only used for identification, not for prediction (retained in test set for submission)"
    }
  ];
  
  const processData = () => {
    const result = processDataForML({
      ageStrategy: "byGroup",
      fareStrategy: "median",
      embarkedStrategy: "mode"
    });
    
    setProcessedData(result);
    setActiveTab("results");
    
    toast("Feature engineering completed", {
      description: "New features have been created and the data is ready for ML.",
    });
  };
  
  const downloadCSV = () => {
    if (!processedData) return;
    
    // Convert training data to CSV
    const headers = Object.keys(processedData.processedTrain[0]).join(',');
    const rows = processedData.processedTrain.map((row: any) => 
      Object.values(row).map((value) => 
        value === null ? '' : String(value).replace(/,/g, '')
      ).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    // Create a blob and download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'titanic_processed_train.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast("CSV downloaded successfully", {
      description: "Training data with engineered features has been downloaded.",
    });
  };

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="text-2xl text-ocean-800">Phase 3: Feature Engineering</CardTitle>
        <CardDescription>
          Creating new features to enhance predictive power for machine learning
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-4">
            <TabsTrigger value="features">New Features</TabsTrigger>
            <TabsTrigger value="dropped">Dropped Features</TabsTrigger>
            <TabsTrigger value="results">Final Dataset</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Feature Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Justification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {engineeredFeatures.map((feature) => (
                  <TableRow key={feature.name}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <PlusCircle className="h-4 w-4 text-green-500 mr-2" />
                        {feature.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        feature.type === "Categorical" ? "bg-blue-50 text-blue-800 border-blue-200" :
                        feature.type === "Binary" ? "bg-purple-50 text-purple-800 border-purple-200" :
                        "bg-amber-50 text-amber-800 border-amber-200"
                      }>
                        {feature.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{feature.source}</TableCell>
                    <TableCell>{feature.description}</TableCell>
                    <TableCell className="text-sm text-slate-600">{feature.justification}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="flex justify-center">
              <Button
                className="bg-ocean-600 hover:bg-ocean-700"
                onClick={processData}
              >
                Generate Engineered Features
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="dropped" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  Features Dropped or Transformed
                </CardTitle>
                <CardDescription>
                  These original features were either removed or transformed into more useful features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Feature</TableHead>
                      <TableHead>Reason for Dropping</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {droppedFeatures.map((feature) => (
                      <TableRow key={feature.name}>
                        <TableCell className="font-medium">{feature.name}</TableCell>
                        <TableCell>{feature.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mt-6">
                  <h3 className="text-md font-semibold text-amber-800 mb-1">Note on Categorical Encoding</h3>
                  <p className="text-sm text-amber-700">
                    For machine learning readiness, categorical features should be encoded to numerical format:
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm text-amber-700">
                    <li>
                      <span className="font-medium">One-Hot Encoding</span> for nominal categories (Sex, Embarked, Title, Deck)
                    </li>
                    <li>
                      <span className="font-medium">Label Encoding</span> for ordinal categories (Pclass, AgeBin, FareBin)
                    </li>
                  </ul>
                  <p className="mt-2 text-sm text-amber-700">
                    Tree-based models can handle label-encoded ordinals, but for linear models, one-hot encoding is preferable for all categories.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results">
            {processedData ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                      ML-Ready Dataset
                    </CardTitle>
                    <CardDescription>
                      Final processed dataset with engineered features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>PassengerId</TableHead>
                            <TableHead>Survived</TableHead>
                            <TableHead>Pclass</TableHead>
                            <TableHead>Sex</TableHead>
                            <TableHead>Age</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>FamilySize</TableHead>
                            <TableHead>IsAlone</TableHead>
                            <TableHead>Deck</TableHead>
                            <TableHead>HasCabin</TableHead>
                            <TableHead>AgeBin</TableHead>
                            <TableHead>FareBin</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {processedData.processedTrain.slice(0, 5).map((passenger: any) => (
                            <TableRow key={passenger.PassengerId}>
                              <TableCell>{passenger.PassengerId}</TableCell>
                              <TableCell>{passenger.Survived}</TableCell>
                              <TableCell>{passenger.Pclass}</TableCell>
                              <TableCell>{passenger.Sex}</TableCell>
                              <TableCell>{passenger.Age ? passenger.Age.toFixed(1) : '-'}</TableCell>
                              <TableCell>{passenger.Title}</TableCell>
                              <TableCell>{passenger.FamilySize}</TableCell>
                              <TableCell>{passenger.IsAlone}</TableCell>
                              <TableCell>{passenger.Deck}</TableCell>
                              <TableCell>{passenger.HasCabin}</TableCell>
                              <TableCell>{passenger.AgeBin}</TableCell>
                              <TableCell>{passenger.FareBin}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-md font-semibold mb-3">Dataset Statistics</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-md border border-green-200">
                          <p className="font-medium text-green-800">Training Set</p>
                          <p className="text-sm text-green-700 mt-1">
                            {processedData.processedTrain.length} passengers with {Object.keys(processedData.processedTrain[0]).length} features
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-md border border-green-200">
                          <p className="font-medium text-green-800">Test Set</p>
                          <p className="text-sm text-green-700 mt-1">
                            {processedData.processedTest.length} passengers with {Object.keys(processedData.processedTest[0]).length - 1} features (no Survived column)
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="flex flex-col items-center">
                      <p className="text-center max-w-lg mb-4 text-slate-600">
                        The dataset is now ready for machine learning model training. You can download the processed training data as CSV.
                      </p>
                      <Button 
                        onClick={downloadCSV}
                        className="bg-ocean-600 hover:bg-ocean-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Processed Data
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Feature Importance Preview</CardTitle>
                    <CardDescription>
                      Expected predictive power of engineered features
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          { name: "Sex", importance: 0.42 },
                          { name: "Pclass", importance: 0.17 },
                          { name: "Title", importance: 0.15 },
                          { name: "FareBin", importance: 0.11 },
                          { name: "AgeBin", importance: 0.09 },
                          { name: "FamilySize", importance: 0.08 },
                          { name: "Embarked", importance: 0.04 },
                          { name: "Deck", importance: 0.03 },
                          { name: "IsAlone", importance: 0.03 },
                        ].sort((a, b) => b.importance - a.importance)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Expected Importance', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value: any) => `${(value * 100).toFixed(1)}%`} />
                        <Bar dataKey="importance" name="Expected Importance" fill="#38bdf8">
                          {[
                            { name: "Sex", importance: 0.42 },
                            { name: "Pclass", importance: 0.17 },
                            { name: "Title", importance: 0.15 },
                            { name: "FareBin", importance: 0.11 },
                            { name: "AgeBin", importance: 0.09 },
                            { name: "FamilySize", importance: 0.08 },
                            { name: "Embarked", importance: 0.04 },
                            { name: "Deck", importance: 0.03 },
                            { name: "IsAlone", importance: 0.03 },
                          ].sort((a, b) => b.importance - a.importance).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Note: These are estimated importance values based on common findings in Titanic survival models.
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8">
                <p className="text-muted-foreground mb-4">
                  Feature engineering has not been applied yet.
                </p>
                <Button 
                  onClick={() => setActiveTab("features")}
                  variant="outline"
                >
                  View Feature Engineering Plan
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FeatureEngineering;
