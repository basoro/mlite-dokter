import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Stethoscope, 
  Activity, 
  Pill, 
  FlaskConical, 
  Radio, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  User, 
  Bot,
  Syringe,
  FileText
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface VisitHistoryCardProps {
  visit: any;
  type?: 'Ralan' | 'Ranap'; // Optional prop to filter display
}

export const VisitHistoryCard = ({ visit, type }: VisitHistoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Helper to format date
  const formatDate = (dateStr: string, timeStr: string) => {
    try {
      const date = new Date(`${dateStr}T${timeStr}`);
      return format(date, 'yyyy-MM-dd HH:mm:ss');
    } catch {
      return `${dateStr} ${timeStr}`;
    }
  };

  // Determine which data to use based on type
  // If type is not provided, fallback to combining both (though currently logic separates them in parent)
  
  const pemeriksaanRalan = visit.pemeriksaan_ralan || [];
  const pemeriksaanRanap = visit.pemeriksaan_ranap || [];
  
  // Filter pemeriksaan based on type if provided
  const pemeriksaan = type === 'Ralan' 
    ? pemeriksaanRalan 
    : type === 'Ranap' 
      ? pemeriksaanRanap 
      : [...pemeriksaanRalan, ...pemeriksaanRanap];

  // Debugging: Log data to check availability
  // console.log('Visit Card Debug:', { type, pemeriksaan, hasPemeriksaan: pemeriksaan.length > 0 });

  const hasPemeriksaan = pemeriksaan.length > 0;

  const hasResep = visit.pemberian_obat && visit.pemberian_obat.length > 0;
  const hasLab = visit.periksa_lab && visit.periksa_lab.length > 0;
  const hasRad = visit.periksa_radiologi && visit.periksa_radiologi.length > 0;
  
  // Combine actions based on type
  const tindakanRalan = [
    ...(visit.rawat_jl_dr || []),
    ...(visit.rawat_jl_pr || []),
    ...(visit.rawat_jl_drpr || [])
  ];
  
  const tindakanRanap = [
    ...(visit.rawat_inap_dr || []),
    ...(visit.rawat_inap_pr || []),
    ...(visit.rawat_inap_drpr || [])
  ];

  const tindakan = type === 'Ralan'
    ? tindakanRalan
    : type === 'Ranap'
      ? tindakanRanap
      : [...tindakanRalan, ...tindakanRanap];

  const hasTindakan = tindakan.length > 0;

  return (
    <Card className="mb-6 overflow-hidden border shadow-sm">
      {/* Header Info Bar */}
      <div className="bg-muted/30 p-3 md:p-4 border-b">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 items-start md:items-center">
          <div>
            <div className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold">No. Rawat</div>
            <div className="font-bold text-xs md:text-sm truncate">{visit.no_rawat}</div>
          </div>
          <div>
            <div className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold">Tanggal</div>
            <div className="font-medium text-xs md:text-sm truncate">{formatDate(visit.tgl_registrasi, visit.jam_reg)}</div>
          </div>
          <div>
            <div className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold">Poliklinik</div>
            <div className="font-medium text-xs md:text-sm uppercase truncate">{visit.nm_poli}</div>
          </div>
          <div className="col-span-2 md:col-span-1 flex justify-between items-center mt-1 md:mt-0">
            <div className="flex-1 min-w-0 mr-2">
              <div className="text-[10px] md:text-xs text-muted-foreground uppercase font-semibold">Dokter</div>
              <div className="font-medium text-xs md:text-sm truncate">{visit.nm_dokter}</div>
            </div>
            <Button variant="outline" size="sm" className="h-6 md:h-7 text-[10px] md:text-xs gap-1 shrink-0">
              <Bot className="h-3 w-3" /> <span className="hidden xs:inline">AI Scribe</span><span className="xs:hidden">AI</span>
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="p-0">
        {/* Pemeriksaan Section */}
        {hasPemeriksaan && (
          <div className="border-b">
            <div className="p-3 bg-muted/10 flex items-center gap-2 font-semibold text-sm">
              <Stethoscope className="h-4 w-4" />
              Pemeriksaan
            </div>
            <div className="p-4 space-y-6">
              {pemeriksaan.map((item: any, idx: number) => (
                <div key={idx} className="space-y-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(item.tgl_perawatan, item.jam_rawat)}</span>
                    <User className="h-3 w-3 ml-2" />
                    <span>{item.nama || 'Petugas'}</span>
                    {/* <span className="ml-auto text-xs">{visit.no_rawat}</span> */}
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 md:gap-8">
                    {/* Tanda Vital */}
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
                          <span className="font-medium">{item.suhu_tubuh || '-'} <span className="text-[10px] text-muted-foreground">°C</span></span>
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase text-muted-foreground font-semibold">GCS</span>
                          <span className="font-medium">{item.gcs || '-'}</span>
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase text-muted-foreground font-semibold">BB / TB</span>
                          <span className="font-medium">{item.berat || '-'} <span className="text-[10px] text-muted-foreground">kg</span> / {item.tinggi || '-'} <span className="text-[10px] text-muted-foreground">cm</span></span>
                        </div>
                      </div>
                    </div>

                    {/* SOAPIE */}
                    <div>
                      <h4 className="flex items-center gap-2 font-medium text-sm mb-3 text-primary">
                        <FileText className="h-4 w-4" /> SOAPIE
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex flex-col sm:grid sm:grid-cols-[100px_1fr] gap-1 sm:gap-4">
                          <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider sm:pt-0.5">Subjektif</span>
                          <span className="whitespace-pre-line bg-muted/5 text-foreground">{item.keluhan?.replace(/\\n/g, '\n') || '-'}</span>
                        </div>
                        <div className="flex flex-col sm:grid sm:grid-cols-[100px_1fr] gap-1 sm:gap-4">
                          <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider sm:pt-0.5">Objektif</span>
                          <span className="whitespace-pre-line bg-muted/5 text-foreground">{item.pemeriksaan?.replace(/\\n/g, '\n') || '-'}</span>
                        </div>
                        <div className="flex flex-col sm:grid sm:grid-cols-[100px_1fr] gap-1 sm:gap-4">
                          <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider sm:pt-0.5">Asesmen</span>
                          <span className="whitespace-pre-line bg-muted/5 text-foreground">{item.penilaian?.replace(/\\n/g, '\n') || '-'}</span>
                        </div>
                        <div className="flex flex-col sm:grid sm:grid-cols-[100px_1fr] gap-1 sm:gap-4">
                          <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider sm:pt-0.5">Plan</span>
                          <span className="whitespace-pre-line bg-muted/5 text-foreground">{item.rtl?.replace(/\\n/g, '\n') || '-'}</span>
                        </div>
                        {(item.instruksi && item.instruksi !== '-' && item.instruksi.trim() !== '') && (
                          <div className="flex flex-col sm:grid sm:grid-cols-[100px_1fr] gap-1 sm:gap-4">
                            <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider sm:pt-0.5">Instruksi</span>
                            <span className="whitespace-pre-line bg-muted/5 text-foreground">{item.instruksi?.replace(/\\n/g, '\n')}</span>
                          </div>
                        )}
                        {(item.evaluasi && item.evaluasi !== '-' && item.evaluasi.trim() !== '') && (
                          <div className="flex flex-col sm:grid sm:grid-cols-[100px_1fr] gap-1 sm:gap-4">
                            <span className="font-bold text-muted-foreground text-xs uppercase tracking-wider sm:pt-0.5">Evaluasi</span>
                            <span className="whitespace-pre-line bg-muted/5 text-foreground">{item.evaluasi?.replace(/\\n/g, '\n')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tindakan Section */}
        {hasTindakan && (
          <div className="border-b">
            <div className="p-3 bg-muted/10 flex items-center gap-2 font-semibold text-sm">
              <Syringe className="h-4 w-4" />
              Tindakan
            </div>
            <div className="p-4">
               <div className="grid grid-cols-1 gap-2">
                 {tindakan.map((act: any, idx: number) => (
                   <div key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                     <div className="font-medium">{act.nm_perawatan}</div>
                     <div className="text-muted-foreground text-xs">
                        {act.tgl_perawatan && act.jam_rawat ? `${act.tgl_perawatan} ${act.jam_rawat}` : '-'}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}

        {/* Resep Obat Section */}
        {hasResep && (
          <div className="border-b">
            <div className="p-3 bg-muted/10 flex items-center gap-2 font-semibold text-sm">
              <Pill className="h-4 w-4" />
              Resep Obat
            </div>
            <div className="p-4">
              <div className="text-xs text-muted-foreground mb-3 font-medium">
                Tanggal: {visit.pemberian_obat[0]?.tgl_perawatan} {visit.pemberian_obat[0]?.jam}
              </div>
              <div className="space-y-3">
                {visit.pemberian_obat.map((obat: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0 gap-2">
                    <div className="font-medium flex-1">
                      <span className="text-primary">{obat.nama_brng}</span>
                    </div>
                    <div className="flex items-center gap-8 text-muted-foreground text-xs sm:text-sm">
                      <div className="w-20">Jumlah: <span className="font-medium text-foreground">{obat.jml}</span></div>
                      <div className="w-40 text-right">Aturan: <span className="font-medium text-foreground">{obat.aturan || '-'}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Laboratorium Section */}
        {hasLab && (
          <div className="border-b">
            <div className="p-3 bg-muted/10 flex items-center gap-2 font-semibold text-sm">
              <FlaskConical className="h-4 w-4" />
              Laboratorium
            </div>
            <div className="p-4">
              {visit.periksa_lab.map((lab: any, idx: number) => (
                <div key={idx} className="mb-4 last:mb-0">
                  <div className="font-medium text-sm mb-2">{lab.nm_perawatan}</div>
                  <div className="text-xs text-muted-foreground">
                    Hasil: {lab.nilai} {lab.satuan} (N: {lab.nilai_rujukan}) - {lab.keterangan}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Radiologi Section */}
        {hasRad && (
          <div className="border-b last:border-0">
            <div className="p-3 bg-muted/10 flex items-center gap-2 font-semibold text-sm">
              <Radio className="h-4 w-4" />
              Radiologi
            </div>
            <div className="p-4">
              {visit.periksa_radiologi.map((rad: any, idx: number) => (
                <div key={idx} className="mb-4 last:mb-0">
                  <div className="font-medium text-sm mb-2">{rad.nm_perawatan}</div>
                  <div className="text-xs bg-muted p-2 rounded whitespace-pre-wrap font-mono">
                    {rad.hasil || 'Belum ada hasil'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};