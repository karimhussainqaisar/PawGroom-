import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Plus, Trash2 } from 'lucide-react';

export const GalleryView: React.FC = () => {
  const { transformations, openModal, deleteTransformation, confirmDelete } = useApp();
  const [filterBreed, setFilterBreed] = useState<string>('all');

  const filteredTransformations = React.useMemo(() => {
    return transformations.filter((t) => {
      if (filterBreed !== 'all' && t.breed !== filterBreed) return false;
      return true;
    });
  }, [transformations, filterBreed]);

  // Unique breeds in gallery
  const breeds = Array.from(new Set(transformations.map((t) => t.breed)));

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="card-box p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-lg text-[#173E39]">
            Grooming Style & Transformation Portfolio
          </h2>
          <p className="text-xs text-[#5C716C]">
            Before and after photos, blade length notes, and scissored head styles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {breeds.length > 0 && (
            <select
              value={filterBreed}
              onChange={(e) => setFilterBreed(e.target.value)}
              className="text-xs bg-white border border-[#D8D3C4] rounded-xl px-3 py-2 font-bold outline-none"
            >
              <option value="all">All Breeds</option>
              {breeds.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => openModal('transformationForm')}
            className="btn-primary text-xs px-4 py-2 rounded-full font-bold shadow-md flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Transformation
          </button>
        </div>
      </div>

      {/* Gallery Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTransformations.map((tr) => (
          <div key={tr.id} className="card-box p-4 space-y-3 flex flex-col justify-between hover:border-[#2E8A81] transition-all">
            <div>
              {/* Pet Info */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display font-bold text-lg text-[#173E39]">{tr.petName}</h3>
                  <span className="text-xs text-[#2E8A81] font-bold">{tr.breed} • Owner: {tr.ownerName}</span>
                </div>
                <span className="text-[10px] bg-[#EAE7DC] text-[#5C716C] px-2 py-0.5 rounded-full font-bold">
                  {tr.date}
                </span>
              </div>

              {/* Photos Comparison */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-extrabold text-[#5C716C] text-center">Before</div>
                  <img
                    src={tr.beforeImg || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80'}
                    alt="Before grooming"
                    className="w-full h-32 object-cover rounded-xl border border-[#D8D3C4]"
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-extrabold text-[#3E9B6E] text-center">After Groom</div>
                  <img
                    src={tr.afterImg || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80'}
                    alt="After grooming"
                    className="w-full h-32 object-cover rounded-xl border border-[#2E8A81]"
                  />
                </div>
              </div>

              {/* Style Cut Notes */}
              <div className="mt-3 bg-[#F1EEE6] p-2.5 rounded-xl text-xs text-[#5C716C]">
                <strong className="text-[#173E39]">Cut & Style: </strong>
                {tr.styleNotes}
              </div>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-[#D8D3C4] flex items-center justify-between text-xs text-[#5C716C]">
              <span>Stylist: <strong className="text-[#173E39]">{tr.groomerName}</strong></span>
              <button
                onClick={() => {
                  confirmDelete({
                    title: 'Delete Transformation Photo',
                    message: `Delete transformation entry for ${tr.petName}?`,
                    confirmLabel: 'Delete Photo',
                    onConfirm: () => deleteTransformation(tr.id),
                  });
                }}
                className="p-1 text-[#5C716C] hover:text-[#C9503A]"
                title="Delete Entry"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
