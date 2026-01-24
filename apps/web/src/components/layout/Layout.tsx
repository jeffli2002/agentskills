import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/50 py-8 mt-12 bg-secondary/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4 mb-2">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:text-foreground">
              Terms of Use
            </Link>
          </div>
          <div className="mb-2">Agent Skills Marketplace</div>
          <div className="text-xs text-muted-foreground/70">
            Not affiliated with or sponsored by Anthropic, PBC.
          </div>
        </div>
      </footer>
    </div>
  );
}
