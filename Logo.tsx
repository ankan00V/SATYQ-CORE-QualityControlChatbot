
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  animate?: boolean;
  mode?: 'full' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({ 
  className = '', 
  size = 'md', 
  showTagline = false,
  animate = false,
  mode = 'full'
}) => {
  
  const sizeClasses = {
    sm: { h: 'h-8', w: 'w-8', text: 'text-lg', tagline: 'text-[8px]', gap: 'gap-2' },
    md: { h: 'h-10', w: 'w-10', text: 'text-xl', tagline: 'text-[10px]', gap: 'gap-3' },
    lg: { h: 'h-12 md:h-16', w: 'w-12 md:w-16', text: 'text-2xl md:text-3xl', tagline: 'text-[10px] md:text-xs', gap: 'gap-3 md:gap-4' },
    xl: { h: 'h-16 md:h-24', w: 'w-16 md:w-24', text: 'text-3xl md:text-4xl', tagline: 'text-xs md:text-sm', gap: 'gap-4 md:gap-5' },
  };

  const s = sizeClasses[size];

  return (
    <div className={`flex flex-col ${className}`}>
      <div className={`flex items-center ${s.gap}`}>
        {/* Image Logo Container */}
        <div className={`relative ${s.h} ${s.w} shrink-0 rounded-full overflow-hidden border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)] group`}>
          <img 
            src="https://static.vecteezy.com/system/resources/previews/065/460/254/non_2x/robot-head-with-a-friendly-smile-vector.jpg" 
            alt="SATYQ Logo" 
            className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
          />
          {/* Optional Overlay/Glow effect */}
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-full"></div>
        </div>

        {/* Typography */}
        {mode === 'full' && (
          <div className="flex flex-col justify-center">
            <h1 className={`${s.text} font-sans tracking-wide leading-none text-slate-100`}>
              <span className="font-extrabold tracking-wider">SATYQ</span>
              <span className="font-light text-cyan-400 ml-1.5 opacity-90 tracking-widest">CORE</span>
            </h1>
          </div>
        )}
      </div>
      
      {/* Tagline */}
      {showTagline && mode === 'full' && (
        <div className={`mt-2 ${s.tagline} font-mono text-cyan-500/60 uppercase tracking-[0.2em] flex items-center gap-2 whitespace-nowrap`}>
            <span className="w-1 h-1 bg-amber-500 rounded-full shrink-0"></span>
            INTELLIGENT QUALITY. ABSOLUTE TRUTH.
        </div>
      )}
    </div>
  );
};
