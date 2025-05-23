const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const { TenantService } = require('./lib/tenant');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Middleware to handle tenant resolution
app.use(async (req, res, next) => {
  const host = req.get('host');
  const domain = host.split(':')[0]; // Remove port if present
  
  // Skip tenant resolution for main domain
  if (domain === process.env.BASE_DOMAIN) {
    return next();
  }

  const tenant = TenantService.getTenantByDomain(domain);
  if (!tenant) {
    return res.status(404).send('Tenant not found');
  }

  req.tenant = tenant;
  next();
});

// Tenant registration endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { username, sheetId } = req.body;
    
    if (!username || !sheetId) {
      return res.status(400).json({ error: 'Username and sheet ID are required' });
    }

    const tenant = await TenantService.createTenant(username, sheetId);
    res.json(tenant);
  } catch (error) {
    console.error('Error registering tenant:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch sheet data
app.get('/api/sheets/:sheetName', async (req, res) => {
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
}); 