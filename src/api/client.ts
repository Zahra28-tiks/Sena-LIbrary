import {
  AdminOverviewResponse,
  Book,
  Loan,
  PublicUser,
  ReadingPreferences,
} from '../types/library.ts';

let authToken: string | null = null;
let onUnauthorizedHandler: (() => void) | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorizedHandler = handler;
}

async function apiRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && onUnauthorizedHandler) {
      onUnauthorizedHandler();
    }
    const message = typeof data?.error === 'string' ? data.error : 'Terjadi kendala saat menghubungi server.';
    throw new Error(message);
  }

  return data as T;
}

export async function fetchBooks(params?: {
  q?: string;
  category?: string;
  availability?: string;
  accessibility?: string;
  sort?: string;
}): Promise<Book[]> {
  const search = new URLSearchParams();
  if (params?.q) search.set('q', params.q);
  if (params?.category && params.category !== 'Semua') search.set('category', params.category);
  if (params?.availability && params.availability !== 'all') search.set('availability', params.availability);
  if (params?.accessibility && params.accessibility !== 'Semua') search.set('accessibility', params.accessibility);
  if (params?.sort) search.set('sort', params.sort);

  const query = search.toString();
  const data = await apiRequest<{ books: Book[] }>(`/api/books${query ? `?${query}` : ''}`);
  return data.books;
}

export async function fetchBookById(id: string): Promise<Book> {
  const data = await apiRequest<{ book: Book }>(`/api/books/${encodeURIComponent(id)}`);
  return data.book;
}

export async function recordBookRead(id: string, chapterIndex?: number): Promise<void> {
  await apiRequest(`/api/books/${encodeURIComponent(id)}/read`, {
    method: 'POST',
    body: JSON.stringify(typeof chapterIndex === 'number' ? { chapterIndex } : {}),
  });
}

export async function registerMember(payload: {
  name: string;
  email: string;
  password: string;
  accessibilityPrefs?: Partial<ReadingPreferences>;
}): Promise<{ token: string; user: PublicUser }> {
  const data = await apiRequest<{ token: string; user: PublicUser }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setAuthToken(data.token);
  return data;
}

export async function loginMember(payload: {
  email: string;
  password: string;
}): Promise<{ token: string; user: PublicUser }> {
  const data = await apiRequest<{ token: string; user: PublicUser }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setAuthToken(data.token);
  return data;
}

export async function fetchCurrentSession(): Promise<{ user: PublicUser; loans: Loan[] }> {
  return apiRequest<{ user: PublicUser; loans: Loan[] }>('/api/auth/me');
}

export async function updateReadingPreferences(
  prefs: Partial<ReadingPreferences>
): Promise<{ user: PublicUser }> {
  return apiRequest<{ user: PublicUser }>('/api/auth/preferences', {
    method: 'PATCH',
    body: JSON.stringify(prefs),
  });
}

export async function toggleFavoriteBook(bookId: string): Promise<{ favorites: string[]; added: boolean }> {
  return apiRequest<{ favorites: string[]; added: boolean }>(
    `/api/favorites/${encodeURIComponent(bookId)}`,
    { method: 'POST' }
  );
}

export async function fetchUserLoans(): Promise<Loan[]> {
  const data = await apiRequest<{ loans: Loan[] }>('/api/loans');
  return data.loans;
}

export async function borrowLibraryBook(bookId: string): Promise<{ loan: Loan; book: Book }> {
  return apiRequest<{ loan: Loan; book: Book }>('/api/loans', {
    method: 'POST',
    body: JSON.stringify({ bookId }),
  });
}

export async function renewLibraryLoan(loanId: string): Promise<{ loan: Loan }> {
  return apiRequest<{ loan: Loan }>(`/api/loans/${encodeURIComponent(loanId)}/renew`, {
    method: 'POST',
  });
}

export async function returnLibraryLoan(loanId: string): Promise<{ loan: Loan; book?: Book }> {
  return apiRequest<{ loan: Loan; book?: Book }>(`/api/loans/${encodeURIComponent(loanId)}/return`, {
    method: 'POST',
  });
}

export async function fetchAdminBootstrapStatus(): Promise<{
  envPasscodeConfigured: boolean;
  adminClaimed: boolean;
  needsInitialClaim: boolean;
}> {
  return apiRequest('/api/admin/bootstrap-status');
}

export async function claimInitialAdmin(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<{ token: string; user: PublicUser }> {
  const data = await apiRequest<{ token: string; user: PublicUser }>('/api/admin/claim', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setAuthToken(data.token);
  return data;
}

export async function loginAdminWithPasscode(passcode: string): Promise<{ token: string; user: PublicUser }> {
  const data = await apiRequest<{ token: string; user: PublicUser }>('/api/admin/passcode-login', {
    method: 'POST',
    body: JSON.stringify({ passcode }),
  });
  setAuthToken(data.token);
  return data;
}

export async function fetchAdminOverview(): Promise<AdminOverviewResponse> {
  return apiRequest<AdminOverviewResponse>('/api/admin/overview');
}

export async function createLibraryBook(payload: Partial<Book>): Promise<{ book: Book }> {
  return apiRequest<{ book: Book }>('/api/books', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateLibraryBook(id: string, payload: Partial<Book>): Promise<{ book: Book }> {
  return apiRequest<{ book: Book }>(`/api/books/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteLibraryBook(id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/api/books/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export async function updateMemberStatus(
  id: string,
  payload: { status?: 'active' | 'suspended'; role?: 'member' | 'admin' }
): Promise<{ member: PublicUser }> {
  return apiRequest<{ member: PublicUser }>(`/api/admin/members/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
