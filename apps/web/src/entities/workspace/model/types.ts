export interface Workspace {
  id: string;
  name: string;
  is_personal: boolean;
  role: string;
}

export interface Membership {
  role: string;
  permissions: string[];
}

export interface WorkspaceMember {
  id: string;
  account_id: string;
  account_name: string;
  account_email: string;
  role: string;
  joined_at: string;
}
