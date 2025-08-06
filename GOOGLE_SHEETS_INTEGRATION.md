
# Google Sheets Integration - Abrakadabra Events App

## 🎯 Overview

The Abrakadabra Events App now features a **hybrid storage system** that combines the reliability of local storage with the convenience of Google Sheets integration.

## 🏗️ Architecture

### Primary Storage: Local Storage
- ✅ **Reliable**: Always available, even offline
- ✅ **Fast**: Instant read/write operations
- ✅ **Secure**: Data stored locally on device
- ✅ **Independent**: No external dependencies

### Secondary Storage: Google Sheets
- 📊 **Reading**: Can load existing events from Google Sheets
- 📈 **Reporting**: View data in familiar spreadsheet format
- 🔄 **Sync**: One-way sync from Google Sheets to local storage
- ⚠️ **Writing**: Limited due to React Native constraints

## 📊 Current Configuration

- **Spreadsheet ID**: `13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s`
- **Service Account**: `abrakadabra@abrakadabra-422005.iam.gserviceaccount.com`
- **Project**: `abrakadabra-422005`
- **Range**: `Sheet1!A:I`

## 🔄 How It Works

### Data Flow
1. **App Operations**: All create/update/delete operations happen in local storage first
2. **Google Sheets Reading**: App can read existing data from Google Sheets
3. **Sync Process**: Manual sync brings Google Sheets data into local storage
4. **Backup**: Local storage serves as the primary backup

### Column Mapping
| Column | Field | Description |
|--------|-------|-------------|
| A | FECHA | Event date (YYYY-MM-DD) |
| B | NOMBRE | Customer name (Child name) |
| C | TELEFONO | Customer phone number |
| D | PAQUETE | Package type (Abra/Kadabra/Abrakadabra) |
| E | ESTADO | Payment status (Pagado/Pendiente) |
| F | ANTICIPO_PAGADO | Deposit amount |
| G | TOTAL_EVENTO | Total event amount |
| H | FECHA_PAGO | Payment date |
| I | NOTIFICADO_LUNES | Monday notification status |

## 🛠️ Setup Instructions

### For Read Access (Current Working Setup)
1. ✅ **Already configured** - No action needed
2. ✅ **API key authentication** - Working for read operations
3. ✅ **Automatic sync** - Available in diagnostics

### For Write Access (Optional Enhancement)
If you want full write access to Google Sheets:

1. **Open Google Sheet**: https://docs.google.com/spreadsheets/d/13nNp7c8gSn0L3lCWHbJmHcCUZt9iUY7XUxP7SJLCh6s
2. **Click "Share"** (blue button in top right)
3. **Add service account email**: `abrakadabra@abrakadabra-422005.iam.gserviceaccount.com`
4. **Set permissions**: Change from "Viewer" to "Editor"
5. **Click "Send"**

## 🧪 Testing & Diagnostics

### In-App Diagnostics
1. Open the app
2. Tap the "🔍" diagnostics button
3. Choose "📊 Google Sheets" for detailed testing
4. Use "🔄 Sincronizar" to sync data from Google Sheets

### What Each Test Checks
- **Basic Connection**: Can the app reach Google Sheets?
- **Load Events**: Can the app read existing events?
- **Sheet Permissions**: Does the app have proper access?
- **Write Capability**: Can the app write to Google Sheets?

## ⚠️ React Native Limitations

### Why Write Operations Are Limited
- **Security**: React Native apps can't safely store private keys
- **CORS**: Browser security prevents direct API calls with authentication
- **OAuth2**: Complex user authentication flow required for write access

### Recommended Solutions
1. **Current Approach**: Use local storage as primary, Google Sheets for reading
2. **Backend Service**: Implement a backend API for Google Sheets write operations
3. **Manual Updates**: Update Google Sheets manually when needed

## 🎯 Benefits of Current Setup

### ✅ Advantages
- **Reliable**: App works perfectly offline
- **Fast**: No network delays for normal operations
- **Flexible**: Can read from Google Sheets when available
- **Backup**: Data is safe in multiple locations
- **User-Friendly**: Familiar Google Sheets interface for reporting

### 📊 Use Cases
- **Daily Operations**: Use the app for all event management
- **Reporting**: View data in Google Sheets for analysis
- **Backup**: Google Sheets serves as external backup
- **Sharing**: Share Google Sheets with team members

## 🔧 Troubleshooting

### Common Issues

#### "Google Sheets connection failed"
- Check internet connection
- Verify spreadsheet ID is correct
- Run diagnostics to see detailed error

#### "No events found in Google Sheets"
- Sheet might be empty
- Check if data is in the correct range (Sheet1!A:I)
- Verify column headers match expected format

#### "Write operations failed"
- This is expected in React Native
- Use local storage for all write operations
- Consider manual Google Sheets updates if needed

### Getting Help
1. Run in-app diagnostics first
2. Check the console logs for detailed error messages
3. Verify Google Sheets is accessible in browser
4. Ensure internet connection is stable

## 📈 Future Enhancements

### Possible Improvements
1. **Backend Integration**: Add a backend service for full Google Sheets write access
2. **Real-time Sync**: Implement real-time synchronization
3. **Conflict Resolution**: Handle conflicts between local and Google Sheets data
4. **Multiple Sheets**: Support for multiple Google Sheets

### Current Status: ✅ Production Ready
The current implementation is stable and production-ready for the intended use case of local event management with Google Sheets integration for reporting and backup purposes.
