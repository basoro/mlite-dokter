import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { savePemeriksaan, saveTindakan } from '@/api/rawatJalan';

const formSchema = z.object({
  tensi: z.string().optional(),
  nadi: z.string().optional(),
  suhu: z.string().optional(),
  respirasi: z.string().optional(),
  berat: z.string().optional(),
  tinggi: z.string().optional(),
  gcs: z.string().optional(),
  lingkar_perut: z.string().optional(),
  alergi: z.string().optional(),
  keluhan: z.string().optional(),
  pemeriksaan: z.string().optional(),
  penilaian: z.string().optional(),
  rtl: z.string().optional(),
  instruksi: z.string().optional(),
  evaluasi: z.string().optional(),
  spo2: z.string().optional(),
});

interface InputPemeriksaanProps {
  noRawat: string;
  noRkmMedis: string;
  type?: 'ralan' | 'ranap' | 'igd';
  onSuccess?: () => void;
}

export const InputPemeriksaan = ({ noRawat, noRkmMedis, type = 'ralan', onSuccess, initialData, onCancel }: InputPemeriksaanProps & { initialData?: any, onCancel?: () => void }) => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tensi: initialData?.tensi || '',
      nadi: initialData?.nadi || '',
      suhu: initialData?.suhu || '',
      respirasi: initialData?.respirasi || '',
      berat: initialData?.berat || '',
      tinggi: initialData?.tinggi || '',
      gcs: initialData?.gcs || '',
      lingkar_perut: initialData?.lingkar_perut || '',
      alergi: initialData?.alergi || '-',
      keluhan: initialData?.keluhan || '',
      pemeriksaan: initialData?.pemeriksaan || '',
      penilaian: initialData?.penilaian || '',
      rtl: initialData?.rtl || '',
      instruksi: initialData?.instruksi || '',
      evaluasi: initialData?.evaluasi || '',
      spo2: initialData?.spo2 || '',
    },
  });

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        tensi: initialData.tensi || '',
        nadi: initialData.nadi || '',
        suhu: initialData.suhu || '',
        respirasi: initialData.respirasi || '',
        berat: initialData.berat || '',
        tinggi: initialData.tinggi || '',
        gcs: initialData.gcs || '',
        lingkar_perut: initialData.lingkar_perut || '',
        alergi: initialData.alergi || '-',
        keluhan: initialData.keluhan || '',
        pemeriksaan: initialData.pemeriksaan || '',
        penilaian: initialData.penilaian || '',
        rtl: initialData.rtl || '',
        instruksi: initialData.instruksi || '',
        evaluasi: initialData.evaluasi || '',
        spo2: initialData.spo2 || '',
      });
    }
  }, [initialData, form]);

  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      const payload = {
        no_rawat: noRawat,
        tgl_perawatan: initialData ? initialData.date : format(new Date(), 'yyyy-MM-dd'),
        jam_rawat: initialData ? initialData.time : format(new Date(), 'HH:mm:ss'),
        suhu_tubuh: values.suhu, // Map 'suhu' to 'suhu_tubuh' for API
        kesadaran: 'Compos Mentis', // Adding a default as it seems required in some endpoints
        nip: '-', // Providing a default nip if needed
        ...values,
      };
      return savePemeriksaan(payload, type);
    },
    onSuccess: () => {
      toast.success(initialData ? 'Data pemeriksaan berhasil diperbarui' : 'Data pemeriksaan berhasil disimpan');
      queryClient.invalidateQueries({ queryKey: ['riwayat-perawatan'] });
      queryClient.invalidateQueries({ queryKey: ['rawat-inap'] });
      queryClient.invalidateQueries({ queryKey: ['rawat-jalan'] });
      if (!initialData) form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error(error);
      toast.error('Gagal menyimpan data pemeriksaan');
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-sm mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-base font-bold">
          {initialData ? 'Edit Pemeriksaan (SOAP)' : 'Input Pemeriksaan (SOAP)'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Tanda Vital & Fisik */}
            <div>
              <h3 className="text-sm font-semibold text-green-600 mb-4 uppercase tracking-wide">Tanda Vital & Fisik</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="tensi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Tensi (mmHg)</FormLabel>
                      <FormControl>
                        <Input placeholder="120/80" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nadi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Nadi (/menit)</FormLabel>
                      <FormControl>
                        <Input placeholder="80" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="suhu"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Suhu (°C)</FormLabel>
                      <FormControl>
                        <Input placeholder="36.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="respirasi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Respirasi (/menit)</FormLabel>
                      <FormControl>
                        <Input placeholder="20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="berat"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Berat (kg)</FormLabel>
                      <FormControl>
                        <Input placeholder="60" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tinggi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Tinggi (cm)</FormLabel>
                      <FormControl>
                        <Input placeholder="170" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gcs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">GCS</FormLabel>
                      <FormControl>
                        <Input placeholder="456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lingkar_perut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Lingkar Perut (cm)</FormLabel>
                      <FormControl>
                        <Input placeholder="-" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="spo2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">SpO2 (%)</FormLabel>
                      <FormControl>
                        <Input placeholder="98" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-4">
                 <FormField
                  control={form.control}
                  name="alergi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Alergi</FormLabel>
                      <FormControl>
                        <Input placeholder="Riwayat alergi..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* SOAP Detail */}
            <div>
              <h3 className="text-sm font-semibold text-green-600 mb-4 uppercase tracking-wide">SOAPIE Detail</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="keluhan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Keluhan (Subjektif)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Keluhan pasien..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pemeriksaan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Pemeriksaan (Objektif)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Hasil pemeriksaan fisik..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="penilaian"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Penilaian (Asesmen)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Diagnosa/Masalah..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="rtl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Rencana (Plan)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Rencana terapi/tindakan..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="instruksi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Instruksi (Instruction)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Instruksi..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="evaluasi"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Evaluasi (Evaluation)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Evaluasi..." className="min-h-[80px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                {initialData && onCancel && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      form.reset();
                      onCancel();
                    }}
                    type="button"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Batal Edit
                  </Button>
                )}
                <Button 
                  onClick={form.handleSubmit(onSubmit)} 
                  disabled={mutation.isPending}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {mutation.isPending ? 'Menyimpan...' : 'Simpan Pemeriksaan'}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
