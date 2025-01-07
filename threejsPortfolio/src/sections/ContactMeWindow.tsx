import React from 'react'

type Props = {}

const ContactMeWindow = (props: Props) => {
  return (
    <svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
  
  <rect x="50" y="20" width="1100" height="760" rx="3" fill="rgba(216, 181, 192, 0.15)" />
  
  
  <rect x="50" y="20" width="1100" height="40" rx="3" fill="rgba(216, 181, 192, 0.25)" />
  
  
  <text x="70" y="45" fill="rgba(255, 235, 238, 0.8)" font-family="Arial" font-size="16">Contact Me</text>
  
  
  <g transform="translate(1080, 20)">
    
    <rect x="0" y="0" width="70" height="40" fill="rgba(216, 181, 192, 0.25)" />
    <path d="M30 15 L50 27 M30 27 L50 15" stroke="rgba(255, 235, 238, 0.8)" stroke-width="1.5" />
    
    
    <rect x="-35" y="0" width="35" height="40" fill="rgba(216, 181, 192, 0.25)" />
    <rect x="-25" y="15" width="15" height="10" stroke="rgba(255, 235, 238, 0.8)" fill="none" stroke-width="1.5" />
    
    
    <rect x="-70" y="0" width="35" height="40" fill="rgba(216, 181, 192, 0.25)" />
    <line x1="-60" y1="25" x2="-45" y2="25" stroke="rgba(255, 235, 238, 0.8)" stroke-width="1.5" />
  </g>
  
  
  <rect x="50" y="60" width="1100" height="720" fill="rgba(216, 181, 192, 0.1)" />
</svg>
  )
}

export default ContactMeWindow