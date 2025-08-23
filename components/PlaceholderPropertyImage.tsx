import React from 'react';

// Create a simple placeholder image component
const PlaceholderPropertyImage: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
    <svg width="100%" height="100%" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#F3F4F6"/>
      <path d="M160 130H240V190H160V130Z" fill="#D1D5DB"/>
      <path d="M190 110L210 110L240 130H160L190 110Z" fill="#9CA3AF"/>
      <rect x="175" y="145" width="20" height="20" fill="#F3F4F6"/>
      <rect x="205" y="145" width="20" height="20" fill="#F3F4F6"/>
      <rect x="185" y="175" width="30" height="15" fill="#9CA3AF"/>
      <text x="200" y="220" fontFamily="Arial, sans-serif" fontSize="14" textAnchor="middle" fill="#6B7280">Property Image</text>
    </svg>
  </div>
);

export default PlaceholderPropertyImage;