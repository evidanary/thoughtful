import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { todayString } from "../api/campaigns";

// --- Date helpers. Follow-up dates are plain local days stored as YYYY-MM-DD,
// so everything here works on calendar days and never on instants. ---

const pad = (n) => String(n).padStart(2, "0");
const toString = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (value) => {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (value, days) => {
  const d = parse(value);
  d.setDate(d.getDate() + days);
  return toString(d);
};

// Jan 31 + 1 month lands on Feb 28/29, not Mar 3
export const addMonths = (value, months) => {
  const d = parse(value);
  const target = new Date(d.getFullYear(), d.getMonth() + months, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(d.getDate(), lastDay));
  return toString(target);
};

export const formatDay = (value) => {
  if (!value) return null;
  const d = parse(value);
  const sameYear = d.getFullYear() === new Date().getFullYear();
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
};

// overdue / today / future, or null when no follow-up is scheduled
export const urgencyOf = (nextActionAt) => {
  if (!nextActionAt) return null;
  const today = todayString();
  if (nextActionAt < today) return "overdue";
  if (nextActionAt === today) return "today";
  return "future";
};

export const URGENCY = {
  overdue: { border: "#D32F2F", bg: "#FDECEC", fg: "#B71C1C" },
  today: { border: "#FF8C00", bg: "#FFF3E0", fg: "#C25E00" },
  future: { border: "#B0B0B0", bg: "#F1F1F4", fg: "#666" },
};

export const dueLabel = (nextActionAt) => {
  const urgency = urgencyOf(nextActionAt);
  if (urgency === "today") return "Due today";
  if (urgency === "overdue") return `Overdue · ${formatDay(nextActionAt)}`;
  if (urgency === "future") return `Due ${formatDay(nextActionAt)}`;
  return null;
};

// Snoozes always count from today, so an overdue card jumps clear of today
export const SNOOZES = [
  { label: "+1d", apply: (t) => addDays(t, 1) },
  { label: "+7d", apply: (t) => addDays(t, 7) },
  { label: "+30d", apply: (t) => addDays(t, 30) },
  { label: "+1m", apply: (t) => addMonths(t, 1) },
  { label: "+2m", apply: (t) => addMonths(t, 2) },
  { label: "+3m", apply: (t) => addMonths(t, 3) },
];

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS_SHOWN = 3;

// Popover anchored to `anchorRect` (a DOMRect). Shows three months side by
// side plus quick snooze buttons. `onChange` receives YYYY-MM-DD or null.
const NextActionPicker = ({ value, anchorRect, onChange, onClose }) => {
  const ref = useRef(null);
  const today = todayString();
  const start = parse(value || today);
  const [firstMonth, setFirstMonth] = useState(
    new Date(start.getFullYear(), start.getMonth(), 1)
  );
  const [position, setPosition] = useState({ top: anchorRect.bottom + 6, left: anchorRect.left });

  // Keep the popover on screen: flip above the anchor or slide left if needed
  useLayoutEffect(() => {
    if (!ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    let left = Math.min(anchorRect.left, window.innerWidth - width - 12);
    let top = anchorRect.bottom + 6;
    if (top + height > window.innerHeight - 12)
      top = Math.max(12, anchorRect.top - height - 6);
    setPosition({ top, left: Math.max(12, left) });
  }, [anchorRect]);

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const pick = (next) => {
    onChange(next);
    onClose();
  };

  const shiftMonths = (delta) =>
    setFirstMonth(
      (m) => new Date(m.getFullYear(), m.getMonth() + delta, 1)
    );

  const months = Array.from({ length: MONTHS_SHOWN }, (_, i) =>
    new Date(firstMonth.getFullYear(), firstMonth.getMonth() + i, 1)
  );

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: position.top,
        left: position.left,
        zIndex: 3000,
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: 10,
        boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
        padding: 14,
        maxWidth: "calc(100vw - 24px)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: "#4B0082" }}>
          Next action
          {value && (
            <span style={{ fontWeight: 400, color: "#777" }}>
              {" "}· {formatDay(value)}
            </span>
          )}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={() => shiftMonths(-1)} style={navButton} title="Previous month">
            ‹
          </button>
          <button
            onClick={() => setFirstMonth(new Date(parse(today).getFullYear(), parse(today).getMonth(), 1))}
            style={{ ...navButton, width: "auto", padding: "0 8px", fontSize: 11 }}
          >
            Today
          </button>
          <button onClick={() => shiftMonths(1)} style={navButton} title="Next month">
            ›
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 18, overflowX: "auto" }}>
        {months.map((month) => (
          <MonthGrid
            key={toString(month)}
            month={month}
            value={value}
            today={today}
            onPick={pick}
          />
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 6,
          marginTop: 12,
          paddingTop: 10,
          borderTop: "1px solid #eee",
        }}
      >
        <span style={{ fontSize: 11, color: "#888", marginRight: 2 }}>
          Snooze from today
        </span>
        {SNOOZES.map((s, i) => (
          <button
            key={s.label}
            onClick={() => pick(s.apply(today))}
            style={{ ...snoozeButton, marginLeft: i === 3 ? 8 : 0 }}
          >
            {s.label}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        {value && (
          <button
            onClick={() => pick(null)}
            style={{ ...snoozeButton, color: "#c00", borderColor: "#f0c4c4" }}
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

const MonthGrid = ({ month, value, today, onPick }) => {
  const year = month.getFullYear();
  const m = month.getMonth();
  const daysInMonth = new Date(year, m + 1, 0).getDate();
  const cells = [
    ...Array(month.getDay()).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toString(new Date(year, m, i + 1))),
  ];

  return (
    <div style={{ width: 196, flexShrink: 0 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#333",
          textAlign: "center",
          marginBottom: 6,
        }}
      >
        {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 28px)", gap: 0 }}>
        {WEEKDAYS.map((d, i) => (
          <div
            key={i}
            style={{ fontSize: 10, color: "#aaa", textAlign: "center", height: 20 }}
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`blank-${i}`} />;
          const selected = day === value;
          const isToday = day === today;
          const past = day < today;
          return (
            <button
              key={day}
              onClick={() => onPick(day)}
              style={{
                width: 26,
                height: 26,
                margin: 1,
                borderRadius: "50%",
                border: isToday && !selected ? "1px solid #4B0082" : "1px solid transparent",
                background: selected ? "#4B0082" : "transparent",
                color: selected ? "#fff" : past ? "#bbb" : "#333",
                fontSize: 11,
                fontWeight: selected || isToday ? 700 : 400,
                cursor: "pointer",
                padding: 0,
              }}
              onMouseOver={(e) => {
                if (!selected) e.currentTarget.style.background = "#f3eaff";
              }}
              onMouseOut={(e) => {
                if (!selected) e.currentTarget.style.background = "transparent";
              }}
            >
              {Number(day.slice(8))}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const navButton = {
  width: 26,
  height: 24,
  border: "1px solid #e0e0e0",
  background: "#fff",
  borderRadius: 4,
  color: "#4B0082",
  cursor: "pointer",
  fontSize: 14,
  lineHeight: 1,
};

const snoozeButton = {
  border: "1px solid #d9c9ec",
  background: "#fff",
  color: "#4B0082",
  borderRadius: 12,
  padding: "3px 10px",
  fontSize: 11,
  fontWeight: 600,
  cursor: "pointer",
};

export default NextActionPicker;
