import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/context/auth';
import { Button } from '@/components/ui/button';

function UserAvatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const [imgError, setImgError] = useState(false);

  // Get initials from name
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (!avatarUrl || imgError) {
    return (
      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
        {initials}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={name}
      className="h-8 w-8 rounded-full"
      onError={() => setImgError(true)}
    />
  );
}

export function Header() {
  const { user, loading, login, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold cursor-pointer hover:opacity-80">
            Agent Skills
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/skills" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
              Browse
            </Link>
            {user && (
              <Link href="/favorites" className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
                Favorites
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {loading ? (
            <div className="h-10 w-20 bg-muted animate-pulse rounded-md" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <UserAvatar name={user.name} avatarUrl={user.avatarUrl} />
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
