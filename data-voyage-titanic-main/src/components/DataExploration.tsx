
import React, { useState } from 'react';
import { 
  Bar, BarChart, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { trainDataset, calculateMissingValues, calculateSurvivalRate, getSurvivalByFeature } from '@/data/titanic/titanicData';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DataExploration = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Calculate summary statistics
  const totalPassengers = trainDataset.length;
  const survivalRate = calculateSurvivalRate();
  const missingValues = calculateMissingValues(trainDataset);
  
  // Prepare data for visualizations
  const survivalData = [
    { name: 'Survived', value: Math.round(survivalRate) },
    { name: 'Did Not Survive', value: Math.round(100 - survivalRate) }
  ];
  
  const genderSurvival = getSurvivalByFeature('Sex');
  const genderSurvivalData = Object.entries(genderSurvival).map(([gender, counts]) => ({
    gender,
    survived: counts.survived,
    died: counts.died,
    survivalRate: Math.round((counts.survived / (counts.survived + counts.died)) * 100)
  }));
  
  const classSurvival = getSurvivalByFeature('Pclass');
  const classSurvivalData = Object.entries(classSurvival).map(([pclass, counts]) => ({
    class: `Class ${pclass}`,
    survived: counts.survived,
    died: counts.died,
    survivalRate: Math.round((counts.survived / (counts.survived + counts.died)) * 100)
  }));
  
  const embarkedSurvival = getSurvivalByFeature('Embarked');
  const embarkedSurvivalData = Object.entries(embarkedSurvival)
    .filter(([port]) => port !== "undefined") // Filter out undefined/null values
    .map(([port, counts]) => {
      const portMap: Record<string, string> = {
        "S": "Southampton",
        "C": "Cherbourg",
        "Q": "Queenstown",
      };
      return {
        port: portMap[port as keyof typeof portMap] || port,
        survived: counts.survived,
        died: counts.died,
        survivalRate: Math.round((counts.survived / (counts.survived + counts.died)) * 100)
      };
    });
  
  // Sample data for display
  const samplePassengers = trainDataset.slice(0, 5);
  
  // Missing values data for visualization
  const missingValuesData = Object.entries(missingValues)
    .map(([feature, data]) => ({
      feature,
      percentage: Math.round(data.percentage),
      count: data.count
    }))
    .filter(item => item.percentage > 0)
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <Card className="w-full mb-8">
      <CardHeader>
        <CardTitle className="text-2xl text-ocean-800">Phase 1: Initial Data Exploration</CardTitle>
        <CardDescription>
          Exploring the Titanic dataset to understand its structure, features, and relationships
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-1 md:grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sample">Sample Data</TabsTrigger>
            <TabsTrigger value="missing">Missing Values</TabsTrigger>
            <TabsTrigger value="survival">Survival Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Dataset Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-ocean-600">{totalPassengers}</div>
                  <p className="text-sm text-muted-foreground">Total passengers in training data</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Survival Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-3xl font-bold text-ocean-600">{survivalRate.toFixed(1)}%</div>
                    <div className="ml-auto h-12 w-12">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={survivalData}
                            cx="50%"
                            cy="50%"
                            innerRadius={15}
                            outerRadius={24}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {survivalData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index === 0 ? '#38bdf8' : '#94a3b8'} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Passengers who survived</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Feature Types</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <div className="text-sm space-y-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-ocean-400 mr-2"></div>
                      <span>Numerical: Age, Fare, SibSp, Parch</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-ocean-600 mr-2"></div>
                      <span>Categorical: Pclass, Sex, Embarked</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-ocean-800 mr-2"></div>
                      <span>Identifier/Text: PassengerId, Name, Ticket, Cabin</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Class Distribution</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={classSurvivalData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="class" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="survived" name="Survived" stackId="a" fill="#38bdf8" />
                      <Bar dataKey="died" name="Did Not Survive" stackId="a" fill="#94a3b8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Gender Distribution</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={genderSurvivalData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="gender" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="survived" name="Survived" stackId="a" fill="#38bdf8" />
                      <Bar dataKey="died" name="Did Not Survive" stackId="a" fill="#94a3b8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="sample">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sample Data (First 5 Rows)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>PassengerId</TableHead>
                        <TableHead>Survived</TableHead>
                        <TableHead>Pclass</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Sex</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>SibSp</TableHead>
                        <TableHead>Parch</TableHead>
                        <TableHead>Ticket</TableHead>
                        <TableHead>Fare</TableHead>
                        <TableHead>Cabin</TableHead>
                        <TableHead>Embarked</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {samplePassengers.map((passenger) => (
                        <TableRow key={passenger.PassengerId}>
                          <TableCell>{passenger.PassengerId}</TableCell>
                          <TableCell>{passenger.Survived}</TableCell>
                          <TableCell>{passenger.Pclass}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{passenger.Name}</TableCell>
                          <TableCell>{passenger.Sex}</TableCell>
                          <TableCell>{passenger.Age}</TableCell>
                          <TableCell>{passenger.SibSp}</TableCell>
                          <TableCell>{passenger.Parch}</TableCell>
                          <TableCell>{passenger.Ticket}</TableCell>
                          <TableCell>{passenger.Fare}</TableCell>
                          <TableCell>{passenger.Cabin || '-'}</TableCell>
                          <TableCell>{passenger.Embarked}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Initial examination of data shows mixed types, with some missing values (particularly in Age and Cabin).
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="missing">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Missing Values Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={missingValuesData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="feature" />
                        <YAxis label={{ value: 'Missing Values (%)', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Bar dataKey="percentage" name="Missing Values %" fill="#38bdf8">
                          {missingValuesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div>
                    <h3 className="text-md font-semibold mb-2">Missing Values Summary</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Feature</TableHead>
                          <TableHead>Missing Count</TableHead>
                          <TableHead>Missing Percentage</TableHead>
                          <TableHead>Recommended Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {missingValuesData.map((item) => (
                          <TableRow key={item.feature}>
                            <TableCell className="font-medium">{item.feature}</TableCell>
                            <TableCell>{item.count}</TableCell>
                            <TableCell>{item.percentage}%</TableCell>
                            <TableCell>
                              {item.feature === 'Age' && 'Impute with median or by group (Pclass/Sex)'}
                              {item.feature === 'Cabin' && 'Create binary HasCabin feature & extract Deck info'}
                              {item.feature === 'Embarked' && 'Impute with most frequent port (mode)'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="survival">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Survival by Class</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={classSurvivalData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="class" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="survivalRate" name="Survival Rate (%)" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-2">
                    First class passengers had much higher survival rates than third class.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Survival by Gender</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={genderSurvivalData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="gender" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="survivalRate" name="Survival Rate (%)" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-2">
                    Females had significantly higher survival rates than males.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Survival by Embarkation Port</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={embarkedSurvivalData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="port" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="survived" name="Survived" stackId="a" fill="#38bdf8" />
                      <Bar dataKey="died" name="Did Not Survive" stackId="a" fill="#94a3b8" />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-sm text-muted-foreground mt-2">
                    Passengers embarking from Cherbourg had better survival rates than those from Southampton or Queenstown.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DataExploration;
