import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline" | "glass";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  themeContext?: "classic" | "cinematic"; // For context-aware styling if needed
  href?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = "",
  themeContext = "classic",
  disabled,
  href,
  ...props
}: ButtonProps) {
  // Base classes for all buttons
  const baseClasses =
    "relative inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 ease-out overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed";

  // Size classes
  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 rounded-lg",
    md: "text-sm px-5 py-2.5 rounded-xl",
    lg: "text-base px-8 py-3.5 rounded-2xl",
    icon: "p-2 rounded-xl flex items-center justify-center",
  };

  // Variant classes (Theming adapted for classic Amber and cinematic Purple/Cyan)
  const isCinematic = themeContext === "cinematic";

  const variantClasses = {
    primary: isCinematic
      ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] hover:scale-[1.02] active:scale-95"
      : "bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:scale-[1.02] active:scale-95",
    secondary: isCinematic
      ? "bg-purple-900/40 text-purple-100 border border-purple-500/30 hover:bg-purple-800/60 hover:text-white shadow-lg backdrop-blur-md hover:scale-[1.02] active:scale-95"
      : "bg-neutral-800 text-white border border-neutral-700 hover:bg-neutral-700 hover:text-white shadow-lg hover:scale-[1.02] active:scale-95",
    danger:
      "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500 hover:text-white shadow-lg hover:scale-[1.02] active:scale-95",
    ghost:
      "bg-transparent text-neutral-400 hover:text-white hover:bg-neutral-800/50 active:scale-95",
    outline: isCinematic
      ? "bg-transparent text-cyan-400 border-2 border-cyan-500/50 hover:bg-cyan-500/10 hover:border-cyan-400 active:scale-95"
      : "bg-transparent text-amber-500 border-2 border-amber-500/50 hover:bg-amber-500/10 hover:border-amber-400 active:scale-95",
    glass: isCinematic
      ? "bg-purple-500/10 text-white border border-purple-500/20 backdrop-blur-xl hover:bg-purple-500/20 hover:border-purple-500/40 shadow-xl active:scale-95"
      : "bg-white/5 text-white border border-white/10 backdrop-blur-xl hover:bg-white/10 hover:border-white/20 shadow-xl active:scale-95",
  };

  const finalClassName = `
    ${baseClasses} 
    ${sizeClasses[size]} 
    ${variantClasses[variant]} 
    ${fullWidth ? "w-full" : ""} 
    ${className}
  `.trim().replace(/\s+/g, " ");

  const inner = (
    <>
      {/* Loading overlay / spinner */}
      {isLoading && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-inherit backdrop-blur-[1px]">
          <Loader2 className="w-5 h-5 animate-spin" />
        </span>
      )}
      
      {/* Button Content */}
      <span className={`flex items-center gap-2 ${isLoading ? "opacity-0" : "opacity-100"}`}>
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={finalClassName} {...(props as any)}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      className={finalClassName}
      disabled={disabled || isLoading}
      {...props}
    >
      {inner}
    </button>
  );
}
