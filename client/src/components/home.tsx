import { useEffect, useState, useRef } from 'react';
import { useUser, UserButton, useClerk } from '@clerk/clerk-react'; 
import ForceGraph2D from 'react-force-graph-2d';
import { Loader2, X, Send, ShieldCheck } from 'lucide-react';

// 1. Define Interfaces
interface GraphNode {
  id: string;
  githubUsername: string;
  bio: string;
  isMe?: boolean;
  isMock?: boolean;
  val: number;
  color?: string; 
  x?: number;
  y?: number;
}
interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}
interface ForceGraphInstance {
  centerAt: (x: number, y: number, ms?: number) => void;
  zoom: (k: number, ms?: number) => void;
}
interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  isMe: boolean;
  timestamp: number;
}
interface BackendUser {
  clerkId: string;
  githubUsername: string;
  bio: string;
  isVerified: boolean; 
}

// --- CONFIG: COLORS & NAMES ---
const PASTEL_COLORS = [
  '#fca5a5', '#fdba74', '#fcd34d', '#86efac', '#67e8f9', '#93c5fd', '#c4b5fd', '#f9a8d4',
];
const MOCK_NAMES = [
  'Alex_Systems', 'Jordan_AI', 'Casey_Builds', 'Taylor_Eth', 'Morgan_Zk',
  'Jamie_Rust', 'Riley_Net', 'Avery_Sol', 'Quinn_Nodes', 'Skyler_Ops',
  'Dakota_Dev', 'Reese_Ship', 'Cameron_Web', 'Parker_Chain', 'River_Go',
];
const getColorForUser = (username: string) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) { hash = username.charCodeAt(i) + ((hash << 5) - hash); }
  return PASTEL_COLORS[Math.abs(hash % PASTEL_COLORS.length)];
};
const generateMockNodes = (count: number): GraphNode[] => {
  const roles = ['Rust', 'Solidity', 'AI/ML', 'Systems', 'ZkRollup'];
  return Array.from({ length: count }).map((_, i) => ({
    id: `mock-${i}`, githubUsername: MOCK_NAMES[i % MOCK_NAMES.length], bio: `Building high-performance ${roles[i % roles.length]} infra.`,
    isMock: true, val: 5, color: PASTEL_COLORS[i % PASTEL_COLORS.length],
  }));
};

// --- LOCAL STORAGE KEY ---
const CHAT_STORAGE_KEY = 'signalCorps_chat_history';


export default function Home() {
  const { user } = useUser();
  const { signOut } = useClerk();

  const graphRef = useRef<ForceGraphInstance | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null); 

  // State
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedUser, setSelectedUser] = useState<GraphNode | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Autoscroll
  useEffect(() => {
    if (chatEndRef.current) { chatEndRef.current.scrollIntoView({ behavior: 'smooth' }); }
  }, [chatHistory]);

  // --- NEW: Load history from localStorage when selectedUser changes ---
  useEffect(() => {
    if (!selectedUser) {
        setChatHistory([]); // Clear history if modal is closed
        return;
    }

    try {
        const storedHistoryRaw = localStorage.getItem(CHAT_STORAGE_KEY);
        if (storedHistoryRaw) {
            // History is stored as an object { [recipientId]: ChatMessage[] }
            const fullHistory: Record<string, ChatMessage[]> = JSON.parse(storedHistoryRaw);
            const conversation = fullHistory[selectedUser.id] || [];
            setChatHistory(conversation);
        } else {
            setChatHistory([]);
        }
    } catch (e) {
        console.error("Error loading chat history from storage:", e);
        setChatHistory([]);
    }
  }, [selectedUser]); // Removed chatHistory from the dependency array


  // --- 1. HANDLE MESSAGE SEND (Optimistic Update & LocalStorage Save) ---
  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !selectedUser) return;

    const originalMessage = chatMessage;
    
    // OPTIMISTIC UPDATE
    const newMessage: ChatMessage = { id: Date.now().toString(), text: originalMessage, senderId: user?.id || 'guest', isMe: true, timestamp: Date.now(), };
    
    // Update local state immediately
    const newHistory = [...chatHistory, newMessage];
    setChatHistory(newHistory);
    setChatMessage(''); 
    
    // --- LOCALSTORAGE SAVE ---
    try {
        const storedHistoryRaw = localStorage.getItem(CHAT_STORAGE_KEY) || '{}';
        const fullHistory: Record<string, ChatMessage[]> = JSON.parse(storedHistoryRaw);
        
        fullHistory[selectedUser.id] = newHistory; // Update history for the specific recipient
        
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(fullHistory));
    } catch (e) {
        console.error("Failed to save chat history to storage:", e);
    }
    // -------------------------
    
    try {
      const response = await fetch('https://signalcorps-xi.vercel.app/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, recipientId: selectedUser.id, message: originalMessage })
      });
      
      const result = await response.json();
      
      // Check for the 'banned' status from the backend
      if (result.status === 'banned') {
        console.error('🚨 ACCOUNT DELETED BY VIBE GUARD. SIGNING OUT.');
        alert('🚫 Account deleted due to toxic communication. Logging out.');
        signOut(() => { window.location.href = '/'; }); 
        return;
      }
      
      if (!response.ok) throw new Error(result.error || 'Failed to queue message.');

      console.log(`Message '${originalMessage}' queued for Vibe Check.`);
    } catch (err) {
      console.error('Failed to queue message or process response:', err);
      // Revert optimism if sending failed
      setChatHistory(prev => prev.filter(msg => msg.id !== newMessage.id)); 
      setChatMessage(originalMessage); 
    }
  };


  // --- 2. FETCH DATA & POLLING LOOP --- (No change)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://signalcorps-xi.vercel.app/api/user/list');
        const data = await res.json();
        
        const realUsers: BackendUser[] = data.users || [];
        const mockUsers = generateMockNodes(15);

        const verifiedUsers = realUsers.filter((u: BackendUser) => u.isVerified !== false);
        
        const allNodes: GraphNode[] = [...verifiedUsers.map((u) => ({
          id: u.clerkId as string, githubUsername: u.githubUsername as string, bio: u.bio as string,
          isMe: u.clerkId === user?.id, val: u.clerkId === user?.id ? 15 : 8,
          color: getColorForUser(u.githubUsername as string)
        })), ...mockUsers];

        const newLinks: GraphLink[] = [];
        allNodes.forEach((node) => {
          const target1 = allNodes[Math.floor(Math.random() * allNodes.length)];
          const target2 = allNodes[Math.floor(Math.random() * allNodes.length)];
          if(target1.id !== node.id) newLinks.push({ source: node.id, target: target1.id });
          if(target2.id !== node.id) newLinks.push({ source: node.id, target: target2.id });
        });

        setNodes(allNodes);
        setLinks(newLinks);
      } catch (err) {
        console.error('Failed to fetch user list:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchData(); 
    const intervalId = setInterval(() => { if (user) fetchData(); }, 5000); 
    return () => clearInterval(intervalId);
    
  }, [user]); 


  // --- 3. THE PAINT LOGIC --- (No change)
  const paintNode = (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.githubUsername;
    const fontSize = 12 / globalScale;
    const x = node.x || 0;
    const y = node.y || 0;
    ctx.beginPath();
    const size = node.isMe ? 8 : 4; 
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    if (node.isMe) {
      ctx.fillStyle = '#2563eb'; 
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.3)';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else if (node.id === selectedUser?.id) {
      ctx.fillStyle = node.color ?? '#a1a1aa'; 
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = node.color ?? '#a1a1aa'; 
    }
    ctx.fill();
    const isImportant = node.isMe || node.id === selectedUser?.id;
    ctx.font = isImportant ? `bold ${fontSize * 1.3}px Inter, Sans-Serif` : `${fontSize}px Inter, Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isImportant ? '#000' : 'rgba(0,0,0,0.6)'; 
    ctx.shadowColor = "white";
    ctx.shadowBlur = 4;
    ctx.fillText(label, x, y + size + 4);
    ctx.shadowBlur = 0;
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden">
      
      {/* --- HEADER --- */}
      <div className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-center pointer-events-none">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-black">
            Signal Corps.
          </h1>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Network Active • {nodes.length} Verified Nodes
          </p>
        </div>
        
        {/* FIX 4: Logout Button & UserButton */}
        <div className="pointer-events-auto flex items-center gap-3">
          
          <button 
              onClick={() => signOut(() => { window.location.href = "/"; })}
              className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition duration-150"
          >
              Logout
          </button>

          <UserButton afterSignOutUrl="/" />
        </div>
      </div>

      {/* --- THE GRAPH --- */}
      <ForceGraph2D
        width={window.innerWidth}
        height={window.innerHeight}
        graphData={{ nodes, links }}
        nodeCanvasObject={paintNode}
        backgroundColor="#f9fafb" 
        linkColor={() => 'rgba(0,0,0,0.1)'}
        onNodeClick={(clickedNode: GraphNode) => {
            if (clickedNode.isMe) return;
            graphRef.current?.centerAt(clickedNode.x || 0, clickedNode.y || 0, 1000);
            graphRef.current?.zoom(4, 2000);
            setSelectedUser(clickedNode);
        }}
        ref={graphRef}
      />

      {/* --- CHAT MODAL --- */}
      {selectedUser && (
        <div className="absolute bottom-4 right-4 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300 z-50">
          
          {/* Header */}
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black border border-black/10" style={{ backgroundColor: selectedUser.color }}>
                    {selectedUser.githubUsername[0]?.toUpperCase() || '?'}
                </div>
                <div>
                    <h3 className="font-bold text-sm">{selectedUser.githubUsername}</h3>
                    <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium uppercase tracking-wider">
                        <ShieldCheck size={10} /> Verified Signal
                    </div>
                </div>
             </div>
             <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-black">
                <X size={18} />
             </button>
          </div>

          {/* Chat Body */}
          <div className="h-64 p-4 overflow-y-auto bg-white flex flex-col gap-3">
             
             {/* Initial Bio Message */}
             <div className="self-start bg-gray-100 p-3 rounded-lg rounded-tl-none text-xs text-gray-700 max-w-[85%]">
                {selectedUser.bio}
             </div>

             {/* Dynamic Chat History */}
             {chatHistory.map(msg => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-2 rounded-lg text-xs max-w-[85%] ${
                        msg.isMe 
                        ? 'bg-blue-500 text-white rounded-br-none' 
                        : 'bg-gray-200 text-gray-800 rounded-tl-none'
                    }`}>
                        {msg.text}
                    </div>
                </div>
             ))}

             <div ref={chatEndRef} /> {/* Autoscroll target */}
             
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t bg-white flex gap-2">
             <input 
                className="flex-1 bg-gray-50 border-none rounded-full px-4 text-sm focus:ring-1 focus:ring-black outline-none"
                placeholder="Send a high-signal message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }} 
             />
             <button 
                className="bg-black text-white p-2 rounded-full hover:bg-gray-800"
                onClick={handleSendMessage}
             >
                <Send size={16} />
             </button>
          </div>
        </div>
      )}

    </div>
  );
}
