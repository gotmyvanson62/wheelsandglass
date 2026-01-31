import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SimpleLoginDebug() {
  const [password, setPassword] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing...');

    try {
      console.log('🔍 Testing login with password:', password);
      
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ password }),
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📦 Response data:', data);

      setResult(`Status: ${response.status}\nData: ${JSON.stringify(data, null, 2)}`);

      if (response.ok && data.success) {
        setResult(prev => prev + '\n\n✅ SUCCESS! Redirecting...');
        setTimeout(() => {
          window.location.href = '/admin/dashboard';
        }, 1000);
      }

    } catch (error) {
      console.error('💥 Error:', error);
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Simple Login Debug</h1>
        
        <div className="space-y-4">
          <Input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button 
            onClick={testLogin}
            disabled={loading || !password}
            className="w-full"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </Button>


          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre className="text-xs whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}