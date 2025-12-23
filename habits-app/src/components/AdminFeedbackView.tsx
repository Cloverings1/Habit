import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabase';
import { ChevronLeft, Check } from 'lucide-react';

interface FeedbackEntry {
  id: string;
  user_id: string;
  user_email: string;
  type: 'feedback' | 'bug';
  priority: 'fyi' | 'minor' | 'important' | 'critical';
  message: string;
  app_version: string | null;
  platform: string | null;
  created_at: string;
  resolved_at: string | null;
  internal_notes: string | null;
}

interface AdminFeedbackViewProps {
  onBack: () => void;
}

const PRIORITY_LABELS: Record<string, string> = {
  fyi: 'FYI',
  minor: 'Minor',
  important: 'Important',
  critical: 'Critical',
};

const TYPE_LABELS: Record<string, string> = {
  feedback: 'Feedback',
  bug: 'Bug',
};

export const AdminFeedbackView = ({ onBack }: AdminFeedbackViewProps) => {
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<FeedbackEntry | null>(null);
  const [internalNotes, setInternalNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'feedback' | 'bug'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'fyi' | 'minor' | 'important' | 'critical'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');

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
      if (statusFilter === 'open') {
        query = query.is('resolved_at', null);
      } else if (statusFilter === 'resolved') {
        query = query.not('resolved_at', 'is', null);
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

  const handleMarkResolved = async (entry: FeedbackEntry) => {
    try {
      const newResolvedAt = entry.resolved_at ? null : new Date().toISOString();
      const { error } = await supabase
        .from('user_feedback')
        .update({ resolved_at: newResolvedAt })
        .eq('id', entry.id);

      if (error) throw error;

      setFeedback(prev =>
        prev.map(f => (f.id === entry.id ? { ...f, resolved_at: newResolvedAt } : f))
      );
      if (selectedEntry?.id === entry.id) {
        setSelectedEntry({ ...selectedEntry, resolved_at: newResolvedAt });
      }
    } catch (error) {
      console.error('Failed to update resolved status:', error);
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
        <h1 className="text-display">User Feedback</h1>
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
          <option value="resolved">Resolved</option>
        </select>

        <span className="text-[13px] self-center ml-2" style={{ color: 'var(--text-muted)' }}>
          {feedback.length} {feedback.length === 1 ? 'entry' : 'entries'}
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
            No feedback yet
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
                  opacity: entry.resolved_at ? 0.6 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[11px] px-2 py-0.5 rounded-full"
                        style={{
                          background: entry.type === 'bug' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                          color: entry.type === 'bug' ? '#ef4444' : '#3b82f6',
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
                      {entry.resolved_at && (
                        <span
                          className="text-[11px] px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(34, 197, 94, 0.15)',
                            color: '#22c55e',
                          }}
                        >
                          Resolved
                        </span>
                      )}
                    </div>
                    <p
                      className="text-[14px] line-clamp-2 mb-2"
                      style={{ color: 'var(--text-primary)' }}
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
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full"
                      style={{
                        background: selectedEntry.type === 'bug' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: selectedEntry.type === 'bug' ? '#ef4444' : '#3b82f6',
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

                {/* Message */}
                <div className="mb-6">
                  <p className="text-[15px] leading-relaxed" style={{ color: 'var(--text-primary)' }}>
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

                {/* Actions */}
                <button
                  onClick={() => handleMarkResolved(selectedEntry)}
                  className="w-full py-3 rounded-xl text-[14px] font-medium transition-all flex items-center justify-center gap-2"
                  style={{
                    background: selectedEntry.resolved_at
                      ? 'rgba(255, 255, 255, 0.06)'
                      : 'rgba(34, 197, 94, 0.15)',
                    color: selectedEntry.resolved_at
                      ? 'var(--text-secondary)'
                      : '#22c55e',
                  }}
                >
                  {selectedEntry.resolved_at ? (
                    'Mark as open'
                  ) : (
                    <>
                      <Check size={16} />
                      Mark as resolved
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
