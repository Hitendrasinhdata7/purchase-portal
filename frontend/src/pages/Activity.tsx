import { useState } from "react";
import { useList } from "../hooks/useApi";
import PageHeader from "../components/PageHeader";
import FilterBar from "../components/FilterBar";
import type { ActivityLog } from "../types";

const ACTIONS = ["CREATE", "UPDATE", "DELETE", "COLLECT", "DELIVER", "UNCOLLECT", "ADD_ITEM", "UPDATE_ITEM", "REMOVE_ITEM"];

export default function Activity() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { data: logs, isLoading } = useList<ActivityLog>("activity", "/activity/", filters);

  return (
    <div>
      <PageHeader title="Activity" subtitle="Full audit trail of store actions" />
      <FilterBar
        fields={[
          { key: "action", type: "select", label: "Action", options: ACTIONS.map((a) => ({ value: a, label: a })) },
          { key: "search", type: "search", label: "Search" },
        ]}
        values={filters}
        onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
        onClear={() => setFilters({})}
      />
      {isLoading ? (
        <div className="card text-center text-slate-400">Loading activity...</div>
      ) : (
        <div className="card p-0 divide-y divide-slate-50">
          {(logs || []).map((log) => (
            <div key={log.id} className="flex items-center justify-between px-5 py-3">
              <div className="text-sm">
                <span className="font-semibold text-slate-900">{log.actor_name || "System"}</span>{" "}
                <span className="text-slate-500">{log.action.toLowerCase().replace("_", " ")}</span>{" "}
                <span className="font-medium text-slate-700">{log.target_type}: {log.target_label}</span>
              </div>
              <span className="text-xs text-slate-400 whitespace-nowrap ml-4">{new Date(log.created_at).toLocaleString()}</span>
            </div>
          ))}
          {(logs || []).length === 0 && <div className="px-5 py-10 text-center text-slate-400">No activity recorded.</div>}
        </div>
      )}
    </div>
  );
}
