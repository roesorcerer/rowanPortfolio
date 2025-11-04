import React from 'react'

type Props = {}

const ContactMeWindow = (props: Props) => {
  return (
    <svg 
      viewBox="0 0 1200 1100" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Main Window Body */}
      <rect x="30" y="10" width="1140" height="1080" rx="8" fill="rgba(88, 145, 164, 0.15)" stroke="rgba(216, 181, 192, 0.3)" strokeWidth="2" />
      
      {/* Title Bar */}
      <rect x="30" y="10" width="1140" height="50" rx="8" fill="rgba(216, 181, 192, 0.25)" />
      
      {/* Window Title */}
      <text x="60" y="43" fill="rgba(255, 235, 238, 0.9)" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="500">Contact Me</text>
      
      {/* Window Controls */}
      <g transform="translate(1100, 10)">
        {/* Close button */}
        <rect x="0" y="0" width="70" height="50" fill="rgba(216, 181, 192, 0.25)" />
        <path d="M30 20 L50 35 M30 35 L50 20" stroke="rgba(255, 235, 238, 0.8)" strokeWidth="2" strokeLinecap="round" />
        
        {/* Maximize button */}
        <rect x="-40" y="0" width="40" height="50" fill="rgba(216, 181, 192, 0.25)" />
        <rect x="-28" y="20" width="16" height="15" stroke="rgba(255, 235, 238, 0.8)" fill="none" strokeWidth="2" />
        
        {/* Minimize button */}
        <rect x="-80" y="0" width="40" height="50" fill="rgba(216, 181, 192, 0.25)" />
        <line x1="-68" y1="30" x2="-52" y2="30" stroke="rgba(255, 235, 238, 0.8)" strokeWidth="2" strokeLinecap="round" />
      </g>
      
      {/* Content Area */}
      <rect x="30" y="60" width="1140" height="1030" fill="rgba(216, 181, 192, 0.08)" />
    </svg>
  )
}

export default ContactMeWindow