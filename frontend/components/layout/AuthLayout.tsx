"use client";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      {/* Left Side - Branding */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="14" r="4" fill="white" />
              <circle cx="32" cy="14" r="4" fill="white" />
              <path
                d="M8 28C8 24.13 10.86 21 14 21C17.14 21 20 24.13 20 28"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M28 28C28 24.13 30.86 21 34 21C37.14 21 40 24.13 40 28"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </div>
          <h1 className="auth-title">GIBA HR</h1>
          <p className="auth-subtitle">Platform</p>

          <h2 className="auth-heading">Welcome to GIBA HR Platform</h2>
          <p className="auth-description">
            Streamline your HR processes with our modern, intuitive platform.
            Manage requests, track approvals, and get instant support from our
            AI assistant.
          </p>

          <div className="auth-stats">
            <div className="auth-stat-item">
              <div className="auth-stat-value">500+</div>
              <div className="auth-stat-label">Active Users</div>
            </div>
            <div className="auth-stat-item">
              <div className="auth-stat-value">98%</div>
              <div className="auth-stat-label">Satisfaction Rate</div>
            </div>
          </div>
        </div>
        <div className="auth-footer">
          <p>© 2026 GIBA HR Platform. All rights reserved to Synervia team</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="auth-right">
        <div className="auth-form-container">{children}</div>
      </div>
    </div>
  );
}
