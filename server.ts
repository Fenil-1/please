import express, { Request, Response, NextFunction } from 'express';
import { google } from 'googleapis';
import cors from 'cors';
import { TenantService } from './lib/tenant';
import { Tenant } from './lib/types';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Debug: Log environment variables (excluding sensitive data)
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('BASE_DOMAIN:', process.env.BASE_DOMAIN);
console.log('GOOGLE_APPLICATION_CREDENTIALS path:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google Sheets API
let auth;
try {
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!credentialsPath) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS environment variable is not set');
  }

  // Read and parse the credentials file
  const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');
  console.log('Credentials file read successfully');
  
  const credentialsJson = JSON.parse(credentialsContent);
  console.log('Service account email:', credentialsJson.client_email);
  
  auth = new google.auth.GoogleAuth({
    credentials: credentialsJson,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
} catch (error) {
  console.error('Error initializing Google Auth:', error);
  process.exit(1);
}

const sheets = google.sheets({ version: 'v4', auth });

// Extend Express Request type to include tenant
declare global {
  namespace Express {
    interface Request {
      tenant?: Tenant;
    }
  }
}

// Middleware to handle tenant resolution
app.use(async (req: Request, res: Response, next: NextFunction) => {
  const host = req.get('host');
  if (!host) {
    return res.status(400).send('Host header is required');
  }

  const domain = host.split(':')[0]; // Remove port if present
  const subdomain = domain.split('.')[0];
  const baseDomain = domain.split('.').slice(1).join('.');
  
  // For development, handle localhost specially
  if (baseDomain === 'localhost' || baseDomain === '127.0.0.1') {
    // If accessing root path, serve registration page
    if (req.path === '/') {
      return res.sendFile(path.join(__dirname, 'public', 'register.html'));
    }
    
    // Handle subdomain requests in development
    if (subdomain !== 'localhost' && subdomain !== '127.0.0.1') {
      const tenant = TenantService.getTenantByDomain(`${subdomain}.${process.env.BASE_DOMAIN}`);
      if (tenant) {
        req.tenant = tenant;
        return next();
      }
    }
    return next();
  }

  // Skip tenant resolution for main domain
  if (domain === process.env.BASE_DOMAIN) {
    if (req.path === '/') {
      return res.sendFile(path.join(__dirname, 'public', 'register.html'));
    }
    return next();
  }

  const tenant = TenantService.getTenantByDomain(domain);
  if (!tenant) {
    return res.status(404).send('Tenant not found');
  }

  req.tenant = tenant;
  next();
});

// Root route - serve registration page
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Tenant registration endpoint
app.post('/api/register', async (req: Request, res: Response) => {
  try {
    const { username, sheetId } = req.body;
    
    if (!username || !sheetId) {
      return res.status(400).json({ error: 'Username and sheet ID are required' });
    }

    const tenant = await TenantService.createTenant(username, sheetId);
    res.json(tenant);
  } catch (error) {
    console.error('Error registering tenant:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Endpoint to fetch sheet data
app.get('/api/sheets/:sheetName', async (req: Request, res: Response) => {
  try {
    if (!req.tenant) {
      return res.status(400).json({ error: 'Tenant not found' });
    }

    const { sheetName } = req.params;
    const config = TenantService.getTenantConfig(req.tenant);
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: config.sheetId,
      range: sheetName,
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    res.status(500).json({ error: 'Failed to fetch sheet data' });
  }
});

// Serve static files for each tenant
app.use(express.static('public'));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to register a new tenant`);
}); 