import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Save, Plus, Trash2, Pill, FlaskConical } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { saveObat } from '@/api/rawatJalan';

// Schema for regular medicine
const obatItemSchema = z.object({
  kode_brng: z.string().min(1, 'Kode obat wajib diisi'),
  jml: z.string().min(1, 'Jumlah wajib diisi').default('1'),
  aturan_pakai: z.string().optional(),
});

const formObatSchema = z.object({
  obatList: z.array(obatItemSchema).min(1, "Minimal satu obat"),
  tgl_perawatan: z.string().optional(),
  jam_rawat: z.string().optional(),
});

// Schema for compounded medicine (Racikan)
const racikanDetailSchema = z.object({
  kode_brng: z.string().min(1, 'Kode obat wajib diisi'),
  kandungan: z.string().min(1, 'Kandungan wajib diisi'),
  jml: z.string().min(1, 'Jumlah wajib diisi'),
});

const racikanItemSchema = z.object({
  nama_racik: z.string().min(1, 'Nama racikan wajib diisi'),
  kd_racik: z.string().min(1, 'Metode racik wajib diisi'), // e.g., R01 (Puyer), R02 (Kapsul)
  jml_dr: z.string().min(1, 'Jumlah wajib diisi').default('10'),
  aturan_pakai: z.string().optional(),
  keterangan: z.string().optional(),
  detail: z.array(racikanDetailSchema).min(1, "Minimal satu obat penyusun"),
});

const formRacikanSchema = z.object({
  racikanList: z.array(racikanItemSchema).min(1, "Minimal satu racikan"),
  tgl_perawatan: z.string().optional(),
  jam_rawat: z.string().optional(),
});

interface InputResepProps {
  noRawat: string;
  type?: 'ralan' | 'ranap';
  onSuccess?: () => void;
}

// Sub-component for managing racikan ingredients
const RacikanIngredients = ({ nestIndex, control, register }: { nestIndex: number, control: any, register: any }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `racikanList.${nestIndex}.detail`,
  });

  return (
    <div className="bg-muted/30 p-3 rounded-md mt-2">
      <div className="text-xs font-semibold mb-2 flex items-center gap-2">
        <FlaskConical className="h-3 w-3" /> Komposisi / Bahan
      </div>
      <div className="space-y-2">
        {fields.map((item, k) => (
          <div key={item.id} className="grid grid-cols-[1fr_80px_80px_auto] gap-2 items-center">
            <Input 
              {...register(`racikanList.${nestIndex}.detail.${k}.kode_brng`)} 
              placeholder="Kode Obat" 
              className="h-8 text-xs" 
            />
            <Input 
              {...register(`racikanList.${nestIndex}.detail.${k}.kandungan`)} 
              placeholder="Mg" 
              className="h-8 text-xs" 
            />
            <Input 
              {...register(`racikanList.${nestIndex}.detail.${k}.jml`)} 
              placeholder="Jml" 
              className="h-8 text-xs" 
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-700"
              onClick={() => remove(k)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs h-7 w-full border-dashed"
          onClick={() => append({ kode_brng: '', kandungan: '', jml: '' })}
        >
          <Plus className="h-3 w-3 mr-1" /> Tambah Bahan
        </Button>
      </div>
    </div>
  );
};

export const InputResep = ({ noRawat, type = 'ralan', onSuccess }: InputResepProps) => {
  const queryClient = useQueryClient();

  // Form for Regular Obat
  const formObat = useForm<z.infer<typeof formObatSchema>>({
    resolver: zodResolver(formObatSchema),
    defaultValues: {
      obatList: [{ kode_brng: '', jml: '1', aturan_pakai: '' }],
      tgl_perawatan: format(new Date(), 'yyyy-MM-dd'),
      jam_rawat: format(new Date(), 'HH:mm:ss'),
    },
  });

  const { fields: fieldsObat, append: appendObat, remove: removeObat } = useFieldArray({
    control: formObat.control,
    name: "obatList",
  });

  // Form for Racikan
  const formRacikan = useForm<z.infer<typeof formRacikanSchema>>({
    resolver: zodResolver(formRacikanSchema),
    defaultValues: {
      racikanList: [{ 
        nama_racik: '', 
        kd_racik: '', 
        jml_dr: '10', 
        aturan_pakai: '', 
        keterangan: '',
        detail: [{ kode_brng: '', kandungan: '', jml: '' }] 
      }],
      tgl_perawatan: format(new Date(), 'yyyy-MM-dd'),
      jam_rawat: format(new Date(), 'HH:mm:ss'),
    },
  });

  const { fields: fieldsRacikan, append: appendRacikan, remove: removeRacikan } = useFieldArray({
    control: formRacikan.control,
    name: "racikanList",
  });

  const mutationObat = useMutation({
    mutationFn: async (values: z.infer<typeof formObatSchema>) => {
      const promises = values.obatList.map((item) => {
        const payload = {
          no_rawat: noRawat,
          tgl_perawatan: values.tgl_perawatan,
          jam: values.jam_rawat,
          ...item,
        };
        return saveObat(payload, type);
      });
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success('Data obat berhasil disimpan');
      queryClient.invalidateQueries({ queryKey: ['obat-pasien'] });
      formObat.reset({
        obatList: [{ kode_brng: '', jml: '1', aturan_pakai: '' }],
        tgl_perawatan: format(new Date(), 'yyyy-MM-dd'),
        jam_rawat: format(new Date(), 'HH:mm:ss'),
      });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error(error);
      toast.error('Gagal menyimpan data obat');
    },
  });

  const mutationRacikan = useMutation({
    mutationFn: async (values: z.infer<typeof formRacikanSchema>) => {
      // Logic for saving racikan is more complex: typically involves a master record then details
      // Assuming a similar API structure or one that accepts the whole object
      // If the API requires separate calls, we'd need to adapt.
      // For now, let's assume we can post the structure or we'd need a specific saveRacikan API
      console.log("Saving racikan:", values);
      // Placeholder: Implement actual save logic based on specific endpoint requirements for racikan
      // This often involves: /rawat_jalan/saveracikan (master) -> returns ID -> then save ingredients
      throw new Error("API racikan belum diimplementasikan sepenuhnya");
    },
    onSuccess: () => {
      toast.success('Data racikan berhasil disimpan');
      queryClient.invalidateQueries({ queryKey: ['racikan-pasien'] });
      formRacikan.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error(error);
      toast.error('Gagal menyimpan data racikan');
    },
  });

  const onSubmitObat = (values: z.infer<typeof formObatSchema>) => {
    mutationObat.mutate(values);
  };

  const onSubmitRacikan = (values: z.infer<typeof formRacikanSchema>) => {
    mutationRacikan.mutate(values);
  };

  return (
    <Card className="border-t-4 border-t-primary shadow-sm mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-base font-bold">Input Resep Obat</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="umum" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="umum">Obat Umum</TabsTrigger>
            <TabsTrigger value="racikan">Obat Racikan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="umum">
            <Form {...formObat}>
              <form onSubmit={formObat.handleSubmit(onSubmitObat)} className="space-y-4">
                {fieldsObat.map((field, index) => (
                  <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_80px_1fr_auto] gap-4 items-end border-b pb-4 last:border-0">
                    <FormField
                      control={formObat.control}
                      name={`obatList.${index}.kode_brng`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Kode Obat</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: B001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={formObat.control}
                      name={`obatList.${index}.jml`}
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
                      control={formObat.control}
                      name={`obatList.${index}.aturan_pakai`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Aturan Pakai</FormLabel>
                          <FormControl>
                            <Input placeholder="Contoh: 3x1 Sesudah Makan" {...field} />
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
                      onClick={() => removeObat(index)}
                      disabled={fieldsObat.length === 1}
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
                    onClick={() => appendObat({ kode_brng: '', jml: '1', aturan_pakai: '' })}
                    className="text-primary hover:text-primary-foreground hover:bg-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Obat
                  </Button>

                  <Button 
                    type="submit" 
                    disabled={mutationObat.isPending}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {mutationObat.isPending ? 'Menyimpan...' : 'Simpan Resep'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="racikan">
            <Form {...formRacikan}>
              <form onSubmit={formRacikan.handleSubmit(onSubmitRacikan)} className="space-y-4">
                {fieldsRacikan.map((field, index) => (
                  <div key={field.id} className="border rounded-md p-4 bg-muted/10 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => removeRacikan(index)}
                      disabled={fieldsRacikan.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                      <FormField
                        control={formRacikan.control}
                        name={`racikanList.${index}.nama_racik`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Nama Racikan</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: Puyer Batuk" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formRacikan.control}
                        name={`racikanList.${index}.kd_racik`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Metode Racik</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: R01 (Puyer)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                      <FormField
                        control={formRacikan.control}
                        name={`racikanList.${index}.jml_dr`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Jumlah</FormLabel>
                            <FormControl>
                              <Input type="number" min="1" placeholder="10" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formRacikan.control}
                        name={`racikanList.${index}.aturan_pakai`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Aturan Pakai</FormLabel>
                            <FormControl>
                              <Input placeholder="Contoh: 3x1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={formRacikan.control}
                        name={`racikanList.${index}.keterangan`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Keterangan</FormLabel>
                            <FormControl>
                              <Input placeholder="Ket. Tambahan" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Ingredients Sub-form */}
                    <RacikanIngredients 
                      nestIndex={index} 
                      control={formRacikan.control} 
                      register={formRacikan.register} 
                    />
                  </div>
                ))}

                <div className="flex justify-between items-center pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendRacikan({ 
                      nama_racik: '', 
                      kd_racik: '', 
                      jml_dr: '10', 
                      aturan_pakai: '', 
                      keterangan: '',
                      detail: [{ kode_brng: '', kandungan: '', jml: '' }] 
                    })}
                    className="text-primary hover:text-primary-foreground hover:bg-primary"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Racikan
                  </Button>

                  <Button 
                    type="submit" 
                    disabled={mutationRacikan.isPending}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {mutationRacikan.isPending ? 'Menyimpan...' : 'Simpan Racikan'}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
