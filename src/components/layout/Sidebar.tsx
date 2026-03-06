import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Wheat,
  TrendingUp,
  LineChart,
  MessageSquareText,
  LogOut,
  Leaf,
  CloudSun,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/upload-crop', icon: Wheat, label: 'Upload Crop' },
  { to: '/market-prices', icon: TrendingUp, label: 'Market Prices' },
  { to: '/predictions', icon: LineChart, label: 'AI Predictions' },
  { to: '/ai-assistant', icon: MessageSquareText, label: 'AI Assistant' },
];

export function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-forest-900/30 bg-night-900/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="p-6 border-b border-forest-900/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-forest-600/20 border border-forest-600/30 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-forest-400" />
          </div>
          <div>
            <h1 className="font-display font-bold text-earth-100 text-lg leading-none">AgroLink</h1>
            <span className="text-xs font-mono text-forest-500">AI Platform</span>
          </div>
        </div>
      </div>

      {/* Weather quick widget */}
      <div className="mx-4 mt-4 px-3 py-2.5 rounded-lg bg-forest-900/20 border border-forest-800/20">
        <div className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-savanna-400" />
          <span className="text-xs text-earth-400 font-body">Accra, GH</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-body font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-forest-700/20 text-forest-300 border border-forest-600/20'
                  : 'text-earth-500 hover:text-earth-200 hover:bg-forest-900/20'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-forest-400' : 'text-earth-600 group-hover:text-earth-400'}`} />
                {label}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-forest-400" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Sign out */}
      <div className="p-4 border-t border-forest-900/20">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg mb-2">
          <div className="w-8 h-8 rounded-full bg-forest-700/30 border border-forest-600/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-display font-bold text-forest-300">
              {user?.full_name?.charAt(0).toUpperCase() || 'F'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-display font-semibold text-earth-200 truncate">{user?.full_name || 'Farmer'}</p>
            <p className="text-xs text-earth-600 truncate">{user?.region || 'Ghana'}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs text-earth-600 hover:text-red-400 hover:bg-red-900/10 transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
