import { Route, Switch } from 'wouter';
import { AuthProvider } from '@/context/auth';
import { Layout } from '@/components/layout/Layout';
import { HomePage } from '@/pages/HomePage';
import { SkillsPage } from '@/pages/SkillsPage';
import { SkillDetailPage } from '@/pages/SkillDetailPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { LoginPage } from '@/pages/LoginPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';

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
          <Route path="/skills/:id" component={SkillDetailPage} />
          <Route path="/skills" component={SkillsPage} />
          <Route path="/favorites" component={FavoritesPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/terms" component={TermsPage} />
          <Route component={NotFoundPage} />
        </Switch>
      </Layout>
    </AuthProvider>
  );
}
