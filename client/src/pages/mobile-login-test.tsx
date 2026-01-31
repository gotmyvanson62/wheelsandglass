import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MobileLoginTest() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const testMobileLogin = async () => {
    setLoading(true);
    setStatus('Testing mobile login...');

    try {
      // Step 1: Login
      console.log('📱 Mobile Login Step 1: Attempting login...');
      const loginResponse = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      const loginData = await loginResponse.json();
      console.log('📱 Login response:', loginResponse.status, loginData);
      setStatus(`Login: ${loginResponse.status} - ${JSON.stringify(loginData)}`);

      if (loginResponse.ok && loginData.success) {
        // Step 2: Wait for session to establish
        setStatus(prev => prev + '\n\n⏱️ Waiting 2 seconds for session...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 3: Test authentication
        console.log('📱 Mobile Login Step 2: Testing auth...');
        const authResponse = await fetch('/api/dashboard/stats', {
          credentials: 'include'
        });

        const authData = await authResponse.json();
        console.log('📱 Auth response:', authResponse.status, authData);
        setStatus(prev => prev + `\n\nAuth Check: ${authResponse.status} - ${JSON.stringify(authData)}`);

        if (authResponse.ok) {
          setStatus(prev => prev + '\n\n✅ SUCCESS! Redirecting...');
          setTimeout(() => {
            window.location.replace('/admin/dashboard');
          }, 1000);
        } else {
          setStatus(prev => prev + '\n\n❌ Auth failed after login');
        }
      } else {
        setStatus(prev => prev + '\n\n❌ Login failed');
      }

    } catch (error) {
      console.error('📱 Mobile login error:', error);
      setStatus(prev => prev + `\n\n💥 Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-xl font-bold mb-4 text-center">📱 Mobile Login Test</h1>
        
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="text-base"
          />
          
          <Button 
            onClick={testMobileLogin}
            disabled={loading || !password}
            className="w-full text-base"
          >
            {loading ? 'Testing...' : 'Test Mobile Login'}
          </Button>


          {status && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <pre className="whitespace-pre-wrap">{status}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}