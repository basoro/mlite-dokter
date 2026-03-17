import apiClient from './client';

export const fetchDashboardStats = async () => {
  try {
    const today = new Date();
    const currentMonth = today.toISOString().slice(0, 7); // YYYY-MM
    const todayDate = today.toISOString().slice(0, 10); // YYYY-MM-DD
    
    // Calculate last day of month
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const currentMonthEnd = `${currentMonth}-${lastDayOfMonth}`;

    // 1. Total Pasien
    const totalPasienRes = await apiClient.get('/pasien/list');
    // console.log('totalPasienRes', JSON.stringify(totalPasienRes, null, 2));
    const totalPasien = totalPasienRes.data.data.length || 0;

    // 2. Bulan Ini (Semua Pasien Rawat Jalan di bulan ini)
    const bulanIniRes = await apiClient.get(`/rawat_jalan/list?tgl_awal=${currentMonth}-01&tgl_akhir=${currentMonthEnd}&semua_poli=true`);
    const bulanIni = bulanIniRes.data.data.length || 0;

    // 3. Poli Bulan Ini (Sama dengan bulan ini, karena endpoint rawat_jalan/list sudah difilter per dokter/poli oleh backend)
    // Tapi tanpa parameter semua_poli=true
    const poliBulanIniRes = await apiClient.get(`/rawat_jalan/list?tgl_awal=${currentMonth}-01&tgl_akhir=${currentMonthEnd}`);
    const poliBulanIni = poliBulanIniRes.data.data.length || 0;

    // 4. Poli Hari Ini
    const poliHariIniRes = await apiClient.get(`/rawat_jalan/list?tgl_awal=${todayDate}&tgl_akhir=${todayDate}`);
    const poliHariIni = poliHariIniRes.data.data.length || 0;

    return {
      total_pasien: totalPasien,
      bulan_ini: bulanIni,
      poli_bulan_ini: poliBulanIni,
      poli_hari_ini: poliHariIni,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      total_pasien: 0,
      bulan_ini: 0,
      poli_bulan_ini: 0,
      poli_hari_ini: 0,
    };
  }
};

export const fetchPoliklinikHariIni = async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    // Fetch rawat jalan list for today with semua_poli=true
    const response = await apiClient.get(`/rawat_jalan/list?tgl_awal=${today}&tgl_akhir=${today}&semua_poli=true`);
    
    const data = response.data.data || [];
    const poliCounts: Record<string, number> = {};
    
    // Count patients per polyclinic
    data.forEach((item: any) => {
      const poliName = item.nm_poli || 'Unknown';
      poliCounts[poliName] = (poliCounts[poliName] || 0) + 1;
    });

    // Convert to array format expected by component and sort by count DESC
    const processedData = Object.keys(poliCounts)
      .map(name => ({
        name: name, // Chart expects 'name'
        count: poliCounts[name] // Chart expects 'count'
      }))
      .sort((a, b) => b.count - a.count); // Sort descending

    return { data: processedData };
  } catch (error) {
    console.error("Error fetching poliklinik hari ini:", error);
    return { data: [] };
  }
};

export const fetchPasienAktif = async () => {
  try {
    // "Pasien Paling Aktif" usually implies historical data (most visits), but here we are asked to use /rawat_jalan/list
    // Since /rawat_jalan/list is paginated and date-filtered, getting "most active of all time" is hard without a specific endpoint.
    // Assuming the requirement means "Patients in today's list" (as a placeholder for activity)
    const today = new Date().toISOString().slice(0, 10);
    const response = await apiClient.get(`/rawat_jalan/list?tgl_awal=${today}&tgl_akhir=${today}&length=5`); 
    
    const data = response.data.data || [];
    // We map the rawat jalan data to the structure expected by the table
    const processedData = data.slice(0, 5).map((item: any) => ({
        nm_pasien: item.nm_pasien,
        kunjungan: 1 // Placeholder: we don't have total visit count from this endpoint
    }));

    return { data: processedData };
  } catch (error) {
    console.error("Error fetching pasien aktif:", error);
    return { data: [] };
  }
};

export const fetchAntrianTerakhir = async () => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    // Fetch latest queue (assuming default sort is by registration time/number)
    const response = await apiClient.get(`/rawat_jalan/list?tgl_awal=${today}&tgl_akhir=${today}&length=10`);
    
    const data = response.data.data || [];
    const processedData = data.slice(0, 10).map((item: any) => ({
        nm_pasien: item.nm_pasien,
        status: item.stts
    }));

    return { data: processedData };
  } catch (error) {
    console.error("Error fetching antrian terakhir:", error);
    return { data: [] };
  }
};
