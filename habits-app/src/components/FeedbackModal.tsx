import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage?: string;
}

type FeedbackType = 'feedback' | 'bug' | 'feature';
type PriorityLevel = 'fyi' | 'minor' | 'important' | 'critical';

const TYPES: { value: FeedbackType; label: string; icon: string; description: string }[] = [
  { value: 'feedback', label: 'Feedback', icon: '💬', description: 'Share your thoughts' },
  { value: 'bug', label: 'Bug Report', icon: '🐛', description: 'Something isn\'t working' },
  { value: 'feature', label: 'Feature Request', icon: '✨', description: 'Suggest an improvement' },
];

const PRIORITIES: { value: PriorityLevel; label: string; description: string; color: string }[] = [
  { value: 'fyi', label: 'FYI', description: 'Just sharing', color: '#6366f1' },
  { value: 'minor', label: 'Minor', description: 'Small issue or suggestion', color: '#3b82f6' },
  { value: 'important', label: 'Important', description: 'Affects usability', color: '#f97316' },
  { value: 'critical', label: 'Critical', description: 'Urgent - Jonas gets notified', color: '#ef4444' },
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

  const getTypeLabel = () => {
    switch (type) {
      case 'feedback': return 'Feedback';
      case 'bug': return 'Bug Report';
      case 'feature': return 'Feature Request';
      default: return '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-[520px] overflow-hidden"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, rgba(24, 24, 24, 0.98) 0%, rgba(18, 18, 18, 0.98) 100%)',
              backdropFilter: 'blur(60px) saturate(150%)',
              WebkitBackdropFilter: 'blur(60px) saturate(150%)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              boxShadow: '0 32px 100px -20px rgba(0, 0, 0, 0.7), 0 0 1px rgba(255,255,255,0.08) inset',
            }}
          >
            <div className="p-8 sm:p-10">
              {/* Success State */}
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
                    style={{ background: 'rgba(34, 197, 94, 0.12)' }}
                  >
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                  <p className="text-[20px] font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                    Ticket Submitted
                  </p>
                  <p className="text-[14px]" style={{ color: 'var(--text-muted)' }}>
                    Thanks for your feedback. We'll review it soon.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <motion.h2
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[22px] font-semibold tracking-tight"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {step === 1 && 'New Ticket'}
                        {step === 2 && 'Set Priority'}
                        {step === 3 && 'Details'}
                      </motion.h2>
                      <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
                        {step === 1 && 'What would you like to share?'}
                        {step === 2 && 'How urgent is this?'}
                        {step === 3 && 'Tell us more about it'}
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/8"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3"
                    >
                      {TYPES.map((t) => (
                        <button
                          key={t.value}
                          onClick={() => handleTypeSelect(t.value)}
                          className="p-5 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02] hover:bg-white/8 group"
                          style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                          }}
                        >
                          <span className="text-[24px] block mb-3">{t.icon}</span>
                          <span className="text-[15px] font-medium block mb-1" style={{ color: 'var(--text-primary)' }}>
                            {t.label}
                          </span>
                          <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                            {t.description}
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
                      <div className="grid grid-cols-2 gap-3">
                        {PRIORITIES.map((p) => (
                          <button
                            key={p.value}
                            onClick={() => handlePrioritySelect(p.value)}
                            className="p-5 rounded-2xl text-left transition-all duration-200 hover:scale-[1.02]"
                            style={{
                              background: `linear-gradient(135deg, ${p.color}10 0%, ${p.color}05 100%)`,
                              border: `1px solid ${p.color}25`,
                            }}
                          >
                            <div
                              className="w-2 h-2 rounded-full mb-3"
                              style={{ background: p.color, boxShadow: `0 0 8px ${p.color}60` }}
                            />
                            <span className="text-[15px] font-medium block mb-1" style={{ color: p.color }}>
                              {p.label}
                            </span>
                            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                              {p.description}
                            </span>
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 text-[13px] mt-4 hover:opacity-70 transition-opacity"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
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
                      {/* Type & Priority badges */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        <span
                          className="text-[12px] px-3 py-1.5 rounded-lg font-medium"
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {getTypeLabel()}
                        </span>
                        {(() => {
                          const p = PRIORITIES.find(pr => pr.value === priority);
                          return (
                            <span
                              className="text-[12px] px-3 py-1.5 rounded-lg font-medium"
                              style={{
                                background: `${p?.color}15`,
                                color: p?.color,
                              }}
                            >
                              {p?.label}
                            </span>
                          );
                        })()}
                      </div>

                      {/* Title Input */}
                      <div className="mb-4">
                        <label className="text-[12px] font-medium block mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                          Summary
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Brief summary of your request"
                          className="w-full px-5 py-4 rounded-xl text-[15px] outline-none transition-all focus:ring-2 focus:ring-white/10"
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: 'var(--text-primary)',
                          }}
                          autoFocus
                          maxLength={100}
                        />
                      </div>

                      {/* Description Input */}
                      <div className="mb-6">
                        <label className="text-[12px] font-medium block mb-2 uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                          Description
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder={
                            type === 'bug'
                              ? "Describe the issue and steps to reproduce..."
                              : type === 'feature'
                              ? "Describe the feature you'd like to see..."
                              : "Share your thoughts and suggestions..."
                          }
                          rows={5}
                          className="w-full px-5 py-4 rounded-xl text-[15px] resize-none outline-none transition-all focus:ring-2 focus:ring-white/10"
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: 'var(--text-primary)',
                          }}
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setStep(2)}
                          className="flex-1 py-4 rounded-xl text-[14px] font-medium transition-all duration-200 hover:bg-white/8 flex items-center justify-center gap-2"
                          style={{
                            background: 'rgba(255, 255, 255, 0.04)',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <path d="M19 12H5M12 19l-7-7 7-7" />
                          </svg>
                          Back
                        </button>
                        <button
                          onClick={handleSubmit}
                          disabled={!canSubmit || isSubmitting}
                          className="flex-[2] py-4 rounded-xl text-[14px] font-semibold transition-all duration-200"
                          style={{
                            background: canSubmit ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.08)',
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
