"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  User,
  Company,
  Message,
  Task,
  Document,
  Project,
  Competitor,
  Milestone,
  FinanceEntry,
  Investor,
  Roadmap,
  DashboardMetric,
  NavigationItem,
  SearchResult,
  OnboardingData,
} from "@/types";
import {
  users as defaultUsers,
  company as defaultCompany,
  projects as defaultProjects,
  tasks as defaultTasks,
  documents as defaultDocuments,
  messages as defaultMessages,
  competitors as defaultCompetitors,
  milestones as defaultMilestones,
  financeEntries as defaultFinanceEntries,
  investors as defaultInvestors,
  roadmaps as defaultRoadmaps,
  dashboardMetrics as defaultDashboardMetrics,
  navigationItems as defaultNavigationItems,
  onboardingData as defaultOnboardingData,
} from "@/lib/data";
import { generateId } from "@/lib/utils";

type AppContextType = {
  user: User | null;
  company: Company | null;
  currentPage: string;
  sidebarOpen: boolean;
  theme: "dark" | "light";
  messages: Message[];
  tasks: Task[];
  documents: Document[];
  projects: Project[];
  competitors: Competitor[];
  milestones: Milestone[];
  financeEntries: FinanceEntry[];
  investors: Investor[];
  roadmaps: Roadmap[];
  dashboardMetrics: DashboardMetric[];
  navigationItems: NavigationItem[];
  onboardingData: OnboardingData;
  searchQuery: string;
  searchResults: SearchResult[];
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
  setCurrentPage: (page: string) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "dark" | "light") => void;
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addDocument: (document: Omit<Document, "id" | "createdAt" | "updatedAt">) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  addProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addFinanceEntry: (entry: Omit<FinanceEntry, "id">) => void;
  updateInvestor: (id: string, updates: Partial<Investor>) => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(defaultUsers[0]);
  const [company, setCompanyState] = useState<Company | null>(defaultCompany);
  const [currentPage, setCurrentPage] = useState("/");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [messages, setMessages] = useState<Message[]>(defaultMessages);
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [documents, setDocuments] = useState<Document[]>(defaultDocuments);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [competitors] = useState<Competitor[]>(defaultCompetitors);
  const [milestones] = useState<Milestone[]>(defaultMilestones);
  const [financeEntries, setFinanceEntries] = useState<FinanceEntry[]>(defaultFinanceEntries);
  const [investors, setInvestors] = useState<Investor[]>(defaultInvestors);
  const [roadmaps] = useState<Roadmap[]>(defaultRoadmaps);
  const [dashboardMetrics] = useState<DashboardMetric[]>(defaultDashboardMetrics);
  const [navigationItems] = useState<NavigationItem[]>(defaultNavigationItems);
  const [onboardingData] = useState<OnboardingData>(defaultOnboardingData);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  const setUser = useCallback((u: User | null) => setUserState(u), []);
  const setCompany = useCallback((c: Company | null) => setCompanyState(c), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((p) => !p), []);

  const addMessage = useCallback((message: Omit<Message, "id" | "timestamp">) => {
    const newMessage: Message = {
      ...message,
      id: generateId(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newTask: Task = { ...task, id: generateId(), createdAt: now, updatedAt: now };
    setTasks((prev) => [...prev, newTask]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addDocument = useCallback((doc: Omit<Document, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newDoc: Document = { ...doc, id: generateId(), createdAt: now, updatedAt: now };
    setDocuments((prev) => [...prev, newDoc]);
  }, []);

  const updateDocument = useCallback((id: string, updates: Partial<Document>) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d))
    );
  }, []);

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const addProject = useCallback((project: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const now = new Date().toISOString();
    const newProject: Project = { ...project, id: generateId(), createdAt: now, updatedAt: now };
    setProjects((prev) => [...prev, newProject]);
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addFinanceEntry = useCallback((entry: Omit<FinanceEntry, "id">) => {
    const newEntry: FinanceEntry = { ...entry, id: generateId() };
    setFinanceEntries((prev) => [...prev, newEntry]);
  }, []);

  const updateInvestor = useCallback((id: string, updates: Partial<Investor>) => {
    setInvestors((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }, []);

  const value = useMemo<AppContextType>(
    () => ({
      user,
      company,
      currentPage,
      sidebarOpen,
      theme,
      messages,
      tasks,
      documents,
      projects,
      competitors,
      milestones,
      financeEntries,
      investors,
      roadmaps,
      dashboardMetrics,
      navigationItems,
      onboardingData,
      searchQuery,
      searchResults,
      setUser,
      setCompany,
      setCurrentPage,
      toggleSidebar,
      setSidebarOpen,
      setTheme,
      addMessage,
      addTask,
      updateTask,
      deleteTask,
      addDocument,
      updateDocument,
      deleteDocument,
      addProject,
      updateProject,
      deleteProject,
      addFinanceEntry,
      updateInvestor,
      setSearchQuery,
      setSearchResults,
    }),
    [
      user,
      company,
      currentPage,
      sidebarOpen,
      theme,
      messages,
      tasks,
      documents,
      projects,
      competitors,
      milestones,
      financeEntries,
      investors,
      roadmaps,
      dashboardMetrics,
      navigationItems,
      onboardingData,
      searchQuery,
      searchResults,
      setUser,
      setCompany,
      setCurrentPage,
      toggleSidebar,
      setSidebarOpen,
      setTheme,
      addMessage,
      addTask,
      updateTask,
      deleteTask,
      addDocument,
      updateDocument,
      deleteDocument,
      addProject,
      updateProject,
      deleteProject,
      addFinanceEntry,
      updateInvestor,
      setSearchQuery,
      setSearchResults,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
