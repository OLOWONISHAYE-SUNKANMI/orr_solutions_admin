/**
 * API Example Component
 * Demonstrates how to consume all ORR Admin Portal APIs with proper error handling
 */

"use client";

import React, { useState } from 'react';
import { 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Loader, 
  Users, 
  FileText, 
  Calendar, 
  MessageSquare,
  Bell,
  CreditCard,
  BarChart3,
  Search,
  Settings,
  Shield,
  Database
} from 'lucide-react';

// Import API hooks
import {
  useDashboardOverview,
  useClients,
  useContent,
  useMeetings,
  useTickets,
  useNotifications,
  useBillingStats,
  useAnalyticsOverview,
  useCurrentUser,
  useCreateClient,
  useCreateContent,
  useCreateMeeting,
  useCreateTicket,
  useCreateNotification,
  apiTester
} from '@/app/services';

interface ApiSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const ApiSection: React.FC<ApiSectionProps> = ({ title, icon, children }) => (
  <div className="bg-gradient-to-br from-white/15 to-white/5 rounded-xl border border-white/10 p-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-primary/20 rounded-lg">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
    </div>
    {children}
  </div>
);

interface ApiStatusProps {
  loading: boolean;
  error: string | null;
  data: any;
  onRefetch?: () => void;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ loading, error, data, onRefetch }) => (
  <div className="flex items-center gap-2 mb-3">
    {loading && (
      <>
        <Loader className="animate-spin text-blue-400" size={16} />
        <span className="text-blue-400 text-sm">Loading...</span>
      </>
    )}
    {error && (
      <>
        <XCircle className="text-red-400" size={16} />
        <span className="text-red-400 text-sm">{error}</span>
      </>
    )}
    {!loading && !error && data && (
      <>
        <CheckCircle className="text-green-400" size={16} />
        <span className="text-green-400 text-sm">Success</span>
      </>
    )}
    {onRefetch && (
      <button
        onClick={onRefetch}
        className="ml-auto p-1 hover:bg-white/10 rounded transition-colors"
        title="Refresh"
      >
        <RefreshCw size={14} className="text-gray-400" />
      </button>
    )}
  </div>
);

export default function ApiExampleComponent() {
  const [testResults, setTestResults] = useState<string>('');
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Fetch hooks - these will automatically load data
  const dashboardData = useDashboardOverview();
  const clientsData = useClients({ limit: 5 });
  const contentData = useContent({ limit: 5 });
  const meetingsData = useMeetings({ limit: 5 });
  const ticketsData = useTickets({ limit: 5 });
  const notificationsData = useNotifications({ limit: 5 });
  const billingData = useBillingStats();
  const analyticsData = useAnalyticsOverview();
  const userData = useCurrentUser();

  // Mutation hooks - these are for creating/updating data
  const createClient = useCreateClient();
  const createContent = useCreateContent();
  const createMeeting = useCreateMeeting();
  const createTicket = useCreateTicket();
  const createNotification = useCreateNotification();

  // Test functions
  const runAllTests = async () => {
    setIsRunningTests(true);
    setTestResults('Running comprehensive API tests...\n\n');
    
    try {
      // Capture console output
      const originalLog = console.log;
      const originalError = console.error;
      const originalGroup = console.group;
      const originalGroupEnd = console.groupEnd;
      
      let output = '';
      
      console.log = (...args) => {
        output += args.join(' ') + '\n';
        originalLog(...args);
      };
      
      console.error = (...args) => {
        output += 'ERROR: ' + args.join(' ') + '\n';
        originalError(...args);
      };
      
      console.group = (...args) => {
        output += '\n=== ' + args.join(' ') + ' ===\n';
        originalGroup(...args);
      };
      
      console.groupEnd = () => {
        output += '\n';
        originalGroupEnd();
      };
      
      await apiTester.runAllTests();
      
      // Restore console
      console.log = originalLog;
      console.error = originalError;
      console.group = originalGroup;
      console.groupEnd = originalGroupEnd;
      
      setTestResults(output);
    } catch (error) {
      setTestResults(`Test failed: ${error}`);
    } finally {
      setIsRunningTests(false);
    }
  };

  const testCreateOperations = async () => {
    try {
      // Test creating a client
      const clientResult = await createClient.mutate({
        full_name: "Test Client",
        email: "test@example.com",
        company: "Test Company",
        stage: "discover",
        primary_pillar: "strategic"
      });
      console.log('✅ Client created:', clientResult);

      // Test creating content
      const contentResult = await createContent.mutate({
        title: "Test Content",
        content: "This is test content",
        content_type: "article",
        status: "draft",
        stage: "discover"
      });
      console.log('✅ Content created:', contentResult);

      // Test creating a notification
      const notificationResult = await createNotification.mutate({
        notification_type: "system_alert",
        title: "Test Notification",
        message: "This is a test notification"
      });
      console.log('✅ Notification created:', notificationResult);

    } catch (error) {
      console.error('❌ Create operations failed:', error);
    }
  };

  return (
    <div className="min-h-screen text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/stars.svg')] opacity-20 pointer-events-none" />
      
      <div className="relative z-10 p-4 md:p-8">
        <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-white/10">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">API Integration Examples</h1>
            <p className="text-gray-400">
              Comprehensive demonstration of all ORR Admin Portal APIs with error handling and logging
            </p>
          </div>

          {/* Test Controls */}
          <div className="mb-8 p-6 bg-gradient-to-r from-primary/20 to-primary/10 rounded-xl border border-primary/30">
            <h2 className="text-xl font-semibold text-white mb-4">API Testing Controls</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={runAllTests}
                disabled={isRunningTests}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/80 disabled:bg-primary/50 rounded-lg text-white font-medium transition-all duration-200"
              >
                {isRunningTests ? (
                  <Loader className="animate-spin" size={16} />
                ) : (
                  <Play size={16} />
                )}
                {isRunningTests ? 'Running Tests...' : 'Run All API Tests'}
              </button>
              
              <button
                onClick={testCreateOperations}
                disabled={createClient.loading || createContent.loading || createNotification.loading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-600/50 rounded-lg text-white font-medium transition-all duration-200"
              >
                <Database size={16} />
                Test Create Operations
              </button>
            </div>
            
            {testResults && (
              <div className="mt-4 p-4 bg-black/30 rounded-lg border border-white/10">
                <h3 className="text-sm font-medium text-white mb-2">Test Results:</h3>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {testResults}
                </pre>
              </div>
            )}
          </div>

          {/* API Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Dashboard APIs */}
            <ApiSection title="Dashboard APIs" icon={<BarChart3 size={20} className="text-primary" />}>
              <ApiStatus {...dashboardData} />
              <div className="text-sm text-gray-300">
                <p>Endpoint: <code className="text-primary">/admin-portal/v1/dashboard/overview/</code></p>
                <p>Data: {dashboardData.data ? `${Object.keys(dashboardData.data).length} fields` : 'No data'}</p>
              </div>
            </ApiSection>

            {/* Auth APIs */}
            <ApiSection title="Authentication APIs" icon={<Shield size={20} className="text-green-400" />}>
              <ApiStatus {...userData} />
              <div className="text-sm text-gray-300">
                <p>Endpoint: <code className="text-primary">/admin-portal/v1/auth/me/</code></p>
                <p>User: {userData.data?.full_name || userData.data?.username || 'Not loaded'}</p>
              </div>
            </ApiSection>

            {/* Client APIs */}
            <ApiSection title="Client Management APIs" icon={<Users size={20} className="text-blue-400" />}>
              <ApiStatus {...clientsData} />
              <div className="text-sm text-gray-300">
                <p>Endpoint: <code className="text-primary">/admin-portal/v1/clients/</code></p>
                <p>Clients: {Array.isArray(clientsData.data) ? clientsData.data.length : 
                          clientsData.data?.results?.length || 0} loaded</p>
              </div>
            </ApiSection>

            {/* Content APIs */}
            <ApiSection title="Content Management APIs" icon={<FileText size={20} className="text-purple-400" />}>
              <ApiStatus {...contentData} />
              <div className="text-sm text-gray-300">
                <p>Endpoint: <code className="text-primary">/admin-portal/v1/content/</code></p>
                <p>Content: {Array.isArray(contentData.data) ? contentData.data.length : 
                           contentData.data?.results?.length || 0} items</p>
              </div>
            </ApiSection>

            {/* Meeting APIs */}
            <ApiSection title="Meeting Management APIs" icon={<Calendar size={20} className="text-orange-400" />}>
              <ApiStatus {...meetingsData} />
              <div className="text-sm text-gray-300">
                <p>Endpoint: <code className="text-primary">/admin-portal/v1/meetings/</code></p>
                <p>Meetings: {Array.isArray(meetingsData.data) ? meetingsData.data.length : 
                            meetingsData.data?.results?.length || 0} scheduled</p>
              </div>
            </ApiSection>

            {/* Ticket APIs */}
            <ApiSection title="Ticket Management APIs" icon={<MessageSquare size={20} className="text-red-400" />}>
              <ApiStatus {...ticketsData} />
              <div className="text-sm text-gray-300">
                <p>Endpoint: <code className="text-primary">/admin-portal/v1/tickets/</code></p>
                <p>Tickets: {Array.isArray(ticketsData.data) ? ticketsData.data.length : 
                           ticketsData.data?.results?.length || 0} open</p>
              </div>
            </ApiSection>

            {/* Notification APIs */}
            <ApiSection title="Notification APIs" icon={<Bell size={20} className="text-yellow-400" />}>
              <ApiStatus {...notificationsData} />
              <div className="text-sm text-gray-300">
                <p>Endpoint: <code className="text-primary">/admin-portal/v1/notifications/</code></p>
                <p>Notifications: {Array.isArray(notificationsData.data) ? notificationsData.data.length : 
                                 notificationsData.data?.results?.length || 0} pending</p>
              </div>
            </ApiSection>

            {/* Billing APIs */}
            <ApiSection title="Billing & Payment APIs" icon={<CreditCard size={20} className="text-green-400" />}>
              <ApiStatus {...billingData} />
              <div className="text-sm text-gray-300">
                <p>Endpoint: <code className="text-primary">/admin-portal/v1/billing-history/stats/</code></p>
                <p>Revenue: {billingData.data?.total_revenue || 'Not loaded'}</p>
              </div>
            </ApiSection>

            {/* Analytics APIs */}
            <ApiSection title="Analytics & Reporting APIs" icon={<BarChart3 size={20} className="text-indigo-400" />}>
              <ApiStatus {...analyticsData} />
              <div className="text-sm text-gray-300">
                <p>Endpoint: <code className="text-primary">/admin-portal/v1/analytics/overview/</code></p>
                <p>Metrics: {analyticsData.data ? Object.keys(analyticsData.data).length : 0} available</p>
              </div>
            </ApiSection>

          </div>

          {/* Mutation Status */}
          <div className="mt-8 p-6 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl border border-green-500/30">
            <h2 className="text-xl font-semibold text-white mb-4">Create Operations Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="font-medium text-white mb-2">Create Client</h3>
                <ApiStatus 
                  loading={createClient.loading} 
                  error={createClient.error} 
                  data={createClient.data} 
                />
                {createClient.data && (
                  <p className="text-xs text-gray-400">
                    Created: {createClient.data.full_name}
                  </p>
                )}
              </div>

              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="font-medium text-white mb-2">Create Content</h3>
                <ApiStatus 
                  loading={createContent.loading} 
                  error={createContent.error} 
                  data={createContent.data} 
                />
                {createContent.data && (
                  <p className="text-xs text-gray-400">
                    Created: {createContent.data.title}
                  </p>
                )}
              </div>

              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="font-medium text-white mb-2">Create Notification</h3>
                <ApiStatus 
                  loading={createNotification.loading} 
                  error={createNotification.error} 
                  data={createNotification.data} 
                />
                {createNotification.data && (
                  <p className="text-xs text-gray-400">
                    Created: {createNotification.data.title}
                  </p>
                )}
              </div>

            </div>
          </div>

          {/* Usage Instructions */}
          <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-xl border border-primary/20">
            <h2 className="text-xl font-semibold text-white mb-4">How to Use These APIs</h2>
            <div className="space-y-4 text-sm text-gray-300">
              <div>
                <h3 className="font-medium text-white mb-2">1. Using Hooks (Recommended)</h3>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto">
{`import { useClients, useCreateClient } from '@/app/services';

function MyComponent() {
  const { data, loading, error, refetch } = useClients();
  const createClient = useCreateClient();
  
  const handleCreate = async () => {
    try {
      await createClient.mutate({
        full_name: "John Doe",
        email: "john@example.com",
        company: "Acme Corp"
      });
      refetch(); // Refresh the list
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{data?.length} clients loaded</div>;
}`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-white mb-2">2. Direct API Calls</h3>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto">
{`import { clientAPI } from '@/app/services';

async function fetchClients() {
  try {
    const clients = await clientAPI.listClients({ limit: 10 });
    console.log('Clients loaded:', clients);
  } catch (error) {
    console.error('API Error:', error);
  }
}`}
                </pre>
              </div>
              
              <div>
                <h3 className="font-medium text-white mb-2">3. Testing APIs</h3>
                <pre className="bg-black/30 p-3 rounded text-xs overflow-x-auto">
{`import { apiTester } from '@/app/services';

// Test all APIs
await apiTester.runAllTests();

// Test specific API
await apiTester.testSpecificAPI('client');

// Get results
const results = apiTester.getResults();`}
                </pre>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}