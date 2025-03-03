import { useState } from "react";
import { format } from "date-fns";
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

  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
  const monthDays = Array.from({ length: monthEnd.getDate() }, (_, i) => new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i + 1));

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return "bg-white"; 
      case 2: return "bg-blue-300"; 
      case 3: return "bg-blue-400"; 
      case 4: return "bg-blue-500"; 
      case 5: return "bg-blue-600"; 
      default: return "bg-muted";
    }
  };

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

  const findEntryForDate = (date: Date) => {
    return entries.find(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === date.toDateString();
    });
  };

  const handleDayClick = (day: Date) => {
    const entry = findEntryForDate(day);
    if (entry) {
      setSelectedEntry(entry);
      setIsDialogOpen(true);
    }
  };

  const handleEntryUpdated = () => {
    setIsDialogOpen(false);
    if (onEntryUpdated) {
      onEntryUpdated();
    }
  };

  const previousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

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
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            
            <div className="font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            
            <Button
              variant="ghost"
              onClick={nextMonth}
              className="h-8 w-8 p-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
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
            {Array.from({ length: currentMonth.getDay() }, (_, i) => (
              <div key={`empty-before-${i}`} className="aspect-square p-1"></div>
            ))}
            
            {monthDays.map((day) => {
              const entry = findEntryForDate(day);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              
              return (
                <div 
                  key={day.toDateString()}
                  className={cn(
                    "aspect-square p-1 relative rounded-md transition-colors",
                    isCurrentMonth 
                      ? "hover:bg-accent cursor-pointer" 
                      : "text-muted-foreground"
                  )}
                  onClick={() => isCurrentMonth && handleDayClick(day)}
                >
                  <div className="absolute top-1 right-1 text-xs font-medium">
                    {day.getDate()}
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
            
            {Array.from({ length: 6 - (monthDays.length + currentMonth.getDay()) % 7 }, (_, i) => (
              <div key={`empty-after-${i}`} className="aspect-square p-1"></div>
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
