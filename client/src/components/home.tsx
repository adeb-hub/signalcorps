import { useEffect, useState, useRef } from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
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

// --- CONFIG: COLORS & NAMES ---
const PASTEL_COLORS = [
  "#fca5a5", // Red
  "#fdba74", // Orange
  "#fcd34d", // Yellow
  "#86efac", // Green
  "#67e8f9", // Cyan
  "#93c5fd", // Blue
  "#c4b5fd", // Purple
  "#f9a8d4", // Pink
];

const MOCK_NAMES = [
  "Alex_Systems", "Jordan_AI", "Casey_Builds", "Taylor_Eth", "Morgan_Zk",
  "Jamie_Rust", "Riley_Net", "Avery_Sol", "Quinn_Nodes", "Skyler_Ops",
  "Dakota_Dev", "Reese_Ship", "Cameron_Web", "Parker_Chain", "River_Go"
];

// Helper: Pick a consistent color based on username string
const getColorForUser = (username: string) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash % PASTEL_COLORS.length);
  return PASTEL_COLORS[index];
};

// --- MOCK DATA GENERATOR ---
const generateMockNodes = (count: number): GraphNode[] => {
  const roles = ["Rust", "Solidity", "AI/ML", "Systems", "ZkRollup"];
  return Array.from({ length: count }).map((_, i) => ({
    id: `mock-${i}`,
    githubUsername: MOCK_NAMES[i % MOCK_NAMES.length],
    bio: `Building high-performance ${roles[i % roles.length]} infra.`,
    isMock: true,
    val: 5,
    color: PASTEL_COLORS[i % PASTEL_COLORS.length] 
  }));
};

export default function Home() {
  const { user } = useUser();
  
  const graphRef = useRef<ForceGraphInstance | null>(null);
  
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedUser, setSelectedUser] = useState<GraphNode | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch Data & Build Graph
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/user/list');
        const data = await res.json();
        const realUsers = data.users || [];
        const mockUsers = generateMockNodes(15);

        // Combine Real + Mock
        const allNodes: GraphNode[] = [...realUsers.map((u: Record<string, unknown>) => ({
          id: u.clerkId as string,
          githubUsername: u.githubUsername as string,
          bio: u.bio as string,
          isMe: u.clerkId === user?.id,
          val: u.clerkId === user?.id ? 15 : 8,
          color: getColorForUser(u.githubUsername as string)
        })), ...mockUsers];

        // Create Random Links
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
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  // --- THE PAINT LOGIC ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paintNode = (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label = node.githubUsername;
    const fontSize = 12 / globalScale;
    
    const x = node.x || 0;
    const y = node.y || 0;

    // 1. Draw Circle
    ctx.beginPath();
    const size = node.isMe ? 8 : 4; 
    ctx.arc(x, y, size, 0, 2 * Math.PI, false);
    
    // Color Logic
    if (node.isMe) {
      ctx.fillStyle = '#2563eb'; 
      ctx.strokeStyle = 'rgba(37, 99, 235, 0.3)';
      ctx.lineWidth = 4;
      ctx.stroke();
    } else if (node.id === selectedUser?.id) {
      ctx.fillStyle = node.color; 
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      ctx.fillStyle = node.color || '#a1a1aa'; 
    }
    ctx.fill();

    // 2. Draw Label (ALL LABELS ARE NOW VISIBLE)
    const isImportant = node.isMe || node.id === selectedUser?.id;

    // Font Styling: Important nodes are BOLD and LARGER
    ctx.font = isImportant 
      ? `bold ${fontSize * 1.3}px Inter, Sans-Serif` 
      : `${fontSize}px Inter, Sans-Serif`;
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Color Styling: Important are Black, others are semi-transparent Gray
    ctx.fillStyle = isImportant ? '#000' : 'rgba(0,0,0,0.6)'; 

    // Add a glow for readability
    ctx.shadowColor = "white";
    ctx.shadowBlur = 4;
    
    ctx.fillText(label, x, y + size + 4);
    
    ctx.shadowBlur = 0; // Reset
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <div className="relative w-full h-screen bg-gray-50 overflow-hidden">
      
      <div className="absolute top-0 left-0 w-full p-4 z-10 flex justify-between items-center pointer-events-none">
        <div>
          <h1 className="text-xl font-bold tracking-tighter text-black">Signal Corps.</h1>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            Network Active • {nodes.length} Verified Nodes
          </p>
        </div>
        <div className="pointer-events-auto">
          <UserButton afterSignOutUrl="/"/>
        </div>
      </div>

      <ForceGraph2D
        width={window.innerWidth}
        height={window.innerHeight}
        graphData={{ nodes, links }}
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nodeCanvasObject={paintNode as (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => void}
        
        backgroundColor="#f9fafb" 
        linkColor={() => "rgba(0,0,0,0.1)"}
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onNodeClick={(node: any) => {
            const clickedNode = node as GraphNode;
            // Prevent clicking yourself
            if (clickedNode.isMe) return;

            graphRef.current?.centerAt(clickedNode.x || 0, clickedNode.y || 0, 1000);
            graphRef.current?.zoom(4, 2000);
            setSelectedUser(clickedNode);
        }}
        
        ref={graphRef}
      />

      {selectedUser && (
        <div className="absolute bottom-4 right-4 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300 z-50">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-black border border-black/10"
                    style={{ backgroundColor: selectedUser.color }}
                >
                    {selectedUser.githubUsername[0]?.toUpperCase() || "?"}
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

          <div className="h-64 p-4 overflow-y-auto bg-white flex flex-col gap-3">
             <div className="self-start bg-gray-100 p-3 rounded-lg rounded-tl-none text-xs text-gray-700 max-w-[85%]">
                {selectedUser.bio}
             </div>
             <div className="self-center text-xs text-gray-300 mt-4">
                This channel is monitored by Vibe Guard™
             </div>
          </div>

          <div className="p-3 border-t bg-white flex gap-2">
             <input 
                className="flex-1 bg-gray-50 border-none rounded-full px-4 text-sm focus:ring-1 focus:ring-black outline-none"
                placeholder="Send a high-signal message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
             />
             <button className="bg-black text-white p-2 rounded-full hover:bg-gray-800">
                <Send size={16} />
             </button>
          </div>
        </div>
      )}

    </div>
  );
}