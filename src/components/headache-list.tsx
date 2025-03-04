import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { deleteHeadacheEntry } from '@/app/actions';
import { MEDICATION_NAMES, TRIGGER_NAMES } from '@/lib/constants';

interface HeadacheEntry {
  id: string;
  date: string;
  severity: number;
  notes?: string;
  triggers: string[];
  medications: string[];
  createdAt: string;
  updatedAt: string;
}

interface HeadacheListProps {
  entries: HeadacheEntry[];
  onEntryUpdated?: () => void;
}

export function HeadacheList({ entries, onEntryUpdated = () => {} }: HeadacheListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      setIsDeleting(true);
      setEntryToDelete(id);
      await fetch(`/api/headaches?id=${id}`, {
        method: 'DELETE',
        credentials: 'include', // Include credentials (cookies) with the request
      });
      toast.success('Entry deleted successfully');
      onEntryUpdated();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Failed to delete entry');
    } finally {
      setIsDeleting(false);
      setEntryToDelete(null);
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

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id} className="relative">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Date</h3>
                <p>{format(parseISO(entry.date), 'MMM d, yyyy')}</p>
              </div>
              <div>
                <h3 className="font-semibold">Severity</h3>
                <p>{renderSeverityCircles(entry.severity)}</p>
              </div>
              {entry.notes && (
                <div className="col-span-2">
                  <h3 className="font-semibold">Notes</h3>
                  <p>{entry.notes}</p>
                </div>
              )}
              {entry.triggers && entry.triggers.length > 0 && (
                <div>
                  <h3 className="font-semibold">Triggers</h3>
                  <p>
                    {entry.triggers
                      .map((trigger) => TRIGGER_NAMES[trigger] || trigger)
                      .join(', ')}
                  </p>
                </div>
              )}
              {entry.medications && entry.medications.length > 0 && (
                <div>
                  <h3 className="font-semibold">Medications</h3>
                  <p>
                    {entry.medications
                      .map((medication) => MEDICATION_NAMES[medication] || medication)
                      .join(', ')}
                  </p>
                </div>
              )}
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/entry/edit/${entry.id}`)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(entry.id)}
                disabled={isDeleting && entryToDelete === entry.id}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {isDeleting && entryToDelete === entry.id ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
