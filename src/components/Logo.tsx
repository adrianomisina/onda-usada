import React from 'react';

export default function Logo({ className = "h-8" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 100 100" className="h-full w-auto text-red-600 fill-current" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,100 Q30,40 90,10 C70,40 50,70 100,100 Z" />
        <path d="M20,100 Q40,60 80,40 C60,60 50,80 90,100 Z" opacity="0.7" />
      </svg>
      <span className="font-black italic tracking-tighter text-2xl uppercase text-white">
        Onda<span className="text-red-600">Usada</span>
      </span>
    </div>
  );
}
