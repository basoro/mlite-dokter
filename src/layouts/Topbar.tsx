import { Bell, Search, User, Menu, LogOut, Settings, Key } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar = ({ onMenuClick }: TopbarProps) => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-primary flex items-center px-4 gap-4 flex-shrink-0 shadow-sm">
      <button onClick={onMenuClick} className="text-primary-foreground hover:opacity-80 transition-opacity">
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-2 text-primary-foreground font-bold text-lg">
        <img src={import.meta.env.VITE_APP_LOGO || "/logo.png"} alt="Logo" className="h-8 w-8 object-contain" />
        <span>{import.meta.env.VITE_APP_TITLE || "mLITE Indonesia"}</span>
      </div>

      <div className="flex-1" />

      <button className="relative text-primary-foreground hover:opacity-80 transition-opacity">
        <Bell className="h-5 w-5" />
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full text-[10px] flex items-center justify-center font-bold">
          1
        </span>
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 text-primary-foreground hover:opacity-80 transition-opacity outline-none">
            <div className="h-8 w-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            {/* <span className="text-sm font-medium hidden sm:block">{user?.kd_dokter || user?.username || 'DR001'}</span> */}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer">
            <Key className="mr-2 h-4 w-4" />
            <span>Ganti Password</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};
