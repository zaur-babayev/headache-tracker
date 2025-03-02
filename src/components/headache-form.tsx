import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { toast } from 'sonner';

type Medication = {
  id?: string;
  name: string;
  dosage?: string;
};

type HeadacheFormProps = {
  onSuccess?: () => void;
  initialData?: {
    id?: string;
    date: Date;
    severity: number;
    notes?: string;
    triggers?: string;
    medications: Medication[];
  };
  mode?: 'create' | 'edit';
};

export function HeadacheForm({ onSuccess, initialData, mode = 'create' }: HeadacheFormProps) {
  const [date, setDate] = useState<Date | undefined>(initialData?.date || new Date());
  const [severity, setSeverity] = useState<number>(initialData?.severity || 3);
  const [notes, setNotes] = useState<string>(initialData?.notes || '');
  const [triggers, setTriggers] = useState<string>(initialData?.triggers || '');
  const [medications, setMedications] = useState<Medication[]>(initialData?.medications || []);
  const [newMedName, setNewMedName] = useState<string>('');
  const [newMedDosage, setNewMedDosage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleAddMedication = () => {
    if (!newMedName.trim()) return;
    
    setMedications([
      ...medications,
      { name: newMedName, dosage: newMedDosage || undefined }
    ]);
    
    setNewMedName('');
    setNewMedDosage('');
  };

  const handleRemoveMedication = (index: number) => {
    const updatedMeds = [...medications];
    updatedMeds.splice(index, 1);
    setMedications(updatedMeds);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast.error('Please select a date');
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = mode === 'create' 
        ? '/api/headaches' 
        : `/api/headaches/${initialData?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          severity,
          notes,
          triggers,
          medications,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save headache entry');
      }

      toast.success(
        mode === 'create' 
          ? 'Headache entry created successfully' 
          : 'Headache entry updated successfully'
      );
      
      if (onSuccess) {
        onSuccess();
      }
      
      if (mode === 'create') {
        // Reset form for create mode
        setDate(new Date());
        setSeverity(3);
        setNotes('');
        setTriggers('');
        setMedications([]);
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving headache entry:', error);
      toast.error('Failed to save headache entry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="date">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              {date ? format(date, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="severity">Severity (1-5)</Label>
        <div className="flex items-center space-x-2">
          {[1, 2, 3, 4, 5].map((level) => (
            <Button
              key={level}
              type="button"
              variant={severity === level ? "default" : "outline"}
              className="flex-1"
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
          placeholder="What might have triggered this headache?"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes"
        />
      </div>

      <div className="space-y-2">
        <Label>Medications</Label>
        <div className="flex space-x-2">
          <Input
            value={newMedName}
            onChange={(e) => setNewMedName(e.target.value)}
            placeholder="Medication name"
            className="flex-1"
          />
          <Input
            value={newMedDosage}
            onChange={(e) => setNewMedDosage(e.target.value)}
            placeholder="Dosage (optional)"
            className="flex-1"
          />
          <Button type="button" onClick={handleAddMedication}>
            Add
          </Button>
        </div>
        
        {medications.length > 0 && (
          <div className="mt-2 space-y-2">
            {medications.map((med, index) => (
              <div key={index} className="flex items-center justify-between rounded border p-2">
                <div>
                  <span className="font-medium">{med.name}</span>
                  {med.dosage && <span className="ml-2 text-sm text-gray-500">{med.dosage}</span>}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveMedication(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : mode === 'create' ? 'Add Headache Entry' : 'Update Headache Entry'}
      </Button>
    </form>
  );

  if (mode === 'create') {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button>Add Headache Entry</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Headache Entry</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return formContent;
}
