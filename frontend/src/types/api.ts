export interface Script {
  id: number;
  name: string;
  description?: string;
  path: string;
  checksum: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ScriptCreate {
  name: string;
  description?: string;
  content: string;
}

export interface Run {
  id: number;
  target_type: string;
  target_id: number;
  params?: Record<string, string>;
  status: 'queued' | 'running' | 'success' | 'failed' | 'canceled';
  log_path?: string;
  started_at?: string;
  finished_at?: string;
  created_at: string;
}

export interface RunCreate {
  params?: Record<string, string>;
}