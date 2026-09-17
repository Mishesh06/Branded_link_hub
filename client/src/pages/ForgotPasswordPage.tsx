import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link2, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [simulatedToken, setSimulatedToken] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSimulatedToken(null);
    setIsLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      setMessage(res.message);
      if (res.data?.simulatedResetToken) {
        setSimulatedToken(res.data.simulatedResetToken);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-700 text-white">
              <Link2 className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold tracking-tight text-foreground">
              Branded<span className="text-zinc-500">Hub</span>
            </span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Reset your password</h1>
          <p className="text-xs text-muted-foreground">
            Enter your email address and we will generate a recovery simulation token.
          </p>
        </div>

        <Card className="border-border/60 bg-card/80 shadow-lg">
          <CardContent className="pt-6 space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{message}</span>
                </div>
                {simulatedToken && (
                  <div className="pt-2 border-t border-emerald-500/20">
                    <p className="text-[11px] font-mono font-semibold">Simulated Reset Token:</p>
                    <p className="text-[10px] font-mono break-all bg-emerald-950/40 p-1.5 rounded mt-1 select-all">
                      {simulatedToken}
                    </p>
                    <div className="pt-2">
                      <Link
                        to={`/reset-password?token=${simulatedToken}`}
                        className="inline-block text-xs font-semibold underline text-emerald-300 hover:text-white"
                      >
                        Click here to proceed to Reset Form &rarr;
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!simulatedToken && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Email address</label>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <Button type="submit" size="sm" isLoading={isLoading} className="w-full text-xs h-9">
                  Request Password Reset
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
