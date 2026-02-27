// ============ User & Roles ============
export type UserRole = 'labour' | 'contractor' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'suspended' | 'revoked';
export type SkillType = 'skilled' | 'unskilled';

export interface AppUser {
    uid: string;
    mobile: string;
    role: UserRole;
    status: UserStatus;
    displayName: string;
    photoURL?: string;
    createdAt: number;
    updatedAt: number;
}

// ============ Labour Profile ============
export interface LabourProfile {
    uid: string;
    userId: string;
    displayName: string;
    skillType: SkillType;
    skills: string[];
    ratePerDay: number;
    aadhaarVerified: boolean;
    location: GeoLocation;
    state: string;
    city: string;
    labourId?: string; // LAB-YYYY-XXXX
    qrCodeUrl?: string;
    idCardUrl?: string;
    reliabilityScore: number;
    totalProjectsCompleted: number;
    totalNoShows: number;
    status: UserStatus;
    createdAt: number;
    updatedAt: number;
}

// ============ Contractor Profile ============
export interface ContractorProfile {
    uid: string;
    userId: string;
    displayName: string;
    companyName: string;
    gstNumber?: string;
    location: GeoLocation;
    state: string;
    city: string;
    status: UserStatus;
    createdAt: number;
    updatedAt: number;
}

// ============ Projects ============
export type ProjectStatus = 'active' | 'completed' | 'cancelled' | 'draft';

export interface Project {
    id: string;
    contractorId: string;
    contractorName: string;
    siteName: string;
    description: string;
    location: GeoLocation;
    state: string;
    city: string;
    address: string;
    skillRequired: SkillType;
    skillsNeeded: string[];
    totalLabourNeeded: number;
    assignedLabourCount: number;
    salary: number;
    travelProvided: boolean;
    boardingPoint?: string;
    advancePolicy: string;
    status: ProjectStatus;
    startDate: number;
    endDate?: number;
    createdAt: number;
    updatedAt: number;
}

// ============ Project Application ============
export type ApplicationStatus = 'applied' | 'shortlisted' | 'video_verified' | 'offer_sent' | 'accepted' | 'ticket_issued' | 'boarding_confirmed' | 'rejected' | 'no_show';

export interface ProjectApplication {
    id: string;
    projectId: string;
    labourId: string;
    labourName: string;
    labourSkillType: SkillType;
    reliabilityScore: number;
    status: ApplicationStatus;
    appliedAt: number;
    updatedAt: number;
}

// ============ Attendance ============
export type AttendanceStatus = 'present' | 'absent' | 'half_day';

export interface AttendanceRecord {
    id: string;
    labourId: string;
    labourName: string;
    projectId: string;
    projectName: string;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    markedBy: string;
    earnings: number;
    createdAt: number;
}

// ============ Daily Work Photo ============
export interface DailyWorkPhoto {
    id: string;
    labourId: string;
    projectId?: string;
    photoUrl: string;
    description: string;
    gps: GeoLocation;
    timestamp: number;
    createdAt: number;
}

// ============ Commission ============
export type CommissionType = 'project' | 'monthly_labour';

export interface CommissionRecord {
    id: string;
    projectId: string;
    contractorId: string;
    labourId?: string;
    amount: number;
    type: CommissionType;
    month?: string; // YYYY-MM
    createdAt: number;
}

// ============ Travel ============
export type TravelStatus = 'booked' | 'travel_started' | 'completed' | 'no_show' | 'cancelled';

export interface TravelBooking {
    id: string;
    labourId: string;
    projectId: string;
    boardingPoint: string;
    ticketNumber?: string;
    ticketPdfUrl?: string;
    travelDate: number;
    status: TravelStatus;
    createdAt: number;
    updatedAt: number;
}

export interface VideoVerificationLog {
    id: string;
    labourId: string;
    projectId: string;
    verifiedBy: string;
    location: string;
    availabilityDate: number;
    consentGiven: boolean;
    confirmedJoiningDate: number;
    createdAt: number;
}

export interface BoardingQRLog {
    id: string;
    labourId: string;
    projectId: string;
    location: GeoLocation;
    photoUrl: string;
    scannedBy: string;
    timestamp: number;
}

// ============ Reliability ============
export interface ReliabilityScore {
    labourId: string;
    score: number;
    totalProjects: number;
    completedProjects: number;
    noShowCount: number;
    completionRate: number;
    attendanceRate: number;
    updatedAt: number;
}

export interface NoShowRecord {
    id: string;
    labourId: string;
    projectId: string;
    reason?: string;
    createdAt: number;
}

// ============ QR Verification ============
export interface QRVerificationLog {
    id: string;
    labourId: string;
    scannedBy: string;
    scannedLocation: GeoLocation;
    scanTime: number;
    result: 'active' | 'suspended' | 'revoked';
}

// ============ Common ============
export interface GeoLocation {
    latitude: number;
    longitude: number;
}

// ============ Dashboard Stats ============
export interface LabourStats {
    totalEarnings: number;
    monthlyEarnings: number;
    attendanceRate: number;
    reliabilityScore: number;
    projectsCompleted: number;
    activeProject?: string;
}

export interface ContractorStats {
    activeProjects: number;
    totalLabour: number;
    dailyCost: number;
    monthlySpend: number;
    pendingApplicants: number;
}

export interface AdminStats {
    totalLabour: number;
    totalContractors: number;
    activeProjects: number;
    pendingApprovals: number;
    monthlyRevenue: number;
    totalCommission: number;
}
