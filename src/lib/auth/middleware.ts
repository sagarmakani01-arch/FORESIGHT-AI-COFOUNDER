import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './config';
import { UnauthorizedError, ForbiddenError, NotFoundError } from '../errors';

export async function getSession(request?: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch {
    return null;
  }
}

export async function requireAuth(request?: NextRequest) {
  const session = await getSession(request);
  if (!session?.user) {
    throw new UnauthorizedError('You must be logged in to access this resource');
  }
  return session;
}

export async function requireCompany(request?: NextRequest) {
  const session = await requireAuth(request);
  const companyId = (session.user as Record<string, unknown>).companyId as string | undefined;
  if (!companyId) {
    throw new NotFoundError('Company');
  }
  return { session, companyId };
}

export async function getCompanyId(userId: string): Promise<string | null> {
  return null;
}

export function isApiRoute(pathname: string): boolean {
  return pathname.startsWith('/api/');
}

export function isProtectedRoute(pathname: string): boolean {
  const protectedPrefixes = ['/dashboard', '/api'];
  const publicPaths = ['/login', '/register', '/auth', '/api/auth', '/api/health'];

  if (publicPaths.some((p) => pathname.startsWith(p))) return false;
  return protectedPrefixes.some((p) => pathname.startsWith(p));
}
