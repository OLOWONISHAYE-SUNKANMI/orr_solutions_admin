# ORR ADMIN PORTAL - BACKEND REQUIREMENTS SPECIFICATION
**Date:** December 12, 2025  
**For:** Backend Development Team  
**Status:** Ready for Implementation

---

## EXECUTIVE SUMMARY

**✅ FULLY IMPLEMENTED & READY (5 Sections):**
- Home/Dashboard
- Operational Dashboard - System Notifications
- Operational Dashboard - Billing & Credit Overview
- Operational Dashboard - Client Management (All Clients + Profiles)
- Tickets & Communication - Support Tickets

**❌ NEEDS BACKEND ENDPOINTS (11 Sections):**
- Operational Dashboard - Client Workspaces
- Operational Dashboard - Client Meetings
- Consultation Management (All sections)
- Tickets & Communication - Client Messages
- Tickets & Communication - Internal Comms
- Tickets & Communication - Escalations
- Analytics & Insights (9 sub-sections)

---

## PART 1: FULLY IMPLEMENTED SECTIONS (Ready for API Consumption)

### ✅ 1. HOME / DASHBOARD
**Status:** FULLY IMPLEMENTED & READY

**Frontend Structure Expects:**
```typescript
interface DashboardMetrics {
  active_clients: number;
  pending_tickets: number;
  upcoming_meetings: number;
  system_notifications: number;
  portal_logins: number;
  ai_chat_sessions: number;
  escalation_rate: number;
}

interface Notification {
  id: number;
  notification_type: "ticket_created" | "ticket_assigned" | "meeting_assigned" | "meeting_confirmed" | "client_updated" | "content_published" | "system_alert";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_object_info: string;
}

interface TicketListItem {
  id: number;
  ticket_id: string;
  subject: string;
  status: "new" | "in_progress" | "waiting" | "resolved" | "archived";
  priority: "low" | "normal" | "high" | "urgent";
  source: "ai_escalation" | "manual_request";
  client_name: string;
  client_company: string;
  assigned_to_name: string;
  messages_count: number;
  created_at: string;
  updated_at: string;
}

interface MeetingListItem {
  id: number;
  client_name: string;
  client_company: string;
  meeting_type: "discovery" | "follow_up" | "consultation" | "review";
  status: "requested" | "confirmed" | "declined" | "completed" | "cancelled";
  requested_datetime: string;
  confirmed_datetime: string;
  duration_minutes: number;
  host_name: string;
  created_at: string;
}

interface ContentListItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content_type: "faq" | "article" | "checklist" | "template" | "guide";
  status: "draft" | "published" | "archived";
  stage: "discover" | "diagnose" | "design" | "deploy" | "grow";
  pillars: string;
  author_name: string;
  published_at: string;
  version: number;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

interface PaymentStats {
  total_revenue: string | number;
  pending_amount: string | number;
  completed_transactions: number;
  pending_transactions: number;
}
```

**API Endpoints Used:**
1. `GET /admin-portal/v1/dashboard/overview/` → DashboardMetrics
2. `GET /admin-portal/v1/notifications/?is_read=false` → { results: Notification[] }
3. `GET /admin-portal/v1/tickets/?status=new` → { results: TicketListItem[] }
4. `GET /admin-portal/v1/meetings/upcoming/` → { results: MeetingListItem[] }
5. `GET /admin-portal/v1/content/?limit=5` → { results: ContentListItem[] }
6. `GET /admin-portal/v1/billing-history/stats/` → PaymentStats
7. `GET /admin-portal/v1/clients/stats/` → { total_clients: number; ... }

**Frontend Ready:** ✅ YES - All data structures defined and integrated

---

### ✅ 2. OPERATIONAL DASHBOARD - SYSTEM NOTIFICATIONS
**Status:** FULLY IMPLEMENTED & READY

**Frontend Structure Expects:**
```typescript
interface Notification {
  id: number;
  notification_type: "ticket_created" | "ticket_assigned" | "meeting_assigned" | "meeting_confirmed" | "client_updated" | "content_published" | "system_alert";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_object_info: string;
}
```

**API Endpoint Used:**
- `GET /admin-portal/v1/notifications/?is_read=false` → { results: Notification[] }

**Frontend Ready:** ✅ YES - Loading states, error handling, fallback data implemented

---

### ✅ 3. OPERATIONAL DASHBOARD - BILLING & CREDIT OVERVIEW
**Status:** FULLY IMPLEMENTED & READY

**Frontend Structure Expects:**
```typescript
interface PaymentStats {
  total_revenue: string | number;
  pending_amount: string | number;
  completed_transactions: number;
  pending_transactions: number;
}
```

**API Endpoint Used:**
- `GET /admin-portal/v1/billing-history/stats/` → PaymentStats

**Frontend Ready:** ✅ YES - Loading states, error handling, stats display implemented

---

### ✅ 4. OPERATIONAL DASHBOARD - CLIENT MANAGEMENT (All Clients + Profiles)
**Status:** FULLY IMPLEMENTED & READY

**Frontend Structure Expects:**
```typescript
interface ClientListItem {
  id: number;
  full_name: string;
  email: string;
  company: string;
  role: string;
  stage: "discover" | "diagnose" | "design" | "deploy" | "grow";
  primary_pillar: "strategic" | "operational" | "financial" | "cultural";
  assigned_admin_name: string;
  is_portal_active: boolean;
  last_activity: string;
  created_at: string;
}

interface Client {
  id: number;
  full_name: string;
  email: string;
  username: string;
  company: string;
  role: string;
  stage: "discover" | "diagnose" | "design" | "deploy" | "grow";
  primary_pillar: "strategic" | "operational" | "financial" | "cultural";
  secondary_pillars: string;
  assigned_admin_name: string;
  internal_notes: string;
  is_portal_active: boolean;
  last_activity: string;
  date_joined: string;
  last_login: string;
  created_at: string;
  updated_at: string;
  tickets_count: number;
  meetings_count: number;
  documents_count: number;
}

interface EngagementHistory {
  meetings_count: number;
  content_views: number;
  documents_downloaded: number;
  last_engagement: string;
  engagement_score: number;
}

interface ClientStats {
  total_clients: number;
  by_stage: { discover: number; diagnose: number; design: number; deploy: number; grow: number };
  by_pillar: { strategic: number; operational: number; financial: number; cultural: number };
  portal_active_count: number;
  registered_vs_booked: { registered: number; booked: number };
}
```

**API Endpoints Used:**
1. `GET /admin-portal/v1/clients/?[filters]` → { results: ClientListItem[] }
   - Query params: `stage`, `primary_pillar`, `is_portal_active`, `search`
2. `GET /admin-portal/v1/clients/{id}/` → Client
3. `GET /admin-portal/v1/clients/{id}/engagement-history/` → EngagementHistory
4. `GET /admin-portal/v1/clients/stats/` → ClientStats
5. `POST /admin-portal/v1/clients/{id}/actions/` → { action: "toggle_portal" }

**Frontend Ready:** ✅ YES - Filters, search, detailed view, engagement history all implemented

---

### ✅ 5. TICKETS & COMMUNICATION - SUPPORT TICKETS
**Status:** FULLY IMPLEMENTED & READY

**Frontend Structure Expects:**
```typescript
interface TicketListItem {
  id: number;
  ticket_id: string;
  subject: string;
  status: "new" | "in_progress" | "waiting" | "resolved" | "archived";
  priority: "low" | "normal" | "high" | "urgent";
  source: "ai_escalation" | "manual_request";
  client_name: string;
  client_company: string;
  assigned_to_name: string;
  messages_count: number;
  created_at: string;
  updated_at: string;
}

interface Ticket {
  id: number;
  ticket_id: string;
  subject: string;
  description: string;
  status: "new" | "in_progress" | "waiting" | "resolved" | "archived";
  priority: "low" | "normal" | "high" | "urgent";
  source: "ai_escalation" | "manual_request";
  client_name: string;
  client_email: string;
  client_company: string;
  assigned_to_name: string;
  internal_notes: string;
  related_meeting_info: string;
  related_content_info: string;
  created_at: string;
  updated_at: string;
}

interface TicketMessage {
  id: number;
  message: string;
  sender_name: string;
  sender_type: string;
  is_internal: boolean;
  created_at: string;
}

interface TicketStats {
  total_tickets: number;
  new_count: number;
  in_progress_count: number;
  resolved_count: number;
  average_resolution_time: string;
}
```

**API Endpoints Used:**
1. `GET /admin-portal/v1/tickets/?[filters]` → { results: TicketListItem[] }
   - Query params: `status`, `priority`, `source`
2. `GET /admin-portal/v1/tickets/{id}/` → Ticket
3. `GET /admin-portal/v1/tickets/{id}/messages/` → { results: TicketMessage[] }
4. `POST /admin-portal/v1/tickets/{id}/messages/` → { message: string; is_internal: boolean }
5. `PATCH /admin-portal/v1/tickets/{id}/` → { status?: string; priority?: string; ... }
6. `GET /admin-portal/v1/tickets/stats/` → TicketStats

**Frontend Ready:** ✅ YES - Filters, message threads, stats all implemented

---

## PART 2: MISSING BACKEND ENDPOINTS (Need Implementation)

### ❌ 1. OPERATIONAL DASHBOARD - CLIENT WORKSPACES

**Endpoint:** `GET /admin-portal/v1/clients/{client_id}/workspaces/`

**Request:**
```
GET /admin-portal/v1/clients/123/workspaces/
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": 1,
      "client_id": 123,
      "workspace_name": "Strategic Planning Q1 2025",
      "workspace_type": "project",
      "status": "active",
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-15T14:30:00Z",
      "assigned_data_structures": [
        {
          "id": 1,
          "ds_name": "Business Model Canvas",
          "ds_type": "template",
          "assigned_date": "2025-01-01T10:00:00Z"
        }
      ],
      "tools_count": 5,
      "resources_count": 12,
      "last_activity": "2025-01-15T14:30:00Z"
    }
  ]
}
```

**Frontend Data Structure:**
```typescript
interface Workspace {
  id: number;
  client_id: number;
  workspace_name: string;
  workspace_type: string;
  status: "active" | "archived" | "paused";
  created_at: string;
  updated_at: string;
  assigned_data_structures: DataStructure[];
  tools_count: number;
  resources_count: number;
  last_activity: string;
}

interface DataStructure {
  id: number;
  ds_name: string;
  ds_type: string;
  assigned_date: string;
}
```

---

### ❌ 2. OPERATIONAL DASHBOARD - CLIENT MEETINGS (Past/Upcoming/Pending)

**Endpoint:** `GET /admin-portal/v1/clients/{client_id}/meetings/`

**Request:**
```
GET /admin-portal/v1/clients/123/meetings/?status=upcoming
Headers: Authorization: Bearer {token}
Query Params: status (upcoming|past|pending|all)
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": 1,
      "client_id": 123,
      "client_name": "John Doe",
      "client_company": "Tech Corp",
      "meeting_type": "discovery",
      "status": "confirmed",
      "requested_datetime": "2025-01-20T10:00:00Z",
      "confirmed_datetime": "2025-01-20T10:00:00Z",
      "duration_minutes": 60,
      "agenda": "Discuss business model and pain points",
      "host_name": "Sarah Admin",
      "meeting_link": "https://zoom.us/j/123456",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "count": 15,
    "next": null,
    "previous": null
  }
}
```

**Frontend Data Structure:**
```typescript
interface ClientMeeting {
  id: number;
  client_id: number;
  client_name: string;
  client_company: string;
  meeting_type: "discovery" | "follow_up" | "consultation" | "review";
  status: "requested" | "confirmed" | "declined" | "completed" | "cancelled";
  requested_datetime: string;
  confirmed_datetime: string;
  duration_minutes: number;
  agenda: string;
  host_name: string;
  meeting_link: string;
  created_at: string;
  updated_at: string;
}
```

---

### ❌ 3. CONSULTATION MANAGEMENT - ALL SECTIONS

#### 3a. All Consultations (Past & Scheduled)

**Endpoint:** `GET /admin-portal/v1/consultations/`

**Request:**
```
GET /admin-portal/v1/consultations/?type=past
Headers: Authorization: Bearer {token}
Query Params: type (past|scheduled|all)
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": 1,
      "consultation_id": "CONS-001",
      "client_name": "John Doe",
      "client_company": "Tech Corp",
      "consultation_type": "discovery",
      "status": "completed",
      "scheduled_date": "2025-01-10T10:00:00Z",
      "completed_date": "2025-01-10T11:00:00Z",
      "duration_minutes": 60,
      "consultant_name": "Sarah Admin",
      "notes": "Client interested in digital transformation",
      "outcome": "Scheduled follow-up meeting",
      "created_at": "2025-01-08T10:00:00Z",
      "updated_at": "2025-01-10T11:00:00Z"
    }
  ]
}
```

**Frontend Data Structure:**
```typescript
interface Consultation {
  id: number;
  consultation_id: string;
  client_name: string;
  client_company: string;
  consultation_type: string;
  status: "scheduled" | "completed" | "cancelled" | "rescheduled";
  scheduled_date: string;
  completed_date: string;
  duration_minutes: number;
  consultant_name: string;
  notes: string;
  outcome: string;
  created_at: string;
  updated_at: string;
}
```

#### 3b. Assigned Consultants

**Endpoint:** `GET /admin-portal/v1/consultants/`

**Request:**
```
GET /admin-portal/v1/consultants/
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": 1,
      "consultant_name": "Sarah Admin",
      "email": "sarah@orr.solutions",
      "specialization": "Digital Transformation",
      "total_consultations": 25,
      "completed_consultations": 23,
      "pending_consultations": 2,
      "average_rating": 4.8,
      "assigned_clients": [
        {
          "client_id": 123,
          "client_name": "John Doe",
          "company": "Tech Corp"
        }
      ],
      "created_at": "2024-01-01T10:00:00Z"
    }
  ]
}
```

**Frontend Data Structure:**
```typescript
interface Consultant {
  id: number;
  consultant_name: string;
  email: string;
  specialization: string;
  total_consultations: number;
  completed_consultations: number;
  pending_consultations: number;
  average_rating: number;
  assigned_clients: AssignedClient[];
  created_at: string;
}

interface AssignedClient {
  client_id: number;
  client_name: string;
  company: string;
}
```

#### 3c. Reports (Drafts/Approved)

**Endpoint:** `GET /admin-portal/v1/reports/`

**Request:**
```
GET /admin-portal/v1/reports/?status=approved
Headers: Authorization: Bearer {token}
Query Params: status (draft|approved|all)
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": 1,
      "report_id": "RPT-001",
      "client_name": "John Doe",
      "client_company": "Tech Corp",
      "report_title": "Digital Transformation Roadmap",
      "report_type": "strategic_analysis",
      "status": "approved",
      "created_by": "Sarah Admin",
      "created_date": "2025-01-05T10:00:00Z",
      "approved_by": "Manager Name",
      "approved_date": "2025-01-10T14:00:00Z",
      "pages": 25,
      "file_url": "https://storage.orr.solutions/reports/RPT-001.pdf",
      "created_at": "2025-01-05T10:00:00Z",
      "updated_at": "2025-01-10T14:00:00Z"
    }
  ]
}
```

**Frontend Data Structure:**
```typescript
interface Report {
  id: number;
  report_id: string;
  client_name: string;
  client_company: string;
  report_title: string;
  report_type: string;
  status: "draft" | "approved" | "published" | "archived";
  created_by: string;
  created_date: string;
  approved_by: string;
  approved_date: string;
  pages: number;
  file_url: string;
  created_at: string;
  updated_at: string;
}
```

---

### ❌ 4. TICKETS & COMMUNICATION - CLIENT MESSAGES

**Endpoint:** `GET /admin-portal/v1/clients/{client_id}/messages/`

**Request:**
```
GET /admin-portal/v1/clients/123/messages/
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": 1,
      "message_id": "MSG-001",
      "client_id": 123,
      "client_name": "John Doe",
      "message_type": "inquiry",
      "subject": "Question about implementation timeline",
      "message_content": "When can we start the implementation?",
      "sender_type": "client",
      "status": "open",
      "priority": "normal",
      "assigned_to": "Sarah Admin",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T14:00:00Z",
      "last_response": "2025-01-15T14:00:00Z"
    }
  ]
}
```

**Frontend Data Structure:**
```typescript
interface ClientMessage {
  id: number;
  message_id: string;
  client_id: number;
  client_name: string;
  message_type: string;
  subject: string;
  message_content: string;
  sender_type: "client" | "admin";
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  assigned_to: string;
  created_at: string;
  updated_at: string;
  last_response: string;
}
```

---

### ❌ 5. TICKETS & COMMUNICATION - INTERNAL COMMS

**Endpoint:** `GET /admin-portal/v1/internal-communications/`

**Request:**
```
GET /admin-portal/v1/internal-communications/?type=unread
Headers: Authorization: Bearer {token}
Query Params: type (all|unread|archived)
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": 1,
      "comm_id": "COMM-001",
      "from_user": "Sarah Admin",
      "to_user": "Manager Name",
      "subject": "Client escalation - Tech Corp",
      "message": "Need approval for additional resources",
      "comm_type": "escalation",
      "status": "unread",
      "priority": "high",
      "related_ticket": "TICKET-123",
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**Frontend Data Structure:**
```typescript
interface InternalComm {
  id: number;
  comm_id: string;
  from_user: string;
  to_user: string;
  subject: string;
  message: string;
  comm_type: "escalation" | "notification" | "request" | "update";
  status: "unread" | "read" | "archived";
  priority: "low" | "normal" | "high" | "urgent";
  related_ticket: string;
  created_at: string;
  updated_at: string;
}
```

---

### ❌ 6. TICKETS & COMMUNICATION - ESCALATIONS

**Endpoint:** `GET /admin-portal/v1/escalations/`

**Request:**
```
GET /admin-portal/v1/escalations/?status=pending
Headers: Authorization: Bearer {token}
Query Params: status (pending|resolved|all)
```

**Response (200 OK):**
```json
{
  "results": [
    {
      "id": 1,
      "escalation_id": "ESC-001",
      "ticket_id": "TICKET-123",
      "client_name": "John Doe",
      "client_company": "Tech Corp",
      "escalation_reason": "Client unhappy with response time",
      "escalation_level": "manager",
      "status": "pending",
      "escalated_by": "Sarah Admin",
      "escalated_to": "Manager Name",
      "escalation_date": "2025-01-15T10:00:00Z",
      "resolution_date": null,
      "resolution_notes": null,
      "created_at": "2025-01-15T10:00:00Z",
      "updated_at": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**Frontend Data Structure:**
```typescript
interface Escalation {
  id: number;
  escalation_id: string;
  ticket_id: string;
  client_name: string;
  client_company: string;
  escalation_reason: string;
  escalation_level: "supervisor" | "manager" | "director";
  status: "pending" | "in_progress" | "resolved";
  escalated_by: string;
  escalated_to: string;
  escalation_date: string;
  resolution_date: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}
```

---

### ❌ 7. ANALYTICS & INSIGHTS (9 Sub-sections)

#### 7a. Behaviour Analytics

**Endpoint:** `GET /admin-portal/v1/analytics/behaviour/`

**Request:**
```
GET /admin-portal/v1/analytics/behaviour/?date_range=30days
Headers: Authorization: Bearer {token}
Query Params: date_range (7days|30days|90days|all)
```

**Response (200 OK):**
```json
{
  "total_logins": 156,
  "unique_users": 45,
  "average_session_duration": "12:34",
  "bounce_rate": 15.2,
  "page_views": 1250,
  "most_visited_pages": [
    {
      "page_name": "Dashboard",
      "views": 450,
      "avg_time": "3:45"
    }
  ],
  "user_actions": {
    "documents_downloaded": 89,
    "resources_accessed": 156,
    "meetings_booked": 23,
    "messages_sent": 345
  },
  "trends": {
    "login_trend": 12.5,
    "engagement_trend": 8.3
  }
}
```

**Frontend Data Structure:**
```typescript
interface BehaviourAnalytics {
  total_logins: number;
  unique_users: number;
  average_session_duration: string;
  bounce_rate: number;
  page_views: number;
  most_visited_pages: PageView[];
  user_actions: UserActions;
  trends: Trends;
}

interface PageView {
  page_name: string;
  views: number;
  avg_time: string;
}

interface UserActions {
  documents_downloaded: number;
  resources_accessed: number;
  meetings_booked: number;
  messages_sent: number;
}

interface Trends {
  login_trend: number;
  engagement_trend: number;
}
```

#### 7b. Sector Insights

**Endpoint:** `GET /admin-portal/v1/analytics/sector-insights/`

**Request:**
```
GET /admin-portal/v1/analytics/sector-insights/
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "sectors": [
    {
      "sector_name": "Technology",
      "client_count": 25,
      "total_revenue": "€125,000",
      "average_contract_value": "€5,000",
      "growth_rate": 15.3,
      "top_challenges": [
        "Digital Transformation",
        "AI Integration",
        "Data Security"
      ],
      "success_rate": 92.5
    }
  ],
  "sector_distribution": {
    "Technology": 35,
    "Finance": 25,
    "Healthcare": 20,
    "Other": 20
  }
}
```

**Frontend Data Structure:**
```typescript
interface SectorInsights {
  sectors: Sector[];
  sector_distribution: Record<string, number>;
}

interface Sector {
  sector_name: string;
  client_count: number;
  total_revenue: string;
  average_contract_value: string;
  growth_rate: number;
  top_challenges: string[];
  success_rate: number;
}
```

#### 7c. Consultation Metrics

**Endpoint:** `GET /admin-portal/v1/analytics/consultation-metrics/`

**Request:**
```
GET /admin-portal/v1/analytics/consultation-metrics/?period=monthly
Headers: Authorization: Bearer {token}
Query Params: period (daily|weekly|monthly|yearly)
```

**Response (200 OK):**
```json
{
  "total_consultations": 156,
  "completed_consultations": 142,
  "pending_consultations": 14,
  "average_duration": "58 minutes",
  "client_satisfaction": 4.7,
  "conversion_rate": 78.5,
  "consultations_by_type": {
    "discovery": 45,
    "follow_up": 67,
    "consultation": 34,
    "review": 10
  },
  "top_consultants": [
    {
      "consultant_name": "Sarah Admin",
      "consultations_count": 34,
      "satisfaction_score": 4.9
    }
  ]
}
```

**Frontend Data Structure:**
```typescript
interface ConsultationMetrics {
  total_consultations: number;
  completed_consultations: number;
  pending_consultations: number;
  average_duration: string;
  client_satisfaction: number;
  conversion_rate: number;
  consultations_by_type: Record<string, number>;
  top_consultants: ConsultantMetric[];
}

interface ConsultantMetric {
  consultant_name: string;
  consultations_count: number;
  satisfaction_score: number;
}
```

#### 7d. Workspace Usage

**Endpoint:** `GET /admin-portal/v1/analytics/workspace-usage/`

**Request:**
```
GET /admin-portal/v1/analytics/workspace-usage/?date_range=30days
Headers: Authorization: Bearer {token}
Query Params: date_range (7days|30days|90days|all)
```

**Response (200 OK):**
```json
{
  "active_workspaces": 45,
  "total_workspaces": 67,
  "average_usage_per_workspace": 12.5,
  "most_used_tools": [
    {
      "tool_name": "Business Model Canvas",
      "usage_count": 156,
      "users": 34
    }
  ],
  "workspace_types": {
    "project": 35,
    "strategic": 20,
    "operational": 12
  },
  "engagement_score": 78.5
}
```

**Frontend Data Structure:**
```typescript
interface WorkspaceUsage {
  active_workspaces: number;
  total_workspaces: number;
  average_usage_per_workspace: number;
  most_used_tools: ToolUsage[];
  workspace_types: Record<string, number>;
  engagement_score: number;
}

interface ToolUsage {
  tool_name: string;
  usage_count: number;
  users: number;
}
```

#### 7e. Funnel Reports

**Endpoint:** `GET /admin-portal/v1/analytics/funnel-reports/`

**Request:**
```
GET /admin-portal/v1/analytics/funnel-reports/
Headers: Authorization: Bearer {token}
```

**Response (200 OK):**
```json
{
  "funnel_stages": [
    {
      "stage": "Registered",
      "count": 500,
      "percentage": 100
    },
    {
      "stage": "First Meeting Booked",
      "count": 320,
      "percentage": 64
    },
    {
      "stage": "Discovery Completed",
      "count": 245,
      "percentage": 49
    },
    {
      "stage": "Design Approved",
      "count": 180,
      "percentage": 36
    },
    {
      "stage": "Deployment Started",
      "count": 120,
      "percentage": 24
    }
  ],
  "conversion_rates": {
    "registered_to_first_meeting": 64,
    "first_meeting_to_discovery": 76.5,
    "discovery_to_design": 73.5,
    "design_to_deployment": 66.7
  }
}
```

**Frontend Data Structure:**
```typescript
interface FunnelReports {
  funnel_stages: FunnelStage[];
  conversion_rates: Record<string, number>;
}

interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
}
```

#### 7f. Wallet Logs

**Endpoint:** `GET /admin-portal/v1/analytics/wallet-logs/`

**Request:**
```
GET /admin-portal/v1/analytics/wallet-logs/?date_range=30days
Headers: Authorization: Bearer {token}
Query Params: date_range (7days|30days|90days|all)
```

**Response (200 OK):**
```json
{
  "total_wallet_balance": "€45,230.50",
  "total_deposits": "€125,000",
  "total_withdrawals": "€79,769.50",
  "transactions": [
    {
      "transaction_id": "TXN-001",
      "client_name": "John Doe",
      "transaction_type": "deposit",
      "amount": "€500",
      "balance_after": "€45,230.50",
      "timestamp": "2025-01-15T10:00:00Z"
    }
  ],
  "wallet_trends": {
    "daily_average": "€1,507.68",
    "growth_rate": 12.5
  }
}
```

**Frontend Data Structure:**
```typescript
interface WalletLogs {
  total_wallet_balance: string;
  total_deposits: string;
  total_withdrawals: string;
  transactions: WalletTransaction[];
  wallet_trends: WalletTrends;
}

interface WalletTransaction {
  transaction_id: string;
  client_name: string;
  transaction_type: "deposit" | "withdrawal" | "refund";
  amount: string;
  balance_after: string;
  timestamp: string;
}

interface WalletTrends {
  daily_average: string;
  growth_rate: number;
}
```

#### 7g. Pro-rata Approvals

**Endpoint:** `GET /admin-portal/v1/analytics/pro-rata-approvals/`

**Request:**
```
GET /admin-portal/v1/analytics/pro-rata-approvals/?status=pending
Headers: Authorization: Bearer {token}
Query Params: status (pending|approved|rejected|all)
```

**Response (200 OK):**
```json
{
  "total_requests": 45,
  "pending_approvals": 12,
  "approved": 28,
  "rejected": 5,
  "pending_requests": [
    {
      "request_id": "PRORTA-001",
      "client_name": "John Doe",
      "amount": "€2,500",
      "reason": "Early contract termination",
      "requested_date": "2025-01-10T10:00:00Z",
      "requested_by": "Sarah Admin"
    }
  ]
}
```

**Frontend Data Structure:**
```typescript
interface ProrataApprovals {
  total_requests: number;
  pending_approvals: number;
  approved: number;
  rejected: number;
  pending_requests: ProrataRequest[];
}

interface ProrataRequest {
  request_id: string;
  client_name: string;
  amount: string;
  reason: string;
  requested_date: string;
  requested_by: string;
}
```

#### 7h. Subscriptions

**Endpoint:** `GET /admin-portal/v1/analytics/subscriptions/`

**Request:**
```
GET /admin-portal/v1/analytics/subscriptions/?status=active
Headers: Authorization: Bearer {token}
Query Params: status (active|cancelled|expired|all)
```

**Response (200 OK):**
```json
{
  "total_subscriptions": 156,
  "active_subscriptions": 142,
  "cancelled_subscriptions": 10,
  "expired_subscriptions": 4,
  "mrr": "€45,230",
  "arr": "€542,760",
  "churn_rate": 6.4,
  "subscriptions_by_plan": {
    "starter": 45,
    "professional": 67,
    "enterprise": 30
  },
  "renewal_upcoming": [
    {
      "subscription_id": "SUB-001",
      "client_name": "John Doe",
      "plan": "professional",
      "renewal_date": "2025-02-15",
      "amount": "€299"
    }
  ]
}
```

**Frontend Data Structure:**
```typescript
interface Subscriptions {
  total_subscriptions: number;
  active_subscriptions: number;
  cancelled_subscriptions: number;
  expired_subscriptions: number;
  mrr: string;
  arr: string;
  churn_rate: number;
  subscriptions_by_plan: Record<string, number>;
  renewal_upcoming: UpcomingRenewal[];
}

interface UpcomingRenewal {
  subscription_id: string;
  client_name: string;
  plan: string;
  renewal_date: string;
  amount: string;
}
```

#### 7i. Invoicing

**Endpoint:** `GET /admin-portal/v1/analytics/invoicing/`

**Request:**
```
GET /admin-portal/v1/analytics/invoicing/?status=pending
Headers: Authorization: Bearer {token}
Query Params: status (pending|paid|overdue|all)
```

**Response (200 OK):**
```json
{
  "total_invoices": 234,
  "pending_invoices": 23,
  "paid_invoices": 201,
  "overdue_invoices": 10,
  "total_outstanding": "€12,450.75",
  "total_collected": "€542,230.50",
  "invoices": [
    {
      "invoice_id": "INV-001",
      "client_name": "John Doe",
      "amount": "€5,000",
      "status": "pending",
      "issued_date": "2025-01-10T10:00:00Z",
      "due_date": "2025-02-10T10:00:00Z",
      "days_overdue": 0
    }
  ]
}
```

**Frontend Data Structure:**
```typescript
interface Invoicing {
  total_invoices: number;
  pending_invoices: number;
  paid_invoices: number;
  overdue_invoices: number;
  total_outstanding: string;
  total_collected: string;
  invoices: Invoice[];
}

interface Invoice {
  invoice_id: string;
  client_name: string;
  amount: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  issued_date: string;
  due_date: string;
  days_overdue: number;
}
```

---

## PART 3: RECOMMENDED ACTIONS (Updated from Quick Actions)

**Location:** Dashboard - 3-part opening section

**Spec:** 4 action buttons with RBAC (Role-Based Access Control)

**Current Implementation:**
```typescript
interface RecommendedAction {
  id: string;
  title: string;
  icon: ReactNode;
  description: string;
  action: () => void;
  requiredPermission: string;
}

const recommendedActions = [
  {
    id: "clients",
    title: "Review Active Clients",
    description: "Manage and review all active clients",
    requiredPermission: "can_view_all_clients",
    navigateTo: "/client-management"
  },
  {
    id: "tickets",
    title: "Handle Support Tickets",
    description: "Address pending support tickets",
    requiredPermission: "can_manage_tickets",
    navigateTo: "/tickets"
  },
  {
    id: "meetings",
    title: "Schedule Consultations",
    description: "Manage upcoming consultation meetings",
    requiredPermission: "can_manage_meetings",
    navigateTo: "/schedule-meetings"
  },
  {
    id: "content",
    title: "Manage Content",
    description: "Create and publish new content",
    requiredPermission: "can_create_content",
    navigateTo: "/content-management"
  }
];
```

**Frontend Ready:** ✅ YES - All buttons have RBAC guards and navigation implemented

---

## SUMMARY TABLE

| Section | Status | API Ready | Frontend Ready | Notes |
|---------|--------|-----------|----------------|-------|
| Home/Dashboard | ✅ Complete | ✅ Yes | ✅ Yes | All endpoints integrated |
| Op Dashboard - Notifications | ✅ Complete | ✅ Yes | ✅ Yes | Loading/error states included |
| Op Dashboard - Billing | ✅ Complete | ✅ Yes | ✅ Yes | Stats display ready |
| Op Dashboard - Client Mgmt | ✅ Complete | ✅ Yes | ✅ Yes | Filters, search, engagement history |
| Op Dashboard - Workspaces | ❌ Missing | ❌ No | ✅ Yes | Needs backend endpoint |
| Op Dashboard - Client Meetings | ❌ Missing | ❌ No | ✅ Yes | Needs backend endpoint |
| Consultation Management | ❌ Missing | ❌ No | ⚠️ Partial | Needs 3 endpoints |
| Tickets - Support | ✅ Complete | ✅ Yes | ✅ Yes | Message threads ready |
| Tickets - Client Messages | ❌ Missing | ❌ No | ⚠️ Partial | Needs backend endpoint |
| Tickets - Internal Comms | ❌ Missing | ❌ No | ⚠️ Partial | Needs backend endpoint |
| Tickets - Escalations | ❌ Missing | ❌ No | ⚠️ Partial | Needs backend endpoint |
| Analytics (9 sections) | ❌ Missing | ❌ No | ⚠️ Partial | Needs 9 endpoints |
| Recommended Actions | ✅ Complete | ✅ Yes | ✅ Yes | RBAC implemented |

---

## IMPLEMENTATION PRIORITY

**PHASE 1 (Critical for Launch):**
1. Client Workspaces endpoint
2. Client Meetings endpoint
3. Consultation Management (3 endpoints)

**PHASE 2 (High Priority):**
1. Client Messages endpoint
2. Internal Comms endpoint
3. Escalations endpoint

**PHASE 3 (Analytics):**
1. All 9 Analytics endpoints

---

**Document Version:** 1.0  
**Last Updated:** December 12, 2025  
**Prepared By:** Frontend Development Team
