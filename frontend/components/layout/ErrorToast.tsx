"use client";

import React, { useEffect } from "react";

interface ErrorToastProps {
  message: string | null;
  onClose: () => void;
  duration?: number;
}

export default function ErrorToast({
  message,
  onClose,
  duration = 4000,
}: ErrorToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className="toast toast--error">
      <span className="toast__icon">✕</span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Close">✕</button>
    </div>
  );
}
