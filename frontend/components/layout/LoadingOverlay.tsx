"use client";

import React from "react";

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export default function LoadingOverlay({
  open,
  message = "Processing...",
}: LoadingOverlayProps) {
  if (!open) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-box">
        <div className="loading-spinner">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="16" stroke="#ede9fe" strokeWidth="3.5" />
            <circle
              cx="20" cy="20" r="16"
              stroke="url(#lg)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray="64 38"
            />
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6d5dfc" />
                <stop offset="100%" stopColor="#a89ff5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
}
