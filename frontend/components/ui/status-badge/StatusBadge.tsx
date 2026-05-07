import { RequestStatus } from "@/types";
import { getStatusColor, getStatusDot } from "@/lib/utils";

interface StatusBadgeProps {
  status: RequestStatus;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(status)}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
