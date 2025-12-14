/**
 * API Testing Utility
 * Comprehensive testing suite for all ORR Admin Portal APIs
 */

import {
  dashboardAPI,
  aiOversightAPI,
  analyticsAPI,
  authAPI,
  clientAPI,
  contentAPI,
  meetingAPI,
  notificationAPI,
  searchAPI,
  settingsAPI,
  ticketAPI,
  billingAPI,
  cmsAPI,
} from './api';

interface TestResult {
  endpoint: string;
  method: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
}

class APITester {
  private results: TestSuite[] = [];

  async runTest(
    testName: string,
    testFunction: () => Promise<any>,
    endpoint: string,
    method: string = 'GET'
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      console.log(`🧪 Testing: ${testName}`);
      const data = await testFunction();
      const duration = Date.now() - startTime;
      
      console.log(`✅ ${testName} - Success (${duration}ms)`);
      return {
        endpoint,
        method,
        success: true,
        duration,
        data
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error(`❌ ${testName} - Failed (${duration}ms):`, error.message);
      
      return {
        endpoint,
        method,
        success: false,
        duration,
        error: error.message
      };
    }
  }

  async testDashboardAPIs(): Promise<TestSuite> {
    console.group('📊 Testing Dashboard APIs');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.runTest(
      'Dashboard Overview',
      () => dashboardAPI.getOverview(),
      '/admin-portal/v1/dashboard/overview/'
    ));
    
    tests.push(await this.runTest(
      'Dashboard Quick Stats',
      () => dashboardAPI.getQuickStats(),
      '/admin-portal/v1/dashboard/quick-stats/'
    ));
    
    tests.push(await this.runTest(
      'Dashboard Recent Activity',
      () => dashboardAPI.getRecentActivity(),
      '/admin-portal/v1/dashboard/recent-activity/'
    ));
    
    console.groupEnd();
    
    return this.createTestSuite('Dashboard APIs', tests);
  }

  async testAuthAPIs(): Promise<TestSuite> {
    console.group('🔐 Testing Auth APIs');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.runTest(
      'Get Current User',
      () => authAPI.getCurrentUser(),
      '/admin-portal/v1/auth/me/'
    ));
    
    tests.push(await this.runTest(
      'Get Available Roles',
      () => authAPI.getAvailableRoles(),
      '/admin-portal/v1/admin-roles/'
    ));
    
    tests.push(await this.runTest(
      'Check Permission (can_view_all_clients)',
      () => authAPI.checkPermission('can_view_all_clients'),
      '/admin-portal/v1/auth/check-permission/',
      'POST'
    ));
    
    console.groupEnd();
    
    return this.createTestSuite('Auth APIs', tests);
  }

  async testClientAPIs(): Promise<TestSuite> {
    console.group('👥 Testing Client APIs');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.runTest(
      'List Clients',
      () => clientAPI.listClients(),
      '/admin-portal/v1/clients/'
    ));
    
    tests.push(await this.runTest(
      'Get Client Stats',
      () => clientAPI.getStats(),
      '/admin-portal/v1/clients/stats/'
    ));
    
    // Test with filters
    tests.push(await this.runTest(
      'List Clients with Filters',
      () => clientAPI.listClients({ stage: 'discover', limit: 10 }),
      '/admin-portal/v1/clients/?stage=discover&limit=10'
    ));
    
    console.groupEnd();
    
    return this.createTestSuite('Client APIs', tests);
  }

  async testContentAPIs(): Promise<TestSuite> {
    console.group('📝 Testing Content APIs');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.runTest(
      'List Content',
      () => contentAPI.listContent(),
      '/admin-portal/v1/content/'
    ));
    
    tests.push(await this.runTest(
      'Get Content Stats',
      () => contentAPI.getStats(),
      '/admin-portal/v1/content/stats/'
    ));
    
    tests.push(await this.runTest(
      'List Content with Filters',
      () => contentAPI.listContent({ status: 'published', limit: 5 }),
      '/admin-portal/v1/content/?status=published&limit=5'
    ));
    
    console.groupEnd();
    
    return this.createTestSuite('Content APIs', tests);
  }

  async testMeetingAPIs(): Promise<TestSuite> {
    console.group('📅 Testing Meeting APIs');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.runTest(
      'List Meetings',
      () => meetingAPI.listMeetings(),
      '/admin-portal/v1/meetings/'
    ));
    
    tests.push(await this.runTest(
      'Get Upcoming Meetings',
      () => meetingAPI.getUpcomingMeetings(),
      '/admin-portal/v1/meetings/upcoming/'
    ));
    
    tests.push(await this.runTest(
      'Get My Meetings',
      () => meetingAPI.getMyMeetings(),
      '/admin-portal/v1/meetings/my-meetings/'
    ));
    
    tests.push(await this.runTest(
      'Get Meeting Stats',
      () => meetingAPI.getStats(),
      '/admin-portal/v1/meetings/stats/'
    ));
    
    console.groupEnd();
    
    return this.createTestSuite('Meeting APIs', tests);
  }

  async testTicketAPIs(): Promise<TestSuite> {
    console.group('🎫 Testing Ticket APIs');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.runTest(
      'List Tickets',
      () => ticketAPI.listTickets(),
      '/admin-portal/v1/tickets/'
    ));
    
    tests.push(await this.runTest(
      'Get My Tickets',
      () => ticketAPI.getMyTickets(),
      '/admin-portal/v1/tickets/my-tickets/'
    ));
    
    tests.push(await this.runTest(
      'Get Ticket Stats',
      () => ticketAPI.getStats(),
      '/admin-portal/v1/tickets/stats/'
    ));
    
    tests.push(await this.runTest(
      'List Tickets with Filters',
      () => ticketAPI.listTickets({ status: 'new', priority: 'high' }),
      '/admin-portal/v1/tickets/?status=new&priority=high'
    ));
    
    console.groupEnd();
    
    return this.createTestSuite('Ticket APIs', tests);
  }

  async testNotificationAPIs(): Promise<TestSuite> {
    console.group('🔔 Testing Notification APIs');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.runTest(
      'List Notifications',
      () => notificationAPI.listNotifications(),
      '/admin-portal/v1/notifications/'
    ));
    
    tests.push(await this.runTest(
      'Get Notification Stats',
      () => notificationAPI.getStats(),
      '/admin-portal/v1/notifications/stats/'
    ));
    
    tests.push(await this.runTest(
      'List Unread Notifications',
      () => notificationAPI.listNotifications({ is_read: false }),
      '/admin-portal/v1/notifications/?is_read=false'
    ));
    
    console.groupEnd();
    
    return this.createTestSuite('Notification APIs', tests);
  }

  async testBillingAPIs(): Promise<TestSuite> {
    console.group('💳 Testing Billing APIs');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.runTest(
      'Get Billing History',
      () => billingAPI.getHistory(),
      '/admin-portal/v1/billing-history/'
    ));
    
    tests.push(await this.runTest(
      'Get Billing Stats',
      () => billingAPI.getStats(),
      '/admin-portal/v1/billing-history/stats/'
    ));
    
    tests.push(await this.runTest(
      'Get All Payment Stats',
      () => billingAPI.getAllPaymentStats(),
      '/admin-portal/v1/billing-history/stats/'
    ));
    
    tests.push(await this.runTest(
      'Get Pricing Plans',
      () => billingAPI.getPricingPlans(),
      '/admin-portal/v1/pricing-plans/'
    ));
    
    console.groupEnd();
    
    return this.createTestSuite('Billing APIs', tests);
  }

  async testAnalyticsAPIs(): Promise<TestSuite> {
    console.group('📈 Testing Analytics APIs');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.runTest(
      'Get Analytics Overview',
      () => analyticsAPI.getOverview(),
      '/admin-portal/v1/analytics/overview/'
    ));
    
    tests.push(await this.runTest(
      'Get Client Analytics',
      () => analyticsAPI.getClientAnalytics(),
      '/admin-portal/v1/analytics/clients/'
    ));
    
    tests.push(await this.runTest(
      'Get Content Analytics',
      () => analyticsAPI.getContentAnalytics(),
      '/admin-portal/v1/analytics/content/'
    ));
    
    console.groupEnd();
    
    return this.createTestSuite('Analytics APIs', tests);
  }

  async testSearchAPIs(): Promise<TestSuite> {
    console.group('🔍 Testing Search APIs');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.runTest(
      'Quick Search',
      () => searchAPI.quickSearch('test'),
      '/admin-portal/v1/search/quick/?q=test'
    ));
    
    tests.push(await this.runTest(
      'Global Search - All',
      () => searchAPI.globalSearch('client', 'all', 10),
      '/admin-portal/v1/search/global/?q=client&type=all&limit=10'
    ));
    
    tests.push(await this.runTest(
      'Global Search - Clients Only',
      () => searchAPI.globalSearch('company', 'clients'),
      '/admin-portal/v1/search/global/?q=company&type=clients'
    ));
    
    console.groupEnd();
    
    return this.createTestSuite('Search APIs', tests);
  }

  async testCMSAPIs(): Promise<TestSuite> {
    console.group('🎨 Testing CMS APIs');
    
    const tests: TestResult[] = [];
    
    tests.push(await this.runTest(
      'Get User Role',
      () => cmsAPI.getUserRole(),
      '/admin-portal/v1/auth/me/'
    ));
    
    tests.push(await this.runTest(
      'Get CMS Content - Hero',
      () => cmsAPI.getContent('hero'),
      '/admin-portal/v1/cms/hero/'
    ));
    
    tests.push(await this.runTest(
      'Get CMS Content - About',
      () => cmsAPI.getContent('about'),
      '/admin-portal/v1/cms/about/'
    ));
    
    console.groupEnd();
    
    return this.createTestSuite('CMS APIs', tests);
  }

  private createTestSuite(name: string, tests: TestResult[]): TestSuite {
    const passedTests = tests.filter(t => t.success).length;
    const failedTests = tests.filter(t => !t.success).length;
    const totalDuration = tests.reduce((sum, t) => sum + t.duration, 0);
    
    const suite: TestSuite = {
      name,
      tests,
      totalTests: tests.length,
      passedTests,
      failedTests,
      totalDuration
    };
    
    this.results.push(suite);
    return suite;
  }

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting comprehensive API testing...');
    const startTime = Date.now();
    
    try {
      // Run all test suites
      await this.testAuthAPIs();
      await this.testDashboardAPIs();
      await this.testClientAPIs();
      await this.testContentAPIs();
      await this.testMeetingAPIs();
      await this.testTicketAPIs();
      await this.testNotificationAPIs();
      await this.testBillingAPIs();
      await this.testAnalyticsAPIs();
      await this.testSearchAPIs();
      await this.testCMSAPIs();
      
      const totalDuration = Date.now() - startTime;
      this.printSummary(totalDuration);
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  private printSummary(totalDuration: number): void {
    console.log('\n' + '='.repeat(80));
    console.log('📋 API TEST SUMMARY');
    console.log('='.repeat(80));
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;
    
    this.results.forEach(suite => {
      totalTests += suite.totalTests;
      totalPassed += suite.passedTests;
      totalFailed += suite.failedTests;
      
      const passRate = ((suite.passedTests / suite.totalTests) * 100).toFixed(1);
      const status = suite.failedTests === 0 ? '✅' : '⚠️';
      
      console.log(`${status} ${suite.name}: ${suite.passedTests}/${suite.totalTests} passed (${passRate}%) - ${suite.totalDuration}ms`);
      
      // Show failed tests
      if (suite.failedTests > 0) {
        suite.tests.filter(t => !t.success).forEach(test => {
          console.log(`   ❌ ${test.endpoint} - ${test.error}`);
        });
      }
    });
    
    console.log('='.repeat(80));
    const overallPassRate = ((totalPassed / totalTests) * 100).toFixed(1);
    const overallStatus = totalFailed === 0 ? '🎉' : totalFailed < totalTests / 2 ? '⚠️' : '🚨';
    
    console.log(`${overallStatus} OVERALL: ${totalPassed}/${totalTests} tests passed (${overallPassRate}%)`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`📊 Success Rate: ${overallPassRate}%`);
    
    if (totalFailed === 0) {
      console.log('🎉 All APIs are working perfectly!');
    } else if (totalFailed < totalTests / 2) {
      console.log('⚠️  Some APIs need attention, but most are working.');
    } else {
      console.log('🚨 Many APIs are failing - check your backend connection and authentication.');
    }
    
    console.log('='.repeat(80));
  }

  // Quick test for specific API
  async testSpecificAPI(apiName: string): Promise<void> {
    switch (apiName.toLowerCase()) {
      case 'dashboard':
        await this.testDashboardAPIs();
        break;
      case 'auth':
        await this.testAuthAPIs();
        break;
      case 'client':
        await this.testClientAPIs();
        break;
      case 'content':
        await this.testContentAPIs();
        break;
      case 'meeting':
        await this.testMeetingAPIs();
        break;
      case 'ticket':
        await this.testTicketAPIs();
        break;
      case 'notification':
        await this.testNotificationAPIs();
        break;
      case 'billing':
        await this.testBillingAPIs();
        break;
      case 'analytics':
        await this.testAnalyticsAPIs();
        break;
      case 'search':
        await this.testSearchAPIs();
        break;
      case 'cms':
        await this.testCMSAPIs();
        break;
      default:
        console.error(`❌ Unknown API: ${apiName}`);
        console.log('Available APIs: dashboard, auth, client, content, meeting, ticket, notification, billing, analytics, search, cms');
    }
  }

  // Get test results
  getResults(): TestSuite[] {
    return this.results;
  }

  // Clear results
  clearResults(): void {
    this.results = [];
  }
}

// Export singleton instance
export const apiTester = new APITester();

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).apiTester = apiTester;
  console.log('🧪 API Tester available globally as window.apiTester');
  console.log('Usage:');
  console.log('  - apiTester.runAllTests() - Run all API tests');
  console.log('  - apiTester.testSpecificAPI("dashboard") - Test specific API');
  console.log('  - apiTester.getResults() - Get test results');
}

export default apiTester;