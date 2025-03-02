"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  triggers?: string;
  medications: Medication[];
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

  // Helper function to get severity color
  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return "bg-blue-500 dark:bg-blue-600";
      case 2: return "bg-green-500 dark:bg-green-600";
      case 3: return "bg-yellow-500 dark:bg-yellow-600";
      case 4: return "bg-orange-500 dark:bg-orange-600";
      case 5: return "bg-red-500 dark:bg-red-600";
      default: return "bg-gray-300 dark:bg-gray-600";
    }
  };

  // Helper function to get severity text
  const getSeverityText = (severity: number) => {
    switch (severity) {
      case 1: return "Mild";
      case 2: return "Mild-Moderate";
      case 3: return "Moderate";
      case 4: return "Moderate-Severe";
      case 5: return "Severe";
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Previous month</span>
          </Button>
          <h2 className="text-xl font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Next month</span>
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="hidden sm:flex items-center space-x-2">
            <Badge className="bg-blue-500 dark:bg-blue-600">Mild</Badge>
            <Badge className="bg-green-500 dark:bg-green-600">Mild-Moderate</Badge>
            <Badge className="bg-yellow-500 dark:bg-yellow-600">Moderate</Badge>
            <Badge className="bg-orange-500 dark:bg-orange-600">Moderate-Severe</Badge>
            <Badge className="bg-red-500 dark:bg-red-600">Severe</Badge>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="sm:hidden">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="flex flex-col gap-1">
                <Badge className="bg-blue-500 dark:bg-blue-600">Mild</Badge>
                <Badge className="bg-green-500 dark:bg-green-600">Mild-Moderate</Badge>
                <Badge className="bg-yellow-500 dark:bg-yellow-600">Moderate</Badge>
                <Badge className="bg-orange-500 dark:bg-orange-600">Moderate-Severe</Badge>
                <Badge className="bg-red-500 dark:bg-red-600">Severe</Badge>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-1 mb-2 text-center">
            <div className="font-medium text-xs sm:text-sm">Mon</div>
            <div className="font-medium text-xs sm:text-sm">Tue</div>
            <div className="font-medium text-xs sm:text-sm">Wed</div>
            <div className="font-medium text-xs sm:text-sm">Thu</div>
            <div className="font-medium text-xs sm:text-sm">Fri</div>
            <div className="font-medium text-xs sm:text-sm">Sat</div>
            <div className="font-medium text-xs sm:text-sm">Sun</div>
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
                      ? "bg-background hover:bg-accent/50 cursor-pointer" 
                      : "bg-muted text-muted-foreground"
                  )}
                  onClick={() => isCurrentMonth && handleDayClick(day)}
                >
                  <div className="absolute top-1 right-1 text-xs sm:text-sm font-medium">
                    {format(day, 'd')}
                  </div>
                  
                  {entry && (
                    <div 
                      className={cn(
                        "absolute bottom-1 left-1 right-1 h-2 rounded-full",
                        getSeverityColor(entry.severity)
                      )}
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

      {selectedEntry && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Headache Entry - {format(new Date(selectedEntry.date), 'MMMM d, yyyy')}</DialogTitle>
              <DialogDescription>
                View and edit details for this headache entry.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Badge className={cn(getSeverityColor(selectedEntry.severity), "text-white")}>
                  {getSeverityText(selectedEntry.severity)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Severity Level: {selectedEntry.severity}/5
                </span>
              </div>
              
              {selectedEntry.triggers && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Triggers:</h4>
                  <p className="text-sm text-muted-foreground">{selectedEntry.triggers}</p>
                </div>
              )}
              
              {selectedEntry.notes && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Notes:</h4>
                  <p className="text-sm text-muted-foreground">{selectedEntry.notes}</p>
                </div>
              )}
              
              {selectedEntry.medications.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Medications:</h4>
                  <ul className="text-sm text-muted-foreground">
                    {selectedEntry.medications.map((med) => (
                      <li key={med.id}>
                        {med.name} {med.dosage && `(${med.dosage})`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="pt-2">
                <HeadacheForm 
                  existingEntry={selectedEntry} 
                  onSuccess={handleEntryUpdated}
                  onCancel={() => setIsDialogOpen(false)}
                  isDialog={false}
                  mode="edit"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
