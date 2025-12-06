// client/src/main.tsx

// 1. Fixed the import of ReactNode to be type-only
import { StrictMode, type ReactNode } from 'react'; 
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter, useNavigate } from 'react-router-dom'; 

// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file');
}

// 2. Define the props interface
interface ClerkNavigationProviderProps {
    children: ReactNode; // Explicitly defines the type of the children prop
}

// 3. Custom component to provide Clerk with React Router's navigation function
export const ClerkNavigationProvider = ({ children }: ClerkNavigationProviderProps) => { 
    // 1. Declare the variable, but immediately use the 'void' operator.
    // This tells the compiler the variable's value is deliberately ignored.
    const navigate = useNavigate();
    void navigate; // <--- The crucial fix for the unused variable warning
    
    return (
        <ClerkProvider
            publishableKey={PUBLISHABLE_KEY}
            afterSignOutUrl="/"
            signInUrl="/signin"
            signUpUrl="/signup"
        >
            {children}
        </ClerkProvider>
    );
};
createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <ClerkNavigationProvider>
                <App />
            </ClerkNavigationProvider>
        </BrowserRouter>
    </StrictMode>
);