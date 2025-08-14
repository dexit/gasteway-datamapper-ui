export type Page = 'dashboard' | 'ingest-requests' | 'webhooks' | 'dto' | 'etl' | 'dispatch-rules' | 'dispatch-logs';

export enum ConfigType {
  DTO = 'DTO Mappings',
  ETL = 'ETL Configs',
  Dispatch = 'Dispatch Rules',
  Webhook = 'Webhook Configs',
}

export interface RawRequest {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: string;
  query_params: string;
  ip: string;
  timestamp: number;
  user_agent: string;
}

export interface DispatchLog {
  id: string;
  ingest_request_id: string;
  rule_id: string;
  rule_name: string;
  target_url: string;
  status: 'SUCCESS' | 'FAILED';
  status_code?: number;
  retry_attempts: number;
  response_body: string;
  timestamp: number;
  execution_time: number;
}

export interface ApiLog {
  id: string;
  request_id: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  metadata: string;
  timestamp: number;
  execution_time?: number;
  request_method?: string; // Joined from raw_requests
  request_url?: string; // Joined from raw_requests
}

export interface DtoMapping {
  id: string;
  name: string;
  source_pattern: string;
  target_schema: string;
  transformation_rules: string;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export interface EtlConfig {
  id: string;
  name: string;
  source_dto: string;
  target_format: string;
  extraction_rules: string;
  transformation_rules: string;
  load_rules: string;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export interface DispatchRule {
  id: string;
  name: string;
  pattern: string;
  target_url: string;
  method: string;
  headers: string;
  retry_count: number;
  timeout: number;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export interface WebhookConfig {
  id: string;
  provider: 'hubspot' | 'twilio';
  secret: string;
  signature_header: string;
  algorithm: string;
  is_active: boolean;
  created_at: number;
  updated_at: number;
}

export type AnyConfig = DtoMapping | EtlConfig | DispatchRule | WebhookConfig;