import { Tenant, TenantConfig } from './types';

// Simple function to generate unique IDs
function generateId(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// In-memory tenant store (replace with database in production)
const tenants: Map<string, Tenant> = new Map();

export class TenantService {
  private static getAuth() {
    try {
      const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS 
        ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS)
        : {};
      
      return new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
    } catch (error) {
      console.error('Error initializing Google Auth:', error);
      throw new Error('Failed to initialize Google Auth');
    }
  }

  private static getSheets() {
    const auth = this.getAuth();
    return google.sheets({ version: 'v4', auth });
  }

  static async createTenant(username: string, sheetId: string): Promise<Tenant> {
    console.log('Creating tenant:', { username, sheetId });
    
    // Validate sheet access
    try {
      const sheets = this.getSheets();
      
      // First, try to get the spreadsheet metadata
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });
      
      console.log('Successfully accessed spreadsheet:', spreadsheet.data.properties?.title);

      // Then try to read the first sheet to verify we have read access
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'A1', // Just try to read the first cell
      });

      if (!response.data) {
        throw new Error('Could not read data from the spreadsheet');
      }

    } catch (error: any) {
      console.error('Sheet validation error:', error);
      
      if (error.code === 404) {
        throw new Error('Google Sheet not found. Please check the Sheet ID and make sure the sheet exists.');
      } else if (error.code === 403) {
        throw new Error('Access denied. Please make sure the Google Sheet is shared with the service account email: ' + 
          JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS || '{}').client_email);
      } else {
        throw new Error(`Error accessing Google Sheet: ${error.message}`);
      }
    }

    // Generate subdomain from username
    const subdomain = username.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const tenant: Tenant = {
      id: generateId(),
      username,
      sheetId,
      domain: `${subdomain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'sheetzu.com'}`,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Created tenant:', tenant);
    tenants.set(tenant.id, tenant);
    return tenant;
  }

  static getTenantByDomain(domain: string): Tenant | undefined {
    console.log('Looking up tenant for domain:', domain);
    console.log('Available tenants:', Array.from(tenants.values()));
    
    const tenant = Array.from(tenants.values()).find(
      tenant => tenant.domain === domain || tenant.domain === `${domain}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'sheetzu.com'}`
    );
    
    console.log('Found tenant:', tenant);
    return tenant;
  }

  static getTenantConfig(tenant: Tenant): TenantConfig {
    return {
      sheetId: tenant.sheetId,
      sheets: {
        EVENTS: 'Events/Products',
        SETTINGS: 'Settings',
        WEBPAGES: 'WebPages',
      },
      subdomain: tenant.domain.split('.')[0],
    };
  }

  static async validateSheetAccess(sheetId: string): Promise<boolean> {
    try {
      const sheets = this.getSheets();
      await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
      });
      return true;
    } catch (error: any) {
      console.error('Sheet validation error:', error);
      return false;
    }
  }
} 