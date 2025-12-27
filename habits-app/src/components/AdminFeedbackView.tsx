import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { ChevronLeft, Check } from 'lucide-react';

interface FeedbackEntry {
  id: string;
  user_id: string;
  user_email: string;
  type: 'feedback' | 'bug' | 'feature';
  priority: 'fyi' | 'minor' | 'important' | 'critical';
  title: string | null;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  page: string | null;
  app_version: string | null;
  platform: string | null;
  created_at: string;
  resolved_at: string | null;
  internal_notes: string | null;
}

type TicketStatus = 'open' | 'in_progress' | 'resolved';

const STATUS_CONFIG: Record<TicketStatus, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  in_progress: { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  resolved: { label: 'Resolved', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
};

interface AdminFeedbackViewProps {
  onBack: () => void;
}

const PRIORITY_LABELS: Record<string, string> = {
  fyi: 'FYI',
  minor: 'Minor',
  important: 'Important',
  critical: 'Mission Critical',
};

const TYPE_LABELS: Record<string, string> = {
  feedback: 'Feedback',
  bug: 'Bug',
  feature: 'Feature Request',
};

export const AdminFeedbackView = ({ onBack }: AdminFeedbackViewProps) => {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<FeedbackEntry | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'feedback' | 'bug' | 'feature'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'fyi' | 'minor' | 'important' | 'critical'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TicketStatus>('all');

  const fetchFeedback = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('user_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (typeFilter !== 'all') {
        query = query.eq('type', typeFilter);
      }
      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, priorityFilter, statusFilter]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleStatusChange = async (entry: FeedbackEntry, newStatus: TicketStatus) => {
    try {
      const resolved_at = newStatus === 'resolved' ? new Date().toISOString() : null;
      const { error } = await supabase
        .from('user_feedback')
        .update({ status: newStatus, resolved_at })
        .eq('id', entry.id);

      if (error) throw error;

      setFeedback(prev =>
        prev.map(f => (f.id === entry.id ? { ...f, status: newStatus, resolved_at } : f))
      );
      if (selectedEntry?.id === entry.id) {
        setSelectedEntry({ ...selectedEntry, status: newStatus, resolved_at });
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedEntry) return;

    setSavingNotes(true);
    try {
      const { error } = await supabase
        .from('user_feedback')
        .update({ internal_notes: internalNotes })
        .eq('id', selectedEntry.id);

      if (error) throw error;

      setFeedback(prev =>
        prev.map(f => (f.id === selectedEntry.id ? { ...f, internal_notes: internalNotes } : f))
      );
      setSelectedEntry({ ...selectedEntry, internal_notes: internalNotes });
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setSavingNotes(false);
    }
  };

  const openEntry = (entry: FeedbackEntry) => {
    setSelectedEntry(entry);
    setInternalNotes(entry.internal_notes || '');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'rgba(239, 68, 68, 0.8)';
      case 'important': return 'rgba(251, 191, 36, 0.8)';
      case 'minor': return 'rgba(59, 130, 246, 0.8)';
      default: return 'rgba(156, 163, 175, 0.8)';
    }
  };

  const getTypeBadgeStyle = (type: FeedbackEntry['type']) => {
    switch (type) {
      case 'bug':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' };
      case 'feature':
        return { bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' };
      case 'feedback':
      default:
        return { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' };
    }
  };

  return (
    <div className="main-content">
      {/* Header */}
      <motion.header
        className="mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[14px] mb-4 hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={16} />
          Back to Settings
        </button>
        <p className="text-label mb-3">ADMIN</p>
        <h1 className="text-display">Support Tickets</h1>
      </motion.header>

      {/* Filters */}
      <motion.div
        className="flex flex-wrap gap-3 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
          className="px-3 py-2 rounded-lg text-[13px] outline-none cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-primary)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <option value="all">All Types</option>
          <option value="feedback">Feedback</option>
          <option value="bug">Bug</option>
          <option value="feature">Feature Request</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
          className="px-3 py-2 rounded-lg text-[13px] outline-none cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-primary)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="important">Important</option>
          <option value="minor">Minor</option>
          <option value="fyi">FYI</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="px-3 py-2 rounded-lg text-[13px] outline-none cursor-pointer"
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            color: 'var(--text-primary)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>

        <span className="text-[13px] self-center ml-2" style={{ color: 'var(--text-muted)' }}>
          {feedback.length} {feedback.length === 1 ? 'ticket' : 'tickets'}
        </span>
      </motion.div>

      {/* Feedback List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            Loading...
          </div>
        ) : feedback.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
            No tickets yet
          </div>
        ) : (
          <div className="space-y-3">
            {feedback.map((entry, index) => (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => openEntry(entry)}
                className="w-full p-4 rounded-xl text-left transition-all duration-200 hover:bg-white/8"
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  opacity: entry.status === 'resolved' ? 0.6 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    {entry.title && (
                      <h3 className="text-[15px] font-medium mb-2 line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                        {entry.title}
                      </h3>
                    )}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{
                          background: getTypeBadgeStyle(entry.type).bg,
                          color: getTypeBadgeStyle(entry.type).color,
                        }}
                      >
                        {TYPE_LABELS[entry.type]}
                      </span>
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{
                          background: `${getPriorityColor(entry.priority)}20`,
                          color: getPriorityColor(entry.priority),
                        }}
                      >
                        {PRIORITY_LABELS[entry.priority]}
                      </span>
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{
                          background: STATUS_CONFIG[entry.status || 'open'].bg,
                          color: STATUS_CONFIG[entry.status || 'open'].color,
                        }}
                      >
                        {STATUS_CONFIG[entry.status || 'open'].label}
                      </span>
                      {entry.page && (
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {entry.page}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[13px] line-clamp-2 mb-2"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {entry.message}
                    </p>
                    <div className="flex items-center gap-3 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      <span>{entry.user_email}</span>
                      <span>{formatDate(entry.created_at)}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              onClick={() => setSelectedEntry(null)}
            />

            <motion.div
              className="relative w-full max-w-[480px] max-h-[85vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'rgba(20, 20, 20, 0.95)',
                backdropFilter: 'blur(60px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        background: getTypeBadgeStyle(selectedEntry.type).bg,
                        color: getTypeBadgeStyle(selectedEntry.type).color,
                      }}
                    >
                      {TYPE_LABELS[selectedEntry.type]}
                    </span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        background: `${getPriorityColor(selectedEntry.priority)}20`,
                        color: getPriorityColor(selectedEntry.priority),
                      }}
                    >
                      {PRIORITY_LABELS[selectedEntry.priority]}
                    </span>
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        background: STATUS_CONFIG[selectedEntry.status || 'open'].bg,
                        color: STATUS_CONFIG[selectedEntry.status || 'open'].color,
                      }}
                    >
                      {STATUS_CONFIG[selectedEntry.status || 'open'].label}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Title */}
                {selectedEntry.title && (
                  <h3 className="text-[18px] font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                    {selectedEntry.title}
                  </h3>
                )}

                {/* Message */}
                <div className="mb-6">
                  <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {selectedEntry.message}
                  </p>
                </div>

                {/* Metadata */}
                <div
                  className="p-4 rounded-xl mb-6 space-y-2"
                  style={{ background: 'rgba(255, 255, 255, 0.04)' }}
                >
                  <div className="flex justify-between text-[13px]">
                    <span style={{ color: 'var(--text-muted)' }}>From</span>
                    <span style={{ color: 'var(--text-primary)' }}>{selectedEntry.user_email}</span>
                  </div>
                  {selectedEntry.page && (
                    <div className="flex justify-between text-[13px]">
                      <span style={{ color: 'var(--text-muted)' }}>Page</span>
                      <span style={{ color: 'var(--text-primary)' }}>{selectedEntry.page}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[13px]">
                    <span style={{ color: 'var(--text-muted)' }}>Date</span>
                    <span style={{ color: 'var(--text-primary)' }}>{formatDate(selectedEntry.created_at)}</span>
                  </div>
                  {selectedEntry.platform && (
                    <div className="flex justify-between text-[13px]">
                      <span style={{ color: 'var(--text-muted)' }}>Platform</span>
                      <span style={{ color: 'var(--text-primary)' }}>{selectedEntry.platform}</span>
                    </div>
                  )}
                  {selectedEntry.app_version && (
                    <div className="flex justify-between text-[13px]">
                      <span style={{ color: 'var(--text-muted)' }}>Version</span>
                      <span style={{ color: 'var(--text-primary)' }}>{selectedEntry.app_version}</span>
                    </div>
                  )}
                </div>

                {/* Internal Notes */}
                <div className="mb-6">
                  <label className="text-[12px] uppercase tracking-wide mb-2 block" style={{ color: 'var(--text-muted)' }}>
                    Internal Notes
                  </label>
                  <textarea
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    placeholder="Add notes..."
                    rows={3}
                    className="w-full p-3 rounded-xl text-[14px] resize-none outline-none"
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: 'var(--text-primary)',
                    }}
                  />
                  {internalNotes !== (selectedEntry.internal_notes || '') && (
                    <button
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                      className="mt-2 text-[13px] px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {savingNotes ? 'Saving...' : 'Save notes'}
                    </button>
                  )}
                </div>

                {/* Status Actions */}
                <div className="mb-4">
                  <label className="text-[12px] uppercase tracking-wide mb-3 block" style={{ color: 'var(--text-muted)' }}>
                    Update Status
                  </label>
                  <div className="flex gap-2">
                    {(Object.keys(STATUS_CONFIG) as TicketStatus[]).map((status) => {
                      const config = STATUS_CONFIG[status];
                      const isActive = selectedEntry.status === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(selectedEntry, status)}
                          className="flex-1 py-2.5 rounded-xl text-[13px] font-medium transition-all flex items-center justify-center gap-1.5"
                          style={{
                            background: isActive ? config.bg : 'rgba(255, 255, 255, 0.04)',
                            color: isActive ? config.color : 'var(--text-muted)',
                            border: isActive ? `1px solid ${config.color}40` : '1px solid rgba(255, 255, 255, 0.06)',
                          }}
                        >
                          {status === 'resolved' && isActive && <Check size={14} />}
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
