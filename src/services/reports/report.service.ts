import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';

export interface Report {
  id: string;
  business_id: string;
  report_name: string;
  report_type: string;
  agent_name: string;
  file_type: string;
  file_size: string;
  generated_at: string;
  status: string;
  download_url: string;
  created_at: string;
}

export interface ReportSchedule {
  id: string;
  business_id: string;
  name: string;
  frequency: string;
  description: string;
  created_at: string;
}

export async function getReports(): Promise<Report[]> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ReportsService] Error fetching reports:', error.message);
    throw error;
  }
  return data as Report[];
}

export async function getReportSchedules(): Promise<ReportSchedule[]> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('report_schedules')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ReportsService] Error fetching schedules:', error.message);
    throw error;
  }
  return data as ReportSchedule[];
}

export async function ensureDefaultSchedules(): Promise<void> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return;

  const { data } = await supabase.from('report_schedules').select('id').eq('business_id', businessId).limit(1);
  if (data && data.length > 0) return;

  // Insert default schedules
  const defaults = [
    {
      business_id: businessId,
      name: 'Monday Earnings Sync',
      frequency: 'WEEKLY',
      description: 'CEO Agent delivers a full QTD ARR and operational index digest every Monday at 08:00 AM.'
    },
    {
      business_id: businessId,
      name: 'Monthly Cost Attribution Audit',
      frequency: 'MONTHLY',
      description: 'Finance Agent builds tax runway forecasts and software invoice audits on the 1st of every month.'
    }
  ];

  await supabase.from('report_schedules').insert(defaults);
}

// Helper to convert object array to CSV string
/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
function toCSV(data: any[]): string {
  if (data.length === 0) return 'No data\n';
  const headers = Object.keys(data[0]);
  const rows = data.map(obj => headers.map(h => `"${(obj[h] !== null && obj[h] !== undefined) ? String(obj[h]).replace(/"/g, '""') : ''}"`).join(','));
  return [headers.join(','), ...rows].join('\n');
}

export async function generateReport(agentName: string, reportType: string): Promise<Report> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) throw new Error('No active business ID');

  // Fetch relevant live data to generate a real report
  let csvContent = '';
  let reportName = `Automated Executive Briefing (${agentName})`;

  try {
    if (agentName === 'CEO Agent') {
      reportName = 'Corporate Earnings Synthesis';
      const [cust, ord, exp] = await Promise.all([
        supabase.from('customers').select('*').eq('business_id', businessId),
        supabase.from('orders').select('*').eq('business_id', businessId),
        supabase.from('expenses').select('*').eq('business_id', businessId)
      ]);
      const dataRows = [
        { Metric: 'Total Customers', Value: cust.data?.length || 0 },
        { Metric: 'Total Orders', Value: ord.data?.length || 0 },
        { Metric: 'Total Expenses', Value: exp.data?.length || 0 }
      ];
      csvContent = toCSV(dataRows);

    } else if (agentName === 'Finance Agent') {
      reportName = 'Financial Reconciliation Audit';
      const exp = await supabase.from('expenses').select('*').eq('business_id', businessId);
      csvContent = toCSV(exp.data || []);
      
    } else if (agentName === 'Inventory Agent') {
      reportName = 'Warehouse Audit & Procurement Forecast';
      const inv = await supabase.from('inventory').select('*').eq('business_id', businessId);
      csvContent = toCSV(inv.data || []);

    } else if (agentName === 'Sales Agent') {
      reportName = 'Sales Pipeline & Order Metrics';
      const ord = await supabase.from('orders').select('*').eq('business_id', businessId);
      csvContent = toCSV(ord.data || []);

    } else if (agentName === 'Marketing Agent') {
      reportName = 'Paid Ads Performance Ledger';
      const mkt = await supabase.from('marketing_campaigns').select('*').eq('business_id', businessId);
      csvContent = toCSV(mkt.data || []);

    } else {
      // Fallback: general dump
      const cust = await supabase.from('customers').select('*').eq('business_id', businessId);
      csvContent = toCSV(cust.data || []);
    }
  } catch (err) {
    console.error('Failed to compile data:', err);
    csvContent = 'Error compiling data';
  }

  // Convert CSV to a base64 Data URI for immediate downloading
  const base64Data = typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(csvContent))) : Buffer.from(csvContent).toString('base64');
  const downloadUrl = `data:text/csv;base64,${base64Data}`;
  const fileSizeKb = Math.max(1, Math.round(csvContent.length / 1024));

  const newReport = {
    business_id: businessId,
    report_name: reportName,
    report_type: reportType,
    agent_name: agentName,
    file_type: 'CSV',
    file_size: `${fileSizeKb} KB`,
    generated_at: new Date().toISOString(),
    status: 'Completed',
    download_url: downloadUrl
  };

  const { data: insertedReport, error } = await supabase
    .from('reports')
    .insert(newReport)
    .select('*')
    .single();

  if (error) {
    console.error('[ReportsService] Error inserting report:', error.message);
    throw error;
  }

  return insertedReport as Report;
}

export async function deleteReport(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return;

  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId);

  if (error) {
    console.error('[ReportsService] Error deleting report:', error.message);
    throw error;
  }
}
