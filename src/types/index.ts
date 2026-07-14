export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
};

export type CompanyStage =
  | "idea"
  | "pre-seed"
  | "seed"
  | "series-a"
  | "series-b"
  | "series-c"
  | "growth"
  | "exit";

export type CompanyIndustry =
  | "fintech"
  | "healthtech"
  | "edtech"
  | "saas"
  | "ecommerce"
  | "ai"
  | "blockchain"
  | "cleantech"
  | "other";

export type Company = {
  id: string;
  name: string;
  industry: CompanyIndustry;
  stage: CompanyStage;
  vision: string;
  mission: string;
  description: string;
  foundedDate: string;
  website: string | null;
  logoUrl: string | null;
  teamSize: number;
  location: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type ProjectStatus =
  | "planning"
  | "in-progress"
  | "review"
  | "completed"
  | "on-hold"
  | "cancelled";

export type ProjectPriority = "low" | "medium" | "high" | "urgent";

export type Project = {
  id: string;
  name: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  deadline: string | null;
  description: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskStatus =
  | "todo"
  | "in-progress"
  | "review"
  | "done"
  | "blocked";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  deadline: string | null;
  dependencies: string[];
  projectId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentFolder =
  | "strategy"
  | "finance"
  | "legal"
  | "product"
  | "marketing"
  | "operations"
  | "hr"
  | "other";

export type Document = {
  id: string;
  title: string;
  content: string;
  folder: DocumentFolder;
  companyId: string;
  createdAt: string;
  updatedAt: string;
};

export type MessageRole = "user" | "assistant" | "system";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  reasoningSteps?: ReasoningStep[];
};

export type Competitor = {
  id: string;
  name: string;
  features: string[];
  pricing: string;
  strengths: string[];
  weaknesses: string[];
  industry: string;
  website: string | null;
  lastUpdated: string;
};

export type MilestoneStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "delayed"
  | "cancelled";

export type Milestone = {
  id: string;
  title: string;
  status: MilestoneStatus;
  deadline: string;
  progress: number;
  description: string;
  companyId: string;
};

export type FinanceType = "revenue" | "expense" | "investment" | "loan";

export type FinanceCategory =
  | "salary"
  | "marketing"
  | "infrastructure"
  | "operations"
  | "legal"
  | "sales"
  | "rd"
  | "office"
  | "other";

export type FinanceEntry = {
  id: string;
  type: FinanceType;
  amount: number;
  category: FinanceCategory;
  date: string;
  description: string;
  companyId: string;
};

export type InvestorStatus =
  | "prospecting"
  | "contacted"
  | "meeting-scheduled"
  | "due-diligence"
  | "term-sheet"
  | "closed"
  | "passed";

export type Investor = {
  id: string;
  name: string;
  firm: string;
  stage: CompanyStage;
  status: InvestorStatus;
  lastContact: string;
  notes: string;
  email: string | null;
  phone: string | null;
};

export type RoadmapPhase = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  tasks: string[];
};

export type Roadmap = {
  id: string;
  title: string;
  phases: RoadmapPhase[];
  startDate: string;
  endDate: string;
  companyId: string;
};

export type OnboardingData = {
  companyName: string;
  industry: CompanyIndustry;
  stage: CompanyStage;
  teamSize: number;
  vision: string;
  mission: string;
  description: string;
  website: string;
  location: string;
  foundedDate: string;
  targetMarket: string;
  businessModel: string;
  revenueStreams: string[];
  fundingStatus: string;
  monthlyBurn: number;
  runway: number;
  keyMetrics: string[];
  challenges: string[];
  goals: string[];
};

export type ReasoningStepStatus = "pending" | "active" | "completed" | "error";

export type ReasoningStep = {
  step: number;
  status: ReasoningStepStatus;
  label: string;
};

export type NavigationItem = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
};

export type WidgetSize = "sm" | "md" | "lg" | "full";

export type WidgetType =
  | "metric"
  | "chart"
  | "list"
  | "table"
  | "calendar"
  | "activity"
  | "tasks"
  | "messages";

export type WidgetConfig = {
  id: string;
  title: string;
  type: WidgetType;
  size: WidgetSize;
};

export type TrendDirection = "up" | "down" | "neutral";

export type DashboardMetric = {
  label: string;
  value: string;
  change: number;
  trend: TrendDirection;
};

export type SearchResult = {
  title: string;
  snippet: string;
  url: string;
  score: number;
};
