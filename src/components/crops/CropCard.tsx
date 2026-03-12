import { Wheat, MapPin, Calendar, Package } from 'lucide-react';
import { format } from 'date-fns';
import type { Crop } from '@/types';

interface CropCardProps {
  crop: Crop;
  onDelete?: (id: string) => void;
}

const STATUS_STYLES: Record<string, string> = {
  available: 'badge-green',
  sold:      'badge-soil',
  expired:   'badge-red',
};

export function CropCard({ crop, onDelete }: CropCardProps) {
  return (
    <div className="card-hover group animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
            <Wheat className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-indigo-950 text-sm capitalize">{crop.crop_name}</h3>
            <span className={STATUS_STYLES[crop.status]}>{crop.status}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono font-bold text-indigo-600 text-sm">GHS {crop.expected_price}/kg</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {[
          { icon: Package,  label: 'Quantity', value: `${crop.quantity} kg` },
          { icon: MapPin,   label: 'Location', value: crop.location },
          { icon: Calendar, label: 'Harvest',  value: format(new Date(crop.harvest_date), 'MMM d, yy') },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1 text-slate-400">
              <Icon className="w-3 h-3" />
              <span className="text-xs">{label}</span>
            </div>
            <span className="text-xs font-mono font-semibold text-indigo-900 truncate">{value}</span>
          </div>
        ))}
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(crop.id)}
          className="mt-3 w-full text-xs text-red-400 hover:text-red-600 hover:bg-red-50 py-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          Remove listing
        </button>
      )}
    </div>
  );
}
