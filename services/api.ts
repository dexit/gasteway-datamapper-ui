import { RawRequest, ApiLog, DtoMapping, EtlConfig, DispatchRule, WebhookConfig, AnyConfig, ConfigType, DispatchLog } from '../types';

const generateId = () => crypto.randomUUID();
const getCurrentTimestamp = () => Date.now();
const randomDate = (start: Date, end: Date) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).getTime();

// MOCK DATA GENERATION
const mockRawRequests: RawRequest[] = Array.from({ length: 50 }, (_, i) => ({
  id: generateId(),
  method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
  url: `https://api.example.com/v1/${['users', 'products', 'orders', 'webhook/hubspot'][i % 4]}/${i}`,
  headers: { 'Content-Type': 'application/json', 'User-Agent': 'MockClient/1.0' },
  body: JSON.stringify({ message: `This is mock body ${i}` }),
  query_params: `?limit=10&offset=${i*10}`,
  ip: `192.168.1.${i}`,
  timestamp: randomDate(new Date(2023, 10, 1), new Date()),
  user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}));

const mockDtoMappings: DtoMapping[] = [
  {
    id: generateId(),
    name: 'HubSpot Contact Mapping',
    source_pattern: '.*webhook/hubspot.*',
    target_schema: '{"contact_id": "string", "email": "string"}',
    transformation_rules: JSON.stringify({ contact_id: 'properties.hs_object_id', email: 'properties.email' }, null, 2),
    is_active: true,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp(),
  }
];

const mockEtlConfigs: EtlConfig[] = [
    {
        id: generateId(),
        name: 'Contact Processing Pipeline',
        source_dto: 'hubspot_contact',
        target_format: 'crm_contact',
        extraction_rules: JSON.stringify({ contact_info: 'contact_id', email_address: 'email' }, null, 2),
        transformation_rules: JSON.stringify({ id: 'contact_info', email: { type: 'transform', source: 'email_address', transformation: 'lowercase' } }, null, 2),
        load_rules: JSON.stringify({ destination: 'crm_api', format: 'json' }, null, 2),
        is_active: true,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
    }
];

const mockDispatchRules: DispatchRule[] = [
    {
        id: generateId(),
        name: 'Forward to CRM',
        pattern: '.*webhook.*',
        target_url: 'https://downstream.crm.com/api/contacts',
        method: 'POST',
        headers: JSON.stringify({ 'Authorization': 'Bearer YOUR_API_KEY' }),
        retry_count: 3,
        timeout: 30000,
        is_active: true,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
    },
    {
        id: generateId(),
        name: 'Log Analytics Events',
        pattern: '.*analytics.*',
        target_url: 'https://downstream.analytics.com/events',
        method: 'POST',
        headers: JSON.stringify({ 'X-API-KEY': 'ANALYTICS_KEY' }),
        retry_count: 1,
        timeout: 15000,
        is_active: false,
        created_at: getCurrentTimestamp() - 86400000,
        updated_at: getCurrentTimestamp() - 86400000,
    }
];

const mockWebhookConfigs: WebhookConfig[] = [
  {
    id: generateId(),
    provider: 'hubspot',
    secret: '********',
    signature_header: 'X-HubSpot-Signature-v3',
    algorithm: 'SHA-256',
    is_active: true,
    created_at: getCurrentTimestamp(),
    updated_at: getCurrentTimestamp()
  }
];


const mockDispatchLogs: DispatchLog[] = mockRawRequests
    .map((request): DispatchLog | null => {
        const matchingRule = mockDispatchRules.find(rule => new RegExp(rule.pattern).test(request.url) && rule.is_active);
        if (!matchingRule) return null;

        const status = (['SUCCESS', 'SUCCESS', 'FAILED'] as DispatchLog['status'][])[Math.floor(Math.random() * 3)];
        return {
            id: generateId(),
            ingest_request_id: request.id,
            rule_id: matchingRule.id,
            rule_name: matchingRule.name,
            target_url: matchingRule.target_url,
            status: status,
            status_code: status === 'SUCCESS' ? 200 : 502,
            retry_attempts: status === 'FAILED' ? Math.floor(Math.random() * matchingRule.retry_count) : 0,
            response_body: status === 'SUCCESS' ? '{"status": "ok"}' : '{"error": "upstream service unavailable"}',
            timestamp: request.timestamp + 50 + Math.random() * 200,
            execution_time: 150 + Math.floor(Math.random() * 350)
        };
    })
    .filter((log): log is DispatchLog => log !== null);


const MOCK_DB: Record<ConfigType, AnyConfig[]> = {
    [ConfigType.DTO]: mockDtoMappings,
    [ConfigType.ETL]: mockEtlConfigs,
    [ConfigType.Dispatch]: mockDispatchRules,
    [ConfigType.Webhook]: mockWebhookConfigs,
};

const simulateApiCall = <T,>(data: T): Promise<T> => 
  new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 300 + Math.random() * 400));

export const getDashboardStats = async () => {
    // Simulate a network failure occasionally
    if (Math.random() < 0.1) {
        return new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Failed to connect to the statistics service.')), 500);
        });
    }
    
    const totalIngest = mockRawRequests.length;
    const totalDispatch = mockDispatchLogs.length;
    const failedDispatch = mockDispatchLogs.filter(log => log.status === 'FAILED').length;
    const activeWebhooks = mockWebhookConfigs.filter(c => c.is_active).length;
    
    const avgExecutionTime = mockDispatchLogs.reduce((acc, log) => acc + (log.execution_time || 0), 0) / mockDispatchLogs.length;

    return simulateApiCall({
        totalIngest,
        totalDispatch,
        failedDispatch,
        activeWebhooks,
        avgExecutionTime: isNaN(avgExecutionTime) ? 0 : Math.round(avgExecutionTime)
    });
};

export const getIngestRequests = () => simulateApiCall(mockRawRequests);
export const getDispatchLogs = () => simulateApiCall(mockDispatchLogs);

export const getConfigs = (type: ConfigType) => simulateApiCall(MOCK_DB[type]);

export const addConfig = (type: ConfigType, config: Omit<AnyConfig, 'id' | 'created_at' | 'updated_at'>) => {
    const newConfig = {
        ...config,
        id: generateId(),
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
    } as AnyConfig;
    MOCK_DB[type].push(newConfig);
    return simulateApiCall(newConfig);
};

export const updateConfig = (type: ConfigType, config: AnyConfig) => {
    const db = MOCK_DB[type];
    const index = db.findIndex(c => c.id === config.id);
    if (index !== -1) {
        const updatedConfig = { ...config, updated_at: getCurrentTimestamp() };
        db[index] = updatedConfig;
        return simulateApiCall(updatedConfig);
    }
    return Promise.reject(new Error('Config not found'));
};

export const deleteConfig = (type: ConfigType, id: string) => {
    const db = MOCK_DB[type];
    const index = db.findIndex(c => c.id === id);
    if (index !== -1) {
        // Simulate a protected config that cannot be deleted
        if (index === 0) {
            return new Promise((_, reject) => {
                setTimeout(() => reject(new Error('This is a protected configuration and cannot be deleted.')), 400);
            });
        }
        const deleted = db.splice(index, 1);
        return simulateApiCall(deleted[0]);
    }
    return Promise.reject(new Error('Config not found'));
};
