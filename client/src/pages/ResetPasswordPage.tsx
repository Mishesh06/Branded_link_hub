import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Password reset token is invalid or has expired.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6 animate-page-enter">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700 text-white group-hover:border-zinc-500 transition-colors">
              <Link2 className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              Branded<span className="text-zinc-500 font-normal">Hub</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Set new password</h1>
          <p className="text-xs text-muted-foreground">
            Enter your reset token and your desired new password.
          </p>
        </div>

        <Card className="border-border/60 bg-card/80 shadow-lg">
          <CardContent className="pt-6 space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            {success ? (
              <div className="text-center space-y-3 py-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-semibold text-emerald-400">Password reset successful</h3>
                <p className="text-xs text-muted-foreground">
                  Your password has been changed and all old sessions have been revoked. Redirecting to login...
                </p>
                <Link to="/login" className="inline-block text-xs text-foreground underline pt-2">
                  Click here if not redirected automatically
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Reset Token</label>
                  <Input
                    placeholder="Enter or paste token..."
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">New Password (min 8 chars)</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="text-xs"
                  />
                </div>

                <Button type="submit" size="sm" isLoading={isLoading} className="w-full text-xs h-9">
                  Reset Password &amp; Login
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          <Link to="/login" className="text-foreground inline-flex items-center hover:underline">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
