import { Route, Switch } from 'wouter';

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Agent Skills Marketplace</h1>
        <p className="text-muted-foreground">Coming soon...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route>
        <div className="min-h-screen flex items-center justify-center">
          <h1 className="text-2xl">404 - Page Not Found</h1>
        </div>
      </Route>
    </Switch>
  );
}
