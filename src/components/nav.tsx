import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Nav() {
  return (
    <nav className="border-b">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="font-bold text-xl">
          Headache Tracker
        </Link>
        <div className="ml-auto flex gap-4">
          <Button asChild variant="ghost">
            <Link href="/">Dashboard</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/calendar">Calendar</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/statistics">Statistics</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
