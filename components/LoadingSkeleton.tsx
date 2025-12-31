
import React, { useState, useEffect } from 'react';

const LoadingSkeleton: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = [
    "Dimming the lights...",
    "Rolling the credits...",
    "Scanning nearby box offices...",
    "Comparing local showtimes...",
    "Negotiating prices...",
    "Projecting final results..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <div className="mt-12 space-y-10 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4 w-full md:w-auto">
          <div className="h-4 w-full md:w-80 bg-slate-900 border border-slate-800 rounded-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent animate-shimmer"></div>
          </div>
          <div className="h-2 w-48 bg-slate-900 border border-slate-800 rounded-lg relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent animate-shimmer delay-100"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 gold-gradient animate-pulse"></div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex justify-center">
            <div className="w-16 h-16 border-2 border-slate-800 border-t-amber-500 rounded-full animate-spin"></div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-cinzel font-bold text-white uppercase tracking-widest transition-all duration-500">
              {messages[messageIndex]}
            </h3>
            <div className="flex justify-center gap-1">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div 
                  key={i} 
                  className={`h-1 rounded-full transition-all duration-500 ${i === messageIndex ? 'w-8 bg-amber-500' : 'w-2 bg-slate-800'}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default LoadingSkeleton;
