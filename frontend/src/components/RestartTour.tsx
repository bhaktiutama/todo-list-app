import { useOnboarding } from '../context/OnboardingContext';

export const RestartTour = () => {
  const { startOnboarding } = useOnboarding();

  const handleClick = () => {
    startOnboarding();
    window.dispatchEvent(new Event('restart-tour'));
  };

  return (
    <button onClick={handleClick} className='fixed right-4 top-40 p-2 rounded-full bg-slate-200 dark:bg-slate-700 transition-colors duration-200 hover:bg-slate-300 dark:hover:bg-slate-600 z-50' aria-label='Show Help Guide' type='button'>
      <svg xmlns='http://www.w3.org/2000/svg' className='h-6 w-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}>
        <path strokeLinecap='round' strokeLinejoin='round' d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' />
      </svg>
    </button>
  );
};
