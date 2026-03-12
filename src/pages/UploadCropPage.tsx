import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wheat, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cropsService } from '@/services/cropsService';

const COMMON_CROPS = [
  'Maize', 'Cassava', 'Yam', 'Cocoa', 'Plantain', 'Tomato',
  'Pepper', 'Onion', 'Groundnut', 'Rice', 'Sorghum', 'Millet',
  'Cowpea', 'Okra', 'Garden Egg', 'Cabbage', 'Lettuce', 'Pineapple',
];

const GHANA_MARKETS = [
  'Accra - Makola Market', 'Kumasi - Kejetia Market', 'Tamale Central Market',
  'Takoradi Market Circle', 'Cape Coast Market', 'Sunyani Market',
  'Techiman Market', 'Bolgatanga Market', 'Wa Market', 'Ho Market',
  'Koforidua Market', 'Nkawkaw Market', 'Tema Community Market', 'Other',
];

export function UploadCropPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    crop_name: '', quantity: '', location: '', harvest_date: '', expected_price: '',
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    if (!user) return;
    setError('');
    if (!form.crop_name || !form.quantity || !form.location || !form.harvest_date || !form.expected_price) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await cropsService.createCrop(user.id, {
        crop_name: form.crop_name.toLowerCase(),
        quantity: Number(form.quantity),
        location: form.location,
        harvest_date: form.harvest_date,
        expected_price: Number(form.expected_price),
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to upload crop');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="font-display font-bold text-2xl text-blue-900 mb-2">Crop Listed!</h2>
        <p className="text-blue-400 text-sm">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title mb-1">Upload Crop</h1>
        <p className="text-blue-400 text-sm">List your crop for AI demand analysis and market matching</p>
      </div>

      <div className="card space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div>
          <label className="label">Crop Name</label>
          <input
            className="input-field mb-2"
            placeholder="e.g. Maize, Cassava, Tomato..."
            value={form.crop_name}
            onChange={update('crop_name')}
          />
          <div className="flex flex-wrap gap-1.5">
            {COMMON_CROPS.map(crop => (
              <button
                key={crop}
                onClick={() => setForm(prev => ({ ...prev, crop_name: crop }))}
                className={`text-xs px-3 py-1 rounded-full border font-medium transition-all duration-150 ${
                  form.crop_name === crop
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'border-blue-200 text-blue-500 hover:border-blue-400 hover:text-blue-700 bg-white'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Quantity (kg)</label>
            <input type="number" className="input-field" placeholder="500" min="1" value={form.quantity} onChange={update('quantity')} />
          </div>
          <div>
            <label className="label">Expected Price (GHS/kg)</label>
            <input type="number" className="input-field" placeholder="3.50" step="0.01" min="0" value={form.expected_price} onChange={update('expected_price')} />
          </div>
        </div>

        <div>
          <label className="label">Farm Location / Nearest Market</label>
          <select className="input-field" value={form.location} onChange={update('location')}>
            <option value="">Select market...</option>
            {GHANA_MARKETS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="label">Harvest Date</label>
          <input
            type="date"
            className="input-field"
            value={form.harvest_date}
            min={new Date().toISOString().split('T')[0]}
            onChange={update('harvest_date')}
          />
        </div>

        {form.crop_name && form.quantity && form.expected_price && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Wheat className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-display font-bold text-blue-600 uppercase tracking-wider">Listing Preview</span>
            </div>
            <p className="text-sm text-blue-800 font-medium">
              <span className="capitalize">{form.crop_name}</span>
              {' '} — {form.quantity} kg at GHS {form.expected_price}/kg
              {form.location && ` · ${form.location}`}
            </p>
            <p className="text-xs text-blue-400 mt-1">
              Estimated value: GHS {(Number(form.quantity) * Number(form.expected_price)).toLocaleString()}
            </p>
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? <><div className="spinner" /> Uploading...</> : <><Wheat className="w-4 h-4" /> List Crop</>}
        </button>
      </div>
    </div>
  );
}
