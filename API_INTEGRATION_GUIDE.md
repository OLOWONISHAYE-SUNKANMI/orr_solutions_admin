# ORR Admin Portal - Complete API Integration Guide

This guide provides comprehensive documentation for consuming all ORR Admin Portal APIs with proper error handling and logging.

## 🚀 Quick Start

### 1. Import APIs
```typescript
import { 
  clientAPI, 
  contentAPI, 
  meetingAPI, 
  useClients, 
  useCreateClient,
  apiTester 
} from '@/app/services';
```

### 2. Using React Hooks (Recommended)
```typescript
function MyComponent() {
  const { data, loading, error, refetch } = useClients();
  const createClient = useCreateClient();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{data?.length} clients loaded</div>;
}
```

### 3. Direct API Calls
```typescript
async function fetchData() {
  try {
    const clients = await clientAPI.listClients({ limit: 10 });
    console.log('✅ Clients loaded:', clients);
  } catch (error) {
    console.error('❌ API Error:', error);
  }
}
```

## 📋 Available APIs

### 🏠 Dashboard APIs
- **Overview**: `dashboardAPI.getOverview()`
- **Quick Stats**: `dashboardAPI.getQuickStats()`
- **Recent Activity**: `dashboardAPI.getRecentActivity()`

**Hooks**: `useDashboardOverview()`, `useDashboardQuickStats()`, `useDashboardRecentActivity()`

### 🔐 Authentication APIs
- **Current User**: `authAPI.getCurrentUser()`
- **Login**: `authAPI.login(identifier, password)`
- **Check Permission**: `authAPI.checkPermission(permission)`
- **Available Roles**: `authAPI.getAvailableRoles()`

**Hooks**: `useCurrentUser()`, `useAvailableRoles()`, `usePermissionCheck(permission)`

### 👥 Client Management APIs
- **List Clients**: `clientAPI.listClients(filters?)`
- **Get Client**: `clientAPI.getClient(id)`
- **Create Client**: `clientAPI.createClient(data)`
- **Update Client**: `clientAPI.updateClient(id, data)`
- **Client Stats**: `clientAPI.getStats()`
- **Documents**: `clientAPI.listDocuments(clientId)`
- **Upload Document**: `clientAPI.uploadDocument(clientId, formData)`

**Hooks**: `useClients(filters?)`, `useClient(id)`, `useClientStats()`, `useCreateClient()`, `useUpdateClient()`

### 📝 Content Management APIs
- **List Content**: `contentAPI.listContent(filters?)`
- **Get Content**: `contentAPI.getContent(id)`
- **Create Content**: `contentAPI.createContent(data)`
- **Update Content**: `contentAPI.updateContent(id, data)`
- **Publish Content**: `contentAPI.publishContent(id, action)`
- **Content Stats**: `contentAPI.getStats()`

**Hooks**: `useContent(filters?)`, `useContentItem(id)`, `useContentStats()`, `useCreateContent()`, `useUpdateContent()`

### 📅 Meeting Management APIs
- **List Meetings**: `meetingAPI.listMeetings(filters?)`
- **Get Meeting**: `meetingAPI.getMeeting(id)`
- **Create Meeting**: `meetingAPI.createMeeting(data)`
- **Update Meeting**: `meetingAPI.updateMeeting(id, data)`
- **Upcoming Meetings**: `meetingAPI.getUpcomingMeetings()`
- **My Meetings**: `meetingAPI.getMyMeetings()`
- **Meeting Stats**: `meetingAPI.getStats()`

**Hooks**: `useMeetings(filters?)`, `useMeeting(id)`, `useUpcomingMeetings()`, `useMyMeetings()`, `useCreateMeeting()`

### 🎫 Ticket Management APIs
- **List Tickets**: `ticketAPI.listTickets(filters?)`
- **Get Ticket**: `ticketAPI.getTicket(id)`
- **Create Ticket**: `ticketAPI.createTicket(data)`
- **Update Ticket**: `ticketAPI.updateTicket(id, data)`
- **Add Message**: `ticketAPI.addMessage(ticketId, message, isInternal?)`
- **My Tickets**: `ticketAPI.getMyTickets()`
- **Ticket Stats**: `ticketAPI.getStats()`

**Hooks**: `useTickets(filters?)`, `useTicket(id)`, `useMyTickets()`, `useTicketStats()`, `useCreateTicket()`

### 🔔 Notification APIs
- **List Notifications**: `notificationAPI.listNotifications(filters?)`
- **Get Notification**: `notificationAPI.getNotification(id)`
- **Create Notification**: `notificationAPI.createNotification(data)`
- **Mark Read/Unread**: `notificationAPI.performAction(id, action)`
- **Bulk Actions**: `notificationAPI.bulkActions(action)`
- **Notification Stats**: `notificationAPI.getStats()`

**Hooks**: `useNotifications(filters?)`, `useNotification(id)`, `useNotificationStats()`, `useCreateNotification()`

### 💳 Billing & Payment APIs
- **Billing History**: `billingAPI.getHistory(filters?)`
- **Billing Stats**: `billingAPI.getStats()`
- **Pricing Plans**: `billingAPI.getPricingPlans()`
- **Create Checkout**: `billingAPI.createCheckoutSession(planId, clientId)`
- **Change Plan**: `billingAPI.changePlan(subscriptionId, newPlanId)`

**Hooks**: `useBillingHistory(filters?)`, `useBillingStats()`, `usePricingPlans()`, `useAllPaymentStats()`

### 📊 Analytics & Reporting APIs
- **Analytics Overview**: `analyticsAPI.getOverview()`
- **Client Analytics**: `analyticsAPI.getClientAnalytics()`
- **Content Analytics**: `analyticsAPI.getContentAnalytics()`
- **Export Data**: `analyticsAPI.exportData(format, dateRange?)`

**Hooks**: `useAnalyticsOverview()`, `useClientAnalytics()`, `useContentAnalytics()`

### 🔍 Search APIs
- **Global Search**: `searchAPI.globalSearch(query, type?, limit?)`
- **Quick Search**: `searchAPI.quickSearch(query)`

**Hooks**: `useGlobalSearch(query, type?, limit?)`, `useQuickSearch(query)`

### 🎨 CMS APIs
- **Get User Role**: `cmsAPI.getUserRole()`
- **Get Content**: `cmsAPI.getContent(contentType)`
- **Update Content**: `cmsAPI.updateContent(contentType, data)`
- **Upload Image**: `cmsAPI.uploadImage(formData)`

**Hooks**: `useUserRole()`, `useCMSContent(contentType)`, `useUploadImage()`

### ⚙️ Settings APIs
- **Audit Logs**: `settingsAPI.getAuditLogs(filters?)`
- **List Roles**: `settingsAPI.listRoles()`
- **List Users**: `settingsAPI.listUsers()`
- **System Settings**: `settingsAPI.getSystemSettings()`

**Hooks**: `useAuditLogs(filters?)`, `useRoles()`, `useUsers()`, `useSystemSettings()`

### 🤖 AI Oversight APIs
- **List Conversations**: `aiOversightAPI.listConversations(filters?)`
- **Get Conversation**: `aiOversightAPI.getConversation(id)`
- **Perform Action**: `aiOversightAPI.performAction(id, action, data?)`
- **AI Stats**: `aiOversightAPI.getStats()`

**Hooks**: `useAIConversations(filters?)`, `useAIConversation(id)`, `useAIOversightStats()`

## 🧪 Testing APIs

### Run All Tests
```typescript
import { apiTester } from '@/app/services';

// Test all APIs
await apiTester.runAllTests();

// Test specific API group
await apiTester.testSpecificAPI('client');
await apiTester.testSpecificAPI('dashboard');
await apiTester.testSpecificAPI('content');

// Get test results
const results = apiTester.getResults();
console.log('Test Results:', results);
```

### Available Test Groups
- `dashboard` - Dashboard APIs
- `auth` - Authentication APIs
- `client` - Client Management APIs
- `content` - Content Management APIs
- `meeting` - Meeting Management APIs
- `ticket` - Ticket Management APIs
- `notification` - Notification APIs
- `billing` - Billing & Payment APIs
- `analytics` - Analytics APIs
- `search` - Search APIs
- `cms` - CMS APIs

## 🔧 Error Handling

### Automatic Error Handling
All APIs include comprehensive error handling with:
- **HTTP Status Code Detection**: 401, 403, 404, 422, 429, 500, 502, 503
- **Automatic Token Refresh**: Handles expired tokens
- **Detailed Error Logging**: Console logs with emojis and timestamps
- **Error Categorization**: Network, validation, server errors

### Manual Error Handling
```typescript
try {
  const result = await clientAPI.createClient(data);
  console.log('✅ Success:', result);
} catch (error) {
  console.error('❌ Error:', error.message);
  // Handle specific error types
  if (error.message.includes('401')) {
    // Handle authentication error
  } else if (error.message.includes('422')) {
    // Handle validation error
  }
}
```

## 📝 Console Logging

### API Call Logging
Every API call is logged with:
- 🌐 **Request**: Method, endpoint, data
- ✅ **Success**: Response data
- ❌ **Error**: Error details and stack trace
- ⏱️ **Timing**: Request duration

### Log Format
```
🌐 [API POST] /admin-portal/v1/clients/ - 2024-01-15T10:30:00.000Z
📤 Request Data: { full_name: "John Doe", email: "john@example.com" }

✅ [API SUCCESS] /admin-portal/v1/clients/ - 2024-01-15T10:30:00.500Z
📥 Response Data: { id: 123, full_name: "John Doe", ... }
```

## 🎯 Best Practices

### 1. Use React Hooks for Components
```typescript
// ✅ Good - Using hooks
function ClientList() {
  const { data: clients, loading, error, refetch } = useClients();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div>
      {clients?.map(client => (
        <ClientCard key={client.id} client={client} />
      ))}
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### 2. Handle Loading and Error States
```typescript
// ✅ Good - Proper state handling
function MyComponent() {
  const { data, loading, error } = useClients();
  
  return (
    <div>
      {loading && <div>Loading clients...</div>}
      {error && <div className="error">Error: {error}</div>}
      {data && <div>Loaded {data.length} clients</div>}
    </div>
  );
}
```

### 3. Use Mutations for Create/Update Operations
```typescript
// ✅ Good - Using mutation hooks
function CreateClientForm() {
  const createClient = useCreateClient();
  const { refetch: refetchClients } = useClients();
  
  const handleSubmit = async (formData) => {
    try {
      await createClient.mutate(formData);
      refetchClients(); // Refresh the list
      showSuccessMessage('Client created successfully!');
    } catch (error) {
      showErrorMessage(`Failed to create client: ${error.message}`);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button 
        type="submit" 
        disabled={createClient.loading}
      >
        {createClient.loading ? 'Creating...' : 'Create Client'}
      </button>
    </form>
  );
}
```

### 4. Filter and Pagination
```typescript
// ✅ Good - Using filters
function FilteredClientList() {
  const [filters, setFilters] = useState({
    stage: 'discover',
    limit: 10,
    offset: 0
  });
  
  const { data, loading, error } = useClients(filters);
  
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };
  
  return (
    <div>
      <FilterControls onFilterChange={handleFilterChange} />
      <ClientList clients={data} loading={loading} error={error} />
    </div>
  );
}
```

## 🚨 Common Issues and Solutions

### Issue 1: 401 Unauthorized
**Problem**: Token expired or invalid
**Solution**: 
- Check if user is logged in
- Token is automatically cleared and user redirected to login
- Ensure backend is running and accessible

### Issue 2: CORS Errors
**Problem**: Cross-origin requests blocked
**Solution**:
- Ensure backend CORS settings allow frontend domain
- Check BASE_URL in api.ts matches backend URL

### Issue 3: Network Errors
**Problem**: Cannot connect to backend
**Solution**:
- Verify backend is running on correct port (8002)
- Check BASE_URL configuration
- Ensure no firewall blocking requests

### Issue 4: Validation Errors (422)
**Problem**: Invalid data sent to API
**Solution**:
- Check required fields are provided
- Validate data types match API expectations
- Review API documentation for field requirements

## 🔍 Debugging

### Enable Detailed Logging
All API calls are automatically logged. Check browser console for:
- Request details
- Response data
- Error messages
- Performance timing

### Test Individual APIs
```typescript
// Test specific API endpoint
await apiTester.testSpecificAPI('client');

// Test with custom data
try {
  const result = await clientAPI.listClients({ limit: 1 });
  console.log('API Test Result:', result);
} catch (error) {
  console.error('API Test Failed:', error);
}
```

### Use API Example Component
Import and use the `ApiExampleComponent` to test all APIs:
```typescript
import ApiExampleComponent from '@/app/components/examples/ApiExampleComponent';

function TestPage() {
  return <ApiExampleComponent />;
}
```

## 📚 Additional Resources

- **Backend API Documentation**: Check backend README for endpoint details
- **Type Definitions**: See `app/services/types.ts` for all TypeScript interfaces
- **Example Usage**: Check `app/components/examples/ApiExampleComponent.tsx`
- **Quick Actions**: See quick action modals for real-world usage examples

## 🎉 Success!

You now have a complete, error-free API integration system with:
- ✅ Comprehensive error handling
- ✅ Detailed console logging
- ✅ React hooks for easy consumption
- ✅ Automatic testing utilities
- ✅ TypeScript support
- ✅ Real-world examples

All APIs are properly integrated and ready for use in your ORR Admin Portal!