import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wheat, TrendingUp, LineChart,
  MessageSquareText, LogOut, Leaf, CloudSun,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { to: '/dashboard',    icon: LayoutDashboard,    label: 'Dashboard' },
  { to: '/upload-crop',  icon: Wheat,              label: 'Upload Crop' },
  { to: '/market-prices',icon: TrendingUp,         label: 'Market Prices' },
  { to: '/predictions',  icon: LineChart,          label: 'AI Predictions' },
  { to: '/ai-assistant', icon: MessageSquareText,  label: 'AI Assistant' },
];

export function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-blue-100 bg-white shadow-[2px_0_12px_rgba(59,130,246,0.06)]">
      {/* Logo */}
      <div className="p-6 border-b border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_2px_8px_rgba(37,99,235,0.35)]">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-blue-900 text-lg leading-none">AgroLink</h1>
            <span className="text-xs font-mono text-blue-400 tracking-wider">AI PLATFORM</span>
          </div>
        </div>
      </div>

      {/* Weather strip */}
      <div className="mx-4 mt-4 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-200">
        <div className="flex items-center gap-2">
          <CloudSun className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-amber-700 font-semibold">Accra, GH</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-body font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-[0_2px_8px_rgba(37,99,235,0.30)]'
                  : 'text-blue-700 hover:bg-blue-50 hover:text-blue-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-blue-400 group-hover:text-blue-600'}`} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Sign out */}
      <div className="p-4 border-t border-blue-100">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-1">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-display font-bold text-white">
              {user?.full_name?.charAt(0).toUpperCase() || 'F'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-display font-semibold text-blue-900 truncate">{user?.full_name || 'Farmer'}</p>
            <p className="text-xs text-blue-400 truncate">{user?.region || 'Ghana'}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs text-blue-400 hover:text-red-500 hover:bg-red-50 transition-all duration-150 font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
