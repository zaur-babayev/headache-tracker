"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { HeadacheForm } from "./headache-form";

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

type HeadacheCalendarProps = {
  entries: HeadacheEntry[];
  onEntryUpdated?: () => void;
};

export function HeadacheCalendar({ entries, onEntryUpdated }: HeadacheCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEntry, setSelectedEntry] = useState<HeadacheEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the day of the week for the first day of the month (0 = Sunday, 1 = Monday, etc.)
  const startDay = monthStart.getDay();
  
  // Calculate how many empty cells we need at the beginning
  const emptyCellsAtStart = startDay === 0 ? 6 : startDay - 1; // Adjust for Monday as first day
  
  // Create empty cells for the beginning of the month
  const emptyCellsBefore = Array(emptyCellsAtStart).fill(null);
  
  // Calculate how many empty cells we need at the end to complete the grid
  const totalCells = emptyCellsBefore.length + monthDays.length;
  const rowsNeeded = Math.ceil(totalCells / 7);
  const totalCellsNeeded = rowsNeeded * 7;
  const emptyCellsAfter = Array(totalCellsNeeded - totalCells).fill(null);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Helper function to get severity color
  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return "bg-[#FFE4E4]"; // Very light red
      case 2: return "bg-[#FFB5B5]"; // Light red
      case 3: return "bg-[#FF8585]"; // Medium red
      case 4: return "bg-[#FF5252]"; // Dark red
      case 5: return "bg-[#FF0000]"; // Very dark red
      default: return "bg-muted";
    }
  };

  // Helper function to get severity text
  const getSeverityText = (severity: number) => {
    switch (severity) {
      case 1: return "Level 1";
      case 2: return "Level 2";
      case 3: return "Level 3";
      case 4: return "Level 4";
      case 5: return "Level 5";
      default: return "Unknown";
    }
  };

  // Helper function to find entry for a specific date
  const findEntryForDate = (date: Date) => {
    return entries.find(entry => {
      const entryDate = new Date(entry.date);
      return isSameDay(entryDate, date);
    });
  };

  // Handle day click
  const handleDayClick = (day: Date) => {
    const entry = findEntryForDate(day);
    if (entry) {
      setSelectedEntry(entry);
      setIsDialogOpen(true);
    }
  };

  // Handle entry update
  const handleEntryUpdated = () => {
    setIsDialogOpen(false);
    if (onEntryUpdated) {
      onEntryUpdated();
    }
  };

  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={previousMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            
            <Button
              variant="ghost"
              onClick={nextMonth}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm text-muted-foreground font-medium"
              >
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {emptyCellsBefore.map((_, index) => (
              <div key={`empty-before-${index}`} className="aspect-square p-1"></div>
            ))}
            
            {monthDays.map((day) => {
              const entry = findEntryForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              
              return (
                <div 
                  key={day.toString()}
                  className={cn(
                    "aspect-square p-1 relative rounded-md transition-colors",
                    isCurrentMonth 
                      ? "hover:bg-accent cursor-pointer" 
                      : "text-muted-foreground"
                  )}
                  onClick={() => isCurrentMonth && handleDayClick(day)}
                >
                  <div className="absolute top-1 right-1 text-xs font-medium">
                    {format(day, 'd')}
                  </div>
                  
                  {entry && (
                    <div 
                      className={cn(
                        "absolute bottom-1 left-1 right-1 h-1.5 rounded-full",
                        getSeverityColor(entry.severity)
                      )}
                      title={`Level ${entry.severity}`}
                    ></div>
                  )}
                </div>
              );
            })}
            
            {emptyCellsAfter.map((_, index) => (
              <div key={`empty-after-${index}`} className="aspect-square p-1"></div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedEntry && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Headache Entry - {format(new Date(selectedEntry.date), 'MMM d, yyyy')}
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "border-0",
                    getSeverityColor(selectedEntry.severity)
                  )}
                >
                  Level {selectedEntry.severity}
                </Badge>
              </div>
              
              {selectedEntry.notes && (
                <div>
                  <div className="text-sm font-medium mb-1">Notes</div>
                  <div className="text-sm text-muted-foreground">{selectedEntry.notes}</div>
                </div>
              )}
              
              {selectedEntry.triggers && (
                <div>
                  <div className="text-sm font-medium mb-1">Triggers</div>
                  <div className="text-sm text-muted-foreground">{selectedEntry.triggers.join(', ')}</div>
                </div>
              )}
              
              {selectedEntry.medications.length > 0 && (
                <div>
                  <div className="text-sm font-medium mb-1">Medications</div>
                  <div className="space-y-1">
                    {selectedEntry.medications.map(med => (
                      <div key={med} className="text-sm text-muted-foreground">
                        {med}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
