import React from 'react';

export const Logo = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#1a1a1a" strokeWidth="0.5" />
    <polygon points="40,71 40,28 70,18 55,43" fill="#1a1a1a" />
    <polygon points="40,75 70,75 55,47" fill="#1a1a1a" />
    <text 
      transform="rotate(-90)" 
      x="-75" 
      y="36" 
      fontFamily="system-ui, -apple-system, sans-serif" 
      fontWeight="800" 
      fontSize="6.5" 
      letterSpacing="0.05em"
      fill="#1a1a1a"
    >
      KONCOKU.KOPI
    </text>
  </svg>
);
