/**
 * Admin Dashboard Types
 * Définit tous les types pour le système admin complet
 */

// ===== UTILISATEURS =====
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPPORT = 'support',
  USER = 'user',
  SELLER = 'seller',
  BUSINESS_VEHICLE = 'business_vehicle',
  BUSINESS_INSURANCE = 'business_insurance',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  PENDING_VERIFICATION = 'pending_verification',
  INACTIVE = 'inactive',
}

export interface AdminUser {
  id: string;
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  status: UserStatus;
  lastLogin?: Date;
  lastActivity?: Date;
  activityLog: ActivityLog[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// ===== PERMISSIONS =====
export enum PermissionType {
  // Utilisateurs
  VIEW_USERS = 'view_users',
  MANAGE_USERS = 'manage_users',
  SUSPEND_USERS = 'suspend_users',
  BAN_USERS = 'ban_users',
  VIEW_USER_DETAILS = 'view_user_details',
  EXPORT_USER_DATA = 'export_user_data',

  // Offres
  VIEW_LISTINGS = 'view_listings',
  APPROVE_LISTINGS = 'approve_listings',
  REJECT_LISTINGS = 'reject_listings',
  DELETE_LISTINGS = 'delete_listings',
  FEATURE_LISTINGS = 'feature_listings',

  // Signalements
  VIEW_REPORTS = 'view_reports',
  MANAGE_REPORTS = 'manage_reports',
  CLOSE_REPORTS = 'close_reports',

  // Finances
  VIEW_FINANCES = 'view_finances',
  MANAGE_PAYOUTS = 'manage_payouts',
  VIEW_TRANSACTIONS = 'view_transactions',
  REFUND_TRANSACTIONS = 'refund_transactions',

  // Analytics
  VIEW_ANALYTICS = 'view_analytics',
  VIEW_USER_BEHAVIOR = 'view_user_behavior',
  EXPORT_ANALYTICS = 'export_analytics',

  // Système
  MANAGE_ADMINS = 'manage_admins',
  VIEW_LOGS = 'view_logs',
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_SYSTEM_HEALTH = 'view_system_health',
}

export interface Permission {
  type: PermissionType;
  granted: boolean;
  grantedAt?: Date;
  grantedBy?: string;
  restrictions?: Record<string, any>;
}

// ===== UTILISATEURS (Données Publiques) =====
export interface PublicUser {
  id: string;
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  status: UserStatus;
  isSeller: boolean;
  sellerRating?: number;
  sellerListingsCount: number;
  createdAt: Date;
  lastActivityDate?: Date;
  suspiciousActivity: boolean;
  verificationStatus: 'verified' | 'unverified' | 'rejected';
}

// ===== ACCÈS & CONNEXIONS =====
export interface UserSession {
  userId: string;
  sessionId: string;
  loginTime: Date;
  lastActivityTime: Date;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
  deviceInfo?: {
    browser: string;
    os: string;
    device: string;
  };
  isActive: boolean;
}

// ===== OFFRES / LISTINGS =====
export enum ListingStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DRAFT = 'draft',
  ARCHIVED = 'archived',
  FLAGGED = 'flagged',
  SOLD = 'sold',
  EXPIRED = 'expired',
}

export interface ListingApproval {
  id: string;
  listingId: string;
  userId: string;
  status: ListingStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reason?: string;
  requiredDocuments: Document[];
  comments?: string;
}

export interface Document {
  id: string;
  type: 'registration_document' | 'id_proof' | 'vehicle_inspection' | 'other';
  url: string;
  uploadedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
}

// ===== SIGNALEMENTS =====
export enum ReportStatus {
  OPEN = 'open',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
  ACTION_TAKEN = 'action_taken',
}

export enum ReportType {
  FRAUD = 'fraud',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  SCAM = 'scam',
  FAKE_LISTING = 'fake_listing',
  OFFENSIVE_BEHAVIOR = 'offensive_behavior',
  OTHER = 'other',
}

export interface Report {
  id: string;
  reportedUserId?: string;
  reportedListingId?: string;
  reporterUserId: string;
  type: ReportType;
  status: ReportStatus;
  title: string;
  description: string;
  evidence: string[]; // URLs
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  action?: {
    type: 'suspend' | 'ban' | 'warning' | 'listing_removal' | 'none';
    duration?: number; // en jours
    reason: string;
  };
}

// ===== FINANCES & TRANSACTIONS =====
export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

export enum TransactionType {
  LISTING_FEE = 'listing_fee',
  COMMISSION = 'commission',
  SECURITY_SUBSCRIPTION = 'security_subscription',
  RENTAL_PAYMENT = 'rental_payment',
  SELLER_PAYOUT = 'seller_payout',
  REFUND = 'refund',
  ADJUSTMENT = 'adjustment',
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod?: string;
  paymentGateway?: string;
  reference?: string;
  listingId?: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
  failureReason?: string;
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalCommissions: number;
  totalPayouts: number;
  pendingPayouts: number;
  activeTransactions: number;
  fraudDetected: number;
  refundRate: number;
  averageTransactionValue: number;
  dailyRevenue: Array<{ date: string; amount: number }>;
  byListingType: Record<string, number>;
}

// ===== ANALYTICS & COMPORTEMENT =====
export interface UserBehavior {
  userId: string;
  totalSearches: number;
  averageSessionDuration: number;
  pageViewsCount: number;
  lastPageViewed: string;
  favoriteCategories: string[];
  searchHistory: SearchQuery[];
  browsingHistory: BrowsingEvent[];
  conversionRate: number;
  purchaseHistory: string[]; // listing IDs
  riskScore: number; // 0-100
  suspiciousPatterns: string[];
}

export interface SearchQuery {
  query: string;
  category?: string;
  timestamp: Date;
  resultsCount: number;
  selectedResult?: string;
}

export interface BrowsingEvent {
  listingId: string;
  duration: number; // en secondes
  timestamp: Date;
  action: 'view' | 'favorite' | 'share' | 'contact';
}

export interface Analytics {
  date: string;
  newUsers: number;
  activeUsers: number;
  totalListings: number;
  newListings: number;
  totalTransactions: number;
  totalRevenue: number;
  averageSessionTime: number;
  searchVolume: number;
  conversionRate: number;
  bounceRate: number;
  reportedIssues: number;
  topSearches: Array<{ query: string; count: number }>;
  topCategories: Array<{ category: string; views: number }>;
  deviceStats: {
    mobile: number;
    desktop: number;
    tablet: number;
  };
  referralSources: Record<string, number>;
}

// ===== INTÉGRATIONS EXTERNES =====
export interface ExternalDataSource {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'database' | 'file';
  endpoint?: string;
  credentials?: Record<string, string>;
  lastSync?: Date;
  status: 'active' | 'inactive' | 'error';
  dataTypes: string[];
}

export interface ExternalUserData {
  userId: string;
  source: string;
  creditScore?: number;
  bankruptcyHistory?: boolean;
  fraudHistory?: boolean;
  licenseStatus?: 'valid' | 'suspended' | 'expired';
  vehicleRegistrationStatus?: Record<string, any>;
  thirdPartyRating?: number;
  lastUpdated: Date;
}

// ===== RECHERCHE AVANCÉE =====
export interface SearchFilter {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'range';
  value: any;
}

export interface SearchQuery {
  filters: SearchFilter[];
  sort?: { field: string; direction: 'asc' | 'desc' };
  pagination: { page: number; limit: number };
}

// ===== AUDIT & LOGS =====
export interface AuditLog {
  id: string;
  timestamp: Date;
  adminId: string;
  adminEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: {
    before: Record<string, any>;
    after: Record<string, any>;
  };
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  errorMessage?: string;
}

// ===== DASHBOARD STATS =====
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  onlineUsers: number;
  totalListings: number;
  pendingApprovals: number;
  totalReports: number;
  openReports: number;
  totalRevenue: number;
  pendingTransactions: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    errorRate: number;
    apiLatency: number;
  };
}

// ===== NOTIFICATIONS ADMIN =====
export interface AdminNotification {
  id: string;
  adminId: string;
  type: 'user_report' | 'pending_approval' | 'fraud_detection' | 'system_alert' | 'payment_issue';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}
