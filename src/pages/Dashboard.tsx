import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats, fetchPasienAktif, fetchAntrianTerakhir, fetchPoliklinikHariIni } from '@/api/dashboard';
import { DataTable, Column } from '@/components/DataTable';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import { EmptyState } from '@/components/EmptyState';
import { BarChart3, Users, CalendarDays, Stethoscope, UserCheck, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const StatCard = ({
  icon: Icon,
  label,
  value,
  colorClass,
  bgClass,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  colorClass: string;
  bgClass: string;
}) => (
  <div className="bg-card rounded-xl border p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
    <div className={`h-14 w-14 rounded-xl ${bgClass} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`h-6 w-6 ${colorClass}`} />
    </div>
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
  });

  const { data: poliklinik } = useQuery({
    queryKey: ['poliklinik-hari-ini'],
    queryFn: fetchPoliklinikHariIni,
  });

  const { data: pasienAktif, isLoading: pasienLoading } = useQuery({
    queryKey: ['pasien-aktif'],
    queryFn: fetchPasienAktif,
  });

  const { data: antrianTerakhir, isLoading: antrianLoading } = useQuery({
    queryKey: ['antrian-terakhir'],
    queryFn: fetchAntrianTerakhir,
  });

  const pasienColumns: Column<Record<string, unknown>>[] = [
    { key: 'no', label: 'No', render: (_, i) => i + 1 },
    { key: 'nm_pasien', label: 'Nama Lengkap' },
    { key: 'kunjungan', label: 'Kunj' },
  ];

  const antrianColumns: Column<Record<string, unknown>>[] = [
    { key: 'no', label: 'No', render: (_, i) => i + 1 },
    { key: 'nm_pasien', label: 'Nama Lengkap' },
    {
      key: 'status',
      label: 'Status',
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground">
          {(item.status as string) || 'Menunggu'}
        </span>
      ),
    },
  ];

  const today = format(new Date(), 'dd/MM/yyyy', { locale: id });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold uppercase text-foreground">Dashboard Dokter</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Selamat datang kembali, selamat melayani pasien hari ini!
        </p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <CardSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Pasien" value={stats?.total_pasien ?? 0} bgClass="bg-stat-pink-bg" colorClass="text-stat-pink" />
          <StatCard icon={CalendarDays} label="Bulan Ini" value={stats?.bulan_ini ?? 0} bgClass="bg-stat-blue-bg" colorClass="text-stat-blue" />
          <StatCard icon={Stethoscope} label="Poli Bulan Ini" value={stats?.poli_bulan_ini ?? 0} bgClass="bg-stat-green-bg" colorClass="text-stat-green" />
          <StatCard icon={UserCheck} label="Poli Hari Ini" value={stats?.poli_hari_ini ?? 0} bgClass="bg-stat-orange-bg" colorClass="text-stat-orange" />
        </div>
      )}

      {/* Poliklinik Hari Ini */}
      <div className="bg-card rounded-xl border p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Poliklinik Hari Ini</h2>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{today}</span>
          </div>
        </div>
        {poliklinik?.data?.length > 0 ? (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={poliklinik.data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 100, // Increase bottom margin for rotated labels
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  angle={-45} 
                  textAnchor="end" 
                  interval={0} 
                  height={10} 
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} 
                />
                <YAxis 
                  label={{ value: 'Jumlah Pasien', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted) / 0.3)' }}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30}>
                  {poliklinik.data.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill="hsl(var(--primary) / 0.8)" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="Poliklinik dan Rawat Jalan" />
        )}
      </div>

      {/* Bottom tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-bold mb-3 text-foreground">Pasien Paling Aktif</h2>
          <DataTable columns={pasienColumns} data={pasienAktif?.data || []} isLoading={pasienLoading} />
        </div>
        <div>
          <h2 className="text-sm font-bold mb-3 text-foreground">Antrian 10 Pasien Terakhir</h2>
          <DataTable columns={antrianColumns} data={antrianTerakhir?.data || []} isLoading={antrianLoading} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
