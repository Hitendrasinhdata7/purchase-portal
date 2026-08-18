interface KPICardProps {
  label: string;
  value: string | number;
  icon?: string;
  tone?: "primary" | "warning" | "success" | "danger";
}

const TONE_BG: Record<string, string> = {
  primary: "bg-primary-bg text-primary",
  warning: "bg-warning-bg text-warning",
  success: "bg-success-bg text-success",
  danger: "bg-danger-bg text-danger",
};

export default function KPIcard({ label, value, icon = "📦", tone = "primary" }: KPICardProps) {
  return (
    <div className="card flex flex-col gap-2">
      <div className={`w-10 h-10 rounded-md flex items-center justify-center text-lg ${TONE_BG[tone]}`}>
        {icon}
      </div>
      <div className="text-2xl font-extrabold text-slate-900">{value}</div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
    </div>
  );
}
