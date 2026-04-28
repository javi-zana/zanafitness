import React from 'react';

export function Button({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  type = 'button'
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  type?: 'button' | 'submit';
}) {
  const baseStyles = "w-full py-3 px-6 rounded-md font-medium transition-all duration-300 text-sm tracking-widest uppercase";
  const variants = {
    primary: "bg-babyblue-500 text-navy-900 hover:bg-babyblue-400",
    secondary: "bg-navy-700 text-white hover:bg-navy-800",
    outline: "border border-babyblue-500 text-babyblue-500 hover:bg-babyblue-500 hover:text-navy-900"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
