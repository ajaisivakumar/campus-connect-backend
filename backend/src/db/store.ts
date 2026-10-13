export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'STUDENT' | 'FACULTY' | 'ADMIN' | 'MODERATOR';
  avatarUrl?: string;
  department?: string;
  batch?: string;
  isEmailVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  createdAt: string;
}

export interface PollRecord {
  id: string;
  question: string;
  description?: string;
  options: { id: string; text: string; voteCount: number }[];
  totalVotes: number;
  userVotes?: Record<string, string>; // userId -> optionId
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  expiresAt: string;
  createdAt: string;
}

export interface EventRecord {
  id: string;
  title: string;
  description: string;
  category: 'TECHNICAL' | 'CULTURAL' | 'SPORTS' | 'WORKSHOP' | 'SEMINAR' | 'HACKATHON';
  eventDate: string;
  venue: string;
  registrationLink?: string;
  brochureUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'CANCELLED';
  organizerName?: string;
  moderatorNotes?: string;
  createdAt: string;
}

export interface OpportunityRecord {
  id: string;
  title: string;
  description: string;
  category: 'HACKATHON' | 'RESEARCH' | 'STARTUP' | 'COURSE_PROJECT' | 'OTHER';
  requiredSkills: string[];
  teamSize: number;
  contactPreference: 'in_app' | 'email';
  creatorAlias: string;
  creatorId?: string;
  status: 'OPEN' | 'FILLED' | 'CLOSED';
  createdAt: string;
}

export interface MessageRecord {
  id: string;
  opportunityId: string;
  senderId: string;
  senderName: string;
  senderAlias: string;
  recipientId: string;
  message: string;
  createdAt: string;
}

export interface LostFoundRecord {
  id: string;
  title: string;
  type: 'LOST' | 'FOUND';
  category: string;
  location: string;
  date: string;
  description: string;
  imageUrl?: string;
  contactInfo?: string;
  isSensitive: boolean;
  status: 'OPEN' | 'CLAIMED' | 'RETURNED' | 'RESOLVED' | 'HIDDEN';
  createdAt: string;
}

export interface ComplaintRecord {
  id: string;
  referenceId: string;
  floor: string;
  lab: string;
  systemNumber: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  adminNotes?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface SavedCGPARecord {
  id: string;
  userId: string;
  semesterNumber: number;
  gpa: number;
  totalCredits: number;
  courses: any[];
  createdAt: string;
}

export interface LeaderboardRecord {
  id: string;
  userId?: string;
  rank: number;
  displayName: string;
  alias?: string;
  isAnonymous: boolean;
  cgpa: number;
  milestone: string;
  department: string;
  batch: string;
  verified: boolean;
}

export interface NotificationRecord {
  id: string;
  userId: string;
  type: 'POLL' | 'EVENT' | 'PARTNER' | 'LOSTFOUND' | 'COMPLAINT' | 'SYSTEM';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLogRecord {
  id: string;
  action: string;
  actorEmail: string;
  actorRole: string;
  targetType: string;
  targetId?: string;
  details?: string;
  createdAt: string;
}

class Store {
  users: UserRecord[] = [
    {
      id: 'usr-1',
      name: 'Alex Johnson',
      email: 'alex.cs23@campus.edu',
      password: 'password123',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      department: 'Computer Science & Engineering',
      batch: '2023-2027',
      isEmailVerified: true,
      status: 'ACTIVE',
      createdAt: '2023-09-01T10:00:00Z',
    },
    {
      id: 'usr-2',
      name: 'Campus Admin',
      email: 'admin@campus.edu',
      password: 'password123',
      role: 'ADMIN',
      avatarUrl: '',
      department: 'Administration',
      isEmailVerified: true,
      status: 'ACTIVE',
      createdAt: '2022-01-01T00:00:00Z',
    },
    {
      id: 'usr-3',
      name: 'Dr. Ramesh Kumar',
      email: 'ramesh.hod@campus.edu',
      password: 'password123',
      role: 'FACULTY',
      department: 'Computer Science',
      isEmailVerified: true,
      status: 'ACTIVE',
      createdAt: '2022-06-15T09:00:00Z',
    },
    {
      id: 'usr-4',
      name: 'Vikram Seth',
      email: 'vikram.mech@campus.edu',
      password: 'password123',
      role: 'STUDENT',
      department: 'Mechanical',
      batch: '2022-2026',
      isEmailVerified: true,
      status: 'SUSPENDED',
      createdAt: '2023-08-11T12:00:00Z',
    },
  ];

  polls: PollRecord[] = [
    {
      id: 'poll-1',
      question: 'Should semester mid-terms be held online or pen-and-paper?',
      description: 'Academic Council discussion regarding next month assessment mode.',
      status: 'ACTIVE',
      totalVotes: 342,
      userVotes: {},
      options: [
        { id: 'opt-1', text: 'Online via College Portal', voteCount: 215 },
        { id: 'opt-2', text: 'Traditional Pen & Paper', voteCount: 89 },
        { id: 'opt-3', text: 'Hybrid (Theory paper + Online MCQ)', voteCount: 38 },
      ],
      expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'poll-2',
      question: 'Preferred start timing for college sports festival?',
      description: 'Vote for tournament schedule to minimize clash with labs.',
      status: 'ACTIVE',
      totalVotes: 184,
      userVotes: {},
      options: [
        { id: 'opt-4', text: 'Early Morning (6:30 AM - 8:30 AM)', voteCount: 92 },
        { id: 'opt-5', text: 'Post-college (4:30 PM - 7:00 PM)', voteCount: 77 },
        { id: 'opt-6', text: 'Weekends only (Saturday & Sunday)', voteCount: 15 },
      ],
      expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  events: EventRecord[] = [
    {
      id: 'evt-1',
      title: 'HackNova 2026: 36-Hour National Hackathon',
      description: 'Build real-world solutions in AI, FinTech, and Smart Campus systems. ₹2,00,000 in cash prizes.',
      category: 'HACKATHON',
      eventDate: '2026-11-15T09:00:00Z',
      venue: 'Campus Innovation Center, Auditorium A',
      registrationLink: 'https://hacknova.dev/register',
      brochureUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600',
      status: 'PUBLISHED',
      organizerName: 'CSE Department & IEEE Branch',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'evt-2',
      title: 'Hands-on Generative AI & LLM Systems Workshop',
      description: 'Learn fine-tuning open-source LLMs and RAG architectures.',
      category: 'WORKSHOP',
      eventDate: '2026-10-24T14:00:00Z',
      venue: 'Turing Computing Lab 3',
      registrationLink: 'https://campus.edu/workshops/genai',
      brochureUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600',
      status: 'PUBLISHED',
      organizerName: 'AI Club',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  opportunities: OpportunityRecord[] = [
    {
      id: 'opp-1',
      title: 'Smart India Hackathon: Need Backend & ML Engineer',
      description: 'Automated satellite imagery flood detection model with FastAPI and PyTorch.',
      category: 'HACKATHON',
      requiredSkills: ['Python', 'PyTorch', 'FastAPI', 'Docker'],
      teamSize: 4,
      contactPreference: 'in_app',
      creatorAlias: 'NeuralKnight#402',
      status: 'OPEN',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  messages: MessageRecord[] = [
    {
      id: 'msg-1',
      opportunityId: 'opp-1',
      senderId: 'usr-1',
      senderName: 'Alex Johnson',
      senderAlias: 'You',
      recipientId: 'NeuralKnight#402',
      message: 'Hey, I have worked with PyTorch and deployed FastAPI models. Would love to join!',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ];

  lostFound: LostFoundRecord[] = [
    {
      id: 'lf-1',
      title: 'Blue Hydro Flask Water Bottle (with stickers)',
      type: 'FOUND',
      category: 'Bottles & Containers',
      location: 'Central Library, 2nd floor reading hall table 14',
      date: '2026-10-12',
      description: 'Found around 5 PM near the corner window. Has NASA stickers.',
      imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
      contactInfo: 'Submitted to Library Front Desk security',
      isSensitive: false,
      status: 'OPEN',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ];

  complaints: ComplaintRecord[] = [
    {
      id: 'cmp-1',
      referenceId: 'LAB-2026-8819',
      floor: '2nd Floor',
      lab: 'Turing Lab 2',
      systemNumber: 'SYS-14',
      description: 'Monitor keeps flickering and CPU fan is making loud grinding noise.',
      status: 'IN_PROGRESS',
      adminNotes: 'Hardware team assigned ticket #HW-441',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  savedCgpa: SavedCGPARecord[] = [
    {
      id: 'sem-1',
      userId: 'usr-1',
      semesterNumber: 1,
      gpa: 8.84,
      totalCredits: 22,
      courses: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sem-2',
      userId: 'usr-1',
      semesterNumber: 2,
      gpa: 8.65,
      totalCredits: 23,
      courses: [],
      createdAt: new Date().toISOString(),
    },
  ];

  leaderboard: LeaderboardRecord[] = [
    { id: 'lb-1', rank: 1, displayName: 'Siddharth R.', alias: 'CodeMonk#1', isAnonymous: false, cgpa: 9.88, milestone: 'Sem 1-4', department: 'Computer Science', batch: '2023-2027', verified: true },
    { id: 'lb-2', rank: 2, displayName: 'Pooja Sundaram', alias: 'AlgoAce#9', isAnonymous: false, cgpa: 9.81, milestone: 'Sem 1-4', department: 'Information Technology', batch: '2023-2027', verified: true },
    { id: 'lb-3', rank: 3, displayName: 'Anonymous Scholar', alias: 'CyberPhantom#77', isAnonymous: true, cgpa: 9.74, milestone: 'Sem 1-4', department: 'Computer Science', batch: '2023-2027', verified: true },
    { id: 'lb-6', userId: 'usr-1', rank: 6, displayName: 'Alex Johnson', alias: 'Alex#23', isAnonymous: false, cgpa: 8.80, milestone: 'Sem 1-4', department: 'Computer Science', batch: '2023-2027', verified: true },
  ];

  notifications: NotificationRecord[] = [
    {
      id: 'notif-1',
      userId: 'usr-1',
      type: 'POLL',
      title: 'New Hot Poll Active',
      message: 'Vote on semester mid-terms mode before polls close.',
      read: false,
      link: '/poll-wars',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];

  auditLogs: AuditLogRecord[] = [
    {
      id: 'log-1',
      action: 'USER_ROLE_UPDATED',
      actorEmail: 'admin@campus.edu',
      actorRole: 'ADMIN',
      targetType: 'USER',
      targetId: 'usr-3',
      details: 'Promoted to Faculty Reviewer',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];
}

export const db = new Store();
