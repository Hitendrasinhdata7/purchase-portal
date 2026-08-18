interface BadgeProps {
  status: string;
}

const MAP: Record<string, string> = {
  PENDING: "badge-pending",
  PARTIAL: "badge-partial",
  COLLECTED: "badge-collected",
  DELIVERED: "badge-delivered",
  ACTIVE: "badge-active",
  INACTIVE: "badge-inactive",
};

const DOT: Record<string, string> = {
  PENDING: "●",
  PARTIAL: "◐",
  COLLECTED: "●",
  DELIVERED: "✓",
  ACTIVE: "●",
  INACTIVE: "●",
};

export default function Badge({ status }: BadgeProps) {
  const cls = MAP[status] || "bg-slate-100 text-slate-600";
  return (
    <span className={`badge ${cls}`}>
      <span>{DOT[status] || "●"}</span>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
