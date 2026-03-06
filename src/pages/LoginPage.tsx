import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Leaf, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const GHANA_REGIONS = [
  'Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central',
  'Volta', 'Northern', 'Upper East', 'Upper West', 'Brong-Ahafo',
  'Oti', 'Ahafo', 'Bono East', 'North East', 'Savannah', 'Western North',
];

export function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: '', password: '', full_name: '', phone: '', region: 'Greater Accra',
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(form.email, form.password);
      } else {
        if (!form.full_name.trim()) throw new Error('Full name is required');
        await signUp({
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          phone: form.phone || undefined,
          region: form.region,
        });
      }
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-night-900 flex overflow-hidden">
      {/* Left panel — decorative */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-forest-900/40 via-night-900 to-soil-900/20 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #2da82d 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-forest-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-earth-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '-3s' }} />

        <div className="relative z-10 flex flex-col justify-center px-16 max-w-lg">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-forest-600/20 border border-forest-500/30 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-forest-400" />
            </div>
            <div>
              <div className="font-display font-bold text-2xl text-earth-50">AgroLink AI</div>
              <div className="text-xs font-mono text-forest-500 tracking-wider">SMART FARMING PLATFORM</div>
            </div>
          </div>

          <h2 className="font-display font-bold text-4xl text-earth-50 leading-tight mb-4">
            Grow smarter.<br />
            <span className="text-gradient">Sell better.</span>
          </h2>
          <p className="text-earth-500 text-base leading-relaxed mb-10">
            AI-powered demand predictions, real-time market prices, and weather insights — built for African farmers.
          </p>

          <div className="space-y-4">
            {[
              { icon: '📊', text: 'AI demand predictions for your crops' },
              { icon: '💹', text: 'Live market prices across Ghana' },
              { icon: '🌦️', text: 'Weather-based farming advice' },
              { icon: '🤖', text: 'AI assistant for farming questions' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 opacity-0 animate-slide-up" style={{ animationDelay: `${i * 100 + 200}ms`, animationFillMode: 'forwards' }}>
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm text-earth-400">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-[420px] flex flex-col justify-center p-8 lg:p-12 bg-night-900/95">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <Leaf className="w-5 h-5 text-forest-400" />
          <span className="font-display font-bold text-earth-100">AgroLink AI</span>
        </div>

        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl text-earth-50 mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-earth-500">
            {mode === 'signin' ? 'Sign in to your farming dashboard' : 'Join the smart farming network'}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex rounded-lg bg-forest-900/20 border border-forest-800/20 p-1 mb-6">
          {(['signin', 'signup'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className={`flex-1 py-2 rounded-md text-sm font-display font-semibold transition-all duration-200 ${
                mode === m
                  ? 'bg-forest-600/30 text-forest-200 shadow-sm'
                  : 'text-earth-500 hover:text-earth-300'
              }`}
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-900/20 border border-red-800/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="label">Full Name</label>
              <input
                className="input-field"
                placeholder="Kwame Asante"
                value={form.full_name}
                onChange={update('full_name')}
              />
            </div>
          )}

          <div>
            <label className="label">Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="farmer@example.com"
              value={form.email}
              onChange={update('email')}
            />
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-field pr-10"
                placeholder="••••••••"
                value={form.password}
                onChange={update('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-earth-600 hover:text-earth-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <>
              <div>
                <label className="label">Phone (Optional)</label>
                <input
                  className="input-field"
                  placeholder="+233 XX XXX XXXX"
                  value={form.phone}
                  onChange={update('phone')}
                />
              </div>
              <div>
                <label className="label">Region</label>
                <select className="input-field" value={form.region} onChange={update('region')}>
                  {GHANA_REGIONS.map(r => (
                    <option key={r} value={r} className="bg-night-900">{r}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2 py-3"
          >
            {loading ? (
              <><div className="spinner" /> Processing...</>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </div>

        <p className="text-center text-xs text-earth-600 mt-6">
          By continuing, you agree to AgroLink's terms of service.
        </p>
      </div>
    </div>
  );
}
