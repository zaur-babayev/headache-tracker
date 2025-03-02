import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HeadacheForm } from '@/components/headache-form';
import { toast } from 'sonner';
import { Pencil, Trash2, Pill, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
  entries?: HeadacheEntry[];
  onEntryUpdated?: () => void;
};

export function HeadacheList({ entries = [], onEntryUpdated = () => {} }: HeadacheListProps) {
  const [selectedEntry, setSelectedEntry] = useState<HeadacheEntry | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const MEDICATION_NAMES: Record<string, string> = {
    'ibuprofen': 'Ibuprofen',
    'paracetamol': 'Paracetamol',
  };

  const TRIGGER_NAMES: Record<string, string> = {
    'lack-of-sleep': 'Lack of sleep',
    'too-much-sleep': 'Too much sleep',
    'stress': 'Stress',
    'hunger': 'Hunger',
  };

  const handleEdit = (entry: HeadacheEntry) => {
    setSelectedEntry(entry);
    setIsEditFormOpen(true);
  };

  const handleDelete = (entry: HeadacheEntry) => {
    setSelectedEntry(entry);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEntry) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/headaches?id=${selectedEntry.id}`, {
        method: 'DELETE',
        credentials: 'include', // Include credentials (cookies) with the request
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
      case 1: return 'bg-[#FFE4E4]';
      case 2: return 'bg-[#FFB5B5]';
      case 3: return 'bg-[#FF8585]';
      case 4: return 'bg-[#FF5252]';
      case 5: return 'bg-[#FF0000]';
      default: return 'bg-gray-100';
    }
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No headache entries yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id} className="overflow-hidden bg-card">
          <div className="flex items-start justify-between p-6">
            <div className="space-y-4 flex-grow">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium leading-none">
                    {entry.date ? format(new Date(entry.date), 'MMMM d, yyyy') : 'Unknown date'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {entry.date ? format(new Date(entry.date), 'EEEE') : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => handleEdit(entry)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(entry)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getSeverityColor(entry.severity)}`} />
                  <span className="text-sm">Severity {entry.severity}/5</span>
                </div>

                {entry.triggers && entry.triggers.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">
                      {entry.triggers.map(trigger => 
                        trigger ? (TRIGGER_NAMES[trigger] || trigger) : ''
                      ).filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {entry.medications && entry.medications.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <Pill className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span className="text-sm">
                      {entry.medications.map(med => 
                        med ? (MEDICATION_NAMES[med] || med) : ''
                      ).filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {entry.notes && (
                  <div className="text-sm text-muted-foreground border-t pt-3 mt-3">
                    {entry.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}

      {/* Edit Form Dialog */}
      <Dialog open={isEditFormOpen} onOpenChange={setIsEditFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Headache Entry</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <HeadacheForm
              mode="edit"
              existingEntry={selectedEntry}
              onSuccess={() => {
                setIsEditFormOpen(false);
                onEntryUpdated();
              }}
              onCancel={() => setIsEditFormOpen(false)}
              isDialog={false}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Headache Entry</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this headache entry? This action cannot be undone.
            </p>
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
