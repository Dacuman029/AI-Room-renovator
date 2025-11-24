import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'black';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  fullWidth = false, 
  loading = false,
  className = '',
  disabled,
  icon,
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center font-semibold tracking-wide transition-all duration-300 active:scale-[0.96] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed select-none overflow-hidden";
  
  const sizes = {
    sm: "h-9 px-4 text-xs rounded-lg gap-2",
    md: "h-12 px-6 text-sm rounded-xl gap-2",
    lg: "h-14 px-8 text-base rounded-2xl gap-3"
  };

  const variants = {
    primary: "bg-gradient-to-br from-[#6e293c] to-[#8c354e] text-white shadow-lg shadow-[#6e293c]/25 hover:shadow-xl hover:shadow-[#6e293c]/30 hover:-translate-y-0.5 border border-white/10",
    secondary: "bg-[#f1eae4] text-[#27474e] hover:bg-[#eaddd5] border border-transparent hover:shadow-md",
    outline: "bg-transparent border-2 border-[#27474e]/30 text-[#27474e] hover:bg-[#27474e]/5",
    ghost: "bg-transparent text-[#6e293c] hover:bg-[#6e293c]/10",
    glass: "bg-white/80 backdrop-blur-md border border-white/40 text-[#27474e] shadow-sm hover:bg-white/90",
    black: "bg-[#27474e] text-white shadow-lg shadow-[#27474e]/20 hover:shadow-xl hover:-translate-y-0.5 border border-white/10"
  };

  return (
    <button 
      className={`
        ${baseStyles} 
        ${sizes[size]} 
        ${variants[variant]} 
        ${fullWidth ? 'w-full' : ''} 
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <Loader2 size={size === 'sm' ? 14 : 20} className="animate-spin" />
        </div>
      )}

      {/* Content */}
      <span className={`flex items-center gap-[inherit] ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {icon && <span className="flex-shrink-0">{icon}</span>}
        {children}
      </span>
    </button>
  );
};