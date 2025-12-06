import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import Bio from './bio'; 
import Home from './home'; 
import { Loader2 } from 'lucide-react';

export default function Verify() {
  const { user } = useUser();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        if (!user) return;
        
        // --- THE FIX IS HERE ---
        // 1. URL: Matches the new backend structure
        // 2. Method: POST
        // 3. Body: JSON stringify the userId
        const res = await fetch('http://localhost:3001/api/user/status', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: user.id })
        });

        const data = await res.json();
        
        setIsVerified(data.isVerified); 
      } catch (error) {
        console.error("Failed to check status", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [user]); 

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-black" />
        <span className="ml-2 font-mono text-sm">Verifying Signal...</span>
      </div>
    );
  }

  if (!isVerified) {
    return <Bio onSuccess={() => setIsVerified(true)} />;
  }

  return <Home />;
}