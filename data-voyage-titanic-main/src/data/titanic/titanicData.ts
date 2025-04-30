
import trainData from './train.json';
import testData from './test.json';

export interface TitanicPassenger {
  PassengerId: number;
  Survived?: number;
  Pclass: number;
  Name: string;
  Sex: string;
  Age: number | null;
  SibSp: number;
  Parch: number;
  Ticket: string;
  Fare: number | null;
  Cabin: string | null;
  Embarked: string | null;
  isTrainSet?: boolean;
}

// Adding isTrainSet flag to distinguish between train and test data
export const trainDataset: TitanicPassenger[] = trainData.map(passenger => ({
  ...passenger,
  isTrainSet: true
}));

export const testDataset: TitanicPassenger[] = testData.map(passenger => ({
  ...passenger,
  isTrainSet: false
}));

// Combined dataset for consistent processing
export const combinedDataset: TitanicPassenger[] = [...trainDataset, ...testDataset];

// Generate a summary of missing values
export const calculateMissingValues = (dataset: TitanicPassenger[]) => {
  const totalRows = dataset.length;
  const missingValues: Record<string, { count: number, percentage: number }> = {};
  
  // Get sample keys from first record
  if (dataset.length > 0) {
    const sampleKeys = Object.keys(dataset[0]);
    
    sampleKeys.forEach(key => {
      const nullCount = dataset.filter(item => 
        item[key as keyof TitanicPassenger] === null || 
        item[key as keyof TitanicPassenger] === undefined
      ).length;
      
      missingValues[key] = {
        count: nullCount,
        percentage: (nullCount / totalRows) * 100
      };
    });
  }
  
  return missingValues;
};

// Get feature types for classification
export const featureTypes = {
  numerical: ["Age", "Fare", "SibSp", "Parch"],
  categorical: ["Pclass", "Sex", "Embarked"],
  identifier: ["PassengerId", "Name", "Ticket", "Cabin"]
};

// Survival rate calculation
export const calculateSurvivalRate = () => {
  const survivedCount = trainDataset.filter(p => p.Survived === 1).length;
  return (survivedCount / trainDataset.length) * 100;
};

// Helper functions for data cleaning and feature engineering
export const extractTitle = (name: string): string => {
  const titleMatch = name.match(/,\s(.*?)\./);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }
  return "Unknown";
};

export const calculateFamilySize = (sibSp: number, parch: number): number => {
  return sibSp + parch + 1; // +1 for the passenger themselves
};

export const isAlone = (familySize: number): boolean => {
  return familySize === 1;
};

export const extractDeck = (cabin: string | null): string => {
  if (!cabin) return "Unknown";
  return cabin[0]; // First character of cabin is the deck
};

export const binAge = (age: number | null): string => {
  if (age === null) return "Unknown";
  if (age <= 12) return "Child";
  if (age <= 18) return "Teenager";
  if (age <= 35) return "Young Adult";
  if (age <= 60) return "Adult";
  return "Senior";
};

export const binFare = (fare: number | null): string => {
  if (fare === null) return "Unknown";
  if (fare <= 7.91) return "Low";
  if (fare <= 14.454) return "Medium-Low";
  if (fare <= 31) return "Medium";
  if (fare <= 512.329) return "High";
  return "Very High";
};

// For visualization data preparation
export const getAgeDistribution = () => {
  const ageGroups: Record<string, { survived: number, died: number }> = {
    "Child": { survived: 0, died: 0 },
    "Teenager": { survived: 0, died: 0 },
    "Young Adult": { survived: 0, died: 0 },
    "Adult": { survived: 0, died: 0 },
    "Senior": { survived: 0, died: 0 },
    "Unknown": { survived: 0, died: 0 }
  };
  
  trainDataset.forEach(passenger => {
    const ageGroup = binAge(passenger.Age);
    if (passenger.Survived === 1) {
      ageGroups[ageGroup].survived++;
    } else {
      ageGroups[ageGroup].died++;
    }
  });
  
  return ageGroups;
};

export const getSurvivalByFeature = (featureName: keyof TitanicPassenger) => {
  const breakdown: Record<string, { survived: number, died: number }> = {};
  
  trainDataset.forEach(passenger => {
    const featureValue = String(passenger[featureName] ?? "Unknown");
    
    if (!breakdown[featureValue]) {
      breakdown[featureValue] = { survived: 0, died: 0 };
    }
    
    if (passenger.Survived === 1) {
      breakdown[featureValue].survived++;
    } else {
      breakdown[featureValue].died++;
    }
  });
  
  return breakdown;
};

// Generate function for processing data for ML
export const processDataForML = (imputation = {
  ageStrategy: "median", // median, mean, or byGroup
  fareStrategy: "median",
  embarkedStrategy: "mode"
}) => {
  // Create a deep copy of the datasets to avoid mutations
  const processedTrain = JSON.parse(JSON.stringify(trainDataset));
  const processedTest = JSON.parse(JSON.stringify(testDataset));
  const combined = JSON.parse(JSON.stringify(combinedDataset));
  
  // 1. Handle missing values
  
  // Age imputation
  if (imputation.ageStrategy === "median") {
    const medianAge = combined
      .filter(p => p.Age !== null)
      .map(p => p.Age as number)
      .sort((a, b) => a - b)[Math.floor(combined.filter(p => p.Age !== null).length / 2)];
      
    processedTrain.forEach(p => { if (p.Age === null) p.Age = medianAge; });
    processedTest.forEach(p => { if (p.Age === null) p.Age = medianAge; });
  } else if (imputation.ageStrategy === "mean") {
    const totalAge = combined.reduce((sum, p) => sum + (p.Age || 0), 0);
    const validAgeCount = combined.filter(p => p.Age !== null).length;
    const meanAge = totalAge / validAgeCount;
    
    processedTrain.forEach(p => { if (p.Age === null) p.Age = meanAge; });
    processedTest.forEach(p => { if (p.Age === null) p.Age = meanAge; });
  } else if (imputation.ageStrategy === "byGroup") {
    // Group by Pclass and Sex for age imputation
    const ageByGroup: Record<string, number[]> = {};
    
    combined.forEach(p => {
      if (p.Age !== null) {
        const groupKey = `${p.Pclass}_${p.Sex}`;
        if (!ageByGroup[groupKey]) ageByGroup[groupKey] = [];
        ageByGroup[groupKey].push(p.Age);
      }
    });
    
    // Calculate median for each group
    const medianByGroup: Record<string, number> = {};
    Object.entries(ageByGroup).forEach(([groupKey, ages]) => {
      ages.sort((a, b) => a - b);
      medianByGroup[groupKey] = ages[Math.floor(ages.length / 2)];
    });
    
    // Apply group-specific median imputation
    processedTrain.forEach(p => {
      if (p.Age === null) {
        const groupKey = `${p.Pclass}_${p.Sex}`;
        p.Age = medianByGroup[groupKey] || 
          combined.filter(p => p.Age !== null).map(p => p.Age as number)
          .sort((a, b) => a - b)[Math.floor(combined.filter(p => p.Age !== null).length / 2)];
      }
    });
    
    processedTest.forEach(p => {
      if (p.Age === null) {
        const groupKey = `${p.Pclass}_${p.Sex}`;
        p.Age = medianByGroup[groupKey] || 
          combined.filter(p => p.Age !== null).map(p => p.Age as number)
          .sort((a, b) => a - b)[Math.floor(combined.filter(p => p.Age !== null).length / 2)];
      }
    });
  }
  
  // Fare imputation
  if (imputation.fareStrategy === "median") {
    const medianFare = combined
      .filter(p => p.Fare !== null)
      .map(p => p.Fare as number)
      .sort((a, b) => a - b)[Math.floor(combined.filter(p => p.Fare !== null).length / 2)];
      
    processedTrain.forEach(p => { if (p.Fare === null) p.Fare = medianFare; });
    processedTest.forEach(p => { if (p.Fare === null) p.Fare = medianFare; });
  }
  
  // Embarked imputation
  if (imputation.embarkedStrategy === "mode") {
    const embarkedCounts: Record<string, number> = {};
    combined.forEach(p => {
      if (p.Embarked) {
        embarkedCounts[p.Embarked] = (embarkedCounts[p.Embarked] || 0) + 1;
      }
    });
    
    let modeEmbarked = "S"; // Default to most common port
    let maxCount = 0;
    
    Object.entries(embarkedCounts).forEach(([embarked, count]) => {
      if (count > maxCount) {
        maxCount = count;
        modeEmbarked = embarked;
      }
    });
    
    processedTrain.forEach(p => { if (!p.Embarked) p.Embarked = modeEmbarked; });
    processedTest.forEach(p => { if (!p.Embarked) p.Embarked = modeEmbarked; });
  }
  
  // 2. Feature Engineering
  
  // Add engineered features to both datasets
  const addEngineeredFeatures = (dataset: any[]) => {
    return dataset.map(p => {
      // Extract title from name
      const title = extractTitle(p.Name);
      
      // Calculate family size
      const familySize = calculateFamilySize(p.SibSp, p.Parch);
      
      // Is passenger traveling alone?
      const isAloneValue = isAlone(familySize);
      
      // Extract deck from cabin
      const deck = extractDeck(p.Cabin);
      
      // Has cabin information?
      const hasCabin = p.Cabin !== null;
      
      // Age bins
      const ageBin = binAge(p.Age);
      
      // Fare bins
      const fareBin = binFare(p.Fare);
      
      return {
        ...p,
        Title: title,
        FamilySize: familySize,
        IsAlone: isAloneValue ? 1 : 0,
        Deck: deck,
        HasCabin: hasCabin ? 1 : 0,
        AgeBin: ageBin,
        FareBin: fareBin
      };
    });
  };
  
  const engineeredTrain = addEngineeredFeatures(processedTrain);
  const engineeredTest = addEngineeredFeatures(processedTest);
  
  return {
    processedTrain: engineeredTrain,
    processedTest: engineeredTest
  };
};

export default {
  trainDataset,
  testDataset,
  combinedDataset,
  calculateMissingValues,
  featureTypes,
  calculateSurvivalRate,
  getAgeDistribution,
  getSurvivalByFeature,
  processDataForML
};
