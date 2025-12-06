// client/src/hooks/useClerkNavigation.tsx

import { useNavigate } from 'react-router-dom';

/**
 * Custom hook to provide Clerk with React Router's internal navigation function.
 * This prevents full page redirects (which cause 404s on Vercel) and forces 
 * client-side routing.
 */
export const useClerkNavigation = () => {
  const navigate = useNavigate();
  // Return the function that Clerk's 'navigate' prop expects: (to: string) => void
  return (to: string) => navigate(to); 
};