import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  nama: string;
  kd_dokter: string;
  role: string;
  gender?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  password?: string | null; // Added password for permission headers
  isAuthenticated: boolean;
  login: (token: string, user: User, password?: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => {
  const storedToken = localStorage.getItem('mlite_token');
  const storedUser = localStorage.getItem('mlite_user');
  const storedPassword = localStorage.getItem('mlite_password'); // Retrieve password

  return {
    token: storedToken,
    user: storedUser ? JSON.parse(storedUser) : null,
    password: storedPassword, // Set initial password state
    isAuthenticated: !!storedToken,
    login: (token, user, password) => {
      localStorage.setItem('mlite_token', token);
      localStorage.setItem('mlite_user', JSON.stringify(user));
      if (password) {
        localStorage.setItem('mlite_password', password); // Store password
      }
      set({ token, user, password, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('mlite_token');
      localStorage.removeItem('mlite_user');
      localStorage.removeItem('mlite_password'); // Remove password
      set({ token: null, user: null, password: null, isAuthenticated: false });
    },
    setUser: (user) => {
      localStorage.setItem('mlite_user', JSON.stringify(user));
      set({ user });
    },
  };
});
