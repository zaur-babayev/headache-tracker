'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const MEDICATIONS = [
  { id: 'ibuprofen', name: 'Ibuprofen' },
  { id: 'paracetamol', name: 'Paracetamol' },
];

const TRIGGERS = [
  { id: 'lack-of-sleep', label: 'Lack of sleep' },
  { id: 'too-much-sleep', label: 'Too much sleep' },
  { id: 'stress', label: 'Stress' },
  { id: 'hunger', label: 'Hunger' },
];

type HeadacheFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
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
  const [severity, setSeverity] = useState<number>(entryData?.severity || 3);
  const [notes, setNotes] = useState<string>(entryData?.notes || '');
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>(
    entryData?.triggers || []
  );
  const [selectedMedications, setSelectedMedications] = useState<string[]>(
    entryData?.medications || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

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
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
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
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label>Severity (1-5)</Label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <Button
              key={level}
              type="button"
              variant={severity === level ? "default" : "outline"}
              className={cn(
                "flex-1",
                severity === level && "font-semibold"
              )}
              onClick={() => setSeverity(level)}
            >
              {level}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Triggers</Label>
        <div className="grid grid-cols-2 gap-4">
          {TRIGGERS.map((trigger) => (
            <div key={trigger.id} className="flex items-center space-x-2">
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
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {trigger.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label>Medications</Label>
        <div className="grid grid-cols-2 gap-4">
          {MEDICATIONS.map((medication) => (
            <div key={medication.id} className="flex items-center space-x-2">
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
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {medication.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Entry' : 'Update Entry'}
        </Button>
      </div>
    </form>
  );
}

export function HeadacheForm({ 
  onSuccess, 
  onCancel, 
  initialValues, 
  existingEntry,
  mode = 'create',
  isDialog = true
}: HeadacheFormProps) {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleOpenChange = (isOpen: boolean) => {
    if (!isSignedIn && isOpen) {
      router.push('/sign-in');
      return;
    }
    setOpen(isOpen);
  };

  const handleSuccess = () => {
    setOpen(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleCancel = () => {
    setOpen(false);
    if (onCancel) {
      onCancel();
    }
  };

  if (!isDialog) {
    return (
      <HeadacheFormContent
        onSuccess={onSuccess}
        onCancel={onCancel}
        initialValues={initialValues}
        existingEntry={existingEntry}
        mode={mode}
        isDialog={isDialog}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Entry</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Add New Headache Entry' : 'Edit Headache Entry'}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Record details about your headache episode.'
              : 'Update the details of your headache entry.'}
          </DialogDescription>
        </DialogHeader>
        <HeadacheFormContent
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          initialValues={initialValues}
          existingEntry={existingEntry}
          mode={mode}
          isDialog={true}
        />
      </DialogContent>
    </Dialog>
  );
}
