import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Calendar, MapPin, Phone, Activity, FileText, ClipboardList, Stethoscope, Pill, FlaskConical, Radio, BedDouble, ArrowRightLeft, Thermometer, Heart, Wind, Weight, Ruler, Clock, Droplets, Copy, Edit, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisitHistoryCard } from './VisitHistoryCard';
import { InputPemeriksaan } from './InputPemeriksaan';
import { InputTindakan } from '@/components/rawat-jalan/InputTindakan';
import { InputResep } from './InputResep';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';

import { useQuery } from '@tanstack/react-query';
import { fetchRiwayatPerawatan, fetchTindakanPasien, fetchObatPasien, fetchRacikanPasien } from '@/api/rawatJalan';

interface DiagnosaPasien {
  kd_penyakit: string;
  nm_penyakit: string;
  prioritas: number;
}

interface RegPeriksa {
  no_rawat: string;
  tgl_registrasi: string; 
  nm_dokter: string;
  nm_poli: string;
  status_lanjut: string;
  diagnosa_pasien: DiagnosaPasien[];
  pemeriksaan_ralan?: any;
  pemeriksaan_ranap?: any;
}

interface RiwayatKunjunganResponse {
  status: string;
  data: {
    settings: any;
    pasien: any;
    reg_periksa: RegPeriksa[];
  };
}

interface PatientDetailProps {
  patient: any;
  riwayatData: any;
  isLoading: boolean;
  riwayatKunjungan: RiwayatKunjunganResponse | null;
  isLoadingKunjungan: boolean;
}

const TindakanContent = ({ noRawat, statusLanjut }: { noRawat: string, statusLanjut: string }) => {
  const type = statusLanjut === 'Ranap' || statusLanjut === 'Rawat Inap' ? 'ranap' : 'ralan';
  
  const { data: tindakan, isLoading } = useQuery({
    queryKey: ['tindakan-pasien', noRawat, type],
    queryFn: async () => {
      const res = await fetchTindakanPasien(noRawat, type);
      console.log('Tindakan Raw Response:', JSON.stringify(res, null, 2));
      return res;
    },
    enabled: !!noRawat
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center text-muted-foreground">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p>Memuat data tindakan...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <InputTindakan noRawat={noRawat} type={type} />
      <Card>
      <CardContent className="p-0 md:p-4">
        {tindakan && tindakan.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              {tindakan.map((item: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4 hover:bg-muted/5 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium text-primary">{item.nm_perawatan}</div>
                    <div className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                      {item.kd_jenis_prw}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3" />
                      <span>{item.nm_dokter || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span>{item.tgl_perawatan} {item.jam_rawat}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-3 w-3" />
                      <span>Biaya: Rp {parseInt(item.biaya_rawat || 0).toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 flex justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10 m-4">
            Tidak ada data tindakan
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

const ResepContent = ({ noRawat, statusLanjut }: { noRawat: string, statusLanjut: string }) => {
  const type = statusLanjut === 'Ranap' || statusLanjut === 'Rawat Inap' ? 'ranap' : 'ralan';

  const { data: obat, isLoading: isLoadingObat } = useQuery({
    queryKey: ['obat-pasien', noRawat, type],
    queryFn: async () => {
      const res = await fetchObatPasien(noRawat, type);
      console.log('Obat Raw Response:', JSON.stringify(res, null, 2));
      return res;
    },
    enabled: !!noRawat
  });

  const { data: racikan, isLoading: isLoadingRacikan } = useQuery({
    queryKey: ['racikan-pasien', noRawat, type],
    queryFn: async () => {
      const res = await fetchRacikanPasien(noRawat, type);
      console.log('Racikan Raw Response:', JSON.stringify(res, null, 2));
      return res;
    },
    enabled: !!noRawat
  });

  const isLoading = isLoadingObat || isLoadingRacikan;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex flex-col items-center justify-center text-muted-foreground">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
          <p>Memuat data resep...</p>
        </CardContent>
      </Card>
    );
  }

  // Extract data safely
  const listObat = Array.isArray(obat) ? obat : [];
  const listRacikan = Array.isArray(racikan) ? racikan : [];
  
  // Helper to group by no_resep
  const groupByNoResep = (list: any[]) => {
    if (!Array.isArray(list)) return {};
    return list.reduce((acc: any, item: any) => {
      const noResep = item.no_resep || 'Tanpa No. Resep';
      if (!acc[noResep]) {
        acc[noResep] = [];
      }
      acc[noResep].push(item);
      return acc;
    }, {});
  };

  const groupedObat = groupByNoResep(listObat);
  const groupedRacikan = groupByNoResep(listRacikan);

  return (
    <div className="space-y-6">
      <InputResep noRawat={noRawat} type={type} />
      <Card>
        <CardContent className="p-0 md:p-4">
          {((listObat && listObat.length > 0) || (listRacikan && listRacikan.length > 0)) ? (
            <Tabs defaultValue="non-racikan" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="non-racikan">
                  <Pill className="h-4 w-4 mr-2" />
                  Obat Non-Racikan
                </TabsTrigger>
                <TabsTrigger value="racikan">
                  <FlaskConical className="h-4 w-4 mr-2" />
                  Obat Racikan
                </TabsTrigger>
              </TabsList>

              <TabsContent value="non-racikan">
                {Object.keys(groupedObat).length > 0 ? (
                  Object.keys(groupedObat).map((noResep) => (
                    <div key={noResep} className="mb-6 last:mb-0">
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded uppercase">
                          No. Resep: {noResep}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {groupedObat[noResep][0]?.tgl_peresepan ? `${groupedObat[noResep][0].tgl_peresepan} ${groupedObat[noResep][0].jam_peresepan}` : ''}
                        </div>
                      </div>
                      <div className="bg-white border rounded-lg p-6 space-y-6 shadow-sm font-mono">
                        {groupedObat[noResep].map((item: any, idx: number) => (
                          <div key={idx} className="border-b border-dashed border-gray-200 pb-4 last:border-0 last:pb-0">
                            <div className="text-lg font-medium text-foreground flex items-baseline gap-2">
                              <span className="font-bold italic text-xl">R/</span> 
                              <span>{item.nama_brng}</span>
                              <span className="ml-auto font-bold">No. {item.jml}</span>
                            </div>
                            <div className="pl-8 mt-1 text-muted-foreground italic font-medium">
                              S. {item.aturan_pakai || '-'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 flex justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10 m-4">
                    Tidak ada data obat non-racikan
                  </div>
                )}
              </TabsContent>

              <TabsContent value="racikan">
                {Object.keys(groupedRacikan).length > 0 ? (
                  Object.keys(groupedRacikan).map((noResep) => (
                    <div key={noResep} className="mb-6 last:mb-0">
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <div className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded uppercase">
                          No. Resep: {noResep}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {groupedRacikan[noResep][0]?.tgl_peresepan ? `${groupedRacikan[noResep][0].tgl_peresepan} ${groupedRacikan[noResep][0].jam_peresepan}` : ''}
                        </div>
                      </div>
                      <div className="bg-white border rounded-lg p-6 space-y-6 shadow-sm font-mono">
                        {groupedRacikan[noResep].map((item: any, idx: number) => (
                          <div key={idx} className="border-b border-dashed border-gray-200 pb-4 last:border-0 last:pb-0">
                            <div className="text-lg font-medium text-foreground flex items-baseline gap-2">
                              <span className="font-bold italic text-xl">R/</span> 
                              <span>{item.nama_racik}</span>
                              <span className="text-sm text-muted-foreground font-normal">({item.kd_racik})</span>
                              <span className="ml-auto font-bold">No. {item.jml_dr}</span>
                            </div>
                            <div className="pl-8 mt-1 text-muted-foreground italic font-medium">
                              S. {item.aturan_pakai || '-'}
                            </div>
                            {item.keterangan && (
                              <div className="pl-8 mt-1 text-xs text-muted-foreground">
                                Ket: {item.keterangan}
                              </div>
                            )}
                            
                            {/* Detail Racikan if available */}
                            {item.detail_racikan && Array.isArray(item.detail_racikan) && (
                              <div className="pl-8 mt-3">
                                <div className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Komposisi:</div>
                                <ul className="space-y-1">
                                  {item.detail_racikan.map((detail: any, dIdx: number) => (
                                    <li key={dIdx} className="text-sm text-muted-foreground flex justify-between border-b border-dotted border-gray-100 pb-1 last:border-0">
                                      <span>{detail.nama_brng}</span>
                                      <span className="font-mono text-xs bg-muted/30 px-1.5 py-0.5 rounded">{detail.kandungan} mg</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                   <div className="py-12 flex justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10 m-4">
                    Tidak ada data obat racikan
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="py-12 flex justify-center text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10 m-4">
              Tidak ada data resep obat
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export const PatientDetail = ({ patient, riwayatData, isLoading, riwayatKunjungan, isLoadingKunjungan }: PatientDetailProps) => {
  const [editingData, setEditingData] = useState<any>(null);
  
  // Helper to extract data safely from riwayatData if it exists
  // Assuming riwayatData might contain patient details too
  const patientDetails = riwayatData?.data?.pasien || patient;

  console.log('Patient Details:', patientDetails); // Debugging
  
  // Extract visit history from response structure
  // Based on console log: response.data.reg_periksa is the array of visits
  // If riwayatKunjungan is the whole response object (including status, data), we might need to access .data
  const visitHistory = riwayatKunjungan?.data?.reg_periksa || (Array.isArray(riwayatKunjungan) ? riwayatKunjungan : []);

  console.log('Processed Visit History:', visitHistory); // Debugging

  // Filter history data
  // Logic updated: 
  // - Tab Rawat Jalan shows visits that are 'Ralan' OR 'Ranap' visits that have 'pemeriksaan_ralan' data.
  // - Tab Rawat Inap shows visits that are 'Ranap'.
  const rawatJalanHistory = Array.isArray(visitHistory) 
    ? visitHistory.filter((item: any) => 
        item.status_lanjut === 'Ralan' || 
        (item.status_lanjut === 'Ranap' && item.pemeriksaan_ralan && item.pemeriksaan_ralan.length > 0)
      ) 
    : [];
    
  const rawatInapHistory = Array.isArray(visitHistory) 
    ? visitHistory.filter((item: any) => item.status_lanjut === 'Ranap') 
    : [];
  
  // Sanitize no_rawat for API call
  const encodedNoRawat = patient.no_rawat ? encodeURIComponent(patient.no_rawat) : '';

  const { data: localRiwayatPerawatan, isLoading: isLoadingLocal } = useQuery({
    queryKey: ['riwayat-perawatan', patient.no_rkm_medis, encodedNoRawat],
    queryFn: () => fetchRiwayatPerawatan(patient.no_rkm_medis, encodedNoRawat),
    enabled: !!patient.no_rkm_medis && !!encodedNoRawat && !riwayatData
  });

  const pemeriksaanData = riwayatData || localRiwayatPerawatan;
  
  // Debugging logs
  console.log('Riwayat Data (Prop):', JSON.stringify(riwayatData, null, 2));
  console.log('Local Riwayat Data:', JSON.stringify(localRiwayatPerawatan, null, 2));
  console.log('Pemeriksaan Data (Combined):', JSON.stringify(pemeriksaanData, null, 2));
  if (pemeriksaanData) {
    console.log('pemeriksaan_ralan:', JSON.stringify(pemeriksaanData.pemeriksaan_ralan || pemeriksaanData.data?.pemeriksaan_ralan, null, 2));
    console.log('pemeriksaan_ranap:', JSON.stringify(pemeriksaanData.pemeriksaan_ranap || pemeriksaanData.data?.pemeriksaan_ranap, null, 2));
  }

  const isLoadingPemeriksaan = isLoading || isLoadingLocal;

  // Group SOAPI by date and time
  const groupSOAPIByDateTime = (data: any) => {
    if (!data) return [];
    
    let allRalan: any[] = [];
    let allRanap: any[] = [];

    // Helper to extract arrays from a visit object
    const extractFromVisit = (visit: any) => {
        if (visit.pemeriksaan_ralan && Array.isArray(visit.pemeriksaan_ralan)) {
            allRalan.push(...visit.pemeriksaan_ralan);
        }
        if (visit.pemeriksaan_ranap && Array.isArray(visit.pemeriksaan_ranap)) {
            allRanap.push(...visit.pemeriksaan_ranap);
        }
    };

    // Strategy 1: Check for reg_periksa array in data.data (Standard API response)
    if (data.data?.reg_periksa && Array.isArray(data.data.reg_periksa)) {
        data.data.reg_periksa.forEach(extractFromVisit);
    } 
    // Strategy 2: Check for reg_periksa array in root (Unwrapped response)
    else if (data.reg_periksa && Array.isArray(data.reg_periksa)) {
        data.reg_periksa.forEach(extractFromVisit);
    }
    
    // Strategy 3: Check for direct arrays in data.data (Alternative structure)
    if (data.data?.pemeriksaan_ralan && Array.isArray(data.data.pemeriksaan_ralan)) {
        allRalan.push(...data.data.pemeriksaan_ralan);
    }
    if (data.data?.pemeriksaan_ranap && Array.isArray(data.data.pemeriksaan_ranap)) {
        allRanap.push(...data.data.pemeriksaan_ranap);
    }

    // Strategy 4: Check for direct arrays in root (Unwrapped alternative)
    if (data.pemeriksaan_ralan && Array.isArray(data.pemeriksaan_ralan)) {
        allRalan.push(...data.pemeriksaan_ralan);
    }
    if (data.pemeriksaan_ranap && Array.isArray(data.pemeriksaan_ranap)) {
        allRanap.push(...data.pemeriksaan_ranap);
    }
    
    // Deduplicate based on ID if available
    const uniqueRalan = Array.from(new Map(allRalan.map(item => [item.id ? `id-${item.id}` : `rand-${Math.random()}`, item])).values());
    const uniqueRanap = Array.from(new Map(allRanap.map(item => [item.id ? `id-${item.id}` : `rand-${Math.random()}`, item])).values());

    // Helper to format SOAPI items
    const processItems = (items: any[], type: 'Ralan' | 'Ranap') => {
      if (!Array.isArray(items)) return [];
      
      return items.map(item => {
        // Construct date object
        const dateStr = item.tgl_perawatan || item.tgl_registrasi || '';
        const timeStr = item.jam_rawat || '';
        const dateTimeStr = dateStr && timeStr ? `${dateStr}T${timeStr}` : dateStr;
        
        return {
          date: dateStr,
          time: timeStr,
          dateTime: dateTimeStr,
          type,
          keluhan: item.keluhan || '-',
          pemeriksaan: item.pemeriksaan || '-',
          penilaian: item.penilaian || '-',
          rtl: item.rtl || '-',
          instruksi: item.instruksi || '-',
          evaluasi: item.evaluasi || '-',
          diagnosa: item.diagnosa || '-', // Sometimes diagnosa is inline? If not, check global diagnosa
          alergi: item.alergi || '-',
          suhu: item.suhu_tubuh,
          tensi: item.tensi,
          nadi: item.nadi,
          respirasi: item.respirasi,
          tinggi: item.tinggi,
          berat: item.berat,
          kesadaran: item.kesadaran || item.gcs, // Fallback to GCS if kesadaran is empty or use both
          gcs: item.gcs,
          spo2: item.spo2 || (item.pemeriksaan?.match(/SpO2\s*:\s*(\d+)%?/i)?.[1]) || '-',
          // Add specialist info if available - Prioritize 'nama'
          petugas: item.nama ? item.nama : (item.nm_dokter ? item.nm_dokter : (item.nip ? item.nip : '-')),
          // Raw object just in case
          raw: item
        };
      });
    };

    // Ensure we are accessing arrays, fallback to empty array if property missing
    const ralanItems = processItems(uniqueRalan, 'Ralan');
    const ranapItems = processItems(uniqueRanap, 'Ranap');
    
    // Merge and sort
    const allItems = [...ralanItems, ...ranapItems].sort((a, b) => {
      // Sort descending (newest first)
      if (a.dateTime && b.dateTime) {
        return new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime();
      }
      return 0;
    });

    return allItems;
  };

  const soapiHistory = groupSOAPIByDateTime(pemeriksaanData);

  // Prepare Chart Data from soapiHistory (Current Visit)
  const chartData = soapiHistory
    .map((item: any) => {
      const tensi = item.tensi || "0/0";
      const [systolic, diastolic] = tensi.split('/').map((v: string) => parseInt(v, 10) || 0);
      const spo2Val = item.spo2 !== '-' ? item.spo2 : 0;
      
      return {
        date: item.dateTime, // Use full datetime for precision
        displayDate: `${item.date} ${item.time}`,
        systolic,
        diastolic,
        nadi: parseInt(item.nadi, 10) || 0,
        suhu: parseFloat(item.suhu) || 0,
        respirasi: parseInt(item.respirasi, 10) || 0,
        spo2: parseInt(spo2Val, 10) || 0,
      };
    })
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartConfig = {
    systolic: {
      label: "Sistolik",
      color: "hsl(217.2 91.2% 59.8%)", // Blue
    },
    diastolic: {
      label: "Diastolik",
      color: "hsl(221.2 83.2% 53.3%)", // Darker Blue
    },
    nadi: {
      label: "Nadi",
      color: "hsl(346.8 77.2% 49.8%)", // Pink/Red
    },
    suhu: {
      label: "Suhu",
      color: "hsl(24.6 95% 53.1%)", // Orange
    },
    respirasi: {
      label: "Respirasi",
      color: "hsl(142.1 76.2% 36.3%)", // Green
    },
    spo2: {
      label: "SpO2",
      color: "hsl(262.1 83.3% 57.8%)", // Violet
    },
  };
  
  const InfoItem = ({ icon: Icon, label, value, className }: { icon: any, label: string, value: string | React.ReactNode, className?: string }) => (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-medium text-sm pl-6">{value || '-'}</div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Patient Data Card */}
      <Card>
        <CardHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="hidden md:block text-lg flex items-center gap-2">
              <CardTitle className="font-bold">Data Pasien</CardTitle>
            </div>
            <div className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
              No. Rawat: <span className="text-foreground">{patient.no_rawat}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div className="space-y-6">
              <InfoItem 
                icon={User} 
                label="Nama" 
                value={<span className="font-bold text-lg">{patient.nama_pasien}</span>} 
              />
              <InfoItem 
                icon={FileText} 
                label="No. RM" 
                value={<span className="font-mono text-base font-bold tracking-wide">{patient.no_rkm_medis}</span>} 
              />
              <InfoItem 
                icon={Calendar} 
                label="Tanggal Lahir" 
                value={patientDetails?.tgl_lahir || '-'} 
              />
              <InfoItem 
                icon={User} 
                label="Jenis Kelamin" 
                value={patientDetails?.jk === 'L' ? 'Laki-laki' : patientDetails?.jk === 'P' ? 'Perempuan' : '-'} 
              />
            </div>
            <div className="space-y-6">
              <InfoItem 
                icon={MapPin} 
                label="Alamat" 
                value={patientDetails?.alamat || '-'} 
              />
              <InfoItem 
                icon={Phone} 
                label="Telepon" 
                value={patientDetails?.no_tlp || '-'} 
              />
              <InfoItem 
                icon={Activity} 
                label="Golongan Darah" 
                value={patientDetails?.gol_darah || '-'} 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="kunjungan" className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full justify-start h-auto p-1 bg-transparent gap-2">
            <TabsTrigger 
              value="kunjungan" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-4 py-2 h-auto gap-2 border bg-card hover:bg-muted/50 transition-all"
            >
              <ArrowRightLeft className="h-4 w-4" />
              Kunjungan
            </TabsTrigger>
            <TabsTrigger 
              value="pemeriksaan" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-4 py-2 h-auto gap-2 border bg-card hover:bg-muted/50 transition-all"
            >
              <Stethoscope className="h-4 w-4" />
              Pemeriksaan
            </TabsTrigger>
            <TabsTrigger 
              value="tindakan" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-4 py-2 h-auto gap-2 border bg-card hover:bg-muted/50 transition-all"
            >
              <ClipboardList className="h-4 w-4" />
              Tindakan
            </TabsTrigger>
            <TabsTrigger 
              value="resep" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-4 py-2 h-auto gap-2 border bg-card hover:bg-muted/50 transition-all"
            >
              <Pill className="h-4 w-4" />
              Resep
            </TabsTrigger>
            <TabsTrigger 
              value="laboratorium" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-4 py-2 h-auto gap-2 border bg-card hover:bg-muted/50 transition-all"
            >
              <FlaskConical className="h-4 w-4" />
              Laboratorium
            </TabsTrigger>
            <TabsTrigger 
              value="radiologi" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md px-4 py-2 h-auto gap-2 border bg-card hover:bg-muted/50 transition-all"
            >
              <Radio className="h-4 w-4" />
              Radiologi
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Kunjungan Content */}
        <TabsContent value="kunjungan" className="mt-4 space-y-4">
          <Tabs defaultValue="rawat-jalan" className="w-full">
            <TabsList className="grid w-full max-w-[400px] grid-cols-2">
              <TabsTrigger value="rawat-jalan" className="gap-2">
                <User className="h-4 w-4" />
                Rawat Jalan
              </TabsTrigger>
              <TabsTrigger value="rawat-inap" className="gap-2">
                <BedDouble className="h-4 w-4" />
                Rawat Inap
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="rawat-jalan" className="mt-4">
              {isLoadingKunjungan ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                  <p>Memuat data riwayat...</p>
                </div>
              ) : rawatJalanHistory.length > 0 ? (
                <div className="space-y-4">
                  {rawatJalanHistory.map((visit: any, idx: number) => (
                    <VisitHistoryCard key={idx} visit={visit} type="Ralan" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                  <p>Tidak ada data kunjungan rawat jalan</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="rawat-inap" className="mt-4">
              {isLoadingKunjungan ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                  <p>Memuat data riwayat...</p>
                </div>
              ) : rawatInapHistory.length > 0 ? (
                <div className="space-y-4">
                  {rawatInapHistory.map((visit: any, idx: number) => (
                    <VisitHistoryCard key={idx} visit={visit} type="Ranap" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                  <p>Tidak ada data kunjungan rawat inap</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Other Tabs Placeholders */}
        <TabsContent value="pemeriksaan">
          <Card className="border-0 md:border">
            <CardContent className="p-0 my-6 md:p-4">
              {isLoadingPemeriksaan ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
                  <p>Memuat data pemeriksaan...</p>
                </div>
              ) : pemeriksaanData ? (
                (() => {
                  const pemeriksaan = pemeriksaanData.pemeriksaan_ralan?.[0] || pemeriksaanData.pemeriksaan_ranap?.[0] || {};
                  const diagnosa = pemeriksaanData.diagnosa_pasien || [];
                  const prosedur = pemeriksaanData.tindakan_ralan || pemeriksaanData.tindakan_ranap || [];
                  const obat = pemeriksaanData.detail_pemberian_obat || [];
                  // groupSOAPIByDateTime is now defined at component level
                  const soapiHistory = groupSOAPIByDateTime(pemeriksaanData);
                  const latestTTV = soapiHistory.length > 0 ? soapiHistory[0] : {} as any;
                  
                  // Determine visit type
                  let visitType: 'ralan' | 'ranap' | 'igd' = 'ralan';
                  if (patient.status_lanjut === 'Ranap' || patient.status === 'Ranap' || patient.nm_poli === 'Rawat Inap' || patient.nm_bangsal) {
                    visitType = 'ranap';
                  } else if (patient.nm_poli?.includes('IGD') || patient.kd_poli === 'IGD') {
                    visitType = 'igd';
                  }

                  return (
                    <div className="space-y-6">
                      {/* Input Pemeriksaan Form */}
                      <InputPemeriksaan 
                        noRawat={patient.no_rawat} 
                        noRkmMedis={patient.no_rkm_medis}
                        type={visitType}
                        initialData={editingData}
                        onSuccess={() => setEditingData(null)}
                        onCancel={() => setEditingData(null)}
                      />

                      {/* TTV Cards */}
                      <div className="text-base font-bold text-foreground">Tanda-Tanda Vital Terbaru</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Activity className="h-5 w-5 text-primary mb-2" />
                            <span className="text-xs text-muted-foreground uppercase font-bold">Tensi</span>
                            <span className="text-lg font-bold text-foreground">{latestTTV.tensi || '-'}</span>
                            <span className="text-xs text-muted-foreground">mmHg</span>
                          </CardContent>
                        </Card>
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Heart className="h-5 w-5 text-rose-500 mb-2" />
                            <span className="text-xs text-muted-foreground uppercase font-bold">Nadi</span>
                            <span className="text-lg font-bold text-foreground">{latestTTV.nadi || '-'}</span>
                            <span className="text-xs text-muted-foreground">x/menit</span>
                          </CardContent>
                        </Card>
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Wind className="h-5 w-5 text-sky-500 mb-2" />
                            <span className="text-xs text-muted-foreground uppercase font-bold">Respirasi</span>
                            <span className="text-lg font-bold text-foreground">{latestTTV.respirasi || '-'}</span>
                            <span className="text-xs text-muted-foreground">x/menit</span>
                          </CardContent>
                        </Card>
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Thermometer className="h-5 w-5 text-orange-500 mb-2" />
                            <span className="text-xs text-muted-foreground uppercase font-bold">Suhu</span>
                            <span className="text-lg font-bold text-foreground">{latestTTV.suhu || '-'}</span>
                            <span className="text-xs text-muted-foreground">°C</span>
                          </CardContent>
                        </Card>
                        <Card className="bg-primary/5 border-primary/20">
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <Droplets className="h-5 w-5 text-indigo-500 mb-2" />
                            <span className="text-xs text-muted-foreground uppercase font-bold">SpO2</span>
                            <span className="text-lg font-bold text-foreground">{latestTTV.spo2 || '-'}</span>
                            <span className="text-xs text-muted-foreground">%</span>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Charts */}
                      {chartData.length > 0 && (
                        <Card className="border-0 md:border w-full">
                          <CardHeader className="p-0 md:p-6 mb-4 md:mb-0">
                            <CardTitle className="text-base">Grafik Tanda-Tanda Vital</CardTitle>
                            <CardDescription>Riwayat Sistolik, Diastolik, Nadi, Respirasi, SPO2 dan Suhu</CardDescription>
                          </CardHeader>
                          <CardContent className="p-0 md:p-6">
                            <div className="h-[250px] md:h-[300px] w-full -ml-4 md:ml-0">
                              <ChartContainer config={chartConfig} className="h-full w-full">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="fillSystolic" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-systolic)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--color-systolic)" stopOpacity={0.1}/>
                                  </linearGradient>
                                  <linearGradient id="fillDiastolic" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-diastolic)" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="var(--color-diastolic)" stopOpacity={0.1}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="date" 
                                  tickLine={false} 
                                  axisLine={false} 
                                  tickMargin={8} 
                                  tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                                  }}
                                />
                                {/* Left Axis for BP & Pulse */}
                                <YAxis yAxisId="left" orientation="left" stroke="var(--color-systolic)" tickLine={false} axisLine={false} />
                                {/* Right Axis for Temp & Resp */}
                                <YAxis yAxisId="right" orientation="right" stroke="var(--color-suhu)" tickLine={false} axisLine={false} domain={[0, 60]} />
                                
                                <ChartTooltip 
                                  content={
                                    <ChartTooltipContent 
                                      labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString('id-ID', {
                                          day: 'numeric',
                                          month: 'short',
                                          year: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        });
                                      }} 
                                    />
                                  } 
                                />
                                
                                {/* BP, Pulse & SpO2 on Left Axis */}
                                <Area yAxisId="left" type="monotone" dataKey="systolic" stroke="var(--color-systolic)" fillOpacity={1} fill="url(#fillSystolic)" name="Sistolik" />
                                <Area yAxisId="left" type="monotone" dataKey="diastolic" stroke="var(--color-diastolic)" fillOpacity={1} fill="url(#fillDiastolic)" name="Diastolik" />
                                <Area yAxisId="left" type="monotone" dataKey="nadi" stroke="var(--color-nadi)" fillOpacity={0.1} fill="var(--color-nadi)" name="Nadi" strokeDasharray="5 5" />
                                <Area yAxisId="left" type="monotone" dataKey="spo2" stroke="var(--color-spo2)" fill="none" strokeWidth={2} name="SpO2" strokeDasharray="3 3" />
                                
                                {/* Temp & Resp on Right Axis */}
                                <Area yAxisId="right" type="monotone" dataKey="suhu" stroke="var(--color-suhu)" fill="none" strokeWidth={2} name="Suhu" />
                                <Area yAxisId="right" type="monotone" dataKey="respirasi" stroke="var(--color-respirasi)" fill="none" strokeWidth={2} name="Respirasi" />
                                
                                <Legend content={<ChartLegendContent className="flex-wrap gap-2 text-[12px]" />} />
                              </AreaChart>
                            </ChartContainer>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      <div className="grid grid-cols-1 gap-3 md:gap-6">
                        {/* Riwayat SOAPI */}
                        <Card className="border-0 md:border h-full w-full">
                          <CardHeader className="p-0 md:p-6">
                            <CardTitle className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-primary" />
                              Riwayat TTV dan SOAPIE
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 md:space-y-6 p-0 md:p-4 my-6 md:my-0">
                            {soapiHistory.length > 0 ? (
                              soapiHistory.map((item: any, idx: number) => (
                                <div key={idx} className="border rounded-lg p-3 md:p-6 space-y-4">
                                  {/* Header matching VisitHistoryCard style */}
                                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b pb-4">
                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3" />
                                      <span>{item.date} {item.time}</span>
                                      <span className="hidden md:inline text-muted-foreground/50">|</span>
                                      <User className="h-3 w-3" />
                                      <span>{item.petugas}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       <div className="flex items-center gap-1 mr-2">
                                         <button 
                                           className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-primary transition-colors"
                                           title="Salin SOAP"
                                           onClick={() => setEditingData({ ...item, date: format(new Date(), 'yyyy-MM-dd'), time: format(new Date(), 'HH:mm:ss') })}
                                         >
                                           <Copy className="h-3.5 w-3.5" />
                                         </button>
                                         <button 
                                           className="p-1.5 hover:bg-muted rounded-full text-muted-foreground hover:text-primary transition-colors"
                                           title="Edit SOAP"
                                           onClick={() => setEditingData(item)}
                                         >
                                           <Edit className="h-3.5 w-3.5" />
                                         </button>
                                         <button 
                                           className="p-1.5 hover:bg-red-50 rounded-full text-muted-foreground hover:text-red-600 transition-colors"
                                           title="Hapus SOAP"
                                           onClick={() => {
                                             if (confirm('Apakah Anda yakin ingin menghapus data pemeriksaan ini?')) {
                                               // TODO: Implement delete functionality
                                               console.log('Delete item:', item);
                                             }
                                           }}
                                         >
                                           <Trash2 className="h-3.5 w-3.5" />
                                         </button>
                                       </div>
                                       <div className={cn(
                                         "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                                         item.type === 'Ranap' ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
                                       )}>
                                         {item.type === 'Ranap' ? 'Rawat Inap' : 'Rawat Jalan'}
                                       </div>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 md:gap-8">
                                    {/* Left Column: Tanda Vital */}
                                    <div className="bg-muted/10 rounded-lg h-fit">
                                      <h4 className="flex items-center gap-2 font-medium text-sm mb-3 text-primary">
                                        <Activity className="h-4 w-4" /> Tanda Vital 
                                      </h4>
                                      
                                      <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div className="flex flex-col">
                                          <span className="text-[10px] uppercase text-muted-foreground font-semibold">TD</span>
                                          <span className="font-medium">{item.tensi || '-'} <span className="text-[10px] text-muted-foreground">mmHg</span></span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[10px] uppercase text-muted-foreground font-semibold">Nadi</span>
                                          <span className="font-medium">{item.nadi || '-'} <span className="text-[10px] text-muted-foreground">x/m</span></span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[10px] uppercase text-muted-foreground font-semibold">RR</span>
                                          <span className="font-medium">{item.respirasi || '-'} <span className="text-[10px] text-muted-foreground">x/m</span></span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[10px] uppercase text-muted-foreground font-semibold">Suhu</span>
                                          <span className="font-medium">{item.suhu || '-'} <span className="text-[10px] text-muted-foreground">°C</span></span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[10px] uppercase text-muted-foreground font-semibold">SpO2</span>
                                          <span className="font-medium">{item.spo2 || '-'} <span className="text-[10px] text-muted-foreground">%</span></span>
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[10px] uppercase text-muted-foreground font-semibold">GCS</span>
                                          <span className="font-medium">{item.gcs || '-'}</span>
                                        </div>
                                        <div className="flex flex-col col-span-2">
                                          <span className="text-[10px] uppercase text-muted-foreground font-semibold">BB / TB</span>
                                          <span className="font-medium">{item.berat || '-'} <span className="text-[10px] text-muted-foreground">kg</span> / {item.tinggi || '-'} <span className="text-[10px] text-muted-foreground">cm</span></span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Right Column: SOAPIE */}
                                    <div>
                                      <h4 className="flex items-center gap-2 font-medium text-sm mb-3 text-primary">
                                        <FileText className="h-4 w-4" /> SOAPIE
                                      </h4>

                                      <div className="space-y-3 text-sm">
                                        <div className="flex flex-col sm:grid sm:grid-cols-[100px_1fr] gap-1 sm:gap-4">
                                          <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider sm:pt-0.5">Subjektif</span>
                                          <span className="whitespace-pre-line bg-muted/5 text-foreground p-2 rounded">{item.keluhan ? item.keluhan.replace(/\\n/g, '\n') : '-'}</span>
                                        </div>

                                        <div className="flex flex-col sm:grid sm:grid-cols-[100px_1fr] gap-1 sm:gap-4">
                                          <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider sm:pt-0.5">Objektif</span>
                                          <span className="whitespace-pre-line bg-muted/5 text-foreground p-2 rounded">{item.pemeriksaan ? item.pemeriksaan.replace(/\\n/g, '\n') : '-'}</span>
                                        </div>

                                        <div className="flex flex-col sm:grid sm:grid-cols-[100px_1fr] gap-1 sm:gap-4">
                                          <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider sm:pt-0.5">Asesmen</span>
                                          <span className="whitespace-pre-line bg-muted/5 text-foreground p-2 rounded">{item.penilaian ? item.penilaian.replace(/\\n/g, '\n') : '-'}</span>
                                        </div>

                                        <div className="flex flex-col sm:grid sm:grid-cols-[100px_1fr] gap-1 sm:gap-4">
                                          <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider sm:pt-0.5">Plan</span>
                                          <span className="whitespace-pre-line bg-muted/5 text-foreground p-2 rounded">{item.rtl ? item.rtl.replace(/\\n/g, '\n') : '-'}</span>
                                        </div>

                                        {(item.instruksi && item.instruksi !== '-' && item.instruksi.trim() !== '') && (
                                          <div className="flex flex-col sm:grid sm:grid-cols-[100px_1fr] gap-1 sm:gap-4">
                                            <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider sm:pt-0.5">Instruksi</span>
                                            <span className="whitespace-pre-line bg-muted/5 text-foreground p-2 rounded">{item.instruksi.replace(/\\n/g, '\n')}</span>
                                          </div>
                                        )}

                                        {(item.evaluasi && item.evaluasi !== '-' && item.evaluasi.trim() !== '') && (
                                          <div className="flex flex-col sm:grid sm:grid-cols-[100px_1fr] gap-1 sm:gap-4">
                                            <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider sm:pt-0.5">Evaluasi</span>
                                            <span className="whitespace-pre-line bg-muted/5 text-foreground p-2 rounded">{item.evaluasi.replace(/\\n/g, '\n')}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                               <div className="text-center py-8 text-muted-foreground">
                                 Belum ada data riwayat SOAPI
                               </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="flex justify-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/10">
                  Data pemeriksaan tidak ditemukan
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="tindakan">
          <TindakanContent noRawat={patient.no_rawat} statusLanjut={patient.status_lanjut || patient.status} />
        </TabsContent>
        <TabsContent value="resep">
          <ResepContent noRawat={patient.no_rawat} statusLanjut={patient.status_lanjut || patient.status} />
        </TabsContent>
        <TabsContent value="laboratorium">
          <Card>
            <CardContent className="py-12 flex justify-center text-muted-foreground">
              Konten Laboratorium akan ditampilkan di sini
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="radiologi">
          <Card>
            <CardContent className="py-12 flex justify-center text-muted-foreground">
              Konten Radiologi akan ditampilkan di sini
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};