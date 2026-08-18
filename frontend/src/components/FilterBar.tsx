export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  key: string;
  type: "select" | "search" | "date";
  label: string;
  options?: FilterOption[];
}

interface FilterBarProps {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear?: () => void;
}

export default function FilterBar({ fields, values, onChange, onClear }: FilterBarProps) {
  return (
    <div className="card mb-4 flex flex-col md:flex-row md:flex-wrap gap-3 md:items-end">
      {fields.map((f) => (
        <div key={f.key} className="flex-1 min-w-[140px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1">{f.label}</label>
          {f.type === "select" && (
            <select
              className="input"
              value={values[f.key] || ""}
              onChange={(e) => onChange(f.key, e.target.value)}
            >
              <option value="">All</option>
              {f.options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )}
          {f.type === "search" && (
            <input
              className="input"
              placeholder={`Search ${f.label.toLowerCase()}...`}
              value={values[f.key] || ""}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          )}
          {f.type === "date" && (
            <input
              type="date"
              className="input"
              value={values[f.key] || ""}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          )}
        </div>
      ))}
      {onClear && (
        <button onClick={onClear} className="btn-secondary whitespace-nowrap">
          Clear filters
        </button>
      )}
    </div>
  );
}
