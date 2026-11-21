import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'pulpit' },
  {
    path: 'pulpit',
    title: 'Pulpit',
    loadComponent: () => import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'sprawy',
    title: 'Sprawy',
    loadComponent: () => import('./features/cases/case-list-page').then((m) => m.CaseListPage),
  },
  {
    path: 'sprawy/nowa',
    title: 'Nowa sprawa',
    loadComponent: () => import('./features/cases/case-new-page').then((m) => m.CaseNewPage),
  },
  {
    path: 'sprawy/:caseId',
    title: 'Sprawa',
    loadComponent: () => import('./features/cases/case-detail-page').then((m) => m.CaseDetailPage),
  },
  {
    path: 'sprawy/:caseId/dokumenty/:documentId',
    title: 'Weryfikacja dokumentu',
    loadComponent: () => import('./features/review/document-review-page').then((m) => m.DocumentReviewPage),
  },
  {
    path: 'konfiguracja/typy-dokumentow',
    title: 'Typy dokumentów',
    loadComponent: () =>
      import('./features/config/document-types-page').then((m) => m.DocumentTypesPage),
  },
  {
    path: 'konfiguracja/typy-dokumentow/:code',
    title: 'Typ dokumentu',
    loadComponent: () =>
      import('./features/config/document-type-detail-page').then((m) => m.DocumentTypeDetailPage),
  },
  {
    path: 'konfiguracja/slowniki',
    title: 'Słowniki',
    loadComponent: () => import('./features/config/dictionaries-page').then((m) => m.DictionariesPage),
  },
  {
    path: 'konfiguracja/modele-llm',
    title: 'Modele LLM',
    loadComponent: () => import('./features/config/llm-page').then((m) => m.LlmPage),
  },
  {
    path: 'konfiguracja/profile-docling',
    title: 'Profile Docling',
    loadComponent: () => import('./features/config/docling-profiles-page').then((m) => m.DoclingProfilesPage),
  },
  {
    path: 'konfiguracja/wydania',
    title: 'Wydania konfiguracji',
    loadComponent: () => import('./features/config/releases-page').then((m) => m.ReleasesPage),
  },
  {
    path: 'jakosc',
    title: 'Jakość',
    loadComponent: () => import('./features/quality/quality-page').then((m) => m.QualityPage),
  },
  {
    path: 'audyt',
    title: 'Audyt',
    loadComponent: () => import('./features/audit/audit-page').then((m) => m.AuditPage),
  },
  {
    path: 'deklaracja-dostepnosci',
    title: 'Deklaracja dostępności',
    loadComponent: () =>
      import('./features/accessibility/accessibility-statement-page').then((m) => m.AccessibilityStatementPage),
  },
  {
    path: '**',
    title: 'Nie znaleziono strony',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
