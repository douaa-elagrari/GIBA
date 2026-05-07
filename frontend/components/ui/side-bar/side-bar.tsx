"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Home,
  PlusCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const employeeNav = [
  { label: "Home", icon: Home, href: "/employee/dashboard" },
  { label: "My Requests", icon: FileText, href: "/employee/requests" },
  { label: "New Request", icon: PlusCircle, href: "/employee/new-request" },
];

const managerNav = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/hr/dashboard" },
  { label: "Requests", icon: FileText, href: "/hr/requests" },
  { label: "Employees", icon: Users, href: "/hr/employees" },
  { label: "My Requests", icon: FileText, href: "/hr/my-requests" },
  { label: "New Request", icon: PlusCircle, href: "/hr/new-request" },
];

export default function Sidebar({
  initialRole,
}: {
  initialRole?: "employee" | "manager";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    document.body.setAttribute("data-sidebar", collapsed ? "collapsed" : "expanded");
    return () => {
      document.body.removeAttribute("data-sidebar");
    };
  }, [collapsed]);

  const role = initialRole || "employee";
  const navItems = role === "manager" ? managerNav : employeeNav;
  const settingsHref =
    role === "manager" ? "/hr/hr-settings" : "/employee/profile";

  function handleLogout() {
    logout();
    router.push("/auth/login");
  }

  return (
    <>
      {/* Sidebar */}
      <aside
        className="hr-sidebar"
        data-collapsed={collapsed ? "true" : "false"}
        style={{
          width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
        }}
      >
        {/* Logo */}
        <div className="hr-sidebar__logo">
          <div className="hr-sidebar__logo-icon">
            <img
              src="/logo GIBA.png"
              alt="GIBA"
              className="hr-sidebar__logo-image"
            />
          </div>
          {!collapsed && (
            <div className="hr-sidebar__logo-text">
              <span className="hr-sidebar__logo-title">GIBA HR</span>
              <span className="hr-sidebar__logo-sub">Platform</span>
            </div>
          )}
        </div>

        {/* Floating Toggle Button */}
        <button
          className="hr-sidebar__float-toggle"
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Nav */}
        <nav className="hr-sidebar__nav">
          {navItems.map(({ label, icon: Icon, href }) => (
            <Link
              key={href + label}
              href={href}
              className={`hr-nav-item ${pathname === href ? "active" : ""} ${collapsed ? "collapsed" : ""}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={20} className="hr-nav-item__icon" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer: Settings */}
        <div className="hr-sidebar__footer">
          <Link
            href={settingsHref}
            className={`hr-nav-item ${pathname === settingsHref ? "active" : ""} ${collapsed ? "collapsed" : ""}`}
            title={collapsed ? "Settings & Profile" : undefined}
          >
            <Settings size={20} className="hr-nav-item__icon" />
            {!collapsed && <span>Settings &amp; Profile</span>}
          </Link>
        </div>
      </aside>

      {/* Spacer to push main content */}
      <div
        className="hr-sidebar__spacer"
        style={{
          width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
          flexShrink: 0,
          transition: "width var(--duration-slow) var(--ease-out)",
        }}
      />
    </>
  );
}
