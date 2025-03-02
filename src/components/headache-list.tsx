import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HeadacheForm } from '@/components/headache-form';
import { toast } from 'sonner';

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

type HeadacheListProps = {
  entries: HeadacheEntry[];
  onEntryUpdated: () => void;
};

export function HeadacheList({ entries, onEntryUpdated }: HeadacheListProps) {
  const [selectedEntry, setSelectedEntry] = useState<HeadacheEntry | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const MEDICATION_NAMES = {
    'ibuprofen': 'Ibuprofen',
    'paracetamol': 'Paracetamol',
  } as const;

  const TRIGGER_NAMES = {
    'lack-of-sleep': 'Lack of sleep',
    'too-much-sleep': 'Too much sleep',
    'stress': 'Stress',
    'hunger': 'Hunger',
  } as const;

  const handleEdit = (entry: HeadacheEntry) => {
    setSelectedEntry(entry);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (entry: HeadacheEntry) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEntry) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/headaches/${selectedEntry.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete headache entry');
      }
      
      toast.success('Headache entry deleted successfully');
      onEntryUpdated();
    } catch (error) {
      console.error('Error deleting headache entry:', error);
      toast.error('Failed to delete headache entry');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const getSeverityColor = (severity: number) => {
    switch (severity) {
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-orange-100 text-orange-800';
      case 5: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No headache entries yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {format(new Date(entry.date), 'PPP')}
              </CardTitle>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(entry)}>
                  Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(entry)}>
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex items-center">
                <span className="font-medium mr-2">Severity:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(entry.severity)}`}>
                  {entry.severity} / 5
                </span>
              </div>
              
              {entry.triggers.length > 0 && (
                <div>
                  <span className="font-medium">Triggers:</span>{' '}
                  {entry.triggers.map(trigger => TRIGGER_NAMES[trigger as keyof typeof TRIGGER_NAMES] || trigger).join(', ')}
                </div>
              )}
              
              {entry.notes && (
                <div>
                  <span className="font-medium">Notes:</span> {entry.notes}
                </div>
              )}
              
              {entry.medications.length > 0 && (
                <div>
                  <span className="font-medium">Medications:</span>
                  <ul className="list-disc list-inside ml-2 mt-1">
                    {entry.medications.map((med) => (
                      <li key={med}>
                        {MEDICATION_NAMES[med as keyof typeof MEDICATION_NAMES] || med}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Headache Entry</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
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
                setIsEditDialogOpen(false);
                onEntryUpdated();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete this headache entry? This action cannot be undone.</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
