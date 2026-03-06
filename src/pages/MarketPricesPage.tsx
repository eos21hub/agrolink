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
    const result = prices.filter(p =>
      p.crop.toLowerCase().includes(q) || p.market.toLowerCase().includes(q)
    );
    setFiltered(result);
  }, [query, prices]);

  const handleSort = (field: keyof MarketPrice) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
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
          <p className="text-earth-500 text-sm">Live crop prices across Ghana's markets</p>
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
            { label: 'Total Entries', value: prices.length },
            { label: 'Markets Tracked', value: new Set(prices.map(p => p.market)).size },
            { label: 'Crops Tracked', value: new Set(prices.map(p => p.crop)).size },
          ].map(({ label, value }) => (
            <div key={label} className="card text-center">
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-earth-600" />
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
              <tr className="border-b border-forest-900/20">
                {[
                  { field: 'crop' as keyof MarketPrice, label: 'Crop' },
                  { field: 'market' as keyof MarketPrice, label: 'Market' },
                  { field: 'price_per_kg' as keyof MarketPrice, label: 'Price/kg (GHS)' },
                  { field: 'updated_at' as keyof MarketPrice, label: 'Last Updated' },
                ].map(({ field, label }) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className="px-5 py-3.5 text-left text-xs font-display font-semibold text-earth-500 uppercase tracking-wider cursor-pointer hover:text-earth-300 transition-colors"
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
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
                    <div className="spinner mx-auto" />
                  </td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-earth-600 text-sm">
                    {query ? 'No results found' : 'No market price data available'}
                  </td>
                </tr>
              ) : (
                sorted.map((price, i) => (
                  <tr
                    key={price.id}
                    className={`${i !== sorted.length - 1 ? 'border-b border-forest-900/10' : ''} hover:bg-forest-900/10 transition-colors`}
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-earth-200 capitalize">{price.crop}</span>
                    </td>
                    <td className="px-5 py-3.5 text-earth-400">{price.market}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-bold text-savanna-300">GHS {price.price_per_kg}</span>
                    </td>
                    <td className="px-5 py-3.5 text-earth-600 text-xs font-mono">
                      {format(new Date(price.updated_at), 'MMM d, yyyy HH:mm')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {sorted.length > 0 && (
        <p className="text-xs text-earth-700 text-right">
          Showing {sorted.length} of {prices.length} entries
        </p>
      )}
    </div>
  );
}
