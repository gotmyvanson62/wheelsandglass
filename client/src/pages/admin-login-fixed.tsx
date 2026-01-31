import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Car } from 'lucide-react';

export default function AdminLoginFixed() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    console.log('🔑 Starting login process...');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      console.log('📡 Login response:', response.status);
      const data = await response.json();
      console.log('📦 Login data:', data);
      
      if (response.ok && data.success) {
        console.log('✅ Login successful');
        setSuccess(true);
        
        // Wait a bit for session to be established, especially on mobile
        setTimeout(() => {
          console.log('✅ Redirecting to dashboard...');
          // Force page reload for mobile compatibility
          window.location.replace('/admin/dashboard');
        }, 1500);
      } else {
        console.log('❌ Login failed:', data.message);
        setError(data.message || 'Invalid password. Please try again.');
      }
    } catch (err) {
      console.error('💥 Login error:', err);
      setError('Connection error. Please try again.');
    } finally {
      // Don't set loading to false immediately on success to show success state
      setTimeout(() => {
        if (!success) {
          setIsLoading(false);
        }
      }, 100);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 force-light">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-green-600 mb-2">Login Successful!</h2>
            <p className="text-gray-600">Taking you to the admin dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 force-light">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
              <Car className="w-10 h-10 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">Express Auto Glass</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Admin Portal Access
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Input
                id="password"
                data-testid="input-password"
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base px-4"
                required
                autoFocus
                autoComplete="current-password"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              data-testid="button-login"
              className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400" 
              disabled={isLoading || !password.trim()}
            >
              {isLoading ? 'Verifying...' : 'Access Admin Portal'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-500">
              Secure access to integration management
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}