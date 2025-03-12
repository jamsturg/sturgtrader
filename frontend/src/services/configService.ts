export interface HyperliquidConfig {
  apiUrl: string;
  wsUrl: string;
  apiKey?: string;
  network: string;
}
interface ApiConfig {
  [service: string]: {
    apiUrl: string;
    wsUrl: string;
    apiKey?: string;
    network?: string;
  };
}

const CONFIG_STORAGE_KEY = 'apiConfigurations';

export const getApiConfig = async (service: string) => {
  if (typeof window === 'undefined') return null;
  
  const configs: ApiConfig = JSON.parse(
    localStorage.getItem(CONFIG_STORAGE_KEY) || '{}'
  );
  return configs[service] || null;
};

export const saveApiConfig = async (service: string, config: any) => {
  if (typeof window === 'undefined') return;

  const configs: ApiConfig = JSON.parse(
    localStorage.getItem(CONFIG_STORAGE_KEY) || '{}'
  );
  configs[service] = config;
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
};

export const clearApiConfig = async (service: string) => {
  if (typeof window === 'undefined') return;

  const configs: ApiConfig = JSON.parse(
    localStorage.getItem(CONFIG_STORAGE_KEY) || '{}'
  );
  delete configs[service];
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(configs));
};