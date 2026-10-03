"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NativeDeleteProps {
  /**
   * Callback when delete button is first clicked (shows confirmation)
   */
  onConfirm?: () => void;
  /**
   * Callback when delete is confirmed
   */
  onDelete: () => void;
  /**
   * Text to show on the delete button
   * Default: "Delete"
   */
  buttonText?: string;
  /**
   * Text to show on the confirm button
   * Default: "Confirm"
   */
  confirmText?: string;
  /**
   * Size variant
   * Default: "sm"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Show icon in button
   * Default: true
   */
  showIcon?: boolean;
  /**
   * Additional class names for the container
   */
  className?: string;
  /**
   * Disable the button
   */
  disabled?: boolean;
}

const sizeClasses = {
  sm: "h-8 text-xs px-3",
  md: "h-9 text-xs sm:text-sm px-3.5",
  lg: "h-11 text-sm sm:text-base px-5",
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 18,
};

const cancelBtnSizes = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

export function NativeDelete({
  onConfirm,
  onDelete,
  buttonText = "Delete",
  confirmText = "Confirm",
  size = "sm",
  showIcon = true,
  className,
  disabled = false,
}: NativeDeleteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-collapse if user clicks outside
  useEffect(() => {
    if (!isExpanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsExpanded(true);
      onConfirm?.();
    }
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete();
    setIsExpanded(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(false);
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative inline-flex items-center gap-1.5", className)}
    >
      {/* Main Delete / Confirm Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={isExpanded ? handleConfirm : handleDeleteClick}
        aria-label={isExpanded ? confirmText : buttonText}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-semibold text-white select-none",
          "transition-all duration-200 ease-out active:scale-95 shadow-sm",
          sizeClasses[size],
          isExpanded
            ? "bg-[#b91c1c] hover:bg-[#991b1b] ring-2 ring-[#ef4444]/40"
            : "bg-[#E10600] hover:bg-[#c30500]",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        <span
          className={cn(
            "inline-flex items-center gap-1.5 transition-transform duration-200 ease-out",
            isExpanded ? "scale-105" : "scale-100"
          )}
        >
          {showIcon && (
            <span className="shrink-0 transition-transform duration-200">
              {isExpanded ? (
                <Check size={iconSizes[size]} className="animate-in fade-in zoom-in-75 duration-150" />
              ) : (
                <Trash2 size={iconSizes[size]} className="animate-in fade-in zoom-in-75 duration-150" />
              )}
            </span>
          )}
          <span className="font-medium tracking-wide">
            {isExpanded ? confirmText : buttonText}
          </span>
        </span>
      </button>

      {/* Cancel Button (Smooth Slide & Fade in 0ms delay) */}
      <button
        type="button"
        tabIndex={isExpanded ? 0 : -1}
        onClick={handleCancel}
        aria-label="Cancel delete"
        className={cn(
          "inline-flex items-center justify-center rounded-md border border-line bg-raised hover:bg-white/15 text-muted hover:text-white",
          "transition-all duration-200 ease-out active:scale-90",
          cancelBtnSizes[size],
          isExpanded
            ? "opacity-100 translate-x-0 pointer-events-auto scale-100"
            : "opacity-0 -translate-x-2 pointer-events-none scale-75 w-0 p-0 border-0 overflow-hidden"
        )}
      >
        <X size={iconSizes[size]} />
      </button>
    </div>
  );
}

export default NativeDelete;
