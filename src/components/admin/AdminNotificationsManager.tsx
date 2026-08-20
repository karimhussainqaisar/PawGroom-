import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AdminNotification, NotificationType, NotificationPriority, ClientProfile } from '../../types/auth';
import { 
  Bell, 
  Send, 
  Plus, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  MessageSquare, 
  Users, 
  User, 
  Layout, 
  Clock, 
  X, 
  Check, 
  Search, 
  ExternalLink,
  Power
} from 'lucide-react';

export const AdminNotificationsManager: React.FC<{
  onSendSuccess?: (msg: string) => void;
  preselectedProfileId?: string | null;
}> = ({ onSendSuccess, preselectedProfileId }) => {
  const { 
    authDatabase, 
    notifications, 
    createAdminNotification, 
    deleteAdminNotification, 
    toggleNotificationStatus 
  } = useAuth();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [previewNotification, setPreviewNotification] = useState<AdminNotification | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTarget, setFilterTarget] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State for creating notification
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [targetProfileId, setTargetProfileId] = useState<string>('');
  const [type, setType] = useState<NotificationType>('popup');
  const [priority, setPriority] = useState<NotificationPriority>('info');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick preset templates
  const applyTemplate = (tmpl: {
    title: string;
    message: string;
    type: NotificationType;
    priority: NotificationPriority;
    actionLabel?: string;
  }) => {
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setType(tmpl.type);
    setPriority(tmpl.priority);
    setActionLabel(tmpl.actionLabel || '');
  };

  const handleOpenCreateModal = (specificProfileId?: string) => {
    if (specificProfileId) {
      setTargetType('specific');
      setTargetProfileId(specificProfileId);
    } else if (preselectedProfileId) {
      setTargetType('specific');
      setTargetProfileId(preselectedProfileId);
    } else {
      setTargetType('all');
      setTargetProfileId('');
    }
    setTitle('');
    setMessage('');
    setActionLabel('');
    setType('popup');
    setPriority('info');
    setCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      alert('Please provide both a notification title and message.');
      return;
    }

    if (targetType === 'specific' && !targetProfileId) {
      alert('Please select a specific client profile.');
      return;
    }

    setIsSubmitting(true);
    try {
      let targetBusinessName = 'All Client Studios';
      if (targetType === 'specific') {
        const found = authDatabase.profiles.find(p => p.profileId === targetProfileId);
        targetBusinessName = found ? `${found.businessName} (${found.profileId})` : targetProfileId;
      }

      await createAdminNotification({
        targetType,
        targetProfileId: targetType === 'specific' ? targetProfileId : 'all',
        targetBusinessName,
        type,
        priority,
        title: title.trim(),
        message: message.trim(),
        actionLabel: actionLabel.trim() || undefined,
        isActive: true
      });

      setCreateModalOpen(false);
      if (onSendSuccess) {
        onSendSuccess(`Notification successfully broadcasted to ${targetBusinessName}!`);
      }
    } catch (err) {
      console.error('Failed to create notification:', err);
      alert('Failed to send notification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, notifTitle: string) => {
    if (confirm(`Are you sure you want to permanently delete notification "${notifTitle}" from the database?`)) {
      await deleteAdminNotification(id);
      if (onSendSuccess) {
        onSendSuccess('Notification removed from database.');
      }
    }
  };

  const handleToggle = async (id: string) => {
    await toggleNotificationStatus(id);
    if (onSendSuccess) {
      onSendSuccess('Notification visibility status updated.');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchSearch = 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.targetBusinessName && n.targetBusinessName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchType = filterType === 'all' || n.type === filterType;
    const matchTarget = filterTarget === 'all' || n.targetType === filterTarget;

    return matchSearch && matchType && matchTarget;
  });

  const getPriorityBadge = (p: NotificationPriority) => {
    switch (p) {
      case 'urgent':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-500/20 text-red-400 border border-red-500/30"><Flame className="w-3 h-3" /> URGENT</span>;
      case 'warning':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30"><AlertTriangle className="w-3 h-3" /> WARNING</span>;
      case 'promotion':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30"><Sparkles className="w-3 h-3" /> PROMO</span>;
      case 'update':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> UPDATE</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"><Info className="w-3 h-3" /> INFO</span>;
    }
  };

  const getTypeBadge = (t: NotificationType) => {
    switch (t) {
      case 'popup':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30"><Layout className="w-3 h-3" /> Dashboard Pop-up Modal</span>;
      case 'banner':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30"><MessageSquare className="w-3 h-3" /> Top Banner Notice</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><Bell className="w-3 h-3" /> Push Alert & Inbox</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Trigger */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1C0908] via-[#2A100E] to-[#1C0908] border border-[#FF6B00]/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="p-2 rounded-xl bg-[#FF6B00]/20 text-[#FF6B00]">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-black text-white font-display">
              Client Push Notifications & Interactive Pop-ups
            </h2>
          </div>
          <p className="text-xs text-[#A08E8B] max-w-2xl">
            Deliver real-time high-priority modal pop-ups, system announcements, promotional messages, and dashboard alerts directly to client profiles.
          </p>
        </div>

        <button
          onClick={() => handleOpenCreateModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E55C00] text-white rounded-2xl text-xs font-black shadow-lg shadow-[#FF6B00]/30 active:scale-95 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Notification / Pop-up</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1C0908] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#A08E8B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, message or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white outline-none cursor-pointer focus:border-[#FF6B00]"
          >
            <option value="all" className="bg-[#1C0908]">All Formats</option>
            <option value="popup" className="bg-[#1C0908]">Pop-up Modal</option>
            <option value="banner" className="bg-[#1C0908]">Top Banner</option>
            <option value="push" className="bg-[#1C0908]">Push / Inbox</option>
          </select>

          <select
            value={filterTarget}
            onChange={(e) => setFilterTarget(e.target.value)}
            className="px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white outline-none cursor-pointer focus:border-[#FF6B00]"
          >
            <option value="all" className="bg-[#1C0908]">All Targets</option>
            <option value="all" className="bg-[#1C0908]">Global Broadcasts</option>
            <option value="specific" className="bg-[#1C0908]">Specific Clients</option>
          </select>
        </div>
      </div>

      {/* Notifications Grid / List */}
      {filteredNotifications.length === 0 ? (
        <div className="p-12 text-center bg-[#1C0908] rounded-3xl border border-white/10">
          <Bell className="w-12 h-12 text-[#A08E8B]/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Push Notifications Found</h3>
          <p className="text-xs text-[#A08E8B] max-w-sm mx-auto mb-4">
            Create and broadcast your first custom pop-up or push message to all client studios or targeted accounts.
          </p>
          <button
            onClick={() => handleOpenCreateModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer hover:bg-[#E55C00]"
          >
            <Plus className="w-4 h-4" />
            <span>Send First Notification</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {filteredNotifications.map((notif) => (
            <div 
              key={notif.id}
              className={`p-5 rounded-2xl border transition-all ${
                notif.isActive 
                  ? 'bg-[#1C0908] border-white/10 hover:border-white/20' 
                  : 'bg-[#140606] border-white/5 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 flex-wrap">
                  {getPriorityBadge(notif.priority)}
                  {getTypeBadge(notif.type)}

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-white/10 text-white">
                    {notif.targetType === 'all' ? (
                      <>
                        <Users className="w-3 h-3 text-[#2E8A81]" />
                        <span>All Clients (Global Broadcast)</span>
                      </>
                    ) : (
                      <>
                        <User className="w-3 h-3 text-[#FF6B00]" />
                        <span>Target: <strong className="text-[#FF6B00]">{notif.targetBusinessName || notif.targetProfileId}</strong></span>
                      </>
                    )}
                  </span>

                  <span className="text-[10px] text-[#A08E8B] flex items-center gap-1 ml-auto md:ml-0">
                    <Clock className="w-3 h-3" />
                    {new Date(notif.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Status & Control Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setPreviewNotification(notif)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-xs text-white font-medium transition-colors cursor-pointer"
                    title="Preview as Client"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#4ECDC4]" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleToggle(notif.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      notif.isActive 
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                        : 'bg-white/10 text-[#A08E8B] hover:bg-white/20'
                    }`}
                    title={notif.isActive ? "Deactivate Notification" : "Activate Notification"}
                  >
                    <Power className="w-3 h-3" />
                    <span>{notif.isActive ? 'Active' : 'Disabled'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(notif.id, notif.title)}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                    title="Delete permanently from database"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-3">
                <h4 className="text-sm font-black text-white font-display mb-1">
                  {notif.title}
                </h4>
                <p className="text-xs text-[#C5B7B4] whitespace-pre-line leading-relaxed">
                  {notif.message}
                </p>

                {notif.actionLabel && (
                  <div className="mt-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 rounded-xl text-[11px] font-bold">
                      Button CTA: "{notif.actionLabel}"
                    </span>
                  </div>
                )}

                <div className="mt-3 flex items-center gap-4 text-[10px] text-[#A08E8B]">
                  <span>Delivered via Live Firestore</span>
                  <span>•</span>
                  <span>Dismissed by: {Array.isArray(notif.dismissedBy) ? notif.dismissedBy.length : 0} clients</span>
                  <span>•</span>
                  <span>Read by: {Array.isArray(notif.readBy) ? notif.readBy.length : 0} clients</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE NOTIFICATION MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C0908] text-white rounded-3xl border border-white/20 shadow-2xl max-w-xl w-full p-6 space-y-5 animate-fadeIn my-8">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FF6B00] text-white">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white">
                    Compose Push Notification / Pop-up
                  </h3>
                  <p className="text-[11px] text-[#A08E8B]">
                    Broadcast live messages and alerts to client dashboards in real time.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#A08E8B] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Templates Selector */}
            <div>
              <label className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider block mb-1.5">
                Quick Preset Templates
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => applyTemplate({
                    title: '⚡ System Performance Upgrade',
                    message: 'We have updated our real-time synchronization engine. You can now experience faster booking and real-time inventory management.',
                    type: 'popup',
                    priority: 'update',
                    actionLabel: 'Got It'
                  })}
                  className="p-2 text-left bg-white/5 hover:bg-white/10 rounded-xl text-[11px] border border-white/5 transition-colors cursor-pointer"
                >
                  <p className="font-bold text-white">System Upgrade</p>
                  <p className="text-[9px] text-[#A08E8B]">Modal Pop-up</p>
                </button>

                <button
                  type="button"
                  onClick={() => applyTemplate({
                    title: '⭐ Special Exclusive Feature Release',
                    message: 'Your studio now has access to enhanced client loyalty points and automated invoice PDF generation. Check your settings tab to configure.',
                    type: 'popup',
                    priority: 'promotion',
                    actionLabel: 'View Features'
                  })}
                  className="p-2 text-left bg-white/5 hover:bg-white/10 rounded-xl text-[11px] border border-white/5 transition-colors cursor-pointer"
                >
                  <p className="font-bold text-white">Feature Release</p>
                  <p className="text-[9px] text-[#A08E8B]">Promo Pop-up</p>
                </button>

                <button
                  type="button"
                  onClick={() => applyTemplate({
                    title: '⚠️ Scheduled Maintenance Notice',
                    message: 'Our cloud servers will undergo brief scheduled routine maintenance on Sunday at 02:00 UTC. No data loss will occur.',
                    type: 'banner',
                    priority: 'warning'
                  })}
                  className="p-2 text-left bg-white/5 hover:bg-white/10 rounded-xl text-[11px] border border-white/5 transition-colors cursor-pointer"
                >
                  <p className="font-bold text-white">Maintenance</p>
                  <p className="text-[9px] text-[#A08E8B]">Top Banner</p>
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Target Audience */}
              <div>
                <label className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider block mb-1.5">
                  Target Recipient
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setTargetType('all')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      targetType === 'all' 
                        ? 'bg-[#FF6B00] text-white border-[#FF6B00]' 
                        : 'bg-white/5 text-[#A08E8B] border-white/10 hover:text-white'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>All Clients (Broadcast)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetType('specific')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      targetType === 'specific' 
                        ? 'bg-[#FF6B00] text-white border-[#FF6B00]' 
                        : 'bg-white/5 text-[#A08E8B] border-white/10 hover:text-white'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>Specific Client Profile</span>
                  </button>
                </div>

                {targetType === 'specific' && (
                  <select
                    value={targetProfileId}
                    onChange={(e) => setTargetProfileId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-[#FF6B00]/40 rounded-xl text-white outline-none focus:border-[#FF6B00]"
                  >
                    <option value="" className="bg-[#1C0908]">-- Select Client Profile --</option>
                    {authDatabase.profiles.map(p => (
                      <option key={p.profileId} value={p.profileId} className="bg-[#1C0908]">
                        {p.businessName} ({p.profileId}) - {p.ownerName} [{p.status.toUpperCase()}]
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Delivery Format & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider block mb-1.5">
                    Delivery Format
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as NotificationType)}
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#FF6B00]"
                  >
                    <option value="popup" className="bg-[#1C0908]">🚨 Dashboard Pop-up Modal</option>
                    <option value="banner" className="bg-[#1C0908]">📌 Top Notice Banner</option>
                    <option value="push" className="bg-[#1C0908]">📣 Push Notice & Inbox</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider block mb-1.5">
                    Priority / Tone
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as NotificationPriority)}
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-[#FF6B00]"
                  >
                    <option value="info" className="bg-[#1C0908]">ℹ️ Information (Blue)</option>
                    <option value="urgent" className="bg-[#1C0908]">🔥 Urgent Notice (Red)</option>
                    <option value="warning" className="bg-[#1C0908]">⚠️ Warning / Alert (Orange)</option>
                    <option value="promotion" className="bg-[#1C0908]">⭐ Offer / Promo (Purple)</option>
                    <option value="update" className="bg-[#1C0908]">✅ System Update (Green)</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider block mb-1.5">
                  Notification Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Important Account Notice or Special Update"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
                />
              </div>

              {/* Message */}
              <div>
                <label className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider block mb-1.5">
                  Notification Message Content *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type the announcement or notice here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
                />
              </div>

              {/* Optional CTA Button Label */}
              <div>
                <label className="text-[11px] font-bold text-[#A08E8B] uppercase tracking-wider block mb-1.5">
                  Action Button Label (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., View Settings, Upgrade Plan, Got It"
                  value={actionLabel}
                  onChange={(e) => setActionLabel(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
                />
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#A08E8B] hover:text-white bg-white/5 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black bg-[#FF6B00] hover:bg-[#E55C00] text-white shadow-lg shadow-[#FF6B00]/30 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Pushing to Clients...' : 'Send Notification Now'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewNotification && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] text-[#240C0B] rounded-3xl border border-black/10 shadow-2xl max-w-md w-full p-6 space-y-4 animate-fadeIn relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6DFD5]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FF6B00]/15 text-[#FF6B00]">
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#A08E8B]">
                  Client Pop-up Preview Mode
                </span>
              </div>
              <button
                onClick={() => setPreviewNotification(null)}
                className="p-1.5 rounded-full bg-[#E6DFD5]/50 hover:bg-[#E6DFD5] text-[#240C0B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center py-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#FF6B00]/30">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="font-display font-black text-lg text-[#240C0B] mb-2">
                {previewNotification.title}
              </h3>
              <p className="text-xs text-[#7A6865] whitespace-pre-line leading-relaxed px-2">
                {previewNotification.message}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {previewNotification.actionLabel && (
                <button
                  type="button"
                  onClick={() => setPreviewNotification(null)}
                  className="w-full py-2.5 px-4 bg-[#FF6B00] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  {previewNotification.actionLabel}
                </button>
              )}
              <button
                type="button"
                onClick={() => setPreviewNotification(null)}
                className="w-full py-2 px-4 bg-[#E6DFD5]/60 hover:bg-[#E6DFD5] text-[#240C0B] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
