
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, CheckCircle2, Map, Terminal, Activity, Shield, LayoutDashboard, MousePointer2 } from 'lucide-react';

interface TourGuideProps {
  onComplete: () => void;
}

interface TourStep {
  title: string;
  content: string;
  position: string; // Tailwind classes for positioning
  align: 'left' | 'right' | 'center';
  arrow?: string;
}

export const TourGuide: React.FC<TourGuideProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const STEPS: TourStep[] = [
    {
      title: 'SYSTEM ORIENTATION',
      content: 'Welcome to SATYQ CORE. Would you like to initiate the calibration sequence to familiarize yourself with the operational interface?',
      position: 'inset-0 flex items-center justify-center',
      align: 'center'
    },
    {
      title: 'NEURAL MODULES',
      content: 'Select specialized AI modes here. "Standard" for logging, "Deep Reason" for logic, or "Valuation" for pricing assets.',
      position: 'top-20 left-4 md:left-72',
      align: 'left',
      arrow: 'left'
    },
    {
      title: 'MISSION LOG',
      content: 'This central stream displays AI outputs, generated reports, and real-time visualization charts.',
      position: 'top-1/3 left-4 md:left-1/3 md:w-96',
      align: 'center'
    },
    {
      title: 'UTILITIES',
      content: 'Access "Report Templates" for standardized inputs and the "Data Visualizer" to convert raw text into charts.',
      position: 'bottom-32 left-4 md:left-72',
      align: 'left',
      arrow: 'left'
    },
    {
      title: 'COMMAND CONSOLE',
      content: 'Enter commands here. You can also drag-and-drop images for "Visual Recon" analysis.',
      position: 'bottom-24 left-4 right-4 md:left-auto md:right-auto md:bottom-32 md:left-1/2 md:-translate-x-1/2',
      align: 'center',
      arrow: 'down'
    },
    {
      title: 'CONTEXT AWARENESS',
      content: 'The system tracks your active mode (e.g., Target Market in Valuation) here. Always verify before executing.',
      position: 'bottom-48 right-4 md:bottom-32 md:right-20',
      align: 'right',
      arrow: 'down'
    }
  ];

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentStep = STEPS[step];

  // If mobile, force center for all steps except the first one might need tweaking, 
  // but generally centering is safest on mobile to avoid overflow.
  const containerClass = isMobile && step > 0 
    ? 'fixed inset-0 flex items-center justify-center bg-black/60 z-[100] p-4' 
    : step === 0 
        ? 'fixed inset-0 flex items-center justify-center bg-black/80 z-[100] backdrop-blur-sm p-4'
        : `fixed ${currentStep.position} z-[100] transition-all duration-500 ease-in-out`;

  // Render the Start Screen differently
  if (step === 0) {
      return (
        <div className={containerClass}>
            <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 rounded-lg shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="h-1 bg-emerald-500 w-full animate-pulse"></div>
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-500/50">
                        <Shield className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2 tracking-wide font-mono">SYSTEM ONLINE</h2>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8">
                        {currentStep.content}
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={handleSkip}
                            className="px-6 py-2.5 rounded border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-bold uppercase tracking-wider"
                        >
                            Skip Orientation
                        </button>
                        <button 
                            onClick={handleNext}
                            className="px-6 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                        >
                            Start Tour <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="bg-black/50 p-2 text-center border-t border-slate-800">
                    <span className="text-[10px] text-slate-600 font-mono">SATYQ CORE v4.2 // INITIALIZATION</span>
                </div>
            </div>
        </div>
      );
  }

  return (
    <>
      {/* Backdrop for focus */}
      <div className="fixed inset-0 bg-black/20 z-[90] pointer-events-none transition-opacity duration-500" />
      
      <div className={`${containerClass} pointer-events-auto`}>
         <div className="relative w-80 md:w-96 bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-2xl p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            
            {/* Decorative Corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-500 rounded-tl-md"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-500 rounded-tr-md"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-500 rounded-bl-md"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-500 rounded-br-md"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-bold text-cyan-400 font-mono tracking-widest uppercase">{currentStep.title}</h3>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{step}/{STEPS.length - 1}</span>
            </div>

            {/* Content */}
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {currentStep.content}
            </p>

            {/* Controls */}
            <div className="flex items-center justify-between">
                <button 
                    onClick={handleSkip}
                    className="text-[10px] text-slate-500 hover:text-white uppercase tracking-wider transition-colors"
                >
                    Dismiss
                </button>
                <button 
                    onClick={handleNext}
                    className="px-4 py-2 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/50 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all hover:scale-105"
                >
                    {step === STEPS.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="w-3 h-3" />
                </button>
            </div>
         </div>
      </div>
    </>
  );
};
