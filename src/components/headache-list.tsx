import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Pencil, Trash2, Pill, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MEDICATION_NAMES, TRIGGER_NAMES } from '@/lib/constants';
import Link from 'next/link';

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = (entry: HeadacheEntry) => {
    window.location.href = `/entry/edit/${entry.id}`;
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
      case 1: return 'bg-white';
      case 2: return 'bg-blue-300';
      case 3: return 'bg-blue-400';
      case 4: return 'bg-blue-500';
      case 5: return 'bg-blue-600';
      default: return 'bg-gray-300';
    }
  };

  const renderSeverityCircles = (severity: number) => {
    const circles = [];
    for (let i = 1; i <= 5; i++) {
      circles.push(
        <div 
          key={i} 
          className={`w-5 h-5 rounded-full ${i <= severity ? getSeverityColor(i) : 'bg-gray-700'}`}
        />
      );
    }
    return (
      <div className="flex space-x-2">
        {circles}
      </div>
    );
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
                  <Link href={`/entry/edit/${entry.id}`}>
                    <a>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </a>
                  </Link>
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
                  {renderSeverityCircles(entry.severity)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Headache Entry</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this headache entry? This action cannot be undone.</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
