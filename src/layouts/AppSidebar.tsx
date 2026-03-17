import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  Calendar,
  AlertCircle,
  Stethoscope,
  BedDouble,
  Droplets,
  ClipboardCheck,
  Scissors,
  DollarSign,
  FileText,
  Activity,
  ChevronDown,
  ChevronLeft,
  User,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

const menuItems = [
  { label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
  {
    label: 'Pasien',
    icon: Users,
    children: [
      { label: 'Booking', path: '/pasien/booking' },
      { label: 'IGD', path: '/pasien/igd' },
      { label: 'Rawat Jalan', path: '/pasien/rawat-jalan' },
      { label: 'Rawat Inap', path: '/pasien/rawat-inap' },
      { label: 'Hemodialisa', path: '/pasien/hemodialisa' },
    ],
  },
  { label: 'Presensi', icon: ClipboardCheck, path: '/presensi' },
  { label: 'Booking Operasi', icon: Scissors, path: '/booking-operasi' },
  { label: 'Tarif INA-CBGs', icon: DollarSign, path: '/tarif-inacbgs' },
  { label: 'Master ICD', icon: FileText, path: '/master-icd' },
  { label: 'Statistik', icon: Activity, path: '/statistik' },
];

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// ... existing imports ...

export const AppSidebar = ({ collapsed, onToggle, onNavigate }: AppSidebarProps) => {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const [openGroups, setOpenGroups] = useState<string[]>(['Pasien']);
  
  const bgImage = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80';
  const gender = user?.gender || 'L';
  const doctorName = user?.nama || 'Dokter';
  const doctorId = user?.kd_dokter || user?.username || 'DR001';

  // Determine avatar image based on gender
  const avatarImage = gender === 'P' ? '/wanita.png' : '/pria.png';

  const toggleGroup = (label: string) => {
    setOpenGroups((prev) =>
      prev.includes(label) ? prev.filter((g) => g !== label) : [...prev, label]
    );
  };

  const isActive = (path: string) => location.pathname === path;
  const isGroupActive = (children: { path: string }[]) =>
    children.some((c) => location.pathname === c.path);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-4 h-full w-16">
        <button onClick={onToggle} className="mb-6 text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="h-5 w-5 rotate-180" />
        </button>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = item.path ? isActive(item.path) : item.children ? isGroupActive(item.children) : false;
          return (
            <NavLink
              key={item.label}
              to={item.path || item.children?.[0]?.path || '#'}
              className={cn(
                'flex items-center justify-center h-10 w-10 rounded-lg mb-1 transition-colors',
                active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-sidebar-hover'
              )}
              title={item.label}
              onClick={onNavigate}
            >
              <Icon className="h-5 w-5" />
            </NavLink>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-64">
      {/* User profile area */}
      <div 
        className="p-4 border-b relative" 
        style={{ 
          backgroundImage: `url(${bgImage})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center', 
        }} 
      >
        <div className="absolute inset-0 bg-primary/40 backdrop-blur-[1px]" />
        <div className="relative z-10"> 
          <div className="flex"> 
            <div className="h-16 w-16 rounded-full bg-white/90 flex items-center justify-center shadow-md overflow-hidden"> 
              <img 
                src={avatarImage} 
                alt="Profile" 
                className="h-full w-full object-cover"
                onError={(e) => {
                  // Fallback to SVG if image fails
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('fallback-svg');
                }}
              />
              {/* Fallback SVG rendered only if needed (handled via CSS/JS logic or conditional rendering if preferred, 
                  but for simplicity replacing the whole block) */}
              <div className="hidden fallback-svg:block">
                  {gender === 'P' ? ( 
                    <svg viewBox="0 0 24 24" className="h-10 w-10 text-primary"> 
                      <path fill="currentColor" d="M12 2a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2a2 2 0 0 1 2-2m-1.5 20v-6h-3l2.59-7.59C10.34 7.59 11.1 7 12 7c.9 0 1.66.59 1.91 1.41L16.5 16h-3v6h-3Z"/> 
                    </svg> 
                  ) : ( 
                    <svg viewBox="0 0 24 24" className="h-10 w-10 text-primary"> 
                      <path fill="currentColor" d="M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z"/> 
                    </svg> 
                  )} 
              </div>
            </div> 
          </div> 
          <h3 className="mt-3 font-bold text-white text-lg tracking-tight drop-shadow-md">{doctorName}</h3> 
          <p className="text-xs text-white/90 font-medium drop-shadow-sm">{doctorId}</p> 
        </div> 
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;

          if (item.children) {
            const groupOpen = openGroups.includes(item.label);
            const groupActive = isGroupActive(item.children);
            return (
              <div key={item.label} className="mb-1">
                <button
                  onClick={() => toggleGroup(item.label)}
                  className={cn(
                    'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    groupActive
                      ? 'text-accent-foreground bg-accent'
                      : 'text-sidebar-foreground hover:bg-sidebar-hover'
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 transition-transform',
                      groupOpen && 'rotate-180'
                    )}
                  />
                </button>
                {groupOpen && (
                  <div className="ml-7 mt-1 space-y-0.5">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={cn(
                          'block px-3 py-2 rounded-lg text-sm transition-colors',
                          isActive(child.path)
                            ? 'text-accent-foreground font-medium bg-accent'
                            : 'text-muted-foreground hover:text-foreground hover:bg-sidebar-hover'
                        )}
                        onClick={onNavigate}
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path!}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors',
                isActive(item.path!)
                  ? 'text-accent-foreground bg-accent'
                  : 'text-sidebar-foreground hover:bg-sidebar-hover'
              )}
              onClick={onNavigate}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t text-[10px] text-muted-foreground text-center bg-muted/20">
        © 2017 - 2026 
        <Dialog>
          <DialogTrigger asChild>
            <span className="text-primary font-medium block sm:inline cursor-pointer hover:underline"> ICT RSHD Barabai</span>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl text-primary">Instalasi ICT RSHD Barabai</DialogTitle>
              <DialogDescription className="text-center pt-2">
                Ditetapkan sebagai Instalasi ICT dengan Surat Keputusan Direktur Rumah Sakit Umum Daerah H. Damanhuri pada tanggal 1 November 2017.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-muted/30 p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2 text-primary">Kepala Instalasi :</h4>
                <p className="text-sm font-medium">MasBas (drg. Faisol Basoro)</p>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg max-h-[300px] overflow-y-auto">
                <h4 className="font-semibold text-sm mb-3 text-primary">Anggota :</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Amat (Muhammad Ma'ruf, S.Kom)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Aruf (Ma'ruf, S.Kom)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Didi (Didi Andriawan, S.Kom)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Adly (M. Adly Hidayat, S.Kom)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Ridho (M. Alfian Ridho, S.Kom) (Alm)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Ijai (Zailani)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Ina (Inarotut Darojah) (2019 left)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Iqbal (Muhammad Iqbal Arisyi, S.Kom)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Iki (Muhammad Rizki Renaldi)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Nora (Nora Gusti Salsabila, S.Kom)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Reza (Muhammad Reza, S.Kom)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Rakha (Rakha Fauziannur, S.Kom)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Mukhdi (Muhammad Mukhdi, S.Kom)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Pebrie (Muhammad Pebrie Budiman, S.Kom)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Ana (Erliana, A.Md.Kom)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>Wanda (Wanda Septia Dewi Lestari, S.Kom)</li>
                </ul>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
