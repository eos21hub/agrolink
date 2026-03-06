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
    crop_name: '',
    quantity: '',
    location: '',
    harvest_date: '',
    expected_price: '',
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
        <div className="w-16 h-16 rounded-full bg-forest-900/30 border border-forest-600/30 flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-forest-400" />
        </div>
        <h2 className="font-display font-bold text-2xl text-earth-100 mb-2">Crop Listed!</h2>
        <p className="text-earth-500 text-sm">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title mb-1">Upload Crop</h1>
        <p className="text-earth-500 text-sm">List your crop for AI demand analysis and market matching</p>
      </div>

      <div className="card space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-800/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Crop name with quick select */}
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
                className={`text-xs px-2.5 py-1 rounded-full border transition-all duration-150 ${
                  form.crop_name === crop
                    ? 'bg-forest-700/30 border-forest-500/40 text-forest-300'
                    : 'border-forest-900/30 text-earth-600 hover:text-earth-300 hover:border-forest-700/30'
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
            <input
              type="number"
              className="input-field"
              placeholder="500"
              min="1"
              value={form.quantity}
              onChange={update('quantity')}
            />
          </div>
          <div>
            <label className="label">Expected Price (GHS/kg)</label>
            <input
              type="number"
              className="input-field"
              placeholder="3.50"
              step="0.01"
              min="0"
              value={form.expected_price}
              onChange={update('expected_price')}
            />
          </div>
        </div>

        <div>
          <label className="label">Farm Location / Nearest Market</label>
          <select className="input-field" value={form.location} onChange={update('location')}>
            <option value="" className="bg-night-900">Select market...</option>
            {GHANA_MARKETS.map(m => (
              <option key={m} value={m} className="bg-night-900">{m}</option>
            ))}
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

        {/* Preview */}
        {form.crop_name && form.quantity && form.expected_price && (
          <div className="bg-forest-900/20 rounded-lg p-4 border border-forest-800/20">
            <div className="flex items-center gap-2 mb-2">
              <Wheat className="w-4 h-4 text-forest-400" />
              <span className="text-xs font-display font-semibold text-earth-300 uppercase tracking-wider">Listing Preview</span>
            </div>
            <p className="text-sm text-earth-300">
              <span className="font-semibold text-earth-100 capitalize">{form.crop_name}</span>
              {' '} — {form.quantity} kg at GHS {form.expected_price}/kg
              {form.location && ` · ${form.location}`}
            </p>
            <p className="text-xs text-earth-600 mt-1">
              Estimated value: GHS {(Number(form.quantity) * Number(form.expected_price)).toLocaleString()}
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {loading ? (
            <><div className="spinner" /> Uploading...</>
          ) : (
            <>
              <Wheat className="w-4 h-4" />
              List Crop
            </>
          )}
        </button>
      </div>
    </div>
  );
}
