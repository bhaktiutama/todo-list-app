'use client';

import { useEffect } from 'react';
import { TourProvider, useTour, type StepType } from '@reactour/tour';
import { useOnboarding } from '../context/OnboardingContext';

const steps: StepType[] = [
  {
    selector: '.toggle-form',
    content: 'Click here to show or hide the form for creating a new todo list.',
  },
  {
    selector: '.tag-filters',
    content: 'Filter todo lists by tags to find related lists quickly.',
  },
  {
    selector: '.search-todo-lists',
    content: 'Search through todo lists by title or description.',
  },
  {
    selector: '.theme-toggle',
    content: 'Switch between light and dark mode to customize your experience.',
  },
];

const tourStyles = {
  popover: (base: any) => ({
    ...base,
    backgroundColor: 'var(--background-color, #FFFFFF)',
    color: 'var(--text-color, #1F2937)',
    borderRadius: 8,
    padding: 20,
  }),
};

const TourComponent = () => {
  const { isFirstVisit, completeOnboarding, startOnboarding } = useOnboarding();
  const { setIsOpen } = useTour();

  // Update CSS variables based on theme
  useEffect(() => {
    const updateThemeColors = () => {
      const isDark = document.documentElement.classList.contains('dark');
      document.documentElement.style.setProperty('--background-color', isDark ? '#1E1E1E' : '#FFFFFF');
      document.documentElement.style.setProperty('--text-color', isDark ? '#FFFFFF' : '#1F2937');
    };

    // Initial update
    updateThemeColors();

    // Create observer to watch for theme changes
    const observer = new MutationObserver(updateThemeColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isFirstVisit) {
      setIsOpen(true);
    }
  }, [isFirstVisit, setIsOpen]);

  useEffect(() => {
    const handleTourEnd = () => {
      completeOnboarding();
      setIsOpen(false);
    };

    // Listen for tour completion
    window.addEventListener('reactour:end', handleTourEnd);
    window.addEventListener('reactour:close', handleTourEnd);

    return () => {
      window.removeEventListener('reactour:end', handleTourEnd);
      window.removeEventListener('reactour:close', handleTourEnd);
    };
  }, [completeOnboarding, setIsOpen]);

  // Listen for help button clicks
  useEffect(() => {
    const handleHelpClick = () => {
      startOnboarding();
      setIsOpen(true);
    };

    window.addEventListener('restart-tour', handleHelpClick);
    return () => {
      window.removeEventListener('restart-tour', handleHelpClick);
    };
  }, [startOnboarding, setIsOpen]);

  return null;
};

export const OnboardingGuide = () => {
  return (
    <TourProvider steps={steps} styles={tourStyles} showNavigation={true} showBadge={true} showDots={true}>
      <TourComponent />
    </TourProvider>
  );
};
