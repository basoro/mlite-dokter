import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { saveTindakan } from '@/api/rawatJalan';

const tindakanItemSchema = z.object({
  kd_jenis_prw: z.string().min(1, 'Kode tindakan wajib diisi'),
  jml_tindakan: z.string().min(1, 'Jumlah wajib diisi').default('1'),
  kode_provider: z.string().optional(),
});

const formSchema = z.object({
  tindakanList: z.array(tindakanItemSchema).min(1, "Minimal satu tindakan"),
  provider: z.string().optional(),
  tgl_perawatan: z.string().optional(),
  jam_rawat: z.string().optional(),
});

interface InputTindakanProps {
  noRawat: string;
  type?: 'ralan' | 'ranap';
  onSuccess?: () => void;
}

export const InputTindakan = ({ noRawat, type = 'ralan', onSuccess }: InputTindakanProps) => {
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tindakanList: [
        {
          kd_jenis_prw: '',
          jml_tindakan: '1',
          kode_provider: '-',
        }
      ],
      provider: type === 'ranap' ? 'rawat_in_dr' : 'rawat_jl_dr',
      tgl_perawatan: format(new Date(), 'yyyy-MM-dd'),
      jam_rawat: format(new Date(), 'HH:mm:ss'),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tindakanList",
  });

  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const promises = values.tindakanList.map((item) => {
        const payload = {
          kat: 'tindakan',
          no_rawat: noRawat,
          tgl_perawatan: values.tgl_perawatan,
          jam_rawat: values.jam_rawat,
          provider: values.provider,
          ...item,
        };
        return saveTindakan(payload, type);
      });
      
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success('Data tindakan berhasil disimpan');
      queryClient.invalidateQueries({ queryKey: ['tindakan-pasien'] });
      form.reset({
        tindakanList: [
          {
            kd_jenis_prw: '',
            jml_tindakan: '1',
            kode_provider: '-',
          }
        ],
        provider: type === 'ranap' ? 'rawat_in_dr' : 'rawat_jl_dr',
        tgl_perawatan: format(new Date(), 'yyyy-MM-dd'),
        jam_rawat: format(new Date(), 'HH:mm:ss'),
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error(error);
      toast.error('Gagal menyimpan data tindakan');
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-sm mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-base font-bold">Input Tindakan</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_100px_1fr_auto] gap-4 items-end border-b pb-4 last:border-0">
                <FormField
                  control={form.control}
                  name={`tindakanList.${index}.kd_jenis_prw`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Kode Tindakan</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: T001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name={`tindakanList.${index}.jml_tindakan`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Jumlah</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`tindakanList.${index}.kode_provider`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Kode Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: D00001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 mb-0.5"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex justify-between items-center pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ kd_jenis_prw: '', jml_tindakan: '1', kode_provider: '-' })}
                className="text-primary hover:text-primary-foreground hover:bg-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Baris
              </Button>

              <Button 
                type="submit" 
                disabled={mutation.isPending}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                {mutation.isPending ? 'Menyimpan...' : 'Simpan Tindakan'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
