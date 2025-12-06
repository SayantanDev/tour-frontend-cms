# Meta WhatsApp Cloud API Setup Guide

This guide will help you set up the WhatsApp Inbox Dashboard with Meta's WhatsApp Cloud API.

## Prerequisites

1. **Meta Business Account** - You need a Meta Business Account
2. **WhatsApp Business Account** - Create a WhatsApp Business Account
3. **Meta App** - Create a Meta App in Meta for Developers
4. **Access Token** - Generate a permanent or temporary access token
5. **Phone Number ID** - Your WhatsApp Business Phone Number ID

## Step-by-Step Setup

### 1. Create Meta App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Click "My Apps" → "Create App"
3. Select "Business" as the app type
4. Fill in app details and create

### 2. Add WhatsApp Product

1. In your app dashboard, click "Add Product"
2. Find "WhatsApp" and click "Set Up"
3. Follow the setup wizard

### 3. Get Phone Number ID

1. In your app dashboard, go to WhatsApp → API Setup
2. You'll see your **Phone Number ID** (starts with a number like `123456789012345`)
3. Copy this ID - you'll need it for configuration

### 4. Generate Access Token

1. In WhatsApp → API Setup, you'll see "Temporary access token"
2. For development, you can use this temporary token
3. For production, create a **System User** and generate a permanent token:
   - Go to Business Settings → System Users
   - Create a new system user
   - Assign WhatsApp permissions
   - Generate token with "Never expire" option

### 5. Configure in Application

#### Method 1: UI Configuration

1. Navigate to `/whatsapp-inbox` in your application
2. Click the Settings icon (⚙️) in the top-right
3. Select "Meta WhatsApp Cloud API" as provider
4. Enter your credentials:
   - **API Base URL**: `https://graph.facebook.com`
   - **Access Token**: Your Meta access token
   - **Phone Number ID**: Your phone number ID
   - **Business Account ID**: (Optional) Your business account ID
   - **API Version**: `v18.0` (or latest version)
5. Click "Save Configuration"

#### Method 2: Environment Variables

Create a `.env` file:

```env
REACT_APP_WHATSAPP_PROVIDER=whatsapp-business
REACT_APP_WHATSAPP_API_URL=https://graph.facebook.com
REACT_APP_WHATSAPP_API_KEY=your_access_token_here
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=123456789012345
REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
REACT_APP_WHATSAPP_API_VERSION=v18.0
```

## Webhook Setup (For Receiving Messages)

Meta WhatsApp Cloud API requires webhooks to receive incoming messages. Since this is a frontend application, you have two options:

### Option 1: Use a Webhook Proxy Service

Use services like:
- **ngrok** - For local development
- **Cloudflare Workers** - For production
- **AWS Lambda** - For production
- **Vercel/Netlify Functions** - For production

### Option 2: Backend Webhook Handler

Create a simple backend endpoint that:
1. Receives webhooks from Meta
2. Stores messages in your database
3. Your frontend polls or uses WebSockets to get updates

### Webhook Configuration

1. In Meta App Dashboard → WhatsApp → Configuration
2. Click "Edit" under Webhook
3. Enter your webhook URL: `https://your-domain.com/webhook/whatsapp`
4. Enter verify token (any secure string)
5. Subscribe to these fields:
   - `messages`
   - `message_status`
   - `message_template_status_update`

### Webhook Verification

Meta will send a GET request to verify your webhook:

```
GET /webhook/whatsapp?hub.mode=subscribe&hub.challenge=CHALLENGE_STRING&hub.verify_token=YOUR_VERIFY_TOKEN
```

Your server should respond with the `hub.challenge` value.

### Processing Webhooks

When you receive a webhook, call the `processWebhook` function in your backend:

```javascript
import { processWebhook } from './api/whatsappAPI';

// In your webhook endpoint
app.post('/webhook/whatsapp', (req, res) => {
  processWebhook(req.body);
  res.status(200).send('OK');
});
```

## Sending Messages

### Text Messages

The application automatically sends text messages using the Meta API format:

```javascript
POST /v18.0/{phone-number-id}/messages
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+1234567890",
  "type": "text",
  "text": {
    "body": "Your message here"
  }
}
```

### Template Messages (First-Time Conversations)

For users who haven't messaged you first, you must use approved message templates:

```javascript
POST /v18.0/{phone-number-id}/messages
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "+1234567890",
  "type": "template",
  "template": {
    "name": "hello_world",
    "language": {
      "code": "en"
    }
  }
}
```

### Media Messages

Use the `sendMediaMessage` function:

```javascript
import { sendMediaMessage } from './api/whatsappAPI';

// Send image
sendMediaMessage(
  phoneNumber,
  'https://example.com/image.jpg',
  'image',
  'Optional caption'
);
```

## Important Notes

### 24-Hour Window

- Users can message you freely within 24 hours of their last message
- After 24 hours, you can only send template messages
- Template messages must be pre-approved by Meta

### Message Templates

1. Go to WhatsApp → Message Templates
2. Create a new template
3. Wait for approval (usually 24-48 hours)
4. Use approved templates for outbound messages

### Rate Limits

- **Tier 1**: 1,000 conversations per day
- **Tier 2**: 10,000 conversations per day
- **Tier 3**: 100,000 conversations per day
- **Tier 4**: Unlimited

### Phone Number Format

Always use E.164 format: `+[country code][number]`
- Example: `+1234567890` (US)
- Example: `+919876543210` (India)

## Testing

1. **Send a test message** from your WhatsApp Business number
2. **Check webhook** - Verify you're receiving webhooks
3. **Send reply** - Try sending a message from the dashboard
4. **Check delivery status** - Verify message delivery

## Troubleshooting

### "Invalid OAuth access token"

- Verify your access token is correct
- Check token hasn't expired
- Ensure token has `whatsapp_business_messaging` permission

### "Phone number not found"

- Verify Phone Number ID is correct
- Ensure phone number is registered with your Meta App

### "Message failed to send"

- Check if user is within 24-hour window
- For first-time messages, use template messages
- Verify phone number format (E.164)

### "Webhook not receiving messages"

- Verify webhook URL is accessible
- Check webhook is verified
- Ensure correct fields are subscribed
- Check webhook logs in Meta App Dashboard

### "Rate limit exceeded"

- You've exceeded your tier limit
- Wait for limit reset or upgrade tier
- Check usage in Meta App Dashboard

## Security Best Practices

1. **Never expose access token** in frontend code (use environment variables)
2. **Use permanent tokens** for production (not temporary tokens)
3. **Rotate tokens** regularly
4. **Use HTTPS** for webhooks
5. **Validate webhook signatures** (Meta provides X-Hub-Signature-256 header)
6. **Store tokens securely** (consider using a backend proxy)

## API Reference

- [Meta WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Graph API Reference](https://developers.facebook.com/docs/graph-api)
- [Webhook Reference](https://developers.facebook.com/docs/graph-api/webhooks)

## Support

- [Meta Business Help Center](https://www.facebook.com/business/help)
- [WhatsApp Business API Support](https://business.whatsapp.com/)
- [Developer Community](https://developers.facebook.com/community)

