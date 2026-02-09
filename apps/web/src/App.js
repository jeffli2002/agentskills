import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
function NotFoundPage() {
    return (_jsx("div", { className: "min-h-[80vh] flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("h1", { className: "text-6xl font-bold text-muted-foreground mb-4", children: "404" }), _jsx("p", { className: "text-xl text-muted-foreground mb-8", children: "Page Not Found" }), _jsx("a", { href: "/", className: "inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2", children: "Go Home" })] }) }));
}
export default function App() {
    console.log('App rendering, current path:', window.location.pathname);
    return (_jsx(AuthProvider, { children: _jsx(Layout, { children: _jsxs(Switch, { children: [_jsx(Route, { path: "/", component: HomePage }), _jsx(Route, { path: "/skills/:id/openclaw", component: OpenClawExportPage }), _jsx(Route, { path: "/skills/:id", component: SkillDetailPage }), _jsx(Route, { path: "/skills", component: SkillsPage }), _jsx(Route, { path: "/cli", component: CLIPage }), _jsx(Route, { path: "/convert", component: ConvertPage }), _jsx(Route, { path: "/favorites", component: FavoritesPage }), _jsx(Route, { path: "/my-skills", component: MySkillsPage }), _jsx(Route, { path: "/login", component: LoginPage }), _jsx(Route, { path: "/create", component: CreateSkillPage }), _jsx(Route, { path: "/privacy", component: PrivacyPage }), _jsx(Route, { path: "/terms", component: TermsPage }), _jsx(Route, { component: NotFoundPage })] }) }) }));
}
