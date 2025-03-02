'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus, X } from 'lucide-react';

type HeadacheFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: {
    id?: string;
    date: string | Date;
    severity: number;
    notes?: string;
    triggers?: string;
    medications?: { id: string; name: string; dosage?: string }[];
  };
  existingEntry?: {
    id: string;
    date: string;
    severity: number;
    notes?: string;
    triggers?: string;
    medications: { id: string; name: string; dosage?: string }[];
    createdAt: string;
    updatedAt: string;
  };
  mode?: 'create' | 'edit';
  isDialog?: boolean;
};

// Separate the form content from the dialog wrapper
function HeadacheFormContent({ 
  onSuccess, 
  onCancel, 
  initialValues, 
  existingEntry,
  mode = 'create',
  isDialog = true
}: HeadacheFormProps) {
  // Combine initialValues and existingEntry to support both formats
  const entryData = existingEntry || initialValues;
  
  const initialDate = entryData?.date 
    ? typeof entryData.date === 'string' 
      ? new Date(entryData.date) 
      : entryData.date 
    : new Date();
  
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const [severity, setSeverity] = useState<number>(entryData?.severity || 3);
  const [notes, setNotes] = useState<string>(entryData?.notes || '');
  const [triggers, setTriggers] = useState<string>(entryData?.triggers || '');
  const [medications, setMedications] = useState<{ id: string; name: string; dosage?: string }[]>(
    entryData?.medications || []
  );
  const [newMedication, setNewMedication] = useState<string>('');
  const [newDosage, setNewDosage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleAddMedication = () => {
    if (newMedication.trim()) {
      setMedications([
        ...medications,
        {
          id: Date.now().toString(),
          name: newMedication.trim(),
          dosage: newDosage.trim() || undefined,
        },
      ]);
      setNewMedication('');
      setNewDosage('');
    }
  };

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter((med) => med.id !== id));
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
        triggers: triggers || undefined,
        medications,
      };
      
      const endpoint = mode === 'create' ? '/api/headaches' : `/api/headaches/${entryData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
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
    <form onSubmit={onSubmit} className="space-y-4">
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

      <div className="space-y-2">
        <Label htmlFor="triggers">Triggers (Optional)</Label>
        <Input
          id="triggers"
          value={triggers}
          onChange={(e) => setTriggers(e.target.value)}
          placeholder="E.g., stress, lack of sleep, food"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional details about this headache episode"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Medications (Optional)</Label>
        <div className="flex space-x-2">
          <Input
            value={newMedication}
            onChange={(e) => setNewMedication(e.target.value)}
            placeholder="Medication name"
            className="flex-1"
          />
          <Input
            value={newDosage}
            onChange={(e) => setNewDosage(e.target.value)}
            placeholder="Dosage (optional)"
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            onClick={handleAddMedication}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {medications.length > 0 && (
          <div className="mt-2 space-y-2">
            {medications.map((med) => (
              <div 
                key={med.id} 
                className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
              >
                <div>
                  <span className="font-medium">{med.name}</span>
                  {med.dosage && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {med.dosage}
                    </span>
                  )}
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleRemoveMedication(med.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" className={onCancel ? '' : 'w-full'} disabled={isSubmitting}>
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
  const [isOpen, setIsOpen] = useState(false);

  // For direct embedding (like in the mobile bottom nav or calendar view)
  if (!isDialog) {
    return (
      <HeadacheFormContent
        onSuccess={onSuccess}
        onCancel={onCancel}
        initialValues={initialValues}
        existingEntry={existingEntry}
        mode={existingEntry || (initialValues?.id) ? 'edit' : 'create'}
        isDialog={false}
      />
    );
  }

  // For dialog trigger button
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Add Entry</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add Headache Entry' : 'Edit Headache Entry'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Record a new headache episode. Click save when you\'re done.'
              : 'Update this headache entry. Click save when you\'re done.'}
          </DialogDescription>
        </DialogHeader>
        <HeadacheFormContent 
          onSuccess={() => {
            setIsOpen(false);
            if (onSuccess) onSuccess();
          }} 
          initialValues={initialValues}
          existingEntry={existingEntry}
          mode={mode}
          isDialog={true}
        />
      </DialogContent>
    </Dialog>
  );
}
