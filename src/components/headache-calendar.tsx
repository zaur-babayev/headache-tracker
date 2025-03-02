import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HeadacheForm } from '@/components/headache-form';
import { format } from 'date-fns';

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
};

type HeadacheCalendarProps = {
  entries: HeadacheEntry[];
  onEntryUpdated: () => void;
};

export function HeadacheCalendar({ entries, onEntryUpdated }: HeadacheCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HeadacheEntry | null>(null);

  // Create a map of dates to entries for quick lookup
  const entryMap = entries.reduce<Record<string, HeadacheEntry>>((acc, entry) => {
    const dateStr = format(new Date(entry.date), 'yyyy-MM-dd');
    acc[dateStr] = entry;
    return acc;
  }, {});

  // Function to determine if a date has an entry and its severity
  const getDayClassNames = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const entry = entryMap[dateStr];
    
    if (!entry) return '';
    
    // Return different colors based on severity
    switch (entry.severity) {
      case 1: return 'bg-green-100 text-green-800 font-bold';
      case 2: return 'bg-blue-100 text-blue-800 font-bold';
      case 3: return 'bg-yellow-100 text-yellow-800 font-bold';
      case 4: return 'bg-orange-100 text-orange-800 font-bold';
      case 5: return 'bg-red-100 text-red-800 font-bold';
      default: return 'bg-gray-100 font-bold';
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    const entry = entryMap[dateStr];
    
    if (entry) {
      // If there's an entry for this date, show it
      setSelectedEntry(entry);
    } else {
      // If no entry, allow creating a new one
      setSelectedEntry(null);
    }
    
    setIsDialogOpen(true);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Headache Calendar</CardTitle>
          <CardDescription>
            Select a date to view or add a headache entry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-md border"
              modifiersClassNames={{
                selected: 'bg-primary text-primary-foreground',
              }}
              modifiers={{
                headache: (date) => {
                  const dateStr = format(date, 'yyyy-MM-dd');
                  return !!entryMap[dateStr];
                },
              }}
              components={{
                Day: ({ date, displayMonth, selected, disabled, ...props }) => {
                  // Extract only the DOM-compatible props
                  const { className, style, onClick, onMouseEnter, tabIndex, ...restProps } = props;
                  
                  // Only include valid DOM props
                  const domProps = {
                    className: `${className} ${getDayClassNames(date)}`,
                    style,
                    onClick,
                    onMouseEnter,
                    tabIndex
                  };
                  
                  return (
                    <button
                      {...domProps}
                      disabled={disabled}
                      type="button"
                    />
                  );
                },
              }}
            />
          </div>
          
          <div className="mt-4 flex justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-green-100 mr-2"></div>
              <span className="text-sm">Level 1</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-blue-100 mr-2"></div>
              <span className="text-sm">Level 2</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-yellow-100 mr-2"></div>
              <span className="text-sm">Level 3</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-orange-100 mr-2"></div>
              <span className="text-sm">Level 4</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 rounded-full bg-red-100 mr-2"></div>
              <span className="text-sm">Level 5</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEntry 
                ? `Headache Entry for ${format(new Date(selectedEntry.date), 'PPP')}` 
                : `Add Headache Entry for ${selectedDate ? format(selectedDate, 'PPP') : ''}`}
            </DialogTitle>
          </DialogHeader>
          
          {selectedEntry ? (
            <HeadacheForm
              mode="edit"
              initialData={{
                id: selectedEntry.id,
                date: new Date(selectedEntry.date),
                severity: selectedEntry.severity,
                notes: selectedEntry.notes,
                triggers: selectedEntry.triggers,
                medications: selectedEntry.medications,
              }}
              onSuccess={() => {
                setIsDialogOpen(false);
                onEntryUpdated();
              }}
            />
          ) : (
            <HeadacheForm
              mode="create"
              initialData={{
                date: selectedDate || new Date(),
                severity: 3,
                notes: '',
                triggers: '',
                medications: [],
              }}
              onSuccess={() => {
                setIsDialogOpen(false);
                onEntryUpdated();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
