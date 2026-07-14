import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const companySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(200),
  industry: z.enum([
    'fintech', 'healthtech', 'edtech', 'saas', 'ecommerce',
    'ai', 'blockchain', 'cleantech', 'other',
  ]),
  stage: z.enum([
    'idea', 'pre-seed', 'seed', 'series-a', 'series-b',
    'series-c', 'growth', 'exit',
  ]),
  vision: z.string().max(2000).optional(),
  mission: z.string().max(2000).optional(),
  description: z.string().max(5000).optional(),
  website: z.string().url().optional().or(z.literal('')),
  location: z.string().max(200).optional(),
  teamSize: z.number().int().min(1).max(10000).optional(),
  foundedDate: z.string().optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  deadline: z.string().optional(),
  status: z.enum(['planning', 'in-progress', 'review', 'completed', 'on-hold', 'cancelled']).optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200),
  description: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  deadline: z.string().optional(),
  projectId: z.string().optional(),
  assignee: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done', 'blocked']).optional(),
});

export const documentSchema = z.object({
  title: z.string().min(1, 'Document title is required').max(200),
  content: z.string().max(100000).optional(),
  folder: z.enum([
    'strategy', 'finance', 'legal', 'product',
    'marketing', 'operations', 'hr', 'other',
  ]),
});

export const financeEntrySchema = z.object({
  type: z.enum(['revenue', 'expense', 'investment', 'loan']),
  amount: z.number().positive('Amount must be positive'),
  category: z.enum([
    'salary', 'marketing', 'infrastructure', 'operations',
    'legal', 'sales', 'rd', 'office', 'other',
  ]),
  date: z.string(),
  description: z.string().max(500).optional(),
});

export const competitorSchema = z.object({
  name: z.string().min(1, 'Competitor name is required').max(200),
  industry: z.string().max(200),
  features: z.array(z.string()).optional(),
  pricing: z.string().max(500).optional(),
  strengths: z.array(z.string()).optional(),
  weaknesses: z.array(z.string()).optional(),
  website: z.string().url().optional().or(z.literal('')),
});

export const investorSchema = z.object({
  name: z.string().min(1, 'Investor name is required').max(200),
  firm: z.string().max(200).optional(),
  stage: z.enum([
    'idea', 'pre-seed', 'seed', 'series-a', 'series-b',
    'series-c', 'growth', 'exit',
  ]),
  status: z.enum([
    'prospecting', 'contacted', 'meeting-scheduled',
    'due-diligence', 'term-sheet', 'closed', 'passed',
  ]),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(30).optional(),
  notes: z.string().max(5000).optional(),
});

export const onboardingStepSchema = z.object({
  step: z.number().int().min(1).max(5),
  data: z.record(z.string(), z.unknown()),
});

export const researchQuerySchema = z.object({
  query: z.string().min(1, 'Query is required').max(1000),
  depth: z.enum(['quick', 'standard', 'deep']).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CompanyInput = z.infer<typeof companySchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
export type FinanceEntryInput = z.infer<typeof financeEntrySchema>;
export type CompetitorInput = z.infer<typeof competitorSchema>;
export type InvestorInput = z.infer<typeof investorSchema>;
export type OnboardingStepInput = z.infer<typeof onboardingStepSchema>;
export type ResearchQueryInput = z.infer<typeof researchQuerySchema>;
