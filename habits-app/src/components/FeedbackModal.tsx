import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
}

type FeedbackType = 'feedback' | 'bug';
type PriorityLevel = 'fyi' | 'minor' | 'important' | 'critical';

const TYPES: { value: FeedbackType; label: string }[] = [
  { value: 'feedback', label: 'Feedback' },
  { value: 'bug', label: 'Bug / Issue' },
];

const PRIORITIES: { value: PriorityLevel; label: string; description: string; color: string }[] = [
  { value: 'fyi', label: 'FYI', description: 'just sharing', color: '#6366f1' },
  { value: 'minor', label: 'Minor', description: 'small issue or suggestion', color: '#3b82f6' },
  { value: 'important', label: 'Important', description: 'affects usability', color: '#f97316' },
  { value: 'critical', label: 'Mission Critical', description: 'Jonas gets instant Slack notification. Est. resolution: 1 hour.', color: '#ef4444' },
];

export const FeedbackModal = ({ isOpen, onClose, currentPage = 'unknown' }: FeedbackModalProps) => {
  const { user } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [type, setType] = useState<FeedbackType | null>(null);
  const [priority, setPriority] = useState<PriorityLevel | null>(null);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    // Reset state on close
    setTimeout(() => {
      setStep(1);
      setType(null);
      setPriority(null);
      setTitle('');
      setMessage('');
      setSubmitted(false);
    }, 300);
    onClose();
  };

  const handleTypeSelect = (selectedType: FeedbackType) => {
    setType(selectedType);
    setStep(2);
  };

  const handlePrioritySelect = (selectedPriority: PriorityLevel) => {
    setPriority(selectedPriority);
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!user || !type || !priority || !title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('user_feedback').insert({
        user_id: user.id,
        user_email: user.email,
        type,
        priority,
        title: title.trim(),
        message: message.trim(),
        status: 'open',
        page: currentPage,
        platform: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        app_version: '1.0.0',
      });

      if (error) throw error;

      setSubmitted(true);
      setTimeout(handleClose, 1500);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = title.trim().length > 0 && message.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-[380px] overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(20, 20, 20, 0.85)',
              backdropFilter: 'blur(60px) saturate(150%)',
              WebkitBackdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 24px 80px -12px rgba(0, 0, 0, 0.6), 0 0 1px rgba(255,255,255,0.1) inset',
            }}
          >
            <div className="p-8">
              {/* Success State */}
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-4"
                >
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                    style={{ background: 'rgba(34, 197, 94, 0.15)' }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                  <p className="text-[16px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                    Ticket Submitted
                  </p>
                  <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                    We'll get back to you soon
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <motion.h2
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[18px] font-medium tracking-tight"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {step === 1 && 'New Ticket'}
                      {step === 2 && 'Set Priority'}
                      {step === 3 && 'Ticket Details'}
                    </motion.h2>
                    <button
                      onClick={handleClose}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Step 1: Type Selection */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-3"
                    >
                      {TYPES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => handleTypeSelect(t.value)}
                          className="w-full p-4 rounded-xl text-left transition-all duration-200 hover:bg-white/8"
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                          }}
                        >
                          <span className="text-[15px]" style={{ color: 'var(--text-primary)' }}>
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}

                  {/* Step 2: Priority Selection */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="space-y-3"
                    >
                      {PRIORITIES.map((p) => (
                        <button
                          key={p.value}
                          onClick={() => handlePrioritySelect(p.value)}
                          className="w-full p-4 rounded-xl text-left transition-all duration-200 hover:scale-[1.02]"
                          style={{
                            background: `linear-gradient(135deg, ${p.color}15 0%, ${p.color}08 100%)`,
                            border: `1px solid ${p.color}30`,
                            borderLeft: `3px solid ${p.color}`,
                          }}
                        >
                          <span className="text-[15px] block font-medium" style={{ color: p.color }}>
                            {p.label}
                          </span>
                          <span className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                            {p.description}
                          </span>
                        </button>
                      ))}
                      <button
                        onClick={() => setStep(1)}
                        className="text-[13px] mt-2 hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Back
                      </button>
                    </motion.div>
                  )}

                  {/* Step 3: Ticket Details */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                    >
                      {/* Type & Priority & Status badges */}
                      <div className="flex flex-wrap gap-2 mb-5">
                        <span
                          className="text-[11px] px-2 py-1 rounded-full"
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-muted)',
                          }}
                        >
                          {type === 'feedback' ? 'Feedback' : 'Bug Report'}
                        </span>
                        {(() => {
                          const p = PRIORITIES.find(pr => pr.value === priority);
                          return (
                            <span
                              className="text-[11px] px-2 py-1 rounded-full"
                              style={{
                                background: `${p?.color}20`,
                                color: p?.color,
                              }}
                            >
                              {p?.label}
                            </span>
                          );
                        })()}
                        <span
                          className="text-[11px] px-2 py-1 rounded-full"
                          style={{
                            background: 'rgba(59, 130, 246, 0.15)',
                            color: '#3b82f6',
                          }}
                        >
                          Open
                        </span>
                      </div>

                      {/* Title Input */}
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Brief summary of your request"
                        className="w-full px-3 py-4 rounded-xl text-[15px] outline-none transition-all mb-3"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-primary)',
                        }}
                        autoFocus
                        maxLength={100}
                      />

                      {/* Description Input */}
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Describe the issue or suggestion in detail. Include steps to reproduce if reporting a bug."
                        rows={4}
                        className="w-full px-3 py-4 rounded-xl text-[15px] resize-none outline-none transition-all"
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: 'var(--text-primary)',
                        }}
                      />

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setStep(2)}
                          className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 hover:bg-white/8"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          Back
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={!canSubmit || isSubmitting}
                          className="flex-1 py-3 rounded-xl text-[14px] font-medium transition-all duration-200"
                          style={{
                            background: canSubmit ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)',
                            color: canSubmit ? '#0B0B0B' : 'var(--text-muted)',
                            cursor: canSubmit && !isSubmitting ? 'pointer' : 'not-allowed',
                            opacity: isSubmitting ? 0.6 : 1,
                          }}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
