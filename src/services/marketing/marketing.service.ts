import { getBrowserSupabaseClient as getSupabaseClient, getBrowserActiveBusinessId as getActiveBusinessId } from '../clientHelper';

export interface MarketingCampaign {
  id: string;
  business_id: string;
  campaign_name: string;
  channel: string;
  budget: number;
  spent: number;
  revenue_generated: number;
  clicks: number;
  impressions: number;
  conversions: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export type CreateMarketingCampaignPayload = Omit<MarketingCampaign, 'id' | 'business_id' | 'created_at'>;

export async function getCampaigns(): Promise<MarketingCampaign[]> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) return [];

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[MarketingService] Error fetching campaigns:', error.message);
    throw error;
  }
  return data as MarketingCampaign[];
}

export async function createCampaign(payload: CreateMarketingCampaignPayload): Promise<MarketingCampaign> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) throw new Error('No active business ID');

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .insert({ ...payload, business_id: businessId })
    .select('*')
    .single();

  if (error) {
    console.error('[MarketingService] Error creating campaign:', error.message);
    throw error;
  }
  return data as MarketingCampaign;
}

export async function updateCampaign(id: string, payload: Partial<CreateMarketingCampaignPayload>): Promise<MarketingCampaign> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) throw new Error('No active business ID');

  const { data, error } = await supabase
    .from('marketing_campaigns')
    .update(payload)
    .eq('id', id)
    .eq('business_id', businessId) // Extra safety check for RLS-like enforcement on client
    .select('*')
    .single();

  if (error) {
    console.error('[MarketingService] Error updating campaign:', error.message);
    throw error;
  }
  return data as MarketingCampaign;
}

export async function deleteCampaign(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const businessId = await getActiveBusinessId();
  if (!businessId) throw new Error('No active business ID');

  const { error } = await supabase
    .from('marketing_campaigns')
    .delete()
    .eq('id', id)
    .eq('business_id', businessId);

  if (error) {
    console.error('[MarketingService] Error deleting campaign:', error.message);
    throw error;
  }
}
