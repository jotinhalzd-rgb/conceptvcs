export type UserRole = 'ceo_master' | 'ceo' | 'admin' | 'manager' | 'agent';

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  email: string;
}

export interface Customer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar_url?: string;
  channel_origin: string;
  last_interaction_at: string;
  score_ia: number; // 0-100
  risk_of_churn: 'low' | 'medium' | 'high';
  potential_purchase: number; // 0-100
  assigned_agent_name?: string;
  assigned_manager_name?: string;
}
