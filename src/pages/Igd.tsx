import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchIgd, fetchRiwayatPerawatan, fetchRiwayatKunjungan, RawatJalanParams } from '@/api/rawatJalan';
import { PatientDetail } from '@/components/rawat-jalan/PatientDetail';
import { DataTable, Column } from '@/components/DataTable';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Search, Filter, X, Clock, Calendar as CalendarIcon, ArrowRight, List, Ambulance } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { id } from 'date-fns/locale';
import { DateRange } from "react-day-picker";

const tabs = [
  { key: 'hari-ini', label: 'Semua Pasien', icon: Clock },
  { key: 'pasien-lanjutan', label: 'Pasien Lanjutan', icon: List },
];

const Igd = () => {
  const [activeTab, setActiveTab] = useState('hari-ini');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('semua');
  const [statusBayar, setStatusBayar] = useState('semua');
  const [page, setPage] = useState(0);
  const [debounced, setDebounced] = useState('');
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const [openGroups, setOpenGroups] = useState<Record<string, { noRawat: string; namaPasien: string }[]>>({});
  const [activePatientTab, setActivePatientTab] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<{ 
    no_rkm_medis: string; 
    no_rawat: string; 
    nama_pasien: string;
    // Add full item for flexibility
    [key: string]: any; 
  } | null>(null);

  const formattedDateFrom = date?.from ? format(date.from, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  const formattedDateTo = date?.to ? format(date.to, 'yyyy-MM-dd') : formattedDateFrom;

  // Determine actual dates and status based on active tab
  let effectiveDateFrom = formattedDateFrom;
  let effectiveDateTo = formattedDateTo;
  let effectiveStatus = status !== 'semua' ? status : undefined;

  if (activeTab === 'pasien-lanjutan') {
    // For Pasien Lanjutan: Date until yesterday, status must be 'belum'
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if current date selection is just "today" (default state)
    const isDefaultToday = date?.from && date?.to && 
                           format(date.from, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && 
                           format(date.to, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

    if (isDefaultToday) {
         // Default behavior: Show last 30 days until yesterday
         const thirtyDaysAgo = new Date(today);
         thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
         effectiveDateFrom = format(thirtyDaysAgo, 'yyyy-MM-dd');
         effectiveDateTo = format(yesterday, 'yyyy-MM-dd');
    } else {
         // User selected range: respect "from", but cap "to" at yesterday
         effectiveDateFrom = formattedDateFrom;
         
         const selectedTo = new Date(formattedDateTo);
         if (selectedTo > yesterday) {
             effectiveDateTo = format(yesterday, 'yyyy-MM-dd');
         } else {
             effectiveDateTo = formattedDateTo;
         }
    }
    
    // Force status to 'Belum' (Override user filter)
    effectiveStatus = 'belum';
  }

  // Debounce search
  const handleSearch = useCallback((val: string) => {
    setSearch(val);
    const timer = setTimeout(() => setDebounced(val), 300);
    return () => clearTimeout(timer);
  }, []);

  const params: RawatJalanParams = {
    draw: 1,
    start: page * 10,
    length: 10,
    tgl_awal: effectiveDateFrom,
    tgl_akhir: effectiveDateTo,
    search: debounced,
    filter: activeTab,
    status: activeTab === 'pasien-lanjutan' ? 'belum' : effectiveStatus, // Force 'belum' if pasien-lanjutan
    status_bayar: statusBayar !== 'semua' ? statusBayar : undefined,
    rujukan_internal: activeTab === 'rujukan-internal' ? true : undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['igd', params],
    queryFn: () => fetchIgd(params),
  });

  const { data: riwayatData, isLoading: isLoadingRiwayat } = useQuery({
    queryKey: ['riwayat-perawatan', selectedPatient?.no_rkm_medis, selectedPatient?.no_rawat],
    queryFn: () => {
      if (!selectedPatient) return null;
      // Remove slashes from no_rawat (e.g., 2026/02/26/000001 -> 20260226000001)
      const sanitizedNoRawat = selectedPatient.no_rawat.replace(/\//g, '');
      return fetchRiwayatPerawatan(selectedPatient.no_rkm_medis, sanitizedNoRawat);
    },
    enabled: !!selectedPatient && !!activePatientTab,
  });

  const { data: riwayatKunjungan, isLoading: isLoadingKunjungan } = useQuery({
    queryKey: ['riwayat-kunjungan', selectedPatient?.no_rkm_medis],
    queryFn: () => {
      if (!selectedPatient) return [];
      return fetchRiwayatKunjungan(selectedPatient.no_rkm_medis);
    },
    enabled: !!selectedPatient && !!activePatientTab,
  });

  const handleRowClick = (item: any) => {
    const noRawat = item.no_rawat;
    const noRkmMedis = item.no_rkm_medis;
    const namaPasien = item.nm_pasien;

    setOpenGroups((prev) => {
      const currentTabGroups = prev[activeTab] || [];
      const exists = currentTabGroups.some(g => g.noRawat === noRawat);
      
      if (!exists) {
        return {
          ...prev,
          [activeTab]: [...currentTabGroups, { noRawat, namaPasien, ...item }]
        };
      }
      return prev;
    });
    setActivePatientTab(noRawat);
    setSelectedPatient({ 
      no_rkm_medis: noRkmMedis, 
      no_rawat: noRawat, 
      nama_pasien: namaPasien,
      ...item // Spread all other item props
    });
  };

  const handleSubTabClick = (group: { noRawat: string; namaPasien: string; [key: string]: any }) => {
    setActivePatientTab(group.noRawat);
    
    // Check if we need to update selectedPatient based on the clicked tab
    // We need to find the full patient data from the original list if possible, or use what we stored
    // Since we spread ...item when adding to groups, group should have no_rkm_medis
    if (group.noRawat !== selectedPatient?.no_rawat) {
       setSelectedPatient({
         no_rkm_medis: group.no_rkm_medis || selectedPatient?.no_rkm_medis || '', // Fallback might be risky if switching patients
         no_rawat: group.noRawat,
         nama_pasien: group.namaPasien,
         ...group
       });
    }
  };

  const closePatientTab = (e: React.MouseEvent, noRawat: string) => {
    e.stopPropagation();
    setOpenGroups((prev) => {
      const currentTabGroups = prev[activeTab] || [];
      return {
        ...prev,
        [activeTab]: currentTabGroups.filter(g => g.noRawat !== noRawat)
      };
    });
    if (activePatientTab === noRawat) {
      setActivePatientTab(null);
      setSelectedPatient(null);
    }
  };

  const currentOpenGroups = openGroups[activeTab] || [];

  const columns: Column<Record<string, unknown>>[] = [
    { key: 'no_reg', label: 'No. Reg' },
    { key: 'no_rkm_medis', label: 'No. RM' },
    { key: 'no_rawat', label: 'Nomor Rawat' },
    { key: 'nm_pasien', label: 'Nama Pasien' },
    { key: 'umur', label: 'Umur' },
    { key: 'jk', label: 'L/P' },
    { key: 'nm_dokter', label: 'Dokter' },
    { key: 'nm_poli', label: 'Poliklinik' },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
          {(item.stts as string) || '-'}
        </span>
      ),
    },
    { key: 'png_jawab', label: 'Asuransi' },
    { key: 'tgl_registrasi', label: 'Tanggal Registrasi' },
    {
      key: 'status_bayar',
      label: 'Status Bayar',
      render: (item) => (
        <span className={cn(
          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
          (item.status_bayar as string) === 'Sudah Bayar' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
        )}>
          {(item.status_bayar as string) || '-'}
        </span>
      ),
    },
  ];

  const clearFilters = () => {
    setSearch('');
    setDebounced('');
    setStatus('semua');
    setStatusBayar('semua');
    setPage(0);
  };

  const totalRecords = data?.recordsFiltered ?? 0;
  const totalPages = Math.ceil(totalRecords / 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Ambulance className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Pasien IGD</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Pasien yang mendapatkan pelayanan gawat darurat
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(0); setActivePatientTab(null); }}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors border-b-2',
                activeTab === tab.key
                  ? 'border-primary text-primary bg-card'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Patient Tabs (Sub-tabs) */}
      {currentOpenGroups.length > 0 && (
        <div className="flex flex-wrap gap-2 pb-2">
          {currentOpenGroups.map((group) => (
            <button
              key={group.noRawat}
              onClick={() => handleSubTabClick(group)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-colors border',
                activePatientTab === group.noRawat
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/50'
              )}
            >
              <Users className="h-3 w-3" />
              <span className="truncate max-w-[150px]">{group.namaPasien}</span>
              <span 
                onClick={(e) => closePatientTab(e, group.noRawat)}
                className={cn(
                  "ml-1 rounded-full p-0.5 transition-all",
                  activePatientTab === group.noRawat 
                    ? "hover:bg-primary-foreground/20" 
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                <X className="h-3 w-3" />
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
        {!activePatientTab ? (
          <>
            <h2 className="text-base font-bold text-foreground">Daftar Pasien IGD Hari Ini</h2>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-[200px] max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari pasien..."
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "dd LLL y", { locale: id })} -{" "}
                            {format(date.to, "dd LLL y", { locale: id })}
                          </>
                        ) : (
                          format(date.from, "dd LLL y", { locale: id })
                        )
                      ) : (
                        <span>Pilih periode tanggal</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status</SelectItem>
                  <SelectItem value="belum">Belum</SelectItem>
                  <SelectItem value="sudah">Sudah</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusBayar} onValueChange={setStatusBayar}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Status Bayar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semua">Semua Status Bayar</SelectItem>
                  <SelectItem value="sudah-bayar">Sudah Bayar</SelectItem>
                  <SelectItem value="belum-bayar">Belum Bayar</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-4 w-4" />
                Filter
              </Button>

              <Button variant="outline" size="sm" onClick={clearFilters} className="gap-1.5 text-muted-foreground">
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>

            {/* Table */}
            <DataTable 
              columns={columns} 
              data={data?.data || []} 
              isLoading={isLoading} 
              emptyMessage="Tidak ada data IGD"
              onRowClick={handleRowClick}
            />

              {/* Pagination */}
              <div className="flex items-center justify-between pt-2">
                <p className="text-xs text-muted-foreground">
                  Menampilkan {page * 10 + 1}-{Math.min((page + 1) * 10, totalRecords)} dari {totalRecords}
                </p>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                    Prev
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                    Next
                  </Button>
                </div>
              </div>
          </>
        ) : (
          <div className="space-y-4">
             {selectedPatient && (
               <PatientDetail 
                 patient={selectedPatient}
                 riwayatData={riwayatData}
                 isLoading={isLoadingRiwayat}
                 riwayatKunjungan={riwayatKunjungan}
                 isLoadingKunjungan={isLoadingKunjungan}
               />
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Igd;
