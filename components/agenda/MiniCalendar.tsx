"use client";

import { useState } from "react";
import { MONTHS_BR, WEEKDAYS_BR, toDateKey } from "@/lib/utils";

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

export default function MiniCalendar({
  selectedKey,
  onSelect,
}: {
  selectedKey: string;
  onSelect: (dateKey: string) => void;
}) {
  const selected = new Date(`${selectedKey}T00:00:00.000Z`);
  const [cursor, setCursor] = useState({
    year: selected.getUTCFullYear(),
    month: selected.getUTCMonth(),
  });

  const first = new Date(Date.UTC(cursor.year, cursor.month, 1));
  const firstWeekday = first.getUTCDay();
  const total = daysInMonth(cursor.year, cursor.month);
  const todayKey = toDateKey(new Date());

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  function shiftMonth(delta: number) {
    let m = cursor.month + delta;
    let y = cursor.year;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setCursor({ year: y, month: m });
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">
          {MONTHS_BR[cursor.month]} {cursor.year}
        </span>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
          >
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {WEEKDAYS_BR.map((w) => (
          <span key={w} className="text-gray-400">{w.charAt(0)}</span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e${i}`} />;
          const key = `${cursor.year}-${String(cursor.month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = key === selectedKey;
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`mx-auto flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                isSelected
                  ? "bg-brand-600 text-white"
                  : isToday
                  ? "border border-brand-400 text-brand-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
