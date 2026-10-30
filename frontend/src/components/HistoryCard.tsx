import { useState } from "react";
import { AtSign, Camera, Clock3, MapPin, Phone, Sparkles } from "lucide-react";
import type { Change } from "../types";
const icons: Record<string, typeof Phone> = {
  mobile: Phone,
  email: AtSign,
  address: MapPin,
  skills: Sparkles,
  photo: Camera,
};
function display(value: unknown) {
  if (value === null || value === undefined || value === "") return "Empty";
  return Array.isArray(value) ? value.join(", ") : String(value);
}
export function HistoryCard({
  items,
  retentionDays,
}: {
  items: Change[];
  retentionDays: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, 4);
  return (
    <section className="panel history-panel">
      <div className="panel-head">
        <div>
          <div className="eyebrow">YOUR ACTIVITY</div>
          <h3>Recent changes</h3>
          <p>Your profile updates from the last {retentionDays} days.</p>
        </div>
        <span className="history-clock">
          <Clock3 size={16} />
        </span>
      </div>
      {items.length === 0 ? (
        <div className="empty-history">
          <div className="empty-icon">
            <Clock3 size={18} />
          </div>
          <b>All caught up</b>
          <p>Your profile changes will show up here.</p>
        </div>
      ) : (
        <>
          <div className="timeline">
            {visible.map((item, i) => {
              const Icon = icons[item.field] || Sparkles;
              return (
                <div className="timeline-item" key={item.id || i}>
                  <div className="timeline-icon">
                    <Icon size={15} />
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-title">
                      <b>{item.label} updated</b>
                      <time>
                        {new Date(item.changedAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                    <div className="change-detail">
                      <span>{display(item.before)}</span>
                      <i>→</i>
                      <b>{display(item.after)}</b>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {items.length > 4 && (
            <button className="view-all" onClick={() => setExpanded(!expanded)}>
              {expanded ? "Show less" : "View all activity"}{" "}
              <span>{expanded ? "↑" : "→"}</span>
            </button>
          )}
        </>
      )}
    </section>
  );
}
