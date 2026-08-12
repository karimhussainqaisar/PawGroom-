import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Download, Upload, RotateCcw, Award, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    resetToDemoData, 
    exportDataJSON, 
    importDataJSON, 
    confirmDelete,
    showToast 
  } = useApp();

  const [formData, setFormData] = useState({
    name: settings.name || settings.salonName || 'PawBook Pro Grooming Studio',
    address: settings.address || '100 Bark Avenue, Suite 4, San Francisco, CA 94107',
    phone: settings.phone || '(555) 123-PAWS',
    open: settings.open ?? 8,
    close: settings.close ?? 18,
    slot: settings.slot ?? 30,
    currency: settings.currency || 'USD',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...settings,
      name: formData.name,
      salonName: formData.name,
      address: formData.address,
      phone: formData.phone,
      open: formData.open,
      close: formData.close,
      slot: formData.slot,
      currency: formData.currency,
    });
  };

  const handleDownload = () => {
    const jsonStr = exportDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PawBook_Pro_Backup_${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    showToast('Downloaded JSON backup!', 'success');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) importDataJSON(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Shop Profile Form */}
      <form onSubmit={handleSubmit} className="card-box space-y-4">
        <h2 className="font-display font-bold text-lg text-[#173E39] border-b pb-2">
          Grooming Shop Profile & Operating Hours
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="md:col-span-2">
            <label className="font-bold text-[#173E39]">Shop / Salon Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
              placeholder="e.g., PawBook Pro Grooming Studio"
            />
          </div>

          <div className="md:col-span-2">
            <label className="font-bold text-[#173E39]">Shop Street Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
              placeholder="e.g., 100 Bark Avenue, Suite 4, San Francisco, CA 94107"
            />
          </div>

          <div>
            <label className="font-bold text-[#173E39]">Shop Phone Number</label>
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
              placeholder="e.g., (555) 123-PAWS"
            />
          </div>

          <div>
            <label className="font-bold text-[#173E39]">Appointment Slot Duration</label>
            <select
              value={formData.slot}
              onChange={(e) => setFormData({ ...formData, slot: parseInt(e.target.value) })}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
            >
              <option value={30}>30 Minutes</option>
              <option value={60}>60 Minutes (1 Hour)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-[#173E39]">Daily Opening Hour</label>
            <select
              value={formData.open}
              onChange={(e) => setFormData({ ...formData, open: parseInt(e.target.value) })}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
            >
              <option value={6}>6:00 AM</option>
              <option value={7}>7:00 AM</option>
              <option value={8}>8:00 AM</option>
              <option value={9}>9:00 AM</option>
              <option value={10}>10:00 AM</option>
              <option value={11}>11:00 AM</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-[#173E39]">Daily Closing Hour</label>
            <select
              value={formData.close}
              onChange={(e) => setFormData({ ...formData, close: parseInt(e.target.value) })}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
            >
              <option value={16}>4:00 PM</option>
              <option value={17}>5:00 PM</option>
              <option value={18}>6:00 PM</option>
              <option value={19}>7:00 PM</option>
              <option value={20}>8:00 PM</option>
              <option value={21}>9:00 PM</option>
              <option value={22}>10:00 PM</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-[#173E39]">Currency Symbol</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
              className="w-full mt-1 px-3 py-2 border border-[#D8D3C4] rounded-xl font-medium focus:border-[#2E8A81] outline-none"
            >
              <option value="USD">$ USD (US Dollar)</option>
              <option value="GBP">£ GBP (British Pound)</option>
              <option value="EUR">€ EUR (Euro)</option>
              <option value="CAD">$ CAD (Canadian Dollar)</option>
              <option value="AUD">$ AUD (Australian Dollar)</option>
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button type="submit" className="btn-primary text-xs px-6 py-2.5 rounded-full font-bold shadow-md">
            Save Shop Profile & Settings
          </button>
        </div>
      </form>

      {/* Data Backup & Restore */}
      <div className="card-box space-y-4">
        <h3 className="font-display font-bold text-lg text-[#173E39] border-b pb-2">
          Data Management & Backup
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="btn-teal text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold"
          >
            <Download className="w-4 h-4" /> Backup JSON Data
          </button>

          <label className="btn-ghost text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold cursor-pointer">
            <Upload className="w-4 h-4 text-[#2E8A81]" /> Restore JSON Data
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() => {
              confirmDelete({
                title: 'Reset Demo Dataset',
                message: 'Are you sure you want to reset to the initial PawBook Pro demo dataset? Any custom data added will be restored to defaults.',
                confirmLabel: 'Reset Dataset',
                onConfirm: () => resetToDemoData(),
              });
            }}
            className="btn-ghost text-xs px-4 py-2 rounded-xl text-[#C9503A] border-[#E7C0B5] hover:bg-[#FEF2F2] flex items-center gap-1.5 font-bold"
          >
            <RotateCcw className="w-4 h-4" /> Reset Demo Dataset
          </button>
        </div>
      </div>
    </div>
  );
};
