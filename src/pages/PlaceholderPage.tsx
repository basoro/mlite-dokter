import { Construction } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const PlaceholderPage = () => {
  const location = useLocation();
  const pageName = location.pathname.split('/').filter(Boolean).pop() || 'Halaman';

  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
      <Construction className="h-16 w-16 mb-4 opacity-30" />
      <h1 className="text-lg font-semibold capitalize">{pageName.replace(/-/g, ' ')}</h1>
      <p className="text-sm mt-1">Halaman ini sedang dalam pengembangan</p>
    </div>
  );
};

export default PlaceholderPage;
