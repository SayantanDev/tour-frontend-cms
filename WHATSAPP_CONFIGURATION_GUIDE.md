# WhatsApp API Configuration Guide

Complete guide for configuring WhatsApp API in your application.

## Quick Start

### Option 1: Using Your Own Backend API (Recommended)

If you have your own backend API that stores WhatsApp data:

1. **Set Backend URL in Environment Variables:**
   ```env
   REACT_APP_BASE_URL=http://localhost:8000/api/v1
   ```

2. **Configure WhatsApp Provider:**
   ```env
   REACT_APP_WHATSAPP_PROVIDER=meta-whatsapp
   ```

3. **That's it!** The app will use your backend API endpoints as documented in `WHATSAPP_API_DOCUMENTATION.md`.

---

### Option 2: Direct WhatsApp Provider Integration

Connect directly to WhatsApp providers (Meta, Twilio, etc.) without a backend.

---

## Configuration Methods

### Method 1: Environment Variables (Recommended for Production)

Create a `.env` file in your project root:

```env
# Backend API URL (if using your own backend)
REACT_APP_BASE_URL=http://localhost:8000/api/v1

# WhatsApp Provider (twilio, whatsapp-business, meta-whatsapp, chatapi, 360dialog, custom)
REACT_APP_WHATSAPP_PROVIDER=meta-whatsapp

# API Base URL (auto-set for Meta, required for others)
REACT_APP_WHATSAPP_API_URL=https://graph.facebook.com

# API Credentials
REACT_APP_WHATSAPP_API_KEY=your_access_token_here
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=123456789012345
REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
REACT_APP_WHATSAPP_API_VERSION=v18.0

# For Twilio
REACT_APP_WHATSAPP_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_WHATSAPP_API_SECRET=your_auth_token_here

# Socket.io URL (for real-time updates)
REACT_APP_SOCKET_URL=http://localhost:3001
```

**Important:** Restart your development server after changing `.env` file.

---

### Method 2: UI Configuration Dialog

1. Navigate to `/whatsapp-inbox` in your application
2. Click the **Settings icon (⚙️)** in the top-right corner
3. Fill in your configuration:
   - **Provider**: Select your WhatsApp provider
   - **Base URL**: API base URL (auto-filled for Meta)
   - **Access Token/API Key**: Your provider credentials
   - **Phone Number ID**: Your WhatsApp phone number ID
   - **Business Account ID**: (Optional) Your business account ID
   - **API Version**: API version (default: v18.0)
4. Click **"Save Configuration"**

**Note:** Configuration is saved in browser `localStorage`.

---

### Method 3: Backend API Configuration Endpoint

If using your own backend, configure via API:

```javascript
// POST /api/v1/whatsapp/config
{
  "provider": "meta-whatsapp",
  "isActive": true,
  "accessToken": "your_token",
  "phoneNumberId": "123456789",
  "businessAccountId": "987654321",
  "apiVersion": "v18.0",
  "webhookUrl": "https://your-domain.com/webhook",
  "webhookVerifyToken": "your_verify_token"
}
```

---

## Provider-Specific Configuration

### Meta WhatsApp Cloud API (Recommended)

**Required:**
- Access Token
- Phone Number ID

**Environment Variables:**
```env
REACT_APP_WHATSAPP_PROVIDER=meta-whatsapp
REACT_APP_WHATSAPP_API_KEY=your_access_token_here
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=123456789012345
REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
REACT_APP_WHATSAPP_API_VERSION=v18.0
```

**How to Get Credentials:**
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a Meta App → Add WhatsApp product
3. Get **Phone Number ID** from WhatsApp → API Setup
4. Generate **Access Token** (temporary for dev, permanent for production)
5. Get **Business Account ID** from Business Settings

**See:** `META_WHATSAPP_SETUP.md` for detailed setup instructions.

---

### Twilio

**Required:**
- Account SID
- Auth Token

**Environment Variables:**
```env
REACT_APP_WHATSAPP_PROVIDER=twilio
REACT_APP_WHATSAPP_API_URL=https://conversations.twilio.com
REACT_APP_WHATSAPP_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_WHATSAPP_API_SECRET=your_auth_token_here
```

**How to Get Credentials:**
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get **Account SID** and **Auth Token** from Twilio Console
3. Enable WhatsApp in Twilio Console

---

### ChatAPI

**Required:**
- API Key
- Instance URL

**Environment Variables:**
```env
REACT_APP_WHATSAPP_PROVIDER=chatapi
REACT_APP_WHATSAPP_API_URL=https://eu1.chat-api.com/instance12345
REACT_APP_WHATSAPP_API_KEY=your_api_key_here
```

**How to Get Credentials:**
1. Sign up at [ChatAPI](https://www.chat-api.com/)
2. Create an instance
3. Get **API Key** and **Instance URL** from dashboard

---

### 360dialog

**Required:**
- API Key

**Environment Variables:**
```env
REACT_APP_WHATSAPP_PROVIDER=360dialog
REACT_APP_WHATSAPP_API_URL=https://waba-api.360dialog.io/v1
REACT_APP_WHATSAPP_API_KEY=your_api_key_here
```

---

## Configuration Priority

The application checks configuration in this order:

1. **localStorage** (from UI configuration dialog)
2. **Environment Variables** (from `.env` file)
3. **Default Values** (fallback)

---

## Using Your Own Backend API

If you have your own backend API that stores WhatsApp data:

### 1. Set Backend URL

```env
REACT_APP_BASE_URL=http://localhost:8000/api/v1
```

### 2. Backend Endpoints Expected

Your backend should implement these endpoints (see `WHATSAPP_API_DOCUMENTATION.md`):

- `GET /whatsapp/chats` - Get all chats
- `POST /whatsapp/chats` - Create chat
- `GET /whatsapp/chats/:id` - Get chat by ID
- `GET /whatsapp/chats/:id/messages` - Get chat messages
- `POST /whatsapp/chats/:id/messages` - Send message
- `GET /whatsapp/agents` - Get all agents
- `GET /whatsapp/agents/online` - Get online agents
- `PUT /whatsapp/agents/:id/status` - Update agent status
- `POST /whatsapp/chats/:id/assign` - Assign chat
- `GET /whatsapp/labels` - Get labels
- `GET /whatsapp/templates` - Get templates
- `GET /whatsapp/followups` - Get follow-ups
- `GET /whatsapp/notes` - Get team notes
- `GET /whatsapp/blocked-numbers` - Get blocked numbers

### 3. Authentication

Your backend API should use the same authentication as your main API (Bearer token, etc.). The app uses `axiosServices` from `interceptor.js` which handles authentication automatically.

---

## Configuration Storage

### Development (localStorage)
- Stored in browser `localStorage`
- Persists across page refreshes
- Cleared when browser cache is cleared

### Production (Environment Variables)
- Stored in `.env` file (never commit to git!)
- More secure than localStorage
- Can be set via deployment platform (Vercel, Netlify, etc.)

### Backend API (Database)
- Store configuration in your backend database
- Use `/api/v1/whatsapp/config` endpoint
- More secure and centralized

---

## Verification

After configuration, verify it's working:

1. **Check Console:**
   - Open browser DevTools (F12)
   - Check for any configuration errors
   - Look for successful API calls

2. **Test Features:**
   - Navigate to `/whatsapp-inbox`
   - Check if chats are loading
   - Try sending a test message
   - Verify agents are loading

3. **Check Network Tab:**
   - Open Network tab in DevTools
   - Verify API calls are going to correct endpoints
   - Check for authentication errors

---

## Common Configuration Issues

### Issue: "Failed to fetch chats"

**Solutions:**
- Verify `REACT_APP_BASE_URL` is set correctly
- Check backend API is running and accessible
- Verify authentication token is valid
- Check CORS settings on backend

### Issue: "Invalid access token"

**Solutions:**
- Verify access token is correct
- Check token hasn't expired
- For Meta API, ensure token has `whatsapp_business_messaging` permission
- Regenerate token if needed

### Issue: "Phone number not found"

**Solutions:**
- Verify Phone Number ID is correct
- Check phone number is registered with provider
- For Meta, ensure phone number is verified

### Issue: "Configuration not saving"

**Solutions:**
- Check browser console for errors
- Verify localStorage is enabled
- Try clearing browser cache
- Use environment variables instead

---

## Security Best Practices

### ⚠️ Important Security Notes

1. **Never commit `.env` file to git**
   - Add `.env` to `.gitignore`
   - Use environment variables in deployment platform

2. **Use Backend API for Production**
   - Don't store API keys in frontend code
   - Proxy requests through your backend
   - Store credentials securely in backend

3. **Rotate Tokens Regularly**
   - Change access tokens periodically
   - Use permanent tokens for production (not temporary)

4. **Use HTTPS**
   - Always use HTTPS in production
   - Never send credentials over HTTP

5. **Validate Webhooks**
   - Verify webhook signatures
   - Use secure webhook tokens

---

## Example Configuration Files

### `.env` for Development (Meta WhatsApp)

```env
REACT_APP_BASE_URL=http://localhost:8000/api/v1
REACT_APP_WHATSAPP_PROVIDER=meta-whatsapp
REACT_APP_WHATSAPP_API_KEY=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=123456789012345
REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID=987654321
REACT_APP_WHATSAPP_API_VERSION=v18.0
REACT_APP_SOCKET_URL=http://localhost:3001
```

### `.env` for Production (with Backend)

```env
REACT_APP_BASE_URL=https://api.yourdomain.com/api/v1
REACT_APP_WHATSAPP_PROVIDER=meta-whatsapp
REACT_APP_SOCKET_URL=https://socket.yourdomain.com
```

(API credentials stored in backend database)

---

## Testing Configuration

### Quick Test Script

```javascript
// Test in browser console
import { WHATSAPP_API_CONFIG } from './api/whatsappAPI';

console.log('Provider:', WHATSAPP_API_CONFIG.provider);
console.log('Base URL:', WHATSAPP_API_CONFIG.baseURL);
console.log('Phone Number ID:', WHATSAPP_API_CONFIG.getPhoneNumberId());
console.log('Has API Key:', !!WHATSAPP_API_CONFIG.getApiKey());
```

### Test API Connection

```javascript
// Test in browser console
import { getAllChats } from './api/whatsappAPI';

getAllChats()
  .then(res => console.log('Chats:', res.data))
  .catch(err => console.error('Error:', err));
```

---

## Next Steps

1. **Configure Provider** - Choose and configure your WhatsApp provider
2. **Set Backend URL** - If using your own backend API
3. **Test Configuration** - Verify everything works
4. **Set Up Webhooks** - Configure webhooks for receiving messages (see `META_WHATSAPP_SETUP.md`)
5. **Deploy** - Deploy with environment variables set

---

## Additional Resources

- **Meta WhatsApp Setup**: See `META_WHATSAPP_SETUP.md`
- **API Documentation**: See `WHATSAPP_API_DOCUMENTATION.md`
- **API Models**: See `WHATSAPP_API_MODELS.md`
- **Features**: See `WHATSAPP_INBOX_FEATURES.md`

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify configuration values are correct
3. Check network tab for API call failures
4. Review provider-specific documentation
5. Check backend API logs (if using backend)

---

**Last Updated**: 2024-01-01

