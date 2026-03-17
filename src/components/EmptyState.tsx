import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState = ({ title = 'Tidak ada data', description }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
    <Inbox className="h-12 w-12 mb-3 opacity-40" />
    <p className="text-sm font-medium">{title}</p>
    {description && <p className="text-xs mt-1">{description}</p>}
  </div>
);
