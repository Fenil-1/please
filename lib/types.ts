export interface SheetData {
  // Define the structure of your sheet data here
  // This will depend on how your user's sheets are structured
  [key: string]: any
}

export interface Tenant {
  id: string;
  username: string;
  sheetId: string;
  domain: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantConfig {
  sheetId: string;
  sheets: {
    EVENTS: string;
    SETTINGS: string;
    WEBPAGES: string;
  };
  subdomain: string;
}
