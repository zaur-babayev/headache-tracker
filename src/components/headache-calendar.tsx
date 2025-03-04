import { useState } from "react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MEDICATION_NAMES } from "@/lib/constants";

type Medication = {
  id: string;
  name: string;
  dosage?: string;
};

type HeadacheEntry = {
  id: string;
  date: string;
  severity: number;
  notes?: string;
  triggers: string[];
  medications: string[];
  createdAt: string;
  updatedAt: string;
};

interface HeadacheCalendarProps {
  entries: HeadacheEntry[];
}

export function HeadacheCalendar({ entries }: HeadacheCalendarProps) {
  const router = useRouter();
  const [selectedEntry, setSelectedEntry] = useState<HeadacheEntry | null>(null);

  // Group entries by date
  const entriesByDate = entries.reduce((acc, entry) => {
    const date = entry.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, HeadacheEntry[]>);

  // Generate calendar days
  const today = new Date();
  const daysInMonth = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    today.getFullYear(),
    today.getMonth(),
    1
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
    const dateStr = format(date, "yyyy-MM-dd");
    return {
      date,
      dateStr,
      entries: entriesByDate[dateStr] || [],
    };
  });

  // Add empty cells for days before the first day of the month
  const emptyCells = Array(firstDayOfMonth).fill(null);

  const handleDayClick = (entry: HeadacheEntry) => {
    router.push(`/entry/edit/${entry.id}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-7 gap-1">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-2 text-center font-semibold text-gray-600"
          >
            {day}
          </div>
        ))}

        {emptyCells.map((_, i) => (
          <div
            key={`empty-${i}`}
            className="aspect-square p-1 bg-gray-50 rounded-lg"
          />
        ))}

        {days.map(({ date, entries }) => {
          const isToday = format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");
          
          return (
            <div
              key={date.toString()}
              className={cn(
                "aspect-square p-1 rounded-lg transition-colors",
                isToday && "bg-blue-50 border border-blue-200",
                !isToday && "bg-gray-50"
              )}
            >
              <div className="h-full flex flex-col">
                <div className="text-right text-sm p-1">
                  {format(date, "d")}
                </div>
                <div className="flex-1 flex flex-col gap-1 overflow-auto">
                  {entries.map((entry) => (
                    <Button
                      key={entry.id}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "p-1 text-xs rounded w-full text-left flex items-center gap-1",
                        "hover:bg-gray-100"
                      )}
                      onClick={() => handleDayClick(entry)}
                    >
                      <Badge
                        variant="outline"
                        className={cn(
                          "px-1 py-px text-[10px] leading-none",
                          entry.severity >= 7 && "border-red-500 bg-red-50 text-red-700",
                          entry.severity >= 4 && entry.severity < 7 && "border-yellow-500 bg-yellow-50 text-yellow-700",
                          entry.severity < 4 && "border-green-500 bg-green-50 text-green-700"
                        )}
                      >
                        {entry.severity}
                      </Badge>
                      <span className="truncate flex-1">{entry.notes}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
