import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Activity, Lock, Github, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-tighter">Signal Corps.</div>
          <div className="flex gap-4">
            <Link 
              to="/signin" 
              className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-all"
            >
              Join the Signal
            </Link>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          The Meritocracy Protocol is Live
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
          The Network for <br />
          <span className="text-gray-400">Builders, not Talkers.</span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Series isn't for everyone. It's for the high-signal 1%.
          We use AI to filter out the noise, ensuring every connection you make is with a 
          verified, legitimate builder.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/signin" 
            className="group flex items-center gap-2 bg-black text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-gray-800 transition-all hover:scale-105"
          >
            <Github className="w-5 h-5" />
            Enter the High-Signal Network
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Feature 1: The Gate */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Merit-Based Entry</h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                You can't buy your way in. Our AI agent scans your actual code history to ensure you match the community standard. 
                Fakers get stopped at the door; builders get fast-tracked.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-sm font-mono text-gray-600">
                <div className="flex gap-2 mb-2">
                  <span className="text-red-500">❯</span> 
                  <span>Analyzing GitHub contribution graph...</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-green-500">❯</span> 
                  <span>Signal Strength: <span className="text-black font-bold">HIGH (98%)</span></span>
                </div>
              </div>
            </div>

            {/* Feature 2: The Watchtower */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-white border-2 border-black rounded-xl flex items-center justify-center mb-6">
                <Activity className="w-6 h-6 text-black" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Zero-Noise Guarantee</h3>
              <p className="text-gray-500 leading-relaxed mb-6">
                We protect the network's integrity in real-time. Using event streams, we detect and remove low-signal actors 
                (spam, scams, clout-chasing) instantly. 
              </p>
              <div className="bg-black p-4 rounded-lg border border-gray-800 text-sm font-mono text-gray-400">
                <div className="flex justify-between mb-2">
                  <span>Network Health:</span>
                  <span className="text-green-400 flex items-center gap-1"><Zap size={12}/> Optimized</span>
                </div>
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full animate-pulse"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <section className="py-20 px-6 text-center border-t border-gray-200">
        <Lock className="w-8 h-8 mx-auto mb-6 text-gray-300" />
        <h2 className="text-3xl font-bold mb-4">Quality over Quantity.</h2>
        <p className="text-gray-500 mb-8">Join the only network where the "Vibe Check" never sleeps.</p>
        <div className="flex justify-center gap-8 opacity-50 grayscale">
           <span className="font-bold text-xl">Series.so</span>
           <span className="font-bold text-xl">Vercel</span>
           <span className="font-bold text-xl">Kafka</span>
           <span className="font-bold text-xl">Gemini</span>
        </div>
      </section>

    </div>
  );
}