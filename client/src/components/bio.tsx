import { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Loader2, Github, AlertTriangle } from 'lucide-react';

interface BioProps {
  onSuccess: () => void;
}

export default function Bio({ onSuccess }: BioProps) {
  const { user } = useUser();
  
  // Form State
  const [bioText, setBioText] = useState("");
  const [githubUser, setGithubUser] = useState(""); 
  const [defenseAnswer, setDefenseAnswer] = useState(""); 
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [challengeQuestion, setChallengeQuestion] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null); 

    if(!githubUser || !bioText) return setErrorMsg("We need both your Code and your Claims.");

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          bio: bioText,
          githubUsername: githubUser,
          answer: defenseAnswer // Empty on first try, filled if defending
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'VERIFIED') {
        onSuccess(); 
      } else if (data.status === 'SUS') {
        // Enter Defense Mode
        setChallengeQuestion(data.question);
        setErrorMsg(data.reason);
      } else {
        setErrorMsg(data.error || "Verification failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("System Error: Could not connect to the Vibe Check server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 animate-in fade-in duration-500">
      <div className="max-w-md w-full p-8 border border-gray-200 rounded-2xl shadow-sm bg-white transition-all">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {challengeQuestion ? "Defend Your Signal" : "The Gate"}
          </h1>
          <p className="text-gray-500 text-sm">
            {challengeQuestion 
              ? "Our AI flagged a gap in your evidence. Prove you know your stuff." 
              : "Link your code history. Our AI will verify your claims."}
          </p>
        </div>
        
        {/* Error Display */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex gap-3 items-start text-red-600 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* STATE 1: NORMAL SUBMISSION */}
          {!challengeQuestion && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Proof of Work</label>
                <div className="relative">
                  <Github className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="github_username"
                    className="w-full pl-10 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none font-mono text-sm"
                    value={githubUser}
                    onChange={(e) => setGithubUser(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">The Claim</label>
                <textarea 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none resize-none"
                  rows={4}
                  placeholder="e.g. Senior Solidity Engineer..."
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* STATE 2: DEFENSE MODE */}
          {challengeQuestion && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-black text-white p-4 rounded-lg text-sm font-medium shadow-lg">
                <span className="text-gray-400 text-xs uppercase tracking-wider block mb-1">Challenge Question</span>
                "{challengeQuestion}"
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Your Defense</label>
                <textarea 
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-black outline-none resize-none"
                  rows={3}
                  placeholder="Answer the technical question specifically..."
                  value={defenseAnswer}
                  onChange={(e) => setDefenseAnswer(e.target.value)}
                  autoFocus
                  required
                />
              </div>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full py-4 rounded-full font-medium text-sm disabled:opacity-50 flex justify-center items-center transition-all hover:scale-[1.02] active:scale-[0.98] ${
              challengeQuestion ? "bg-red-600 hover:bg-red-700 text-white" : "bg-black hover:bg-gray-800 text-white"
            }`}
          >
            {isLoading ? (
              <><Loader2 className="animate-spin w-4 h-4 mr-2"/> {challengeQuestion ? "Verifying Defense..." : "Running Analysis..."}</>
            ) : (
              challengeQuestion ? "Submit Defense" : "Submit for Trial"
            )}
          </button>

          {challengeQuestion && (
            <button
              type="button"
              onClick={() => { setChallengeQuestion(null); setErrorMsg(null); }}
              className="w-full text-center text-xs text-gray-400 hover:text-black underline decoration-gray-300"
            >
              Wait, I made a typo in my username
            </button>
          )}

        </form>

        <p className="text-center text-xs text-gray-300 mt-6">
          Protected by Signal Corps. Protocol
        </p>

      </div>
    </div>
  );
}