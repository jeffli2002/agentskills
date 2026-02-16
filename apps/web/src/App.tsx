import { Route, Switch } from 'wouter';
import { AuthProvider } from '@/context/auth';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { SkillsPage } from '@/pages/SkillsPage';
import { SkillDetailPage } from '@/pages/SkillDetailPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { MySkillsPage } from '@/pages/MySkillsPage';
import { LoginPage } from '@/pages/LoginPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { CreateSkillPage } from '@/pages/CreateSkillPage';
import { OpenClawExportPage } from '@/pages/OpenClawExportPage';
import { CLIPage } from '@/pages/CLIPage';
import { ConvertPage } from '@/pages/ConvertPage';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminSkillsPage } from '@/pages/admin/AdminSkillsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { DocsPage } from '@/pages/DocsPage';
import { WhatAreAgentSkillsPage } from '@/pages/docs/WhatAreAgentSkillsPage';

function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-muted-foreground mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-8">Page Not Found</p>
        <a
          href="/"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

export default function App() {
  console.log('App rendering, current path:', window.location.pathname);

  return (
    <AuthProvider>
      <Layout>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/skills/:id/openclaw" component={OpenClawExportPage} />
          <Route path="/skills/:id" component={SkillDetailPage} />
          <Route path="/skills" component={SkillsPage} />
          <Route path="/cli" component={CLIPage} />
          <Route path="/convert" component={ConvertPage} />
          <Route path="/favorites" component={FavoritesPage} />
          <Route path="/my-skills" component={MySkillsPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/create" component={CreateSkillPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/terms" component={TermsPage} />
          {/* Admin routes (no layout) */}
          <Route path="/admin/login" component={AdminLoginPage} />
          <Route path="/admin/dashboard" component={AdminDashboardPage} />
          <Route path="/admin/skills" component={AdminSkillsPage} />
          <Route path="/admin/users" component={AdminUsersPage} />
          <Route path="/docs" component={DocsPage} />
          <Route path="/docs/what-are-agent-skills" component={WhatAreAgentSkillsPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </Layout>
    </AuthProvider>
  );
}
