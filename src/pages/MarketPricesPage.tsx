import { useEffect, useState } from 'react';
import { Search, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { marketService } from '@/services/marketService';
import type { MarketPrice } from '@/types';

export function MarketPricesPage() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [filtered, setFiltered] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortField, setSortField] = useState<keyof MarketPrice>('updated_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const load = () => {
    setLoading(true);
    marketService.getAllPrices()
      .then(data => { setPrices(data); setFiltered(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const q = query.toLowerCase();
    setFiltered(prices.filter(p => p.crop.toLowerCase().includes(q) || p.market.toLowerCase().includes(q)));
  }, [query, prices]);

  const handleSort = (field: keyof MarketPrice) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortField], bv = b[sortField];
    if (av === undefined || bv === undefined) return 0;
    const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortIcon = ({ field }: { field: keyof MarketPrice }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title mb-1">Market Prices</h1>
          <p className="text-blue-400 text-sm">Live crop prices across Ghana's markets</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      {!loading && prices.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Entries',    value: prices.length,                              color: 'text-blue-600' },
            { label: 'Markets Tracked',  value: new Set(prices.map(p => p.market)).size,    color: 'text-emerald-600' },
            { label: 'Crops Tracked',    value: new Set(prices.map(p => p.crop)).size,      color: 'text-amber-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center">
              <div className={`stat-value ${color}`}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-300" />
        <input
          className="input-field pl-9"
          placeholder="Search crop or market..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-blue-100 bg-blue-50">
                {([
                  { field: 'crop'         as keyof MarketPrice, label: 'Crop' },
                  { field: 'market'       as keyof MarketPrice, label: 'Market' },
                  { field: 'price_per_kg' as keyof MarketPrice, label: 'Price/kg (GHS)' },
                  { field: 'updated_at'   as keyof MarketPrice, label: 'Last Updated' },
                ]).map(({ field, label }) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-5 py-3.5 text-left text-xs font-display font-bold text-blue-500 uppercase tracking-wider cursor-pointer hover:text-blue-700 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      {label}
                      <SortIcon field={field} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center"><div className="spinner mx-auto" /></td></tr>
              ) : sorted.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-blue-300 text-sm">{query ? 'No results found' : 'No market price data available'}</td></tr>
              ) : sorted.map((price, i) => (
                <tr key={price.id} className={`${i !== sorted.length - 1 ? 'border-b border-blue-50' : ''} hover:bg-blue-50/70 transition-colors`}>
                  <td className="px-5 py-3.5 font-semibold text-blue-900 capitalize">{price.crop}</td>
                  <td className="px-5 py-3.5 text-blue-500">{price.market}</td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-blue-700">GHS {price.price_per_kg}</span>
                  </td>
                  <td className="px-5 py-3.5 text-blue-400 text-xs font-mono">
                    {format(new Date(price.updated_at), 'MMM d, yyyy HH:mm')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sorted.length > 0 && (
        <p className="text-xs text-blue-300 text-right">
          Showing {sorted.length} of {prices.length} entries
        </p>
      )}
    </div>
  );
}
