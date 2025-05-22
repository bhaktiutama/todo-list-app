'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface OnboardingContextType {
  isFirstVisit: boolean;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  completeOnboarding: () => void;
  startOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  // Always initialize as false - tour will only show when Help Guide is clicked
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const completeOnboarding = () => {
    setIsFirstVisit(false);
    setCurrentStep(0);
  };

  const startOnboarding = () => {
    setIsFirstVisit(true);
    setCurrentStep(0);
  };

  return (
    <OnboardingContext.Provider
      value={{
        isFirstVisit,
        currentStep,
        setCurrentStep,
        completeOnboarding,
        startOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
