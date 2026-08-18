interface ChartBoxProps {
  title: string;
  children: React.ReactNode;
}

export default function ChartBox({ title, children }: ChartBoxProps) {
  return (
    <div className="card">
      <h3 className="font-bold text-slate-900 mb-4">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}
