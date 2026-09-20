import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link2, ArrowRight } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await signup(name, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6 animate-page-enter">
        {/* Brand */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700 text-white group-hover:border-zinc-500 transition-colors">
              <Link2 className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              Branded<span className="text-zinc-500 font-normal">Hub</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Create an account</h1>
          <p className="text-xs text-muted-foreground">
            Start managing branded short links and your custom bio hub
          </p>
        </div>

        {/* Card */}
        <Card className="border-border/60 bg-card/80 shadow-lg">
          <form onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-4">
              {error && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Full Name</label>
                <Input
                  placeholder="e.g. Alex Engineer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Password (min 8 chars)</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="text-xs"
                />
              </div>

              <Button type="submit" size="sm" isLoading={isLoading} className="w-full text-xs h-9">
                Create Account
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </form>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-foreground font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
