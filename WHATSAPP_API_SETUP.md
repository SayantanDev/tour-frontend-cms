# WhatsApp API Direct Integration Setup

This application connects directly to external WhatsApp API providers without requiring your own backend.

## Supported Providers

1. **Twilio** - Twilio Conversations API
2. **WhatsApp Business API** - Meta's official WhatsApp Business API
3. **ChatAPI** - ChatAPI WhatsApp service
4. **360dialog** - 360dialog WhatsApp Business API
5. **Custom** - Any custom WhatsApp API provider

## Configuration

### Method 1: Environment Variables (Recommended for Production)

Create a `.env` file in your project root:

```env
# WhatsApp API Provider (twilio, whatsapp-business, chatapi, 360dialog, custom)
REACT_APP_WHATSAPP_PROVIDER=twilio

# API Base URL
REACT_APP_WHATSAPP_API_URL=https://conversations.twilio.com

# API Credentials (varies by provider)
REACT_APP_WHATSAPP_API_KEY=your_api_key_here
REACT_APP_WHATSAPP_API_SECRET=your_api_secret_here
REACT_APP_WHATSAPP_ACCOUNT_SID=your_account_sid_here
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
```

### Method 2: UI Configuration

1. Navigate to `/whatsapp-inbox`
2. Click the Settings icon (⚙️) in the top-right of the chat list
3. Fill in your API credentials
4. Click "Save Configuration"

Credentials are stored in browser localStorage.

## Provider-Specific Setup

### Twilio

**Required:**
- Account SID
- Auth Token (API Secret)

**Base URL:** `https://conversations.twilio.com`

**Authentication:** Basic Auth (Account SID:Auth Token)

**Example:**
```env
REACT_APP_WHATSAPP_PROVIDER=twilio
REACT_APP_WHATSAPP_API_URL=https://conversations.twilio.com
REACT_APP_WHATSAPP_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_WHATSAPP_API_SECRET=your_auth_token_here
```

### WhatsApp Business API (Meta)

**Required:**
- Access Token
- Phone Number ID

**Base URL:** `https://graph.facebook.com/v18.0`

**Authentication:** Bearer Token

**Example:**
```env
REACT_APP_WHATSAPP_PROVIDER=whatsapp-business
REACT_APP_WHATSAPP_API_URL=https://graph.facebook.com/v18.0
REACT_APP_WHATSAPP_API_KEY=your_access_token_here
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=123456789012345
```

### ChatAPI

**Required:**
- API Key

**Base URL:** `https://eu1.chat-api.com/instance12345` (your instance URL)

**Authentication:** API Key in header

**Example:**
```env
REACT_APP_WHATSAPP_PROVIDER=chatapi
REACT_APP_WHATSAPP_API_URL=https://eu1.chat-api.com/instance12345
REACT_APP_WHATSAPP_API_KEY=your_api_key_here
```

### 360dialog

**Required:**
- API Key

**Base URL:** `https://waba-api.360dialog.io/v1`

**Authentication:** API Key in header

**Example:**
```env
REACT_APP_WHATSAPP_PROVIDER=360dialog
REACT_APP_WHATSAPP_API_URL=https://waba-api.360dialog.io/v1
REACT_APP_WHATSAPP_API_KEY=your_api_key_here
```

## API Endpoints Mapping

The application automatically maps to provider-specific endpoints:

### Get Chats
- **Twilio:** `GET /v1/Conversations`
- **WhatsApp Business:** `GET /{phoneNumberId}/conversations`
- **ChatAPI:** `GET /dialogs`

### Send Message
- **Twilio:** `POST /v1/Conversations/{chatId}/Messages`
- **WhatsApp Business:** `POST /{phoneNumberId}/messages`
- **ChatAPI:** `POST /sendMessage`

### Get Messages
- **Twilio:** `GET /v1/Conversations/{chatId}/Messages`
- **WhatsApp Business:** `GET /{phoneNumberId}/messages?conversation_id={chatId}`
- **ChatAPI:** `GET /dialogs/{chatId}/messages`

## Internal Features (LocalStorage)

The following features are stored locally in the browser (localStorage) since they're not part of the WhatsApp API:

- **Agent Management** - Agent list, status, assignments
- **Labels/Tags** - Custom labels for organizing chats
- **Templates** - Message templates
- **Team Notes** - Internal notes for conversations
- **Follow-ups** - Scheduled follow-up reminders
- **Blocked Numbers** - List of blocked phone numbers
- **Customer Info** - Customer profile information
- **Chat Assignments** - Which agent is assigned to which chat

**Note:** For production, you may want to store these in your own backend database.

## WebSocket/Real-time Updates

For real-time message delivery and typing indicators, you'll need to:

1. Set up a WebSocket connection to your provider's real-time API
2. Update the Socket.io connection in `src/pages/whatsappInbox/index.js`
3. Configure `REACT_APP_SOCKET_URL` if using a separate WebSocket server

### Provider WebSocket Options:

- **Twilio:** Twilio Sync or Conversations WebSocket
- **WhatsApp Business:** Meta Webhooks (requires backend proxy)
- **ChatAPI:** ChatAPI WebSocket
- **360dialog:** Webhook-based (requires backend proxy)

## Security Notes

⚠️ **Important:** Storing API keys in localStorage is convenient for development but not secure for production.

**Production Recommendations:**

1. **Backend Proxy:** Create a backend service that:
   - Stores API credentials securely
   - Proxies requests to WhatsApp API
   - Handles authentication
   - Manages rate limiting

2. **Environment Variables:** Use environment variables for API keys (never commit to git)

3. **Token Rotation:** Implement token rotation for long-lived tokens

4. **HTTPS Only:** Always use HTTPS in production

## Testing

1. Configure your provider credentials
2. Navigate to `/whatsapp-inbox`
3. The app will attempt to fetch chats from your configured provider
4. Check browser console for any API errors
5. Verify messages can be sent and received

## Troubleshooting

### "Failed to fetch chats"
- Verify API credentials are correct
- Check base URL is correct for your provider
- Verify API key has necessary permissions
- Check browser console for detailed error messages

### "Unauthorized" errors
- Verify API key/token is valid and not expired
- Check authentication method matches provider requirements
- For WhatsApp Business API, verify token has `whatsapp_business_messaging` permission

### Messages not sending
- Verify phone number format (E.164: +1234567890)
- Check provider-specific message format requirements
- Verify phone number is registered with provider

## Migration from Backend API

If you were previously using a backend API, the application will:
- Use localStorage for internal features (agents, labels, templates, etc.)
- Connect directly to WhatsApp API for messaging
- Maintain the same UI and functionality

No code changes needed - just configure the API credentials!

