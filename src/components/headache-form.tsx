'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CalendarIcon, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { MEDICATIONS, TRIGGERS } from '@/lib/constants';

type HeadacheFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  initialValues?: {
    id?: string;
    date: string | Date;
    severity: number;
    notes?: string;
    triggers?: string[];
    medications?: string[];
  };
  existingEntry?: {
    id: string;
    date: string;
    severity: number;
    notes?: string;
    triggers?: string[];
    medications: string[];
    createdAt: string;
    updatedAt: string;
  };
  mode?: 'create' | 'edit';
  isDialog?: boolean;
};

function HeadacheFormContent({ 
  onSuccess, 
  onCancel,
  onDelete,
  initialValues,
  existingEntry,
  mode = 'create',
  isDialog = true
}: HeadacheFormProps) {
  const entryData = existingEntry || initialValues;
  
  const initialDate = entryData?.date 
    ? typeof entryData.date === 'string' 
      ? new Date(entryData.date) 
      : entryData.date 
    : new Date();
  
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [severity, setSeverity] = useState<number>(entryData?.severity || 1);
  const [notes, setNotes] = useState<string>(entryData?.notes || '');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    entryData?.triggers || []
  );
  const [selectedMedications, setSelectedMedications] = useState<string[]>(
    entryData?.medications || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Helper function to get severity color (blue shades) - matching home page
  const getSeverityColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-white border border-gray-300';
      case 2: return 'bg-blue-200';
      case 3: return 'bg-blue-400';
      case 4: return 'bg-blue-600';
      case 5: return 'bg-blue-800';
      default: return 'bg-gray-300';
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const headacheData = {
        id: entryData?.id,
        date: date.toISOString(),
        severity,
        notes: notes || undefined,
        triggers: selectedTriggers,
        medications: selectedMedications,
      };
      
      const response = await fetch('/api/headaches', {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify(headacheData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save headache entry');
      }
      
      toast.success(
        mode === 'create' 
          ? 'Headache entry added successfully' 
          : 'Headache entry updated successfully'
      );
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving headache entry:', error);
      toast.error('Failed to save headache entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-1">
      <div className="space-y-1">
        <Label htmlFor="date" className="text-sm font-medium">Date</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal hover:bg-[#1a1a1a] hover:border-gray-700 cursor-pointer",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => {
                setDate(newDate);
                setIsCalendarOpen(false);
              }}
              initialFocus
              className="bg-[#161616] border-gray-800"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Severity (1-5)</Label>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Mild</span>
            <span className="text-xs text-muted-foreground">Severe</span>
          </div>
          <div className="flex space-x-2 justify-between">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
                  getSeverityColor(level),
                  severity >= level 
                    ? "ring-2 ring-offset-2 ring-offset-background ring-blue-500 scale-105" 
                    : "opacity-70 hover:opacity-100 hover:scale-105"
                )}
                onClick={() => setSeverity(level)}
              >
                <span className={cn(
                  "font-semibold text-sm",
                  level >= 4 ? "text-white" : "text-gray-900"
                )}>
                  {level}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Triggers</Label>
        <div className="grid grid-cols-2 gap-2">
          {TRIGGERS.map((trigger) => (
            <div 
              key={trigger.id} 
              className={cn(
                "flex items-center space-x-2 p-1.5 rounded-lg transition-colors cursor-pointer",
                selectedTriggers.includes(trigger.id) 
                  ? "bg-[#1a1a1a] border border-gray-700" 
                  : "border hover:border-gray-700"
              )}
            >
              <Checkbox
                id={trigger.id}
                checked={selectedTriggers.includes(trigger.id)}
                onCheckedChange={(checked) => {
                  setSelectedTriggers(
                    checked
                      ? [...selectedTriggers, trigger.id]
                      : selectedTriggers.filter((id) => id !== trigger.id)
                  );
                }}
              />
              <Label
                htmlFor={trigger.id}
                className="text-sm font-normal leading-none cursor-pointer w-full"
              >
                {trigger.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Medications</Label>
        <div className="grid grid-cols-2 gap-2">
          {MEDICATIONS.map((medication) => (
            <div 
              key={medication.id} 
              className={cn(
                "flex items-center space-x-2 p-1.5 rounded-lg transition-colors cursor-pointer",
                selectedMedications.includes(medication.id) 
                  ? "bg-[#1a1a1a] border border-gray-700" 
                  : "border hover:border-gray-700"
              )}
            >
              <Checkbox
                id={medication.id}
                checked={selectedMedications.includes(medication.id)}
                onCheckedChange={(checked) => {
                  setSelectedMedications(
                    checked
                      ? [...selectedMedications, medication.id]
                      : selectedMedications.filter((id) => id !== medication.id)
                  );
                }}
              />
              <Label
                htmlFor={medication.id}
                className="text-sm font-normal leading-none cursor-pointer w-full"
              >
                {medication.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="notes" className="text-sm font-medium">Notes (Optional)</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full min-h-[80px] rounded-md border p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder:text-muted-foreground"
          placeholder="Any additional notes..."
        />
      </div>

      {mode === 'edit' ? (
        <div className="flex justify-between pt-2 gap-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-800 bg-transparent text-muted-foreground hover:bg-gray-800/20 hover:text-foreground cursor-pointer"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onDelete}
              className="border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-600 flex items-center justify-center gap-2 cursor-pointer"
              disabled={isSubmitting}
            >
              <Trash2 className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Updating...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </>
            ) : (
              'Update Entry'
            )}
          </Button>
        </div>
      ) : (
        <div className="flex justify-between pt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="cursor-pointer"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Adding...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </>
            ) : (
              'Add Entry'
            )}
          </Button>
        </div>
      )}
    </form>
  );
}

function HeadacheForm({ 
  onSuccess, 
  onCancel,
  onDelete,
  initialValues,
  existingEntry,
  mode = 'create',
  isDialog = true
}: HeadacheFormProps) {
  const [open, setOpen] = useState(false);

  if (!isDialog) {
    return (
      <HeadacheFormContent
        onSuccess={onSuccess}
        onCancel={onCancel}
        onDelete={onDelete}
        initialValues={initialValues}
        existingEntry={existingEntry}
        mode={mode}
        isDialog={isDialog}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="secondary" 
          className="cursor-pointer"
          onClick={() => setOpen(true)}
        >
          {mode === 'create' ? 'Add Headache' : 'Edit Entry'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
          </DialogTitle>
        </DialogHeader>
        <HeadacheFormContent
          onSuccess={() => {
            onSuccess?.();
            setOpen(false);
          }}
          onCancel={() => {
            onCancel?.();
            setOpen(false);
          }}
          onDelete={onDelete}
          initialValues={initialValues}
          existingEntry={existingEntry}
          mode={mode}
          isDialog={isDialog}
        />
      </DialogContent>
    </Dialog>
  );
}

export { HeadacheForm };
