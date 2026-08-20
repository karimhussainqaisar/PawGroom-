import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  AdminNotification, 
  NotificationType, 
  NotificationPriority, 
  ClientProfile 
} from '../../types/auth';
import { 
  READY_MADE_NOTIFICATION_TEMPLATES, 
  NotificationTemplate 
} from '../../data/permissionPresets';
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
  Power,
  Image as ImageIcon,
  Link,
  Layers,
  ArrowRight,
  BookOpen,
  Filter
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
  const [templateBrowserOpen, setTemplateBrowserOpen] = useState(false);
  const [previewNotification, setPreviewNotification] = useState<AdminNotification | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTarget, setFilterTarget] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [templateCategory, setTemplateCategory] = useState<string>('all');

  // Form State for creating notification
  const [targetType, setTargetType] = useState<'all' | 'specific'>('all');
  const [targetProfileId, setTargetProfileId] = useState<string>('');
  const [type, setType] = useState<NotificationType>('popup');
  const [priority, setPriority] = useState<NotificationPriority>('info');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [actionLabel, setActionLabel] = useState('');
  const [actionUrl, setActionUrl] = useState('');
  const [actionTarget, setActionTarget] = useState<'_blank' | '_self'>('_blank');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preset Image Options for rapid selection
  const imagePresets = [
    { label: 'AI Grooming Assistant', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Special Offer / Discount', url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80' },
    { label: 'Subscription / Billing', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80' },
    { label: 'Holiday Marketing Kit', url: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=800&q=80' },
    { label: 'Mobile & Tablet App', url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80' },
    { label: '1,000 Paws Milestone', url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80' },
    { label: 'Rabies & Medical Alert', url: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&w=800&q=80' },
    { label: 'Masterclass Scissoring', url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80' },
    { label: 'QR Pay & Tap Checkout', url: 'https://images.unsplash.com/photo-1556742049-0a67e557b649?auto=format&fit=crop&w=800&q=80' },
    { label: 'Trial Ending Reminder', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80' },
  ];

  // Apply a full template
  const applyTemplate = (tmpl: NotificationTemplate) => {
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setType(tmpl.type);
    setPriority(tmpl.priority);
    setImageUrl(tmpl.imageUrl || '');
    setActionLabel(tmpl.actionLabel || '');
    setActionUrl(tmpl.actionUrl || '');
    setActionTarget(tmpl.actionTarget || (tmpl.actionUrl?.startsWith('http') ? '_blank' : '_self'));
    setTemplateBrowserOpen(false);
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
    setImageUrl('');
    setActionLabel('');
    setActionUrl('');
    setActionTarget('_blank');
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
        imageUrl: imageUrl.trim() || undefined,
        actionLabel: actionLabel.trim() || undefined,
        actionUrl: actionUrl.trim() || undefined,
        actionTarget: actionTarget || undefined,
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
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-500/20 text-[#FF8833] border border-orange-500/30"><Info className="w-3 h-3" /> INFO</span>;
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

  const filteredTemplates = READY_MADE_NOTIFICATION_TEMPLATES.filter(tmpl => {
    if (templateCategory === 'all') return true;
    return tmpl.category === templateCategory;
  });

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
              Client Push Notifications, Banners & Interactive Pop-ups
            </h2>
          </div>
          <p className="text-xs text-[#A08E8B] max-w-2xl">
            Broadcast responsive banners, interactive pop-ups with custom images and external link buttons to all clients or specific trial/demo accounts in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setTemplateBrowserOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white rounded-2xl text-xs font-bold border border-white/10 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#FF8833]" />
            <span>15 Ready-Made Templates</span>
          </button>

          <button
            onClick={() => handleOpenCreateModal()}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6B00] hover:bg-[#E55C00] text-white rounded-2xl text-xs font-black shadow-lg shadow-[#FF6B00]/30 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Compose Notification</span>
          </button>
        </div>
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

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="p-12 text-center bg-[#1C0908] rounded-3xl border border-white/10">
          <Bell className="w-12 h-12 text-[#A08E8B]/40 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No Push Notifications Found</h3>
          <p className="text-xs text-[#A08E8B] max-w-sm mx-auto mb-4">
            Create your custom pop-up or select from 15 ready-made modern templates.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setTemplateBrowserOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl text-xs font-bold border border-white/10"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#FF8833]" />
              <span>Browse 15 Templates</span>
            </button>
            <button
              onClick={() => handleOpenCreateModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF6B00] text-white rounded-xl text-xs font-bold shadow-md hover:bg-[#E55C00]"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Custom</span>
            </button>
          </div>
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

              <div className="pt-3 flex flex-col sm:flex-row gap-4">
                {notif.imageUrl && (
                  <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0 hidden sm:block">
                    <img 
                      src={notif.imageUrl} 
                      alt={notif.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black text-white font-display mb-1">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-[#C5B7B4] whitespace-pre-line leading-relaxed">
                    {notif.message}
                  </p>

                  {notif.actionLabel && (
                    <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF6B00]/20 text-[#FF6B00] border border-[#FF6B00]/30 rounded-xl text-[11px] font-bold">
                        <Link className="w-3 h-3" />
                        CTA: "{notif.actionLabel}" {notif.actionUrl ? `→ ${notif.actionUrl}` : ''}
                      </span>
                      {notif.actionTarget === '_blank' && (
                        <span className="text-[10px] text-white/50 flex items-center gap-0.5">
                          <ExternalLink className="w-2.5 h-2.5" /> Opens new tab
                        </span>
                      )}
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
            </div>
          ))}
        </div>
      )}

      {/* 15 READY-MADE TEMPLATES BROWSER MODAL */}
      {templateBrowserOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C0908] text-white rounded-3xl border border-white/20 shadow-2xl max-w-4xl w-full p-6 space-y-5 animate-fadeIn my-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#FF6B00] text-white">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-white">
                    15 Ready-Made Modern UI Notification Templates
                  </h3>
                  <p className="text-xs text-[#A08E8B]">
                    Select any pre-designed template to immediately broadcast or customize.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTemplateBrowserOpen(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-[#A08E8B] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
              {['all', 'Feature Release', 'Promotion', 'Alert & Maintenance', 'Tips & Guides', 'Milestone'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    templateCategory === cat
                      ? 'bg-[#FF6B00] text-white'
                      : 'bg-white/5 text-[#A08E8B] hover:text-white border border-white/5'
                  }`}
                >
                  {cat === 'all' ? 'All Templates (15)' : cat}
                </button>
              ))}
            </div>

            {/* Templates Cards Grid */}
            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTemplates.map((tmpl) => (
                <div 
                  key={tmpl.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#FF6B00]/40 flex flex-col justify-between transition-all group"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {getPriorityBadge(tmpl.priority)}
                        <span className="px-2 py-0.5 rounded-md bg-white/10 text-[9px] font-bold uppercase text-white/80">
                          {tmpl.type.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#FF8833] font-bold">{tmpl.category}</span>
                    </div>

                    {tmpl.imageUrl && (
                      <div className="w-full h-28 rounded-xl overflow-hidden border border-white/10">
                        <img 
                          src={tmpl.imageUrl} 
                          alt={tmpl.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    <h4 className="font-bold text-sm text-white font-display">
                      {tmpl.title}
                    </h4>

                    <p className="text-xs text-[#C5B7B4] leading-relaxed line-clamp-3">
                      {tmpl.message}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between gap-2">
                    {tmpl.actionLabel ? (
                      <span className="text-[10px] text-white/60 font-bold truncate">
                        CTA: "{tmpl.actionLabel}"
                      </span>
                    ) : <span />}

                    <button
                      type="button"
                      onClick={() => {
                        applyTemplate(tmpl);
                        setCreateModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 bg-[#FF6B00] hover:bg-[#E55C00] text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1 cursor-pointer transition-all active:scale-95 shrink-0"
                    >
                      <span>Use Template</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CREATE NOTIFICATION MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C0908] text-white rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-fadeIn my-6 max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FF6B00] text-white">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white">
                    Compose Broadcast Notification / Pop-up
                  </h3>
                  <p className="text-[11px] text-[#A08E8B]">
                    Configure rich image, interactive button links, and targeting.
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

            <form onSubmit={handleCreateSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
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
                    <option value="banner" className="bg-[#1C0908]">📌 Top Announcement Banner</option>
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
                    <option value="info" className="bg-[#1C0908]">ℹ️ Information (Standard)</option>
                    <option value="urgent" className="bg-[#1C0908]">🔥 Urgent Announcement (Red)</option>
                    <option value="warning" className="bg-[#1C0908]">⚠️ Warning / Alert (Amber)</option>
                    <option value="promotion" className="bg-[#1C0908]">⭐ Offer / Promo (Purple)</option>
                    <option value="update" className="bg-[#1C0908]">✅ System Feature Update (Green)</option>
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
                  placeholder="e.g., Important Studio Announcement or New Feature"
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
                  rows={3}
                  placeholder="Type the announcement or notice message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
                />
              </div>

              {/* Image URL with Preset Picker */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#FF6B00]" />
                    <span>Notification Image / Visual (Optional)</span>
                  </label>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-[10px] text-red-400 hover:underline"
                    >
                      Clear Image
                    </button>
                  )}
                </div>

                <input
                  type="url"
                  placeholder="Paste image URL (https://...)"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
                />

                {/* Preset image buttons */}
                <div>
                  <span className="text-[10px] text-[#A08E8B] block mb-1">Or choose preset visual asset:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {imagePresets.slice(0, 5).map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setImageUrl(img.url)}
                        className={`px-2 py-1 rounded-lg text-[10px] border transition-all cursor-pointer ${
                          imageUrl === img.url 
                            ? 'bg-[#FF6B00] text-white border-[#FF6B00]' 
                            : 'bg-white/5 text-[#A08E8B] hover:text-white border-white/10'
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                {imageUrl && (
                  <div className="w-full h-24 rounded-xl overflow-hidden border border-white/10 mt-2">
                    <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Clickable Button & Link Options */}
              <div className="p-3 bg-white/5 rounded-2xl border border-white/5 space-y-2.5">
                <label className="text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-[#FF6B00]" />
                  <span>Clickable Action Button & Link (Optional)</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <span className="text-[10px] text-[#A08E8B] block mb-1">Button Label:</span>
                    <input
                      type="text"
                      placeholder="e.g., Claim Offer, Open Calendar, View Guide"
                      value={actionLabel}
                      onChange={(e) => setActionLabel(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-[#A08E8B] block mb-1">Target URL or Screen ID:</span>
                    <input
                      type="text"
                      placeholder="e.g. https://... or calendar, revenue, invoices"
                      value={actionUrl}
                      onChange={(e) => setActionUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-xl text-white placeholder-[#7A6865] focus:border-[#FF6B00] outline-none"
                    />
                  </div>
                </div>

                {actionUrl && (
                  <div className="flex items-center gap-4 pt-1 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer text-white">
                      <input 
                        type="radio" 
                        name="actionTarget" 
                        value="_blank"
                        checked={actionTarget === '_blank'}
                        onChange={() => setActionTarget('_blank')}
                        className="accent-[#FF6B00]"
                      />
                      <span>Open in New Browser Tab (_blank)</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-white">
                      <input 
                        type="radio" 
                        name="actionTarget" 
                        value="_self"
                        checked={actionTarget === '_self'}
                        onChange={() => setActionTarget('_self')}
                        className="accent-[#FF6B00]"
                      />
                      <span>Navigate Inside App Screen (_self)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10 shrink-0">
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-[#FF6B00] hover:bg-[#E55C00] text-white shadow-lg shadow-[#FF6B00]/30 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Publishing...' : 'Broadcast Notification Now'}</span>
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

            {previewNotification.imageUrl && (
              <div className="w-full h-40 rounded-2xl overflow-hidden border border-[#E6DFD5]">
                <img 
                  src={previewNotification.imageUrl} 
                  alt={previewNotification.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="text-center py-2">
              <h3 className="font-display font-black text-lg text-[#240C0B] mb-2">
                {previewNotification.title}
              </h3>
              <p className="text-xs text-[#5C4A47] whitespace-pre-line leading-relaxed px-2 bg-white/70 p-3 rounded-xl border border-[#E6DFD5]">
                {previewNotification.message}
              </p>
            </div>

            <div className="space-y-2 pt-1">
              {previewNotification.actionLabel && (
                <button
                  type="button"
                  onClick={() => {
                    if (previewNotification.actionUrl) {
                      if (previewNotification.actionUrl.startsWith('http')) {
                        window.open(previewNotification.actionUrl, '_blank', 'noopener,noreferrer');
                      }
                    }
                    setPreviewNotification(null);
                  }}
                  className="w-full py-2.5 px-4 bg-[#FF6B00] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{previewNotification.actionLabel}</span>
                  {previewNotification.actionUrl?.startsWith('http') && <ExternalLink className="w-3 h-3" />}
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
