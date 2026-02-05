
import React, { useState, useEffect, useRef } from 'react';
import { Logo } from './Logo';
import { Hexagon, Wifi, Cpu, Disc, Lock, Zap, Shield, Eye, BarChart3, Globe, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  theme: 'dark' | 'light';
}

const KPI_DATA = [
  { icon: Zap, text: "QC Latency Reduced by 40%" },
  { icon: Shield, text: "ISO 9001:2015 Compliance Automated" },
  { icon: Eye, text: "Computer Vision Defect Accuracy > 99.8%" },
  { icon: Cpu, text: "Deep Reasoning Engine Active" },
  { icon: BarChart3, text: "Real-time Telemetry Visualization" },
  { icon: Globe, text: "Global Regulatory Standards Sync" },
  { icon: Lock, text: "Enterprise Grade Encryption" },
];

export const Login: React.FC<LoginProps> = ({ onLogin, theme }) => {
  const [bootSequence, setBootSequence] = useState(true);
  const [bootLines, setBootLines] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  
  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  // --- Boot Sequence Logic ---
  useEffect(() => {
    const lines = [
      "INITIALIZING KERNEL...",
      "LOADING NEURAL MODULES [OK]",
      "ESTABLISHING SECURE UPLINK...",
      "VERIFYING BIOMETRIC PROTOCOLS...",
      "DECRYPTING SECTOR 7 KEYS...",
      "ALLOCATING MEMORY HEAPS...",
      "SYSTEM READY."
    ];
    
    let delay = 0;
    lines.forEach((line, index) => {
      delay += Math.random() * 300 + 100;
      setTimeout(() => {
        setBootLines(prev => [...prev, line]);
        if (index === lines.length - 1) {
          setTimeout(() => setBootSequence(false), 800);
        }
      }, delay);
    });
  }, []);

  // --- Matrix Rain Animation Loop ---
  useEffect(() => {
    if (bootSequence) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    // Matrix Config
    const characters = 'SATYQ CORE 0101010101 INTELLIGENCE ΩΣΠΔΛ';
    const fontSize = 14;
    let drops: number[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      const columns = Math.ceil(canvas.width / fontSize);
      
      const newDrops = [];
      for (let x = 0; x < columns; x++) {
        newDrops[x] = 1; 
      }
      drops = newDrops;
    };

    window.addEventListener('resize', resize);
    resize(); 

    const animate = () => {
      // Different fill style based on theme
      if (theme === 'light') {
         ctx.fillStyle = 'rgba(241, 245, 249, 0.1)'; // Very light fade for light mode
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         ctx.fillStyle = '#059669'; // Emerald-600
      } else {
         ctx.fillStyle = 'rgba(2, 6, 23, 0.05)'; 
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         ctx.fillStyle = '#4ade80'; // Green-400
      }
      
      ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [bootSequence, theme]);

  // --- Hold to Unlock Logic ---
  useEffect(() => {
    let interval: any;
    if (isHolding) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            onLogin();
            return 100;
          }
          return prev + 2; // Fill speed
        });
      }, 16);
    } else {
      interval = setInterval(() => {
        setProgress(prev => Math.max(0, prev - 4)); // Decay speed
      }, 16);
    }
    return () => clearInterval(interval);
  }, [isHolding, onLogin]);

  // --- Render Boot Screen ---
  if (bootSequence) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-black font-mono text-emerald-600 dark:text-emerald-500 p-8 flex flex-col justify-end pb-20 selection:bg-emerald-500/30">
         <div className="max-w-2xl w-full mx-auto space-y-2">
            <div className="flex items-center gap-4 mb-8 opacity-50">
               <Hexagon className="w-8 h-8 animate-spin" />
               <span className="text-xl tracking-widest font-bold">SATYQ BIOS v4.2</span>
            </div>
            {bootLines.map((line, i) => (
              <div key={i} className="flex items-center gap-3">
                 <span className="text-emerald-800 dark:text-emerald-800">{`>`}</span>
                 <span className="animate-pulse">{line}</span>
              </div>
            ))}
            <div className="h-4 w-32 bg-emerald-500/20 mt-4 animate-pulse"></div>
         </div>
         <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] z-50"></div>
      </div>
    );
  }

  // --- Render Main Interface ---
  return (
    <div 
      className="min-h-screen bg-slate-100 dark:bg-[#02040a] text-slate-800 dark:text-slate-200 font-sans flex flex-col relative overflow-x-hidden transition-colors duration-500"
      onMouseUp={() => setIsHolding(false)}
      onMouseLeave={() => setIsHolding(false)}
      onTouchEnd={() => setIsHolding(false)}
    >
      {/* Background Matrix Canvas - Fixed */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 opacity-20 dark:opacity-40 pointer-events-none" 
      />
      
      {/* Vignette Overlay for Depth */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#f1f5f9_90%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,#02040a_85%)] z-1 pointer-events-none"></div>

      {/* Founder Uplink Badge - Fixed Bottom Right */}
      <a 
        href="https://www.linkedin.com/in/ghoshankan/"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 group animate-in fade-in slide-in-from-bottom-10 duration-1000 fill-mode-forwards"
      >
        <div className="relative flex items-center gap-3 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md p-1.5 pr-5 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105 hover:border-cyan-500/50">
           <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 group-hover:border-cyan-400 transition-colors shrink-0">
               <img 
                 src="https://media.licdn.com/dms/image/v2/D5603AQEgsBwL21VRlw/profile-displayphoto-scale_400_400/B56ZgJOw0_HYAk-/0/1752501523203?e=1772064000&v=beta&t=a92AmGRzscSEdNHt0elDQSMe0t5MOenQ-r1Ptw5JKZ8" 
                 alt="Ankan Ghosh"
                 className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" 
               />
           </div>
           <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">System Architect</span>
              <div className="flex items-center gap-1">
                 <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">Ankan Ghosh</span>
                 <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
              </div>
           </div>
           
           {/* Online Dot */}
           <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border-2 border-white dark:border-[#09090b]"></span>
            </span>
        </div>
      </a>

      {/* Main Content Wrapper */}
      <div className="relative z-10 flex-1 flex flex-col">
          
          {/* Marquee Separator */}
          <div className="bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-white/5 backdrop-blur-md overflow-hidden h-12 flex items-center shrink-0">
             <div className="flex animate-marquee whitespace-nowrap">
                {[...KPI_DATA, ...KPI_DATA, ...KPI_DATA].map((item, idx) => (
                   <div key={`m-${idx}`} className="flex items-center gap-3 mx-8 opacity-70 hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-default">
                      <item.icon className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 font-medium tracking-wide">{item.text}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* Login Section - Full Screen Center */}
          <div className="min-h-[calc(100vh-48px)] flex items-center justify-center p-3 md:p-4">
              <div className="relative w-full max-w-[420px] mx-auto transition-transform duration-100">
                
                {/* Holographic Border/Glow Container */}
                <div className="absolute inset-0 bg-cyan-500/10 dark:bg-cyan-500/5 blur-2xl rounded-full -z-10 transform scale-150 opacity-20"></div>

                <div className="bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl relative group">
                  
                  {/* Top Bar */}
                  <div className="h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>
                  
                  <div className="p-5 md:p-8">
                    {/* Header */}
                    <div className="flex flex-col items-center justify-center mb-6 md:mb-10">
                      <div className="mb-4 md:mb-6">
                        <Logo size="xl" showTagline animate className="text-slate-900 dark:text-white" />
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 md:gap-3 mb-6 md:mb-8">
                      <div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 p-2 md:p-3 rounded-lg flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] md:text-[10px] text-slate-500 font-bold truncate">NETWORK</span>
                            <span className="text-[10px] md:text-xs font-mono text-slate-700 dark:text-slate-300 truncate">SECURE</span>
                          </div>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 p-2 md:p-3 rounded-lg flex items-center gap-3">
                          <Wifi className="w-3 h-3 text-cyan-500 shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[9px] md:text-[10px] text-slate-500 font-bold truncate">LATENCY</span>
                            <span className="text-[10px] md:text-xs font-mono text-slate-700 dark:text-slate-300 truncate">12ms</span>
                          </div>
                      </div>
                    </div>

                    {/* Interactive Button */}
                    <div className="relative group/btn">
                      <div className="flex justify-between text-[10px] font-mono text-cyan-600 dark:text-cyan-500/60 mb-2 uppercase tracking-wider">
                          <span>Identity Verification</span>
                          <span>{Math.floor(progress)}%</span>
                      </div>
                      
                      <button
                          onMouseDown={() => setIsHolding(true)}
                          onTouchStart={() => setIsHolding(true)}
                          className="relative w-full h-14 bg-slate-50 dark:bg-slate-900/80 border border-cyan-200 dark:border-cyan-900/30 rounded-lg overflow-hidden cursor-pointer active:scale-[0.98] transition-transform duration-200"
                      >
                          {/* Background Progress */}
                          <div 
                            className="absolute inset-0 bg-cyan-200/50 dark:bg-cyan-500/20 transition-all duration-75 ease-linear"
                            style={{ width: `${progress}%` }}
                          ></div>
                          
                          {/* Progress Glow Line */}
                          <div 
                            className="absolute top-0 bottom-0 right-0 w-[2px] bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                            style={{ left: `${progress}%`, opacity: progress > 0 ? 1 : 0 }}
                          ></div>

                          {/* Content */}
                          <div className="absolute inset-0 flex items-center justify-center gap-3 z-10">
                            {progress === 100 ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-widest animate-pulse">ACCESS GRANTED</span>
                            ) : (
                                <>
                                  <Lock className={`w-4 h-4 ${isHolding ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                  <span className={`text-sm font-bold tracking-widest transition-colors ${isHolding ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                                      {isHolding ? 'VERIFYING...' : 'HOLD TO ACCESS'}
                                  </span>
                                </>
                            )}
                          </div>
                          
                          {/* Scan Texture */}
                          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 dark:opacity-20 mix-blend-overlay"></div>
                      </button>
                    </div>

                  </div>

                  {/* Footer */}
                  <div className="bg-slate-50 dark:bg-black/20 p-4 border-t border-slate-200 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-600 font-mono">
                    <div className="flex items-center gap-2">
                        <Cpu className="w-3 h-3" />
                        <span>CORE: ONLINE</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Disc className="w-3 h-3" />
                        <span>MEM: OPTIMAL</span>
                    </div>
                  </div>
                </div>
              </div>
          </div>

          {/* Detailed Portfolio Footer */}
          <footer className="bg-slate-50 dark:bg-[#050507] pt-16 pb-8 px-6 md:px-12 border-t border-slate-200 dark:border-white/5 relative z-20 transition-colors">
             <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                
                {/* Column 1: Brand & Bio */}
                <div className="space-y-6">
                   <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-1">
                     Satyq<span className="text-emerald-500">.Core</span>
                   </h2>
                   <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
                     Intelligent Quality. Absolute Truth. An enterprise-grade AI platform transforming complex telemetry into actionable insights through Deep Reasoning and Computer Vision.
                   </p>
                   <div className="flex gap-4 pt-2">
                      <a href="#" className="p-2.5 bg-white dark:bg-slate-900 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 hover:border-emerald-500/30 group">
                        <Github className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </a>
                      <a href="https://www.linkedin.com/in/ghoshankan/" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white dark:bg-slate-900 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 hover:border-blue-500/30 group">
                        <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </a>
                      <a href="mailto:ghoshankan005@gmail.com" className="p-2.5 bg-white dark:bg-slate-900 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-slate-800 hover:border-rose-500/30 group">
                        <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </a>
                   </div>
                </div>

                {/* Column 2: Contact */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-8">
                    Get in Touch
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
                    Feel free to reach out for collaborations or just a friendly hello.
                  </p>
                  <a href="mailto:info.satyq.core@gmail.com" className="text-emerald-600 dark:text-emerald-400 font-mono text-sm hover:underline hover:text-emerald-500 dark:hover:text-emerald-300 mb-8 block transition-colors">
                     info.satyq.core@gmail.com ↗
                  </a>
                </div>
             </div>
             
             {/* Copyright Bar */}
             <div className="max-w-7xl mx-auto pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-600 font-mono">
                <p>&copy; 2026 Satyq Core. All rights reserved.</p>
                <div className="flex items-center gap-6">
                   <span className="hover:text-slate-800 dark:hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
                   <span className="flex items-center gap-2 text-emerald-700 dark:text-emerald-500/80 bg-emerald-100 dark:bg-emerald-950/20 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-900/30">
                      <span className="relative flex h-2 w-2">
                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75"></span>
                         <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-emerald-500"></span>
                      </span>
                      System Operational
                   </span>
                </div>
             </div>
          </footer>
      </div>

      <style>{`
        @keyframes marquee {
           0% { transform: translateX(0); }
           100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
           animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
            animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
