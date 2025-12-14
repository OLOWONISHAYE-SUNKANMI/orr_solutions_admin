/**
 * TypeScript Types for ORR Admin Portal API
 * Matches backend data models
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum ClientStage {
  DISCOVER = "discover",
  DIAGNOSE = "diagnose",
  DESIGN = "design",
  DEPLOY = "deploy",
  GROW = "grow",
}

export enum Pillar {
  STRATEGIC = "strategic",
  OPERATIONAL = "operational",
  FINANCIAL = "financial",
  CULTURAL = "cultural",
}

export type TicketStatus = "new" | "processing" | "payment_failed" | "payment_disputed" | "refund_requested" | "refund_processed" | "resolved" | "archived";
export type TicketPriority = "low" | "normal" | "high" | "urgent";
export type TicketSource = "payment_webhook" | "billing_portal" | "subscription_change" | "manual_request" | "client_inquiry";

export enum ContentType {
  FAQ = "faq",
  ARTICLE = "article",
  CHECKLIST = "checklist",
  TEMPLATE = "template",
  GUIDE = "guide",
}

export enum ContentStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum MeetingType {
  DISCOVERY = "discovery",
  FOLLOW_UP = "follow_up",
  CONSULTATION = "consultation",
  REVIEW = "review",
}

export enum MeetingStatus {
  REQUESTED = "requested",
  CONFIRMED = "confirmed",
  DECLINED = "declined",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export type NotificationType = 
  | "ticket_created" 
  | "ticket_assigned" 
  | "meeting_assigned" 
  | "meeting_confirmed" 
  | "client_updated" 
  | "content_published" 
  | "system_alert";

export enum AdminRole {
  SUPER_ADMIN = "super_admin",
  ADMIN = "admin",
  OPERATOR = "operator",
  CONTENT_EDITOR = "content_editor",
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface Client {
  id: number;
  full_name: string;
  email: string;
  username: string;
  company: string;
  role?: string | null;
  stage?: ClientStage | string | null;
  primary_pillar?: Pillar | string | null;
  secondary_pillars?: string[] | null;
  assigned_admin_name?: string | null;
  internal_notes?: string | null;
  is_portal_active: boolean;
  last_activity?: string | null;
  date_joined?: string | null;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
  tickets_count?: number;
  meetings_count?: number;
  documents_count?: number;
}

export interface ClientListItem {
  id: number;
  full_name: string;
  email: string;
  username?: string;
  company: string;
  role?: string | null;
  stage?: ClientStage | string | null;
  primary_pillar?: Pillar | string | null;
  assigned_admin_name?: string | null;
  is_portal_active: boolean;
  last_activity?: string | null;
  created_at: string;
}

export interface Document {
  id: number;
  title: string;
  description: string;
  document: string;
  document_type: string;
  is_visible_to_client: boolean;
  uploaded_by_name: string;
  download_count: number;
  last_accessed: string;
  created_at: string;
  file_size: string;
}

export interface Ticket {
  id: number;
  ticket_id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  source: TicketSource;
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

export interface TicketListItem {
  id: number;
  ticket_id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  source: TicketSource;
  client_name: string;
  client_company: string;
  assigned_to_name: string;
  messages_count: number;
  created_at: string;
  updated_at: string;
}

export interface TicketMessage {
  id: number;
  message: string;
  sender_name: string;
  sender_type: string;
  is_internal: boolean;
  created_at: string;
}

export interface AIConversation {
  id: number;
  session_id: string;
  client_name: string;
  client_email: string;
  client_company: string;
  messages: string;
  summary: string;
  escalated_to_ticket: boolean;
  escalation_reason: string;
  needs_improvement: boolean;
  improvement_notes: string;
  reviewed_by_name: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface AIConversationListItem {
  id: number;
  session_id: string;
  client_name: string;
  client_email: string;
  summary: string;
  escalated_to_ticket: boolean;
  needs_improvement: boolean;
  reviewed_by_name: string;
  created_at: string;
}

export interface Content {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content: string;
  content_type: ContentType;
  status: ContentStatus;
  stage: ClientStage;
  pillars: string;
  attachment: string;
  attachment_url: string;
  attachment_size: string;
  author_name: string;
  published_at: string;
  version: number;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface ContentListItem {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content_type: ContentType;
  status: ContentStatus;
  stage: ClientStage;
  pillars: string;
  author_name: string;
  published_at: string;
  version: number;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface Meeting {
  id: number;
  client_name: string;
  client_email: string;
  client_company: string;
  meeting_type: MeetingType;
  status: MeetingStatus;
  requested_datetime: string;
  confirmed_datetime: string;
  duration_minutes: number;
  agenda: string;
  meeting_notes: string;
  internal_notes: string;
  host_name: string;
  calendar_event_id: string;
  meeting_link: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingListItem {
  id: number;
  client_name: string;
  client_company: string;
  meeting_type: MeetingType;
  status: MeetingStatus;
  requested_datetime: string;
  confirmed_datetime: string;
  duration_minutes: number;
  host_name: string;
  created_at: string;
}

export interface Notification {
  id: number;
  notification_type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_object_info: string;
  related_ticket_info?: string;
  related_meeting_info?: string;
  related_client_info?: string;
}

export interface LoginResponse {
  success: boolean;
  status: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: AdminUser;
  };
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  user_type: string;
  role?: number;
  role_name: string;
  role_display: string;
  department?: string;
  phone?: string;
  is_active?: boolean;
  last_login_ip?: string;
  last_login?: string;
  date_joined?: string;
  created_at?: string;
  updated_at?: string;
  permissions?: {
    can_manage_users: boolean;
    can_view_all_clients: boolean;
    can_edit_clients: boolean;
    can_manage_tickets: boolean;
    can_manage_meetings: boolean;
    can_create_content: boolean;
    can_publish_content: boolean;
    can_view_analytics: boolean;
    can_view_billing: boolean;
    can_manage_settings: boolean;
    can_view_ai_logs: boolean;
  };
}

export interface AdminRoleData {
  id: number;
  name: string;
  description: string;
  users_count: number;
}

export interface AdminRolePermissions {
  id: number;
  name: AdminRole;
  description: string;
  can_manage_users: boolean;
  can_view_all_clients: boolean;
  can_edit_clients: boolean;
  can_manage_tickets: boolean;
  can_manage_meetings: boolean;
  can_create_content: boolean;
  can_publish_content: boolean;
  can_view_analytics: boolean;
  can_view_billing: boolean;
  can_manage_settings: boolean;
  can_view_ai_logs: boolean;
  users_count: number;
}

export interface AuditLog {
  id: number;
  username: string;
  user_full_name: string;
  action: string;
  model_name: string;
  object_id: string;
  description: string;
  ip_address: string;
  user_agent: string;
  timestamp: string;
}

export interface DashboardMetrics {
  active_clients: number;
  pending_tickets: number;
  upcoming_meetings: number;
  system_notifications: number;
  portal_logins: number;
  ai_chat_sessions: number;
  escalation_rate: number;
}

export interface QuickStats {
  today_metrics: Record<string, any>;
  weekly_summary: Record<string, any>;
}

export interface RecentActivity {
  latest_clients: ClientListItem[];
  latest_tickets: TicketListItem[];
  latest_meetings: MeetingListItem[];
}

export interface SearchResult {
  clients?: ClientListItem[];
  tickets?: TicketListItem[];
  meetings?: MeetingListItem[];
  content?: ContentListItem[];
}

export interface QuickSearchSuggestion {
  type: "client" | "ticket" | "meeting" | "content";
  id: number;
  title: string;
  subtitle?: string;
}

// ============================================================================
// BILLING & PAYMENT TYPES
// ============================================================================

export interface BillingHistoryItem {
  id: number;
  reference_id: string;
  transaction_date: string;
  client_name: string;
  client_email: string;
  amount: string;
  status: "pending" | "completed" | "cancelled" | "refunded";
  payment_method: string;
  description?: string;
}

export interface PricingPlan {
  id: number;
  name: string;
  description: string;
  price: string;
  billing_cycle: "monthly" | "yearly" | "one_time";
  features: string[];
  is_active: boolean;
  stripe_price_id?: string;
}

export interface PaymentStats {
  total_revenue: string;
  pending_amount: string;
  completed_transactions: number;
  pending_transactions: number;
}
