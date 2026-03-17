import apiClient from './client';

export interface RawatJalanParams {
  draw?: number;
  start?: number;
  length?: number;
  tgl_awal?: string;
  tgl_akhir?: string;
  search?: string;
  status?: string;
  status_bayar?: string;
  filter?: string;
  rujukan_internal?: boolean;
}

export const fetchRiwayatPerawatan = async (noRkmMedis: string, noRawat: string) => {
  try {
    const response = await apiClient.get(`/pasien/riwayatperawatan/${noRkmMedis}/${noRawat}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching riwayat perawatan:", error);
    return null;
  }
};

export const fetchRiwayatKunjungan = async (noRkmMedis: string) => {
  try {
    const response = await apiClient.get(`/pasien/riwayatperawatan/${noRkmMedis}`);
    console.log('Riwayat Kunjungan Response:', JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    console.error("Error fetching riwayat kunjungan:", error);
    return [];
  }
};

export const fetchIgd = async (params: RawatJalanParams) => {
  try {
    const queryParams = new URLSearchParams();
    // DataTables parameters
    if (params.draw) queryParams.append('draw', params.draw.toString());
    if (params.start !== undefined) queryParams.append('start', params.start.toString());
    if (params.length !== undefined) queryParams.append('length', params.length.toString());
    
    // Custom filters
    if (params.tgl_awal) queryParams.append('tgl_awal', params.tgl_awal);
    if (params.tgl_akhir) queryParams.append('tgl_akhir', params.tgl_akhir);
    
    // Handling search and filter logic
    if (params.search) {
      // If user typed search, use it
      queryParams.append('search[value]', params.search);
    } else {
      // If no manual search, check tab filters
      if (params.filter === 'sesi-pagi') {
        queryParams.append('search[value]', 'pagi');
      } else if (params.filter === 'sesi-sore') {
        // Fix: 'search[value]' must be set to 'sore' to match polyclinics with "SORE" in their name.
        // If they are not showing up, verify if the term 'sore' matches.
        queryParams.append('search[value]', 'sore');
      }
    }
    
    // Other filters
    if (params.filter && params.filter !== 'sesi-pagi' && params.filter !== 'sesi-sore' && params.filter !== 'pasien-lanjutan') {
      queryParams.append('filter', params.filter);
    }
    if (params.status) queryParams.append('status_periksa', params.status);
    // Explicitly handle 'belum' status which might be passed directly
    if (params.filter === 'pasien-lanjutan' && !params.status) {
        queryParams.append('status_periksa', 'belum');
    }
    
    if (params.status_bayar) queryParams.append('status_bayar', params.status_bayar);

    // Make the request
    const response = await apiClient.get(`/igd/list?${queryParams.toString()}`);

    // Check if response data is in DataTables format
    if (response.data && Array.isArray(response.data.data)) {
      // Prioritize recordsFiltered from API, fallback to recordsTotal
      // Also check response.meta.total or response.total (common Laravel/API patterns)
      let recordsFiltered = response.data.recordsFiltered;
      let recordsTotal = response.data.recordsTotal;
      
      if (recordsFiltered === undefined || recordsFiltered === 0) {
          if (response.data.meta && response.data.meta.total) {
              recordsFiltered = response.data.meta.total;
          } else if (response.data.total) {
              recordsFiltered = response.data.total;
          }
      }

      // If recordsFiltered is missing or 0 but we have data, likely API issue not returning count
      const currentDataLength = response.data.data.length;
      const requestedLength = params.length || 10;

      // If API returns count as string, parse it
      if (typeof recordsFiltered === 'string') recordsFiltered = parseInt(recordsFiltered, 10);
      if (typeof recordsTotal === 'string') recordsTotal = parseInt(recordsTotal, 10);

      // Force correction if API returns total 0 or undefined but sends data
      if (!recordsFiltered || recordsFiltered === 0) {
           if (currentDataLength < requestedLength) {
              recordsFiltered = (params.start || 0) + currentDataLength;
           } else {
              recordsFiltered = (params.start || 0) + currentDataLength + 1;
           }
      }
      
      if (recordsFiltered === requestedLength && currentDataLength === requestedLength) {
           recordsFiltered = (params.start || 0) + requestedLength + 1;
      }
      
      if (!recordsTotal) recordsTotal = recordsFiltered;

      return {
        ...response.data,
        recordsFiltered,
        recordsTotal
      };
    }
    // Handle if API returns direct array
    if (Array.isArray(response.data)) {
        return { data: response.data, recordsTotal: response.data.length, recordsFiltered: response.data.length };
    }
    return { data: [], recordsTotal: 0, recordsFiltered: 0 };
  } catch (error) {
    console.error("Error fetching IGD:", error);
    return { data: [], recordsTotal: 0, recordsFiltered: 0 };
  }
};

export const fetchRawatJalan = async (params: RawatJalanParams) => {
  try {
    const queryParams = new URLSearchParams();
    // DataTables parameters
    if (params.draw) queryParams.append('draw', params.draw.toString());
    if (params.start !== undefined) queryParams.append('start', params.start.toString());
    if (params.length !== undefined) queryParams.append('length', params.length.toString());
    
    // Custom filters
    if (params.tgl_awal) queryParams.append('tgl_awal', params.tgl_awal);
    if (params.tgl_akhir) queryParams.append('tgl_akhir', params.tgl_akhir);
    
    // Handling search and filter logic
    if (params.search) {
      queryParams.append('search[value]', params.search);
    } else {
      if (params.filter === 'sesi-pagi') {
        queryParams.append('search[value]', 'pagi');
      } else if (params.filter === 'sesi-sore') {
        queryParams.append('search[value]', 'sore');
      }
    }

    if (params.filter === 'hemodialisa') {
        queryParams.append('search[value]', 'Hemodialisis');
    }
    
    // Other filters
    if (params.filter && params.filter !== 'sesi-pagi' && params.filter !== 'sesi-sore' && params.filter !== 'pasien-lanjutan' && params.filter !== 'hemodialisa') {
      queryParams.append('filter', params.filter);
    }
    
    if (params.status) queryParams.append('status_periksa', params.status);
    
    // Explicitly handle 'belum' status for pasien-lanjutan which might be passed directly
    if (params.filter === 'pasien-lanjutan' && !params.status) {
        queryParams.append('status_periksa', 'belum');
    }
    
    if (params.status_bayar) queryParams.append('status_bayar', params.status_bayar);
    if (params.rujukan_internal) queryParams.append('rujukan_internal', 'true');

    // Make the request
    const response = await apiClient.get(`/rawat_jalan/list?${queryParams.toString()}`);

    // Check if response data is in DataTables format
    if (response.data && Array.isArray(response.data.data)) {
      // Prioritize recordsFiltered from API, fallback to recordsTotal
      // Also check response.meta.total or response.total (common Laravel/API patterns)
      let recordsFiltered = response.data.recordsFiltered;
      let recordsTotal = response.data.recordsTotal;
      
      if (recordsFiltered === undefined || recordsFiltered === 0) {
          if (response.data.meta && response.data.meta.total) {
              recordsFiltered = response.data.meta.total;
          } else if (response.data.total) {
              recordsFiltered = response.data.total;
          }
      }

      // If recordsFiltered is missing or 0 but we have data, likely API issue not returning count
      // We can try to guess total if it's paginated but count missing (rare for DataTables)
      // BUT if the API returns exactly 'length' items, there might be more pages.
      // If it returns less than 'length', that's the end.
      
      const currentDataLength = response.data.data.length;
      const requestedLength = params.length || 10;

      // If API returns count as string, parse it
      if (typeof recordsFiltered === 'string') recordsFiltered = parseInt(recordsFiltered, 10);
      if (typeof recordsTotal === 'string') recordsTotal = parseInt(recordsTotal, 10);

      // Force correction if API returns total 0 or undefined but sends data
      if (!recordsFiltered || recordsFiltered === 0) {
          // Check if response has 'total' property sometimes used in other API formats
          if (response.data.total) {
             recordsFiltered = parseInt(response.data.total, 10);
          } else {
             // Fallback: If we can't know the real total from server, we can't display "{total_semua_row}" correctly.
             // We can only enable pagination.
             // However, if the user explicitly asks for "total_semua_row", it implies the server SHOULD send it.
             // If server sends wrong data (recordsFiltered: 0), we can't fix it on client side magically without another request.
             
             // Let's try to see if there is another field.
             // If not, we keep the +1 hack for navigation, but user won't see true total.
             
             if (currentDataLength < requestedLength) {
                recordsFiltered = (params.start || 0) + currentDataLength;
             } else {
                recordsFiltered = (params.start || 0) + currentDataLength + 1;
             }
          }
      }
      
      // If we still have the issue where recordsFiltered == data.length (e.g. 10) but we know there are more
      // This happens if server only counts the current page.
      // We can check if recordsFiltered equals requestedLength.
      if (recordsFiltered === requestedLength && currentDataLength === requestedLength) {
           // This strongly suggests server is returning page size as total.
           // We'll add +1 to allow next page.
           recordsFiltered = (params.start || 0) + requestedLength + 1;
      }
      
      if (!recordsTotal) recordsTotal = recordsFiltered;

      return {
        ...response.data,
        recordsFiltered,
        recordsTotal
      };
    }
    // Handle if API returns direct array
    if (Array.isArray(response.data)) {
        return { data: response.data, recordsTotal: response.data.length, recordsFiltered: response.data.length };
    }
    return { data: [], recordsTotal: 0, recordsFiltered: 0 };
  } catch (error) {
    console.error("Error fetching rawat jalan:", error);
    return { data: [], recordsTotal: 0, recordsFiltered: 0 };
  }
};

export const fetchRawatInap = async (params: RawatJalanParams) => {
  try {
    const queryParams = new URLSearchParams();
    // DataTables parameters
    if (params.draw) queryParams.append('draw', params.draw.toString());
    if (params.start !== undefined) queryParams.append('start', params.start.toString());
    if (params.length !== undefined) queryParams.append('length', params.length.toString());
    
    // Custom filters
    if (params.tgl_awal) queryParams.append('tgl_awal', params.tgl_awal);
    if (params.tgl_akhir) queryParams.append('tgl_akhir', params.tgl_akhir);
    
    // Handling search and filter logic
    if (params.search) {
      queryParams.append('search[value]', params.search);
    }
    
    // Other filters
    if (params.filter) {
      queryParams.append('filter', params.filter);
    }
    if (params.status) queryParams.append('status_ranap', params.status);
    if (params.status_bayar) queryParams.append('status_bayar', params.status_bayar);

    // Make the request
    const response = await apiClient.get(`/rawat_inap/list?${queryParams.toString()}`);

    // Check if response data is in DataTables format
    if (response.data && Array.isArray(response.data.data)) {
      // Prioritize recordsFiltered from API, fallback to recordsTotal
      let recordsFiltered = response.data.recordsFiltered;
      let recordsTotal = response.data.recordsTotal;
      
      if (recordsFiltered === undefined || recordsFiltered === 0) {
          if (response.data.meta && response.data.meta.total) {
              recordsFiltered = response.data.meta.total;
          } else if (response.data.total) {
              recordsFiltered = response.data.total;
          }
      }

      const currentDataLength = response.data.data.length;
      const requestedLength = params.length || 10;

      if (typeof recordsFiltered === 'string') recordsFiltered = parseInt(recordsFiltered, 10);
      if (typeof recordsTotal === 'string') recordsTotal = parseInt(recordsTotal, 10);

      // Force correction if API returns total 0 or undefined but sends data
      if (!recordsFiltered || recordsFiltered === 0) {
           if (currentDataLength < requestedLength) {
              recordsFiltered = (params.start || 0) + currentDataLength;
           } else {
              recordsFiltered = (params.start || 0) + currentDataLength + 1;
           }
      }
      
      if (recordsFiltered === requestedLength && currentDataLength === requestedLength) {
           recordsFiltered = (params.start || 0) + requestedLength + 1;
      }
      
      if (!recordsTotal) recordsTotal = recordsFiltered;

      return {
        ...response.data,
        recordsFiltered,
        recordsTotal
      };
    }
    
    if (Array.isArray(response.data)) {
        return { data: response.data, recordsTotal: response.data.length, recordsFiltered: response.data.length };
    }
    return { data: [], recordsTotal: 0, recordsFiltered: 0 };
  } catch (error) {
    console.error("Error fetching rawat inap:", error);
    return { data: [], recordsTotal: 0, recordsFiltered: 0 };
  }
};

export const savePemeriksaan = async (data: any, type: 'ralan' | 'ranap' | 'igd') => {
  try {
    let endpoint = '/rawat_jalan/savesoap';
    if (type === 'ranap') endpoint = '/rawat_inap/savesoap';
    if (type === 'igd') endpoint = '/igd/savesoap';
    
    // The Postman collection shows JSON is used for these endpoints
    const response = await apiClient.post(endpoint, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error saving pemeriksaan:", error);
    throw error;
  }
};

export const saveTindakan = async (data: any, type: 'ralan' | 'ranap') => {
  try {
    let endpoint = '/rawat_jalan/savedetail';
    if (type === 'ranap') {
      endpoint = '/rawat_inap/savedetail';
    }
    
    // Using JSON as per example
    const response = await apiClient.post(endpoint, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
  } catch (error) {
    console.error("Error saving tindakan:", error);
    throw error;
  }
};

export const fetchTindakanPasien = async (noRawat: string, type: 'ralan' | 'ranap') => {
  try {
    // Remove slashes from no_rawat for this specific endpoint
    const cleanNoRawat = noRawat.replace(/\//g, '');
    
    let endpoint = `/rawat_jalan/showdetail/tindakan/${cleanNoRawat}`;
    if (type === 'ranap') {
      endpoint = `/rawat_inap/showdetail/tindakan/${cleanNoRawat}`;
    }
    
    console.log('Fetching Tindakan from:', endpoint); // Debug log
    const response = await apiClient.get(endpoint);
    console.log('API Response for Tindakan:', response.data); // Debug log
    
    // Check if the response matches the structure provided in the prompt
    if (response.data && response.data.data) {
       const data = response.data.data;
       let allTindakan: any[] = [];
       
       if (Array.isArray(data.rawat_jl_dr)) allTindakan = [...allTindakan, ...data.rawat_jl_dr];
       if (Array.isArray(data.rawat_jl_pr)) allTindakan = [...allTindakan, ...data.rawat_jl_pr];
       if (Array.isArray(data.rawat_jl_drpr)) allTindakan = [...allTindakan, ...data.rawat_jl_drpr];
       
       // Handle Ranap structure if different (often similar keys but with _in_ instead of _jl_)
       if (Array.isArray(data.rawat_in_dr)) allTindakan = [...allTindakan, ...data.rawat_in_dr];
       if (Array.isArray(data.rawat_in_pr)) allTindakan = [...allTindakan, ...data.rawat_in_pr];
       if (Array.isArray(data.rawat_in_drpr)) allTindakan = [...allTindakan, ...data.rawat_in_drpr];

       return allTindakan;
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching tindakan pasien:", error);
    return [];
  }
};

export const saveObat = async (data: any, type: 'ralan' | 'ranap') => {
  try {
    let endpoint = '/rawat_jalan/saveobat';
    if (type === 'ranap') {
      endpoint = '/rawat_inap/saveobat';
    }
    
    // Using JSON as standard for new endpoints
    const response = await apiClient.post(endpoint, data, {
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.data;
  } catch (error) {
    console.error("Error saving obat:", error);
    throw error;
  }
};

export const fetchObatPasien = async (noRawat: string, type: 'ralan' | 'ranap') => {
  try {
    const cleanNoRawat = noRawat.replace(/\//g, '');
    let endpoint = `/rawat_jalan/showdetail/obat/${cleanNoRawat}`;
    if (type === 'ranap') {
      endpoint = `/rawat_inap/showdetail/obat/${cleanNoRawat}`;
    }
    
    const response = await apiClient.get(endpoint);
    // Assuming standard response structure or direct array. 
    // If wrapped in data.data like tindakan, we might need similar extraction logic.
    // For now returning response.data or response.data.data if exists.
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching obat pasien:", error);
    return [];
  }
};

export const fetchRacikanPasien = async (noRawat: string, type: 'ralan' | 'ranap') => {
  try {
    const cleanNoRawat = noRawat.replace(/\//g, '');
    let endpoint = `/rawat_jalan/showdetail/racikan/${cleanNoRawat}`;
    if (type === 'ranap') {
      endpoint = `/rawat_inap/showdetail/racikan/${cleanNoRawat}`;
    }
    
    const response = await apiClient.get(endpoint);
    return response.data.data || response.data;
  } catch (error) {
    console.error("Error fetching racikan pasien:", error);
    return [];
  }
};
