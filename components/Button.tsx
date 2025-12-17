import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', className = '', ...props }) => {
  const baseStyles = "font-bold border-2 border-black rounded-lg transition-all shadow-hard active:shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  // All variants now use text-black for better contrast in the cartoon style
  const variants = {
    primary: "bg-cartoon-yellow text-black hover:bg-yellow-300",
    secondary: "bg-white text-black hover:bg-gray-50",
    danger: "bg-cartoon-red text-black hover:bg-red-400",
    success: "bg-cartoon-green text-black hover:bg-green-400",
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;