import { Link } from 'wouter';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, loading, login, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/">
            <a className="text-xl font-bold">Agent Skills</a>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/skills">
              <a className="text-sm text-muted-foreground hover:text-foreground">Browse</a>
            </Link>
            {user && (
              <Link href="/favorites">
                <a className="text-sm text-muted-foreground hover:text-foreground">Favorites</a>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center gap-3">
              {user.avatarUrl && (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full"
                />
              )}
              <span className="text-sm hidden sm:inline">{user.name}</span>
              <Button variant="outline" size="sm" onClick={logout}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button onClick={login}>Sign in with Google</Button>
          )}
        </div>
      </div>
    </header>
  );
}
