import { Wheat, MapPin, Calendar, DollarSign, Package } from 'lucide-react';
import { format } from 'date-fns';
import type { Crop } from '@/types';

interface CropCardProps {
  crop: Crop;
  onDelete?: (id: string) => void;
}

const STATUS_STYLES = {
  available: 'badge-green',
  sold: 'badge-soil',
  expired: 'badge-red',
};

export function CropCard({ crop, onDelete }: CropCardProps) {
  return (
    <div className="card-hover group animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-forest-900/40 border border-forest-700/20 flex items-center justify-center">
            <Wheat className="w-4 h-4 text-forest-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-earth-100 text-sm capitalize">{crop.crop_name}</h3>
            <span className={STATUS_STYLES[crop.status]}>
              {crop.status}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono font-semibold text-savanna-300 text-sm">GHS {crop.expected_price}/kg</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-earth-600">
            <Package className="w-3 h-3" />
            <span className="text-xs">Quantity</span>
          </div>
          <span className="text-xs font-mono font-medium text-earth-300">{crop.quantity} kg</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-earth-600">
            <MapPin className="w-3 h-3" />
            <span className="text-xs">Location</span>
          </div>
          <span className="text-xs font-mono font-medium text-earth-300 truncate">{crop.location}</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1 text-earth-600">
            <Calendar className="w-3 h-3" />
            <span className="text-xs">Harvest</span>
          </div>
          <span className="text-xs font-mono font-medium text-earth-300">
            {format(new Date(crop.harvest_date), 'MMM d, yy')}
          </span>
        </div>
      </div>

      {onDelete && (
        <button
          onClick={() => onDelete(crop.id)}
          className="mt-3 w-full text-xs text-red-600 hover:text-red-400 hover:bg-red-900/10 py-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100"
        >
          Remove listing
        </button>
      )}
    </div>
  );
}
