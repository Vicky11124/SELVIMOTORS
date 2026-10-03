'use client';

import React, { type ReactNode, type MouseEventHandler, type CSSProperties } from 'react';
import Link from 'next/link';
import './SpecularButton.css';

export interface SpecularButtonProps {
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'red' | 'dark' | 'green' | 'gold' | 'outline' | 'custom' | 'white';
  radius?: number;
  tint?: string;
  tintOpacity?: number;
  blur?: number;
  textColor?: string;
  lineColor?: string;
  baseColor?: string;
  thickness?: number;
  duration?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  href?: string;
  target?: string;
  rel?: string;
  fullWidth?: boolean;
}

export default function SpecularButton({
  children = 'Get Started',
  size = 'md',
  variant = 'red',
  radius = 9999,
  tint,
  tintOpacity,
  blur = 0,
  textColor,
  lineColor,
  baseColor,
  thickness = 1.5,
  duration = '3.5s',
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  href,
  target,
  rel,
  fullWidth = false,
}: SpecularButtonProps) {
  // Variant defaults
  let finalTint = tint ?? '#E10600';
  let finalTintOpacity = tintOpacity ?? 0.95;
  let finalTextColor = textColor ?? '#ffffff';
  let finalLineColor = lineColor ?? '#34d399';
  let finalBaseColor = baseColor ?? finalTint;

  if (variant === 'red') {
    finalTint = tint ?? '#E10600';
    finalTintOpacity = tintOpacity ?? 0.95;
    finalTextColor = textColor ?? '#ffffff';
    finalLineColor = lineColor ?? '#34d399';
    finalBaseColor = baseColor ?? finalTint;
  } else if (variant === 'dark' || variant === 'outline') {
    finalTint = tint ?? '#141418';
    finalTintOpacity = tintOpacity ?? 0.92;
    finalTextColor = textColor ?? '#ffffff';
    finalLineColor = lineColor ?? '#34d399';
    finalBaseColor = baseColor ?? finalTint;
  } else if (variant === 'gold') {
    finalTint = tint ?? '#c88e3e';
    finalTintOpacity = tintOpacity ?? 0.95;
    finalTextColor = textColor ?? '#0f2619';
    finalLineColor = lineColor ?? '#34d399';
    finalBaseColor = baseColor ?? finalTint;
  } else if (variant === 'green') {
    finalTint = tint ?? '#064e3b';
    finalTintOpacity = tintOpacity ?? 0.95;
    finalTextColor = textColor ?? '#ffffff';
    finalLineColor = lineColor ?? '#34d399';
    finalBaseColor = baseColor ?? finalTint;
  } else if (variant === 'white') {
    finalTint = tint ?? '#ffffff';
    finalTintOpacity = tintOpacity ?? 1;
    finalTextColor = textColor ?? '#111816';
    finalLineColor = lineColor ?? '#34d399';
    finalBaseColor = baseColor ?? finalTint;
  }

  const customStyles: CSSProperties = {
    '--sb-radius': `${radius}px`,
    '--sb-tint': finalTint,
    '--sb-tint-opacity': finalTintOpacity,
    '--sb-blur': `${blur}px`,
    '--sb-text-color': finalTextColor,
    '--sb-line-color': finalLineColor,
    '--sb-base-color': finalBaseColor,
    '--sb-thickness': `${thickness}px`,
    '--sb-duration': duration,
  } as CSSProperties;

  const buttonClasses = `specular-button specular-button--${size} ${fullWidth ? 'w-full' : ''} ${className}`;

  const innerContent = (
    <>
      <div className="specular-button__beam" aria-hidden="true" />
      <span className="specular-button__inner">{children}</span>
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        className={buttonClasses}
        style={customStyles}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={buttonClasses}
      style={customStyles}
    >
      {innerContent}
    </button>
  );
}

export { SpecularButton };
