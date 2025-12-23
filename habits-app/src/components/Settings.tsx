import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '../contexts/HabitsContext';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { storage } from '../utils/storage';
import { useNavigate } from 'react-router-dom';
import { PaywallModal } from './PaywallModal';
import { ConsistencyReport } from './ConsistencyReport';
import { ResetConfirmationModal } from './ResetConfirmationModal';
import { FeedbackModal } from './FeedbackModal';
import { AdminFeedbackView } from './AdminFeedbackView';
import { Lock, Camera, ChevronDown, Check, X, MessageCircle } from 'lucide-react';
import { validateAvatarFile } from '../utils/avatarUtils';

const ADMIN_EMAIL = 'jonas@jonasinfocus.com';

export const Settings = () => {
  const { habits, userName, setUserName, removeHabit } = useHabits();
  const {
    signOut,
    user,
    updateDisplayName,
    updateEmail,
    updatePassword,
    uploadAvatar,
    getDisplayName,
    getAvatarUrl,
  } = useAuth();
  const { isPro, status, currentPeriodEnd, cancelAtPeriodEnd, openPortal } = useSubscription();
  const navigate = useNavigate();

  // Existing state
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userName);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showConsistencyReport, setShowConsistencyReport] = useState(false);

  // New state for profile updates
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [showSecuritySection, setShowSecuritySection] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAdminFeedback, setShowAdminFeedback] = useState(false);

  const isAdmin = user?.email === ADMIN_EMAIL;

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSaveName = async () => {
    if (nameInput.trim() && nameInput.trim() !== getDisplayName()) {
      try {
        await updateDisplayName(nameInput.trim());
        setUserName(nameInput.trim());
        showStatus('success', 'Name updated');
      } catch (error) {
        showStatus('error', 'Failed to update name');
      }
    }
    setEditingName(false);
  };

  const handleSaveEmail = async () => {
    if (emailInput.trim() && emailInput.trim() !== user?.email) {
      try {
        await updateEmail(emailInput.trim());
        showStatus('success', 'Email updated');
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to update email';
        showStatus('error', message);
      }
    }
    setEditingEmail(false);
  };

  const handleSavePassword = async () => {
    if (passwordInput.length >= 8) {
      try {
        await updatePassword(passwordInput);
        setPasswordInput('');
        setShowPasswordSection(false);
        showStatus('success', 'Password updated');
      } catch (error: unknown) {
        showStatus('error', 'Failed to update password. Please try again.');
      }
    } else {
      showStatus('error', 'Password must be at least 8 characters');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      showStatus('error', validation.error!);
      return;
    }

    setUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      showStatus('success', 'Avatar uploaded');
    } catch (error) {
      showStatus('error', 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Small delay to ensure auth state clears before redirect
      setTimeout(() => navigate('/login'), 100);
    } catch (error) {
      console.error('Sign out error:', error);
      showStatus('error', 'Failed to sign out');
    }
  };

  const handleExport = () => {
    const data = storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habits-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatSubscriptionDate = (dateString: string | null): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getSubscriptionStatusLabel = (): string => {
    if (status === 'active' && cancelAtPeriodEnd) {
      return 'Canceling';
    }
    if (status === 'active') {
      return 'Active';
    }
    return 'Free';
  };

  // Show admin feedback view if active
  if (showAdminFeedback && isAdmin) {
    return <AdminFeedbackView onBack={() => setShowAdminFeedback(false)} />;
  }

  return (
    <div className="main-content">
      {/* Header */}
      <motion.header
        className="mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-label mb-3">PREFERENCES</p>
        <h1 className="text-display">Settings</h1>
      </motion.header>

      {/* Subscription Section */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
      >
        <h2 className="text-[12px] uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
          Subscription
        </h2>

        <div
          className="p-5 rounded-xl mb-4"
          style={{ background: 'rgba(255, 255, 255, 0.04)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[16px] font-medium" style={{ color: 'var(--text-primary)' }}>
                  {isPro ? 'Pro Plan' : 'Free Plan'}
                </span>
                {isPro && (
                  <span
                    className="text-[11px] px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: cancelAtPeriodEnd
                        ? 'rgba(251, 191, 36, 0.2)'
                        : 'rgba(34, 197, 94, 0.2)',
                      color: cancelAtPeriodEnd ? '#fbbf24' : '#22c55e',
                    }}
                  >
                    {getSubscriptionStatusLabel()}
                  </span>
                )}
              </div>
              {!isPro && (
                <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {habits.length}/3 habits used
                </p>
              )}
              {isPro && currentPeriodEnd && (
                <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {cancelAtPeriodEnd ? 'Ends' : 'Renews'}: {formatSubscriptionDate(currentPeriodEnd)}
                </p>
              )}
            </div>

            {isPro ? (
              <button
                onClick={openPortal}
                className="text-[14px] font-medium px-4 py-2 rounded-lg transition-all hover:bg-white/10"
                style={{ color: 'var(--text-primary)' }}
              >
                Manage
              </button>
            ) : (
              <button
                onClick={() => setShowPaywall(true)}
                className="text-[14px] font-medium px-4 py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#0B0B0B',
                }}
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </motion.section>

      {/* Profile */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-[12px] uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
          Profile
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {getAvatarUrl() ? (
              <img
                src={getAvatarUrl()!}
                alt="Avatar"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-[18px] font-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--text-primary)' }}
              >
                {getDisplayName().slice(0, 2).toUpperCase()}
              </div>
            )}

            <label
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
              style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
            >
              <Camera size={14} color="#0B0B0B" />
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
          </div>

          <div>
            <p className="text-[15px]" style={{ color: 'var(--text-primary)' }}>
              {getDisplayName()}
            </p>
            <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
              {uploadingAvatar ? 'Uploading...' : 'Click camera to change'}
            </p>
          </div>
        </div>

        {/* Name */}
        <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>Display Name</span>
          {editingName ? (
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
              className="text-right w-48 bg-transparent border-b border-white/20 outline-none text-[15px]"
              style={{ color: 'var(--text-primary)' }}
              autoFocus
            />
          ) : (
            <button
              onClick={() => {
                setNameInput(getDisplayName());
                setEditingName(true);
              }}
              className="text-[15px] hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-primary)' }}
            >
              {getDisplayName()}
            </button>
          )}
        </div>
      </motion.section>

      {/* Account Security */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <button
          onClick={() => setShowSecuritySection(!showSecuritySection)}
          className="flex items-center justify-between w-full mb-4 hover:opacity-70 transition-opacity"
        >
          <h2 className="text-[12px] uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
            Account Security
          </h2>
          <ChevronDown
            size={16}
            style={{
              color: 'var(--text-muted)',
              transform: showSecuritySection ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>

        <AnimatePresence>
          {showSecuritySection && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                {/* Email */}
                <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                  <span className="text-[15px]" style={{ color: 'var(--text-secondary)' }}>Email</span>
                  {editingEmail ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        className="text-right w-48 bg-transparent border-b border-white/20 outline-none text-[15px]"
                        style={{ color: 'var(--text-primary)' }}
                        autoFocus
                      />
                      <button onClick={handleSaveEmail} className="hover:opacity-70 transition-opacity">
                        <Check size={18} style={{ color: 'var(--text-primary)' }} />
                      </button>
                      <button onClick={() => setEditingEmail(false)} className="hover:opacity-70 transition-opacity">
                        <X size={18} style={{ color: 'var(--text-muted)' }} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEmailInput(user?.email || '');
                        setEditingEmail(true);
                      }}
                      className="text-[15px] hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {user?.email}
                    </button>
                  )}
                </div>

                {/* Password */}
                <div className="py-4">
                  {!showPasswordSection ? (
                    <button
                      onClick={() => setShowPasswordSection(true)}
                      className="text-[15px] hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Change password
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="New password (min 8 characters)"
                        className="w-full bg-transparent border-b border-white/20 outline-none text-[15px] py-2"
                        style={{ color: 'var(--text-primary)' }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSavePassword}
                          disabled={passwordInput.length < 8}
                          className="flex-1 py-2 px-4 rounded-lg text-[14px] font-medium transition-all"
                          style={{
                            backgroundColor: passwordInput.length >= 8 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
                            color: passwordInput.length >= 8 ? '#0B0B0B' : 'var(--text-muted)',
                            cursor: passwordInput.length >= 8 ? 'pointer' : 'not-allowed',
                          }}
                        >
                          Update Password
                        </button>
                        <button
                          onClick={() => {
                            setShowPasswordSection(false);
                            setPasswordInput('');
                          }}
                          className="py-2 px-4 rounded-lg text-[14px] font-medium transition-all hover:bg-white/10"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>

      {/* Habits */}
      {habits.length > 0 && (
        <motion.section
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-[12px] uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
            Manage Habits
          </h2>
          <div>
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between py-4 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.color }} />
                  <span className="text-[15px]" style={{ color: 'var(--text-primary)' }}>{habit.name}</span>
                </div>
                <button
                  onClick={() => removeHabit(habit.id)}
                  className="text-[12px] hover:opacity-70 transition-opacity"
                  style={{ color: '#ef4444' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Data */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-[12px] uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
          Data
        </h2>
        <div className="space-y-4">
          <button
            onClick={handleExport}
            className="text-[15px] hover:opacity-70 transition-opacity block"
            style={{ color: 'var(--text-primary)' }}
          >
            Export all data
          </button>

          {/* PDF Report Button */}
          <button
            onClick={() => isPro ? setShowConsistencyReport(true) : setShowPaywall(true)}
            className="flex items-center gap-2 text-[15px] hover:opacity-70 transition-opacity"
            style={{ color: isPro ? 'var(--text-primary)' : 'var(--text-muted)' }}
          >
            {!isPro && <Lock size={14} />}
            Export consistency report (PDF)
          </button>

          {/* Reset All Habits Button */}
          <button
            onClick={() => setShowResetModal(true)}
            className="text-[15px] hover:opacity-70 transition-opacity block"
            style={{ color: '#ef4444' }}
          >
            Reset all habits
          </button>
        </div>
      </motion.section>

      {/* Feedback Section */}
      <motion.section
        className="mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="text-[12px] uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
          Support
        </h2>
        <div className="space-y-4">
          <button
            onClick={() => setShowFeedbackModal(true)}
            className="flex items-center gap-2 text-[15px] hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-secondary)' }}
          >
            <MessageCircle size={16} style={{ color: 'var(--text-muted)' }} />
            Send feedback
          </button>

          {/* Admin-only: User Feedback */}
          {isAdmin && (
            <button
              onClick={() => setShowAdminFeedback(true)}
              className="text-[15px] hover:opacity-70 transition-opacity block"
              style={{ color: 'var(--text-primary)' }}
            >
              User Feedback
            </button>
          )}
        </div>
      </motion.section>

      {/* Account */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-12 pt-8 border-t"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <h2 className="text-[12px] uppercase tracking-wide mb-4" style={{ color: 'var(--text-muted)' }}>
          Account
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between py-2">
            <span className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>Logged in as</span>
            <span className="text-[14px]" style={{ color: 'var(--text-primary)' }}>{user?.email}</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-[15px] hover:opacity-70 transition-opacity text-left text-red-500"
          >
            Sign Out
          </button>
        </div>
      </motion.section>

      {/* Modals */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        trigger="export"
      />

      <ConsistencyReport
        isOpen={showConsistencyReport}
        onClose={() => setShowConsistencyReport(false)}
      />

      <ResetConfirmationModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
      />

      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
      />

      {/* Status Toast */}
      <AnimatePresence>
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full z-50"
            style={{
              backgroundColor: statusMessage.type === 'success'
                ? 'rgba(34, 197, 94, 0.9)'
                : 'rgba(239, 68, 68, 0.9)',
              color: '#fff',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <p className="text-[14px] font-medium">{statusMessage.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
