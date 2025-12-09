# WhatsApp API - Backend Model Structures

This document provides comprehensive model structures for storing all WhatsApp-related data in your own backend API. These models can be implemented in any backend framework (Node.js/MongoDB, Node.js/PostgreSQL, Python/Django, etc.).

---

## 1. Chat Model

Represents a WhatsApp conversation/chat.

### Schema Structure

```javascript
{
  _id: ObjectId/String,              // Primary key
  id: String,                        // Unique chat identifier (phone number or chat ID)
  phoneNumber: String,                // Customer phone number (with country code, e.g., +1234567890)
  customerName: String,               // Customer display name
  customerId: ObjectId/String,        // Reference to Customer/User model (optional)
  
  // Status & Assignment
  status: String,                     // 'unassigned' | 'assigned' | 'resolved' | 'closed'
  assignedTo: ObjectId/String,        // Reference to Agent model
  assignedAt: Date,                   // When chat was assigned
  assignedBy: ObjectId/String,        // Reference to User who assigned
  
  // Chat Metadata
  labels: [ObjectId/String],          // Array of Label IDs
  priority: String,                   // 'low' | 'medium' | 'high' | 'urgent'
  source: String,                     // 'whatsapp' | 'api' | 'webhook'
  
  // Message Info
  lastMessage: Object,                // Last message object
  lastMessageTime: Date,              // Timestamp of last message
  lastMessageId: String,              // WhatsApp message ID (wamid)
  unreadCount: Number,                // Number of unread messages (default: 0)
  
  // WhatsApp Provider Info
  provider: String,                   // 'meta-whatsapp' | 'twilio' | 'chatapi' | etc.
  providerChatId: String,              // Chat ID from provider (if different from id)
  whatsappBusinessAccountId: String,  // Meta Business Account ID
  phoneNumberId: String,               // Meta Phone Number ID
  
  // Customer Info
  customerInfo: {
    email: String,
    address: String,
    city: String,
    country: String,
    notes: String,
    tags: [String]
  },
  
  // Timestamps
  createdAt: Date,                    // When chat was created
  updatedAt: Date,                    // Last update timestamp
  closedAt: Date,                     // When chat was closed (if applicable)
  
  // Transfer History
  transferHistory: [{
    fromAgent: ObjectId/String,
    toAgent: ObjectId/String,
    transferredAt: Date,
    reason: String
  }],
  
  // Statistics
  firstResponseTime: Number,          // Time to first response in seconds
  avgResponseTime: Number,            // Average response time in seconds
  totalMessages: Number,              // Total message count
  customerMessages: Number,           // Messages from customer
  agentMessages: Number,              // Messages from agents
  
  // Soft delete
  isDeleted: Boolean,                 // Soft delete flag (default: false)
  deletedAt: Date
}
```

### Indexes

```javascript
// Recommended indexes for performance
db.chats.createIndex({ phoneNumber: 1 });
db.chats.createIndex({ status: 1 });
db.chats.createIndex({ assignedTo: 1 });
db.chats.createIndex({ createdAt: -1 });
db.chats.createIndex({ lastMessageTime: -1 });
db.chats.createIndex({ labels: 1 });
db.chats.createIndex({ isDeleted: 1, status: 1 });
```

---

## 2. Message Model

Represents individual messages within a chat.

### Schema Structure

```javascript
{
  _id: ObjectId/String,              // Primary key
  id: String,                        // WhatsApp message ID (wamid) or custom ID
  chatId: ObjectId/String,            // Reference to Chat model
  
  // Message Content
  text: String,                      // Message text content
  type: String,                      // 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact' | 'sticker'
  
  // Media (if type is media)
  media: {
    url: String,                     // Media URL
    mediaId: String,                 // WhatsApp media ID
    mimeType: String,                // MIME type (e.g., 'image/jpeg')
    fileName: String,                // Original filename
    fileSize: Number,                 // File size in bytes
    caption: String,                 // Media caption
    thumbnailUrl: String             // Thumbnail URL (for images/videos)
  },
  
  // Location (if type is location)
  location: {
    latitude: Number,
    longitude: Number,
    name: String,
    address: String
  },
  
  // Contact (if type is contact)
  contact: {
    name: String,
    phoneNumber: String,
    vcard: String
  },
  
  // Message Direction
  direction: String,                 // 'inbound' | 'outbound'
  from: String,                     // Sender phone number
  to: String,                       // Recipient phone number
  
  // Reply Context
  context: {
    messageId: String,              // Message ID being replied to
    from: String,                    // Original message sender
    referredProduct: Object          // Product/service reference (optional)
  },
  
  // Status & Read Receipts
  status: String,                    // 'sent' | 'delivered' | 'read' | 'failed'
  readStatus: String,                 // 'sent' | 'delivered' | 'read'
  readAt: Date,                      // When message was read
  deliveredAt: Date,                  // When message was delivered
  
  // Sender Info
  senderId: ObjectId/String,          // Reference to Agent/User (if outbound from agent)
  senderName: String,                // Sender display name
  senderType: String,                 // 'agent' | 'customer' | 'system'
  
  // WhatsApp Provider Info
  provider: String,                   // 'meta-whatsapp' | 'twilio' | etc.
  providerMessageId: String,         // Provider's message ID
  providerStatus: String,             // Provider-specific status
  
  // Template (if sent via template)
  template: {
    name: String,
    language: String,
    parameters: [String]
  },
  
  // Error Handling
  error: {
    code: String,
    message: String,
    retryable: Boolean
  },
  
  // Timestamps
  timestamp: Date,                    // Message timestamp
  createdAt: Date,                    // When record was created
  updatedAt: Date,                    // Last update timestamp
  
  // Metadata
  metadata: Object,                   // Additional metadata (flexible)
  isDeleted: Boolean                  // Soft delete flag
}
```

### Indexes

```javascript
db.messages.createIndex({ chatId: 1, timestamp: -1 });
db.messages.createIndex({ id: 1 }, { unique: true });
db.messages.createIndex({ providerMessageId: 1 });
db.messages.createIndex({ timestamp: -1 });
db.messages.createIndex({ senderId: 1 });
db.messages.createIndex({ status: 1 });
```

---

## 3. Agent Model

Represents WhatsApp agents/users who can handle chats.

### Schema Structure

```javascript
{
  _id: ObjectId/String,              // Primary key
  id: String,                        // Unique agent identifier
  userId: ObjectId/String,            // Reference to User model
  
  // Agent Info
  name: String,                      // Agent display name
  email: String,                     // Agent email
  phoneNumber: String,               // Agent phone number
  avatar: String,                    // Avatar URL
  
  // Status & Availability
  status: String,                    // 'online' | 'away' | 'busy' | 'offline'
  availability: String,              // 'available' | 'unavailable'
  isOnline: Boolean,                 // Online status flag
  lastSeen: Date,                    // Last seen timestamp
  
  // Capacity & Limits
  maxConcurrentChats: Number,        // Maximum concurrent chats (default: 5)
  currentChatCount: Number,          // Current active chats (default: 0)
  
  // Permissions
  permissions: {
    canAssignChats: Boolean,
    canTransferChats: Boolean,
    canViewAllChats: Boolean,
    canManageTemplates: Boolean,
    canManageLabels: Boolean,
    canBlockNumbers: Boolean,
    canViewReports: Boolean
  },
  
  // Performance Metrics
  stats: {
    totalChatsHandled: Number,
    avgResponseTime: Number,         // Average response time in seconds
    avgResolutionTime: Number,       // Average chat resolution time
    customerSatisfaction: Number,    // Rating (1-5)
    messagesSent: Number,
    messagesReceived: Number
  },
  
  // Working Hours (optional)
  workingHours: {
    timezone: String,
    schedule: [{
      day: String,                   // 'monday' | 'tuesday' | etc.
      start: String,                  // '09:00'
      end: String,                    // '17:00'
      enabled: Boolean
    }]
  },
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastActiveAt: Date,
  
  // Status
  isActive: Boolean,                 // Active agent flag (default: true)
  isDeleted: Boolean
}
```

### Indexes

```javascript
db.agents.createIndex({ userId: 1 }, { unique: true });
db.agents.createIndex({ status: 1 });
db.agents.createIndex({ isOnline: 1 });
db.agents.createIndex({ isActive: 1 });
```

---

## 4. Label Model

Represents tags/labels for organizing chats.

### Schema Structure

```javascript
{
  _id: ObjectId/String,              // Primary key
  id: String,                        // Unique label identifier
  name: String,                      // Label name (required, unique)
  color: String,                     // Hex color code (e.g., '#FF5733')
  description: String,               // Label description (optional)
  
  // Usage Stats
  usageCount: Number,                // Number of chats using this label (default: 0)
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId/String,        // Reference to User who created
  
  // Status
  isActive: Boolean,                 // Active label flag (default: true)
  isDeleted: Boolean
}
```

### Indexes

```javascript
db.labels.createIndex({ name: 1 }, { unique: true });
db.labels.createIndex({ isActive: 1 });
```

---

## 5. Template Model

Represents message templates for quick replies.

### Schema Structure

```javascript
{
  _id: ObjectId/String,              // Primary key
  id: String,                        // Unique template identifier
  name: String,                      // Template name (required)
  content: String,                   // Template content/text
  category: String,                  // Template category (e.g., 'greeting', 'support', 'sales')
  
  // Template Variables
  variables: [String],               // Array of variable names (e.g., ['name', 'orderId'])
  
  // WhatsApp Template Info (if synced with WhatsApp)
  whatsappTemplateId: String,       // WhatsApp template ID (if approved by Meta)
  whatsappTemplateName: String,      // WhatsApp template name
  language: String,                  // Template language code (e.g., 'en', 'es')
  status: String,                   // 'pending' | 'approved' | 'rejected' | 'local'
  
  // Usage Stats
  usageCount: Number,                // Number of times used (default: 0)
  lastUsedAt: Date,                  // Last usage timestamp
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId/String,        // Reference to User who created
  
  // Status
  isActive: Boolean,                 // Active template flag (default: true)
  isDeleted: Boolean
}
```

### Indexes

```javascript
db.templates.createIndex({ name: 1 });
db.templates.createIndex({ category: 1 });
db.templates.createIndex({ isActive: 1 });
db.templates.createIndex({ whatsappTemplateId: 1 });
```

---

## 6. FollowUp Model

Represents scheduled follow-up reminders for chats.

### Schema Structure

```javascript
{
  _id: ObjectId/String,              // Primary key
  id: String,                        // Unique follow-up identifier
  chatId: ObjectId/String,            // Reference to Chat model
  agentId: ObjectId/String,           // Reference to Agent model (who should follow up)
  
  // Follow-up Details
  title: String,                     // Follow-up title
  notes: String,                     // Follow-up notes/description
  scheduledAt: Date,                 // When to follow up (required)
  
  // Status
  status: String,                    // 'pending' | 'completed' | 'cancelled' | 'overdue'
  completedAt: Date,                 // When follow-up was completed
  completedBy: ObjectId/String,       // Reference to User who completed
  
  // Priority
  priority: String,                   // 'low' | 'medium' | 'high'
  
  // Reminder Settings
  reminderSent: Boolean,              // Whether reminder was sent (default: false)
  reminderSentAt: Date,               // When reminder was sent
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId/String,        // Reference to User who created
  
  // Status
  isDeleted: Boolean
}
```

### Indexes

```javascript
db.followups.createIndex({ chatId: 1 });
db.followups.createIndex({ agentId: 1 });
db.followups.createIndex({ scheduledAt: 1 });
db.followups.createIndex({ status: 1 });
db.followups.createIndex({ scheduledAt: 1, status: 1 }); // For finding pending follow-ups
```

---

## 7. TeamNote Model

Represents internal notes added to chats by team members.

### Schema Structure

```javascript
{
  _id: ObjectId/String,              // Primary key
  id: String,                        // Unique note identifier
  chatId: ObjectId/String,            // Reference to Chat model
  
  // Note Content
  note: String,                      // Note text/content (required)
  
  // Author Info
  authorId: ObjectId/String,          // Reference to User/Agent who created
  authorName: String,                // Author display name
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  
  // Edit History
  editedAt: Date,                    // Last edit timestamp
  editedBy: ObjectId/String,          // Reference to User who last edited
  editHistory: [{                    // Edit history (optional)
    note: String,
    editedAt: Date,
    editedBy: ObjectId/String
  }],
  
  // Status
  isDeleted: Boolean
}
```

### Indexes

```javascript
db.teamnotes.createIndex({ chatId: 1, createdAt: -1 });
db.teamnotes.createIndex({ authorId: 1 });
```

---

## 8. BlockedNumber Model

Represents blocked phone numbers.

### Schema Structure

```javascript
{
  _id: ObjectId/String,              // Primary key
  id: String,                        // Unique identifier
  phoneNumber: String,               // Blocked phone number (with country code)
  
  // Blocking Info
  reason: String,                    // Reason for blocking
  notes: String,                     // Additional notes
  
  // Blocked By
  blockedBy: ObjectId/String,         // Reference to User who blocked
  blockedByName: String,             // User display name
  
  // Timestamps
  blockedAt: Date,                   // When number was blocked
  createdAt: Date,
  updatedAt: Date,
  
  // Unblock Info
  unblockedAt: Date,                 // When number was unblocked (if applicable)
  unblockedBy: ObjectId/String,       // Reference to User who unblocked
  
  // Status
  isActive: Boolean,                 // Whether block is active (default: true)
  isDeleted: Boolean
}
```

### Indexes

```javascript
db.blockednumbers.createIndex({ phoneNumber: 1 }, { unique: true });
db.blockednumbers.createIndex({ isActive: 1 });
db.blockednumbers.createIndex({ blockedAt: -1 });
```

---

## 9. Customer Model (Optional - Enhanced Customer Info)

Represents customer profile information.

### Schema Structure

```javascript
{
  _id: ObjectId/String,              // Primary key
  id: String,                        // Unique customer identifier
  phoneNumber: String,               // Primary phone number (unique, required)
  
  // Personal Info
  name: String,                      // Customer name
  email: String,                     // Email address
  avatar: String,                    // Avatar URL
  
  // Contact Info
  alternatePhoneNumbers: [String],    // Additional phone numbers
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Customer Metadata
  tags: [String],                    // Custom tags
  notes: String,                     // General notes about customer
  language: String,                  // Preferred language
  
  // WhatsApp Info
  whatsappName: String,              // Name from WhatsApp profile
  whatsappProfilePicture: String,    // Profile picture URL
  isVerified: Boolean,              // WhatsApp verified status
  
  // Statistics
  totalChats: Number,                // Total number of chats
  totalMessages: Number,             // Total messages exchanged
  firstContactAt: Date,              // First contact timestamp
  lastContactAt: Date,               // Last contact timestamp
  
  // Preferences
  preferredAgent: ObjectId/String,     // Preferred agent (if any)
  preferredContactTime: String,       // Preferred contact time
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  
  // Status
  isActive: Boolean,
  isDeleted: Boolean
}
```

### Indexes

```javascript
db.customers.createIndex({ phoneNumber: 1 }, { unique: true });
db.customers.createIndex({ email: 1 });
db.customers.createIndex({ name: 1 });
db.customers.createIndex({ tags: 1 });
```

---

## 10. WebhookEvent Model

Represents incoming webhook events from WhatsApp providers.

### Schema Structure

```javascript
{
  _id: ObjectId/String,              // Primary key
  id: String,                        // Unique event identifier
  
  // Event Info
  eventType: String,                 // 'message' | 'status' | 'read_receipt' | 'typing' | etc.
  provider: String,                  // 'meta-whatsapp' | 'twilio' | etc.
  
  // Raw Webhook Data
  rawData: Object,                   // Complete webhook payload (for debugging)
  
  // Processed Data
  processedData: Object,             // Processed/extracted data
  chatId: ObjectId/String,            // Reference to Chat (if applicable)
  messageId: ObjectId/String,         // Reference to Message (if applicable)
  
  // Processing Status
  status: String,                    // 'pending' | 'processed' | 'failed' | 'ignored'
  processedAt: Date,                 // When event was processed
  error: String,                     // Error message (if processing failed)
  
  // Timestamps
  receivedAt: Date,                  // When webhook was received
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
db.webhookevents.createIndex({ eventType: 1 });
db.webhookevents.createIndex({ status: 1 });
db.webhookevents.createIndex({ receivedAt: -1 });
db.webhookevents.createIndex({ chatId: 1 });
db.webhookevents.createIndex({ provider: 1 });
```

---

## 11. ChatAssignment Model (Optional - Detailed Assignment History)

Represents detailed chat assignment history.

### Schema Structure

```javascript
{
  _id: ObjectId/String,              // Primary key
  id: String,                        // Unique assignment identifier
  chatId: ObjectId/String,            // Reference to Chat model
  
  // Assignment Info
  assignedTo: ObjectId/String,        // Reference to Agent model
  assignedBy: ObjectId/String,        // Reference to User who assigned
  assignmentType: String,            // 'manual' | 'auto' | 'transfer'
  
  // Transfer Info (if applicable)
  transferredFrom: ObjectId/String,    // Previous agent (if transfer)
  transferReason: String,            // Reason for transfer
  
  // Status
  status: String,                    // 'active' | 'completed' | 'cancelled'
  completedAt: Date,                 // When assignment ended
  
  // Timestamps
  assignedAt: Date,                  // When assignment started
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
db.chatassignments.createIndex({ chatId: 1, assignedAt: -1 });
db.chatassignments.createIndex({ assignedTo: 1 });
db.chatassignments.createIndex({ status: 1 });
```

---

## 12. AgentPerformance Model (Optional - Performance Analytics)

Represents agent performance metrics and analytics.

### Schema Structure

```javascript
{
  _id: ObjectId/String,              // Primary key
  id: String,                        // Unique performance record identifier
  agentId: ObjectId/String,           // Reference to Agent model
  date: Date,                        // Date for this performance record
  
  // Chat Metrics
  totalChats: Number,                // Total chats handled
  chatsAssigned: Number,             // Chats assigned
  chatsResolved: Number,             // Chats resolved
  chatsTransferred: Number,          // Chats transferred out
  
  // Message Metrics
  messagesSent: Number,               // Messages sent by agent
  messagesReceived: Number,           // Messages received
  avgResponseTime: Number,           // Average response time in seconds
  firstResponseTime: Number,         // Average first response time
  
  // Time Metrics
  totalActiveTime: Number,           // Total active time in seconds
  avgChatDuration: Number,           // Average chat duration in seconds
  
  // Quality Metrics
  customerSatisfaction: Number,      // Average satisfaction rating (1-5)
  resolutionRate: Number,           // Percentage of chats resolved
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
db.agentperformance.createIndex({ agentId: 1, date: -1 });
db.agentperformance.createIndex({ date: -1 });
```

---

## 13. WhatsAppConfig Model

Represents WhatsApp API configuration and credentials.

### Schema Structure

```javascript
{
  _id: ObjectId/String,              // Primary key
  id: String,                        // Unique config identifier
  
  // Provider Info
  provider: String,                  // 'meta-whatsapp' | 'twilio' | 'chatapi' | etc.
  isActive: Boolean,                 // Whether this config is active
  
  // Meta WhatsApp Cloud API Config
  accessToken: String,               // Encrypted access token
  phoneNumberId: String,             // Phone Number ID
  businessAccountId: String,         // Business Account ID
  apiVersion: String,                // API version (e.g., 'v18.0')
  webhookVerifyToken: String,        // Webhook verification token
  webhookSecret: String,             // Webhook secret (encrypted)
  
  // Twilio Config
  accountSid: String,                // Twilio Account SID
  authToken: String,                 // Twilio Auth Token (encrypted)
  
  // ChatAPI Config
  instanceId: String,                // ChatAPI instance ID
  apiKey: String,                    // API key (encrypted)
  
  // Webhook URLs
  webhookUrl: String,                // Webhook URL for receiving events
  webhookStatus: String,             // 'active' | 'inactive' | 'error'
  
  // Business Profile
  businessProfile: {
    name: String,
    description: String,
    email: String,
    website: String,
    address: String,
    profilePictureUrl: String
  },
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastSyncAt: Date,                  // Last sync with provider
  
  // Status
  isDeleted: Boolean
}
```

### Indexes

```javascript
db.whatsappconfigs.createIndex({ provider: 1, isActive: 1 });
db.whatsappconfigs.createIndex({ isActive: 1 });
```

---

## API Endpoint Recommendations

Based on these models, here are the recommended API endpoints:

### Chats
- `GET /api/whatsapp/chats` - Get all chats (with filters)
- `GET /api/whatsapp/chats/:id` - Get chat by ID
- `POST /api/whatsapp/chats` - Create new chat
- `PUT /api/whatsapp/chats/:id` - Update chat
- `DELETE /api/whatsapp/chats/:id` - Delete chat (soft delete)
- `POST /api/whatsapp/chats/:id/assign` - Assign chat to agent
- `PUT /api/whatsapp/chats/:id/unassign` - Unassign chat
- `POST /api/whatsapp/chats/:id/transfer` - Transfer chat
- `PUT /api/whatsapp/chats/:id/read` - Mark chat as read

### Messages
- `GET /api/whatsapp/chats/:chatId/messages` - Get chat messages (paginated)
- `POST /api/whatsapp/chats/:chatId/messages` - Send message
- `GET /api/whatsapp/messages/:id` - Get message by ID
- `PUT /api/whatsapp/messages/:id/read` - Mark message as read

### Agents
- `GET /api/whatsapp/agents` - Get all agents
- `GET /api/whatsapp/agents/:id` - Get agent by ID
- `POST /api/whatsapp/agents` - Create agent
- `PUT /api/whatsapp/agents/:id` - Update agent
- `PUT /api/whatsapp/agents/:id/status` - Update agent status
- `GET /api/whatsapp/agents/online` - Get online agents

### Labels
- `GET /api/whatsapp/labels` - Get all labels
- `POST /api/whatsapp/labels` - Create label
- `PUT /api/whatsapp/labels/:id` - Update label
- `DELETE /api/whatsapp/labels/:id` - Delete label
- `POST /api/whatsapp/chats/:chatId/labels/:labelId` - Add label to chat
- `DELETE /api/whatsapp/chats/:chatId/labels/:labelId` - Remove label from chat

### Templates
- `GET /api/whatsapp/templates` - Get all templates
- `POST /api/whatsapp/templates` - Create template
- `PUT /api/whatsapp/templates/:id` - Update template
- `DELETE /api/whatsapp/templates/:id` - Delete template

### Follow-ups
- `GET /api/whatsapp/followups` - Get all follow-ups (with filters)
- `GET /api/whatsapp/chats/:chatId/followups` - Get follow-ups for chat
- `POST /api/whatsapp/followups` - Create follow-up
- `PUT /api/whatsapp/followups/:id` - Update follow-up
- `DELETE /api/whatsapp/followups/:id` - Delete follow-up

### Team Notes
- `GET /api/whatsapp/chats/:chatId/notes` - Get team notes for chat
- `POST /api/whatsapp/chats/:chatId/notes` - Create team note
- `PUT /api/whatsapp/notes/:id` - Update team note
- `DELETE /api/whatsapp/notes/:id` - Delete team note

### Blocked Numbers
- `GET /api/whatsapp/blocked-numbers` - Get all blocked numbers
- `POST /api/whatsapp/blocked-numbers` - Block number
- `DELETE /api/whatsapp/blocked-numbers/:id` - Unblock number

### Webhooks
- `POST /api/whatsapp/webhooks` - Receive webhook events
- `GET /api/whatsapp/webhooks/events` - Get webhook events (with filters)

### Analytics/Stats
- `GET /api/whatsapp/stats/admin` - Get admin statistics
- `GET /api/whatsapp/stats/agents/:agentId` - Get agent performance stats

---

## Implementation Notes

1. **Encryption**: Store sensitive data (tokens, API keys) encrypted in the database.

2. **Soft Deletes**: Use soft deletes (`isDeleted` flag) instead of hard deletes for data recovery and audit trails.

3. **Timestamps**: Always include `createdAt` and `updatedAt` timestamps. Consider using middleware to auto-update these.

4. **Indexes**: Create appropriate indexes for frequently queried fields (phone numbers, status, dates, etc.).

5. **Validation**: Implement validation at the API level for required fields, data types, and business rules.

6. **Pagination**: Implement pagination for list endpoints (chats, messages, etc.).

7. **Filtering**: Support filtering by status, agent, labels, date ranges, etc.

8. **Real-time Updates**: Use WebSockets/Socket.io to push real-time updates to connected clients.

9. **Audit Trail**: Consider adding an audit log model to track all important actions (assignments, transfers, deletions, etc.).

10. **Rate Limiting**: Implement rate limiting for API endpoints to prevent abuse.

---

## Example MongoDB/Mongoose Implementation

```javascript
// Example: Chat Model (Mongoose)
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true, index: true },
  customerName: { type: String, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  status: { 
    type: String, 
    enum: ['unassigned', 'assigned', 'resolved', 'closed'],
    default: 'unassigned',
    index: true
  },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' },
  assignedAt: Date,
  labels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Label' }],
  lastMessage: Object,
  lastMessageTime: { type: Date, index: true },
  unreadCount: { type: Number, default: 0 },
  // ... other fields
}, {
  timestamps: true // Auto-add createdAt and updatedAt
});

module.exports = mongoose.model('Chat', chatSchema);
```

---

This document provides a comprehensive foundation for implementing your WhatsApp backend API. Adjust the models based on your specific requirements and backend framework.

