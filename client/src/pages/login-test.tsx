import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginTest() {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testLogin = async () => {
    setIsLoading(true);
    setResult('Testing login...');

    try {
      // Test 1: Login API
      const loginResponse = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const loginData = await loginResponse.json();
      setResult(prev => prev + `\n\nLogin API Response (${loginResponse.status}): ${JSON.stringify(loginData)}`);

      if (loginResponse.ok && loginData.success) {
        // Test 2: Dashboard access after login
        await new Promise(resolve => setTimeout(resolve, 200)); // Wait for session
        
        const dashResponse = await fetch('/api/dashboard/stats', {
          credentials: 'include'
        });

        const dashData = await dashResponse.json();
        setResult(prev => prev + `\n\nDashboard API Response (${dashResponse.status}): ${JSON.stringify(dashData)}`);

        if (dashResponse.ok) {
          setResult(prev => prev + '\n\n✅ LOGIN SUCCESS: Authentication working correctly!');
          
          // Redirect after successful test
          setTimeout(() => {
            window.location.href = '/admin/dashboard';
          }, 1000);
        } else {
          setResult(prev => prev + '\n\n❌ LOGIN FAILED: Dashboard access denied after login');
        }
      } else {
        setResult(prev => prev + '\n\n❌ LOGIN FAILED: Invalid credentials or server error');
      }
    } catch (error) {
      setResult(prev => prev + `\n\n💥 ERROR: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Admin Login - Debug Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label>Password:</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </div>
          
          <Button 
            onClick={testLogin} 
            disabled={isLoading || !password.trim()}
            className="w-full"
          >
            {isLoading ? 'Testing...' : 'Test Login Flow'}
          </Button>

          {result && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}