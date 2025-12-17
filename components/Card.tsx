import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', color = 'bg-white', title }) => {
  return (
    <div className={`border-2 border-black rounded-xl p-4 shadow-hard ${color} ${className}`}>
      {title && <h3 className="text-xl font-bold mb-3 border-b-2 border-black pb-1">{title}</h3>}
      {children}
    </div>
  );
};

export default Card;