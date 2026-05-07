import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RequestStatus, RequestType } from "@/types";
import type { ReactNode } from "react";
import { BsCalendar2Heart } from "react-icons/bs";
import { BiHotel } from "react-icons/bi";
import { IoHome, IoTimeSharp } from "react-icons/io5";
import { RiChatDeleteLine } from "react-icons/ri";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStatusColor(status: RequestStatus) {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-700 border-green-200";
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "rejected":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "";
  }
}

export function getStatusDot(status: RequestStatus) {
  switch (status) {
    case "approved":
      return "bg-green-500";
    case "pending":
      return "bg-yellow-500";
    case "rejected":
      return "bg-red-500";
    default:
      return "";
  }
}
export function getRequestTypeIcon(type: RequestType): ReactNode {
  const icons: Record<string, ReactNode> = {
    vacation: <BsCalendar2Heart />,
    "sick-leave": <BiHotel />,
    "remote-work": <IoHome />,
    overtime: <IoTimeSharp />,
    "advance-salary": <RiChatDeleteLine />,
    training: "📚",
    equipment: "💻",
    certificate: "📄",
  };

  return icons[type] ?? "📋";
}
export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}