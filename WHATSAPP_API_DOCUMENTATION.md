# WhatsApp API Documentation

This document provides comprehensive API documentation for all WhatsApp-related endpoints in the backend. Use these endpoints to integrate WhatsApp functionality with your CMS.

## Base URL
```
http://localhost:8000/api/v1/whatsapp
```

## Authentication
All endpoints (except webhook verification) require authentication. Include the authentication token in the request headers:
```
Authorization: Bearer <your_token>
```

---

## Table of Contents
1. [Configuration Management](#configuration-management)
2. [WhatsApp Cloud API (Meta)](#whatsapp-cloud-api-meta)
3. [Chats Management](#chats-management)
4. [Messages Management](#messages-management)
5. [Customers Management](#customers-management)
6. [Agents Management](#agents-management)
7. [Templates Management](#templates-management)
8. [Labels Management](#labels-management)
9. [Webhooks](#webhooks)
10. [Chat Assignments](#chat-assignments)
11. [Agent Performance](#agent-performance)
12. [Follow-ups](#follow-ups)
13. [Team Notes](#team-notes)
14. [Blocked Numbers](#blocked-numbers)

---

## Configuration Management

### Get All Configurations
**GET** `/config`

**Query Parameters:**
- `provider` (optional): Filter by provider (`meta-whatsapp`, `twilio`, `chatapi`)
- `isActive` (optional): Filter by active status (`true`/`false`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "id": "config_123",
      "provider": "meta-whatsapp",
      "isActive": true,
      "phoneNumberId": "123456789",
      "businessAccountId": "987654321",
      "apiVersion": "v18.0",
      "accessToken": "***",
      "webhookUrl": "https://your-domain.com/webhook",
      "webhookStatus": "active",
      "businessProfile": {
        "name": "Your Business",
        "description": "...",
        "email": "business@example.com"
      },
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Active Configuration
**GET** `/config/active`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "id": "config_123",
    "provider": "meta-whatsapp",
    "isActive": true,
    ...
  }
}
```

### Get Configuration by ID
**GET** `/config/:id`

### Create Configuration
**POST** `/config`

**Request Body:**
```json
{
  "provider": "meta-whatsapp",
  "isActive": true,
  "accessToken": "your_access_token",
  "phoneNumberId": "123456789",
  "businessAccountId": "987654321",
  "apiVersion": "v18.0",
  "webhookVerifyToken": "your_verify_token",
  "webhookSecret": "your_webhook_secret",
  "webhookUrl": "https://your-domain.com/api/v1/whatsapp/webhooks/meta-whatsapp",
  "businessProfile": {
    "name": "Your Business Name",
    "description": "Business description",
    "email": "business@example.com",
    "website": "https://example.com",
    "address": "Business Address"
  }
}
```

### Update Configuration
**PUT** `/config/:id`

**Request Body:** (Same as create, all fields optional)

### Activate Configuration
**PUT** `/config/:id/activate`

Activates a specific configuration and deactivates others of the same provider.

### Delete Configuration
**DELETE** `/config/:id`

Soft deletes the configuration.

---

## WhatsApp Cloud API (Meta)

Base URL: `/cloud-api`

### Webhook Verification
**GET** `/cloud-api/webhook`

**Query Parameters:**
- `hub.mode`: `subscribe`
- `hub.verify_token`: Your webhook verify token
- `hub.challenge`: Challenge string from Meta

**Note:** No authentication required. This is called by Meta for webhook verification.

### Subscribe to Webhook
**POST** `/cloud-api/webhook/subscribe`

**Request Body:**
```json
{
  "wabaId": "your_whatsapp_business_account_id",
  "callbackUrl": "https://your-domain.com/api/v1/whatsapp/webhooks/meta-whatsapp",
  "verifyToken": "your_verify_token"
}
```

### Get Phone Number Details
**GET** `/cloud-api/phone-numbers/:phoneNumberId`

### Register Phone Number
**POST** `/cloud-api/phone-numbers/:phoneNumberId/register`

**Request Body:**
```json
{
  "pin": "your_6_digit_pin"
}
```

### Send Text Message
**POST** `/cloud-api/messages/text`

**Request Body:**
```json
{
  "to": "1234567890",
  "message": "Hello, this is a test message!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "apiResponse": {
      "messaging_product": "whatsapp",
      "contacts": [...],
      "messages": [...]
    },
    "message": {
      "_id": "...",
      "id": "msg_123",
      "chatId": "...",
      "direction": "outbound",
      "type": "text",
      "text": "Hello, this is a test message!",
      "status": "sent",
      ...
    }
  }
}
```

### Send Template Message
**POST** `/cloud-api/messages/template`

**Request Body:**
```json
{
  "to": "1234567890",
  "templateName": "hello_world",
  "languageCode": "en",
  "components": [
    {
      "type": "body",
      "parameters": [
        {
          "type": "text",
          "text": "John"
        }
      ]
    }
  ]
}
```

### Send Media Message
**POST** `/cloud-api/messages/media`

**Request Body:**
```json
{
  "to": "1234567890",
  "mediaType": "image",
  "mediaIdOrUrl": "https://example.com/image.jpg",
  "caption": "Optional caption",
  "filename": "image.jpg"
}
```

**Media Types:** `image`, `video`, `audio`, `document`

### Mark Message as Read
**POST** `/cloud-api/messages/mark-read`

**Request Body:**
```json
{
  "messageId": "wamid.xxx"
}
```

### Get Message Status
**GET** `/cloud-api/messages/:messageId/status`

### Get Business Profile
**GET** `/cloud-api/business-profile/:phoneNumberId`

### Update Business Profile
**POST** `/cloud-api/business-profile/:phoneNumberId`

**Request Body:**
```json
{
  "messaging_product": "whatsapp",
  "address": "Business Address",
  "description": "Business Description",
  "vertical": "RETAIL",
  "email": "business@example.com",
  "websites": ["https://example.com"]
}
```

### Get Message Templates
**GET** `/cloud-api/templates?wabaId=your_waba_id`

### Create Message Template
**POST** `/cloud-api/templates?wabaId=your_waba_id`

**Request Body:**
```json
{
  "name": "hello_world",
  "language": "en",
  "category": "MARKETING",
  "components": [
    {
      "type": "BODY",
      "text": "Hello {{1}}! Welcome to our service."
    }
  ]
}
```

### Delete Message Template
**DELETE** `/cloud-api/templates/:templateName?wabaId=your_waba_id`

### Get Media URL
**GET** `/cloud-api/media/:mediaId`

---

## Chats Management

Base URL: `/chats`

### Get All Chats
**GET** `/chats`

**Query Parameters:**
- `status` (optional): Filter by status (`unassigned`, `assigned`, `resolved`, `closed`)
- `assignedTo` (optional): Filter by assigned agent ID
- `phoneNumber` (optional): Filter by phone number
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "id": "chat_123",
      "phoneNumber": "1234567890",
      "customerName": "John Doe",
      "customerId": "...",
      "status": "assigned",
      "assignedTo": "...",
      "labels": [...],
      "priority": "high",
      "lastMessage": {
        "text": "Hello",
        "timestamp": 1234567890
      },
      "lastMessageTime": "2024-01-01T00:00:00.000Z",
      "unreadCount": 5,
      "totalMessages": 10,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### Get Chat by ID
**GET** `/chats/:id`

### Create Chat
**POST** `/chats`

**Request Body:**
```json
{
  "phoneNumber": "1234567890",
  "customerName": "John Doe",
  "customerId": "customer_id_here",
  "status": "unassigned",
  "source": "whatsapp",
  "provider": "meta-whatsapp"
}
```

### Update Chat
**PUT** `/chats/:id`

**Request Body:** (All fields optional)
```json
{
  "status": "assigned",
  "assignedTo": "agent_id",
  "priority": "high",
  "labels": ["label_id_1", "label_id_2"]
}
```

### Delete Chat
**DELETE** `/chats/:id`

### Assign Chat to Agent
**POST** `/chats/:id/assign`

**Request Body:**
```json
{
  "agentId": "agent_id_here",
  "assignedBy": "user_id_here"
}
```

### Transfer Chat
**POST** `/chats/:id/transfer`

**Request Body:**
```json
{
  "toAgentId": "new_agent_id",
  "reason": "Escalation"
}
```

### Close Chat
**POST** `/chats/:id/close`

---

## Messages Management

Base URL: `/messages`

### Get Chat Messages
**GET** `/messages/chat/:chatId`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)
- `sortOrder` (optional): Sort order (`1` for ascending, `-1` for descending, default: `-1`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "id": "msg_123",
      "chatId": "...",
      "direction": "inbound",
      "type": "text",
      "text": "Hello!",
      "status": "read",
      "timestamp": 1234567890,
      "readStatus": "read",
      "readAt": 1234567890,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 100,
    "pages": 2
  }
}
```

### Get Message by ID
**GET** `/messages/:id`

### Send Message
**POST** `/messages/chat/:chatId`

**Request Body:**
```json
{
  "text": "Hello, how can I help you?",
  "type": "text",
  "direction": "outbound"
}
```

### Update Message
**PUT** `/messages/:id`

### Delete Message
**DELETE** `/messages/:id`

### Mark Message as Read
**PUT** `/messages/:id/read`

### Update Message Status
**PUT** `/messages/:id/status`

**Request Body:**
```json
{
  "status": "read",
  "readStatus": "read",
  "readAt": 1234567890
}
```

---

## Customers Management

Base URL: `/customers`

### Get All Customers
**GET** `/customers`

**Query Parameters:**
- `phoneNumber` (optional): Filter by phone number
- `email` (optional): Filter by email
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Customer by ID
**GET** `/customers/:id`

### Create Customer
**POST** `/customers`

**Request Body:**
```json
{
  "phoneNumber": "1234567890",
  "name": "John Doe",
  "email": "john@example.com",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "State",
    "country": "Country",
    "zipCode": "12345"
  }
}
```

### Update Customer
**PUT** `/customers/:id`

### Delete Customer
**DELETE** `/customers/:id`

### Get Customer Chats
**GET** `/customers/:id/chats`

---

## Agents Management

Base URL: `/agents`

### Get All Agents
**GET** `/agents`

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `inactive`, `away`)
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Agent by ID
**GET** `/agents/:id`

### Create Agent
**POST** `/agents`

**Request Body:**
```json
{
  "userId": "user_id_here",
  "name": "Agent Name",
  "email": "agent@example.com",
  "status": "active",
  "maxChats": 10,
  "skills": ["support", "sales"]
}
```

### Update Agent
**PUT** `/agents/:id`

### Delete Agent
**DELETE** `/agents/:id`

### Get Agent Chats
**GET** `/agents/:id/chats`

---

## Templates Management

Base URL: `/templates`

### Get All Templates
**GET** `/templates`

**Query Parameters:**
- `status` (optional): Filter by status (`approved`, `pending`, `rejected`)
- `category` (optional): Filter by category
- `language` (optional): Filter by language

### Get Template by ID
**GET** `/templates/:id`

### Create Template
**POST** `/templates`

**Request Body:**
```json
{
  "name": "welcome_message",
  "category": "MARKETING",
  "language": "en",
  "content": "Hello {{1}}, welcome!",
  "status": "pending"
}
```

### Update Template
**PUT** `/templates/:id`

### Delete Template
**DELETE** `/templates/:id`

---

## Labels Management

Base URL: `/labels`

### Get All Labels
**GET** `/labels`

### Get Label by ID
**GET** `/labels/:id`

### Create Label
**POST** `/labels`

**Request Body:**
```json
{
  "name": "VIP Customer",
  "color": "#FF5733",
  "description": "Very Important Customer"
}
```

### Update Label
**PUT** `/labels/:id`

### Delete Label
**DELETE** `/labels/:id`

---

## Webhooks

Base URL: `/webhooks`

### Receive Webhook Event
**POST** `/webhooks/:provider`

**Note:** No authentication required. This endpoint receives webhook events from WhatsApp providers.

**Supported Providers:** `meta-whatsapp`, `twilio`, `chatapi`

**Request Body:** (Varies by provider)
```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "...",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {...},
            "messages": [...]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

### Get Webhook Events
**GET** `/webhooks/events`

**Query Parameters:**
- `eventType` (optional): Filter by event type
- `provider` (optional): Filter by provider
- `status` (optional): Filter by status
- `chatId` (optional): Filter by chat ID
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Webhook Event by ID
**GET** `/webhooks/events/:id`

### Retry Webhook Processing
**POST** `/webhooks/events/:id/retry`

---

## Chat Assignments

Base URL: `/assignments`

### Get All Assignments
**GET** `/assignments`

**Query Parameters:**
- `agentId` (optional): Filter by agent ID
- `chatId` (optional): Filter by chat ID
- `status` (optional): Filter by status
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Assignment by ID
**GET** `/assignments/:id`

### Create Assignment
**POST** `/assignments`

**Request Body:**
```json
{
  "chatId": "chat_id_here",
  "agentId": "agent_id_here",
  "assignedBy": "user_id_here",
  "priority": "high"
}
```

### Update Assignment
**PUT** `/assignments/:id`

### Delete Assignment
**DELETE** `/assignments/:id`

---

## Agent Performance

Base URL: `/performance`

### Get Agent Performance
**GET** `/performance`

**Query Parameters:**
- `agentId` (optional): Filter by agent ID
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "agentId": "...",
      "period": "2024-01",
      "totalChats": 100,
      "resolvedChats": 85,
      "avgResponseTime": 120,
      "avgResolutionTime": 1800,
      "customerSatisfaction": 4.5,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Get Performance by Agent ID
**GET** `/performance/agent/:agentId`

### Create Performance Record
**POST** `/performance`

---

## Follow-ups

Base URL: `/followups`

### Get All Follow-ups
**GET** `/followups`

**Query Parameters:**
- `chatId` (optional): Filter by chat ID
- `status` (optional): Filter by status
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Follow-up by ID
**GET** `/followups/:id`

### Create Follow-up
**POST** `/followups`

**Request Body:**
```json
{
  "chatId": "chat_id_here",
  "scheduledAt": "2024-01-02T10:00:00.000Z",
  "message": "Follow-up message",
  "status": "pending"
}
```

### Update Follow-up
**PUT** `/followups/:id`

### Delete Follow-up
**DELETE** `/followups/:id`

---

## Team Notes

Base URL: `/notes`

### Get All Notes
**GET** `/notes`

**Query Parameters:**
- `chatId` (optional): Filter by chat ID
- `authorId` (optional): Filter by author ID
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Note by ID
**GET** `/notes/:id`

### Create Note
**POST** `/notes`

**Request Body:**
```json
{
  "chatId": "chat_id_here",
  "authorId": "user_id_here",
  "content": "Internal note about this chat",
  "isPrivate": false
}
```

### Update Note
**PUT** `/notes/:id`

### Delete Note
**DELETE** `/notes/:id`

---

## Blocked Numbers

Base URL: `/blocked-numbers`

### Get All Blocked Numbers
**GET** `/blocked-numbers`

**Query Parameters:**
- `phoneNumber` (optional): Filter by phone number
- `page` (optional): Page number
- `limit` (optional): Items per page

### Get Blocked Number by ID
**GET** `/blocked-numbers/:id`

### Block Number
**POST** `/blocked-numbers`

**Request Body:**
```json
{
  "phoneNumber": "1234567890",
  "reason": "Spam",
  "blockedBy": "user_id_here"
}
```

### Unblock Number
**DELETE** `/blocked-numbers/:id`

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

---

## Integration Example

### Example: Send a WhatsApp Message via CMS

```javascript
// 1. Configure WhatsApp (one-time setup)
POST /api/v1/whatsapp/config
{
  "provider": "meta-whatsapp",
  "isActive": true,
  "accessToken": "your_token",
  "phoneNumberId": "123456789",
  "businessAccountId": "987654321",
  "webhookVerifyToken": "your_verify_token"
}

// 2. Send a message
POST /api/v1/whatsapp/cloud-api/messages/text
Headers: { "Authorization": "Bearer <token>" }
{
  "to": "1234567890",
  "message": "Hello from CMS!"
}

// 3. Get chat messages
GET /api/v1/whatsapp/messages/chat/:chatId?page=1&limit=50
Headers: { "Authorization": "Bearer <token>" }
```

---

## Webhook Setup

1. **Configure Webhook in Meta Dashboard:**
   - Webhook URL: `https://your-domain.com/api/v1/whatsapp/webhooks/meta-whatsapp`
   - Verify Token: Your configured `webhookVerifyToken`
   - Subscribe to: `messages`, `message_status`

2. **Verify Webhook:**
   - Meta will call: `GET /api/v1/whatsapp/cloud-api/webhook?hub.mode=subscribe&hub.verify_token=xxx&hub.challenge=xxx`
   - This is automatically handled by the `verifyWebhook` endpoint

3. **Receive Events:**
   - Incoming messages and status updates will be automatically processed
   - Messages are saved to database
   - Chats and customers are created/updated automatically

---

## Notes

- All timestamps are in milliseconds (Unix timestamp)
- Phone numbers should be in international format without `+` (e.g., `1234567890`)
- Sensitive data (tokens, API keys) are masked in responses (shown as `***`)
- All delete operations are soft deletes (sets `isDeleted: true`)
- Pagination is available on most list endpoints

---

**Last Updated:** 2024-01-01

