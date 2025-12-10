# Missing APIs in Documentation

This document lists API functions that exist in `src/api/whatsappAPI.js` but are **NOT** documented in `WHATSAPP_API_DOCUMENTATION.md`.

## Missing API Functions

### 1. **updateChat** (Chat Update)
- **Function**: `updateChat(chatId, chatData)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `PUT /chats/:id`
- **Note**: Function exists in Redux slice but not in API file

### 2. **deleteChat** (Chat Deletion)
- **Function**: `deleteChat(chatId)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `DELETE /chats/:id`
- **Note**: Function exists in Redux slice but not in API file

### 3. **closeChat** (Close Chat)
- **Function**: `closeChat(chatId)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `POST /chats/:id/close`
- **Note**: Function exists in Redux slice but not in API file

### 4. **getMessageById** (Get Single Message)
- **Function**: `getMessageById(messageId)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `GET /messages/:id`
- **Note**: Should be added to API file

### 5. **updateMessage** (Update Message)
- **Function**: `updateMessage(messageId, messageData)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `PUT /messages/:id`
- **Note**: Should be added to API file

### 6. **deleteMessage** (Delete Message)
- **Function**: `deleteMessage(messageId)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `DELETE /messages/:id`
- **Note**: Should be added to API file

### 7. **updateMessageStatus** (Update Message Status)
- **Function**: `updateMessageStatus(messageId, statusData)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `PUT /messages/:id/status`
- **Note**: Should be added to API file

### 8. **createAgent** (Create Agent)
- **Function**: `createAgent(agentData)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `POST /agents`
- **Note**: Should be added to API file

### 9. **updateAgent** (Update Agent)
- **Function**: `updateAgent(agentId, agentData)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `PUT /agents/:id`
- **Note**: Should be added to API file

### 10. **deleteAgent** (Delete Agent)
- **Function**: `deleteAgent(agentId)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `DELETE /agents/:id`
- **Note**: Should be added to API file

### 11. **getAgentChats** (Get Agent's Chats)
- **Function**: `getAgentChats(agentId)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `GET /agents/:id/chats`
- **Note**: Should be added to API file

### 12. **getTemplateById** (Get Single Template)
- **Function**: `getTemplateById(templateId)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `GET /templates/:id`
- **Note**: Should be added to API file

### 13. **getLabelById** (Get Single Label)
- **Function**: `getLabelById(labelId)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `GET /labels/:id`
- **Note**: Should be added to API file

### 14. **getFollowUpById** (Get Single Follow-up)
- **Function**: `getFollowUpById(followUpId)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `GET /followups/:id`
- **Note**: Should be added to API file

### 15. **getNoteById** (Get Single Note)
- **Function**: `getNoteById(noteId)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `GET /notes/:id`
- **Note**: Should be added to API file

### 16. **updateNote** (Update Note)
- **Function**: `updateNote(noteId, noteData)`
- **Current Implementation**: Not implemented in code (only `updateTeamNote` exists)
- **Documentation Status**: ✅ Documented as `PUT /notes/:id`
- **Note**: Should be added to API file

### 17. **deleteNote** (Delete Note)
- **Function**: `deleteNote(noteId)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `DELETE /notes/:id`
- **Note**: Should be added to API file

### 18. **getBlockedNumberById** (Get Single Blocked Number)
- **Function**: `getBlockedNumberById(blockedId)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `GET /blocked-numbers/:id`
- **Note**: Should be added to API file

### 19. **getAllCustomers** (Get All Customers)
- **Function**: `getAllCustomers(filters)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `GET /customers`
- **Note**: Should be added to API file

### 20. **createCustomer** (Create Customer)
- **Function**: `createCustomer(customerData)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `POST /customers`
- **Note**: Should be added to API file

### 21. **deleteCustomer** (Delete Customer)
- **Function**: `deleteCustomer(customerId)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `DELETE /customers/:id`
- **Note**: Should be added to API file

### 22. **getCustomerChats** (Get Customer's Chats)
- **Function**: `getCustomerChats(customerId)`
- **Current Implementation**: Not implemented in code
- **Documentation Status**: ✅ Documented as `GET /customers/:id/chats`
- **Note**: Should be added to API file

### 23. **sendReplyMessage** (Send Reply Message - Convenience Function)
- **Function**: `sendReplyMessage(chatId, messageText, replyToMessageId, options)`
- **Current Implementation**: ✅ Implemented (wrapper around `sendMessage`)
- **Documentation Status**: ❌ **NOT DOCUMENTED**
- **Note**: This is a convenience function that should be documented

### 24. **sendTypingIndicator** (Send Typing Indicator)
- **Function**: `sendTypingIndicator(chatId, isTyping, messageId)`
- **Current Implementation**: ✅ Implemented
- **Documentation Status**: ❌ **NOT DOCUMENTED**
- **Note**: Should be documented as a Meta WhatsApp API feature

### 25. **getPhoneNumberInfo** (Get Phone Number Info - Meta API)
- **Function**: `getPhoneNumberInfo()`
- **Current Implementation**: ✅ Implemented
- **Documentation Status**: ✅ Documented as `GET /cloud-api/phone-numbers/:phoneNumberId`
- **Note**: Function exists but endpoint path differs slightly

### 26. **getBusinessProfile** (Get Business Profile - Meta API)
- **Function**: `getBusinessProfile(fields)`
- **Current Implementation**: ✅ Implemented
- **Documentation Status**: ✅ Documented as `GET /cloud-api/business-profile/:phoneNumberId`
- **Note**: Function exists and is documented

### 27. **updateBusinessProfile** (Update Business Profile - Meta API)
- **Function**: `updateBusinessProfile(profileData)`
- **Current Implementation**: ✅ Implemented
- **Documentation Status**: ✅ Documented as `POST /cloud-api/business-profile/:phoneNumberId`
- **Note**: Function exists and is documented

### 28. **sendMediaMessage** (Send Media Message - Meta API)
- **Function**: `sendMediaMessage(chatId, mediaUrlOrId, mediaType, caption, options)`
- **Current Implementation**: ✅ Implemented
- **Documentation Status**: ✅ Documented as `POST /cloud-api/messages/media`
- **Note**: Function exists and is documented

### 29. **sendTemplateMessage** (Send Template Message - Meta API)
- **Function**: `sendTemplateMessage(chatId, templateName, languageCode, components)`
- **Current Implementation**: ✅ Implemented
- **Documentation Status**: ✅ Documented as `POST /cloud-api/messages/template`
- **Note**: Function exists and is documented

### 30. **verifyWebhook** (Verify Webhook - Meta API)
- **Function**: `verifyWebhook(mode, token, challenge)`
- **Current Implementation**: ✅ Implemented (client-side only)
- **Documentation Status**: ✅ Documented as `GET /cloud-api/webhook`
- **Note**: Function exists but is typically server-side

### 31. **processWebhook** (Process Webhook - Meta API)
- **Function**: `processWebhook(webhookData)`
- **Current Implementation**: ✅ Implemented
- **Documentation Status**: ✅ Documented as `POST /webhooks/:provider`
- **Note**: Function exists and processes webhook data

### 32. **addLabelToChat** (Add Label to Chat)
- **Function**: `addLabelToChat(chatId, labelId)`
- **Current Implementation**: ✅ Implemented
- **Documentation Status**: ❌ **NOT DOCUMENTED**
- **Note**: Should be documented as `POST /chats/:chatId/labels/:labelId` or similar

### 33. **removeLabelFromChat** (Remove Label from Chat)
- **Function**: `removeLabelFromChat(chatId, labelId)`
- **Current Implementation**: ✅ Implemented
- **Documentation Status**: ❌ **NOT DOCUMENTED**
- **Note**: Should be documented as `DELETE /chats/:chatId/labels/:labelId` or similar

### 34. **autoAssignChat** (Auto-Assign Chat)
- **Function**: `autoAssignChat(chatId)`
- **Current Implementation**: ✅ Implemented
- **Documentation Status**: ❌ **NOT DOCUMENTED**
- **Note**: Should be documented as `POST /chats/:id/auto-assign`

### 35. **getOnlineAgents** (Get Online Agents)
- **Function**: `getOnlineAgents()`
- **Current Implementation**: ✅ Implemented
- **Documentation Status**: ❌ **NOT DOCUMENTED**
- **Note**: Should be documented as `GET /agents/online`

### 36. **getAgentPerformance** (Get Agent Performance)
- **Function**: `getAgentPerformance(agentId, dateRange)`
- **Current Implementation**: ✅ Implemented
- **Documentation Status**: ✅ Documented as `GET /performance` or `GET /performance/agent/:agentId`
- **Note**: Function exists and is documented

### 37. **getAdminStats** (Get Admin Statistics)
- **Function**: `getAdminStats(filters)`
- **Current Implementation**: ✅ Implemented
- **Documentation Status**: ✅ Documented as `GET /performance`
- **Note**: Function exists and is documented

### 38. **saveTeamNote** (Save Team Note - Alias)
- **Function**: `saveTeamNote(chatId, note)`
- **Current Implementation**: ✅ Implemented (alias for `updateTeamNote`)
- **Documentation Status**: ✅ Documented as `POST /notes`
- **Note**: Function exists and is documented

---

## Summary

### APIs Missing from Documentation (Need to be Added):
1. `sendReplyMessage` - Convenience function for replying to messages
2. `sendTypingIndicator` - Send typing indicator (Meta API)
3. `addLabelToChat` - Add label to chat
4. `removeLabelFromChat` - Remove label from chat
5. `autoAssignChat` - Auto-assign chat to agent
6. `getOnlineAgents` - Get online agents list

### APIs Missing from Code (Need to be Implemented):
1. `updateChat` - Update chat details
2. `deleteChat` - Delete/soft delete chat
3. `closeChat` - Close chat
4. `getMessageById` - Get single message
5. `updateMessage` - Update message
6. `deleteMessage` - Delete message
7. `updateMessageStatus` - Update message status
8. `createAgent` - Create new agent
9. `updateAgent` - Update agent details
10. `deleteAgent` - Delete agent
11. `getAgentChats` - Get agent's chats
12. `getTemplateById` - Get single template
13. `getLabelById` - Get single label
14. `getFollowUpById` - Get single follow-up
15. `getNoteById` - Get single note
16. `updateNote` - Update note
17. `deleteNote` - Delete note
18. `getBlockedNumberById` - Get single blocked number
19. `getAllCustomers` - Get all customers
20. `createCustomer` - Create customer
21. `deleteCustomer` - Delete customer
22. `getCustomerChats` - Get customer's chats

---

## Recommendations

1. **Add missing functions to code** for complete CRUD operations
2. **Document convenience functions** like `sendReplyMessage` and `sendTypingIndicator`
3. **Document label management endpoints** for adding/removing labels from chats
4. **Document auto-assign functionality** as it's a key feature
5. **Document online agents endpoint** for real-time agent status

---

**Last Updated**: 2024-01-01

