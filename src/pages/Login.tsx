import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loginApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Stethoscope, Loader2, KeyRound, ArrowLeft, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { parseJwt } from '@/lib/utils';
import apiClient from '@/api/client';
import WhatsappOtpService from '@/services/whatsappOtp';
import OtpInput from 'react-otp-input';

const Login = () => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ username: '', password: '' });
  
  // OTP States
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [tempLoginData, setTempLoginData] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessingOtp, setIsProcessingOtp] = useState(false);

  // ... (rest of the logic remains the same)

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: async (data) => {
      let user = data.user;
      
      if (!user) {
        // If user object is not returned directly, try to parse from token
        const decoded = parseJwt(data.token);
        if (decoded) {
          user = {
            id: decoded.sub || '1',
            username: decoded.username || form.username,
            nama: data.fullname || decoded.username || form.username,
            kd_dokter: decoded.kd_dokter || decoded.username || form.username, // Fallback to username if kd_dokter not in token
            role: decoded.role || 'dokter', // Fallback if not in token
            gender: decoded.gender || 'L',
          };
        } else {
           // Fallback if parsing fails
           user = {
            id: '1',
            username: form.username,
            nama: data.fullname || form.username,
            kd_dokter: form.username, // Fallback to username
            role: 'dokter',
            gender: 'L',
          };
        }
      }

      // OTP Flow
      const requireOtp = import.meta.env.VITE_REQUIRE_OTP === 'true';

      if (!requireOtp) {
         login(data.token, user, form.password);
         toast.success('Login berhasil!');
         navigate('/dashboard');
         return;
      }

      setIsProcessingOtp(true);
      try {
        // We need to set the token temporarily for the next requests because it's not in the store yet
        // Create a temporary client config or just pass headers explicitly
        const authHeaders = {
            Authorization: `Bearer ${data.token}`,
            'X-Username-Permission': user?.kd_dokter || user?.username || form.username,
            'X-Password-Permission': form.password
        };

        // Fetch doctor data to get phone number
        const docResponse = await apiClient.get(`/master/list/dokter/?s=${user?.kd_dokter || user?.username || form.username}&col=kd_dokter`, { headers: authHeaders });
        const doctors = docResponse.data?.data || (Array.isArray(docResponse.data) ? docResponse.data : []);
        const doctor = doctors.find((d: any) => d.kd_dokter === user?.kd_dokter || d.kd_dokter === user?.username);
        console.log('Doctor Data:', docResponse);

        if (doctor && doctor.no_telp) {
          const phone = doctor.no_telp;
          setPhoneNumber(phone);

          // Send OTP
          const otpResult = await WhatsappOtpService.sendOTP(phone, user?.username || form.username);

          if (otpResult.success) {
            // Save OTP to DB
            try {
              await apiClient.post('/master/save/mlite_users', {
                id: user?.id,
                otp_code: otpResult.otp,
                otp_expires: otpResult.expiresAt
              }, { headers: authHeaders });
            } catch (saveError) {
              console.warn('Failed to save OTP to DB, but proceeding with local verification', saveError);
            }

            setTempLoginData({ token: data.token, user, password: form.password });
            setOtpStep(true);
            toast.success(`Kode OTP telah dikirim ke WhatsApp ${phone}`);
          } else {
            toast.error('Gagal mengirim OTP WhatsApp');
          }
        } else {
          if (user?.role === 'dokter' || !user?.role) {
             toast.error('Nomor WhatsApp tidak ditemukan. Hubungi IT.');
          } else {
             login(data.token, user, form.password);
             toast.success('Login berhasil!');
             navigate('/dashboard');
          }
        }
      } catch (error) {
        console.error('OTP Process Error:', error);
        toast.error('Terjadi kesalahan saat memproses OTP.');
      } finally {
        setIsProcessingOtp(false);
      }
    },
    onError: () => {
      toast.error('Login gagal. Periksa kembali kredensial Anda.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempLoginData) return;

    try {
      const result = await WhatsappOtpService.verifyOTP(phoneNumber, tempLoginData.user.username, otp);
      if (result.success) {
        login(tempLoginData.token, tempLoginData.user, tempLoginData.password);
        toast.success('Login berhasil!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Kode OTP salah atau kadaluarsa');
      }
    } catch (error) {
      toast.error('Verifikasi gagal');
    }
  };

  const handleResendOtp = async () => {
    if (!phoneNumber || !tempLoginData) return;
    try {
      const otpResult = await WhatsappOtpService.sendOTP(phoneNumber, tempLoginData.user.username);
      if (otpResult.success) {
        toast.success('OTP baru telah dikirim');
      } else {
        toast.error('Gagal mengirim ulang OTP');
      }
    } catch {
      toast.error('Gagal mengirim ulang OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-xl overflow-hidden animate-fade-in">
          
          {/* Header with Logo */}
          {!otpStep && (
            <div className="bg-primary p-8 text-center text-primary-foreground">
                <div className="mx-auto w-24 h-24 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                  <img src={import.meta.env.VITE_APP_LOGO || "/logo.png"} alt={`Logo ${import.meta.env.VITE_APP_TITLE || "mLITE Indonesia"}`} className="h-22 w-22 object-contain" />
                </div>
                <h1 className="text-2xl font-bold">{import.meta.env.VITE_APP_TITLE || "mLITE Indonesia"}</h1>
              <p className="text-primary-foreground/80 text-sm mt-1">Silahkan Login Terlebih Dahulu</p>
            </div>
          )}

          {otpStep && (
            <div className="bg-[#4CAF50] p-8 text-center text-white">
              <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <img src={import.meta.env.VITE_APP_LOGO || "/logo-barabai.png"} alt="Logo" className="h-10 w-10 object-contain" onError={(e) => {
                    // Fallback if image not found
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield-check"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>';
                }} />
              </div>
              <h1 className="text-2xl font-bold">{import.meta.env.VITE_APP_TITLE || "mLITE Indonesia"}</h1>
              <p className="text-white/90 text-sm mt-1">Verifikasi OTP WhatsApp</p>
            </div>
          )}

          <div className="p-8">
            {!otpStep ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Masukkan username"
                    className="h-11"
                    required
                    disabled={isProcessingOtp}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-xs text-primary hover:underline">Lupa password?</a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Masukkan password"
                    className="h-11"
                    required
                    disabled={isProcessingOtp}
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base font-medium" disabled={mutation.isPending || isProcessingOtp}>
                  {mutation.isPending || isProcessingOtp ? (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  ) : null}
                  {isProcessingOtp ? 'Memproses OTP...' : 'Masuk Aplikasi'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6 animate-in slide-in-from-right">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 text-[#4CAF50] bg-green-50 rounded-full flex items-center justify-center">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Masukkan kode OTP 6 digit yang telah dikirim ke WhatsApp
                    </p>
                    <p className="text-lg font-bold text-[#4CAF50]">{phoneNumber}</p>
                  </div>
                </div>
                
                <div className="flex justify-center py-2">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    numInputs={6}
                    renderSeparator={<span className="w-2"></span>}
                    renderInput={(props) => (
                      <input 
                        {...props} 
                        className="w-10 h-12 text-center text-xl border rounded-md focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] outline-none transition-all bg-background"
                      />
                    )}
                    inputType="tel"
                    shouldAutoFocus
                  />
                </div>

                <div className="space-y-3">
                  <Button type="submit" className="w-full h-11 bg-[#4CAF50] hover:bg-[#43A047] text-white">
                    Verifikasi OTP
                  </Button>
                  
                  <div className="flex justify-between items-center text-sm pt-2">
                    <button 
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#4CAF50] hover:underline font-medium"
                    >
                      Kirim Ulang OTP
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => {
                        setOtpStep(false);
                        setOtp('');
                        setTempLoginData(null);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Kembali ke Login
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
          
          {/* Footer */}
          <div className="bg-muted/30 p-4 text-center border-t">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} {import.meta.env.VITE_APP_TITLE || "mLITE Indonesia"}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
