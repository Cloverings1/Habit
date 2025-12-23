import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export const TermsModal = ({ isOpen, onAccept, onDecline }: TermsModalProps) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const canAccept = hasScrolledToBottom && checkbox1 && checkbox2;

  useEffect(() => {
    if (!isOpen) {
      setHasScrolledToBottom(false);
      setCheckbox1(false);
      setCheckbox2(false);
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      // Consider scrolled to bottom when within 50px of the end
      if (scrollHeight - scrollTop - clientHeight < 50) {
        setHasScrolledToBottom(true);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-[520px] max-h-[90vh] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: '#141414',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            }}
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-4">
              <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#F5F5F5]">
                Terms of Service
              </h2>
              <p className="text-[14px] text-[#6F6F6F] mt-2">
                Please read and accept our terms before continuing
              </p>
            </div>

            {/* Scroll indicator */}
            {!hasScrolledToBottom && (
              <div className="px-8 pb-2">
                <p className="text-[12px] text-[#E85D4F] flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                  Scroll to read all terms
                </p>
              </div>
            )}

            {/* Scrollable content */}
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-8 py-4"
              style={{ maxHeight: '400px' }}
            >
              <div className="text-[14px] leading-[1.8] text-[#A0A0A0]">
                <p className="mb-6">
                  <strong className="text-[#F5F5F5]">TERMS OF SERVICE AGREEMENT</strong>
                </p>

                <p className="mb-4">
                  This Terms of Service Agreement ("Agreement") is entered into between you ("User," "you," or "your") and ATXCopy LLC, a Texas limited liability company ("ATXCopy," "Company," "we," "us," or "our"), effective as of the date you access or use the Habits application (the "Service"). By creating an account, accessing, or using the Service, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions contained herein. If you do not agree to these terms, you must immediately discontinue use of the Service.
                </p>

                <p className="mb-4">
                  <strong className="text-[#F5F5F5]">1. SUBSCRIPTION AND PAYMENT TERMS.</strong> All subscription fees are due and payable in advance of each billing period. <span className="text-[#F5F5F5]">ALL PAYMENTS MADE TO ATXCOPY ARE FINAL, NON-REFUNDABLE, AND NON-TRANSFERABLE UNDER ANY CIRCUMSTANCES WHATSOEVER.</span> This includes, without limitation, situations involving account cancellation, service dissatisfaction, technical issues, user error, change of mind, failure to use the Service, or any other reason. The Company maintains significant server infrastructure and computing resources to provide the Service, and you acknowledge that fees paid compensate for the availability of such resources regardless of your actual usage.
                </p>

                <p className="mb-4">
                  <strong className="text-[#F5F5F5]">2. ACCOUNT TERMINATION.</strong> ATXCopy reserves the absolute and unconditional right, in its sole and exclusive discretion, to suspend, restrict, or terminate your account and access to the Service at any time, for any reason or no reason, with or without prior notice, and without any obligation to provide explanation, refund, credit, or compensation of any kind. Upon termination, your right to access and use the Service shall immediately and automatically cease, and ATXCopy shall have no obligation to maintain, preserve, or provide access to any data, content, or information associated with your account.
                </p>

                <p className="mb-4">
                  <strong className="text-[#F5F5F5]">3. DISPUTE RESOLUTION AND WAIVER OF LEGAL RIGHTS.</strong> <span className="text-[#F5F5F5]">BY ACCEPTING THESE TERMS, YOU EXPRESSLY AND IRREVOCABLY WAIVE YOUR RIGHT TO SUE ATXCOPY LLC, ITS OWNERS, MEMBERS, MANAGERS, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, SUCCESSORS, ASSIGNS, AND AFFILIATES (COLLECTIVELY, "RELEASED PARTIES") IN ANY COURT OF LAW.</span> Any dispute, controversy, or claim arising out of or relating to this Agreement, the Service, or your use thereof shall be resolved exclusively through final and binding arbitration administered in accordance with the rules of the American Arbitration Association, with such arbitration to be conducted in Austin, Travis County, Texas. <span className="text-[#F5F5F5]">YOU HEREBY WAIVE ANY RIGHT TO PARTICIPATE IN A CLASS ACTION LAWSUIT, CLASS-WIDE ARBITRATION, OR ANY OTHER REPRESENTATIVE OR CONSOLIDATED PROCEEDING.</span> You hereby release and forever discharge the Released Parties from any and all claims, demands, actions, causes of action, suits, damages, losses, costs, and expenses of every kind and nature, whether known or unknown, suspected or unsuspected, which you ever had, now have, or may hereafter have against the Released Parties arising out of or in connection with the Service.
                </p>

                <p className="mb-4">
                  <strong className="text-[#F5F5F5]">4. SUPPORT AND TECHNICAL ASSISTANCE.</strong> ATXCopy may, in its sole discretion, provide technical support and assistance to address issues or concerns related to the Service. You acknowledge and agree that ATXCopy is not obligated to provide twenty-four hour support, immediate response, or resolution within any specified timeframe. The Company will address technical issues and billing inquiries within a reasonable timeframe as determined exclusively by ATXCopy. The availability, scope, and manner of support services may be modified or discontinued at any time without notice.
                </p>

                <p className="mb-4">
                  <strong className="text-[#F5F5F5]">5. ACCEPTABLE USE.</strong> You agree to use the Service solely for lawful purposes and in compliance with all applicable laws, regulations, and these Terms. You shall not: (a) interfere with or disrupt the integrity or performance of the Service; (b) attempt to gain unauthorized access to the Service, other accounts, computer systems, or networks; (c) transmit any viruses, malware, or other malicious code; (d) impersonate any person or entity; (e) engage in any conduct that could damage, disable, or impair the Service; or (f) use the Service in any manner that violates any applicable law or regulation.
                </p>

                <p className="mb-4">
                  <strong className="text-[#F5F5F5]">6. DISCLAIMER OF WARRANTIES.</strong> THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE. ATXCOPY EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING WITHOUT LIMITATION, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. ATXCOPY DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, ERROR-FREE, OR THAT ANY DEFECTS WILL BE CORRECTED. YOU ASSUME ALL RISK FOR YOUR USE OF THE SERVICE.
                </p>

                <p className="mb-4">
                  <strong className="text-[#F5F5F5]">7. LIMITATION OF LIABILITY.</strong> TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL ATXCOPY OR THE RELEASED PARTIES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH THIS AGREEMENT OR THE SERVICE, REGARDLESS OF WHETHER SUCH DAMAGES WERE FORESEEABLE OR WHETHER ATXCOPY WAS ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. ATXCOPY'S TOTAL CUMULATIVE LIABILITY SHALL NOT EXCEED THE LESSER OF (A) THE AMOUNTS PAID BY YOU TO ATXCOPY IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100.00 USD).
                </p>

                <p className="mb-4">
                  <strong className="text-[#F5F5F5]">8. GOVERNING LAW AND JURISDICTION.</strong> This Agreement shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law provisions. Subject to the arbitration provision above, any legal action or proceeding arising out of or relating to this Agreement shall be brought exclusively in the state or federal courts located in Travis County, Texas, and you hereby consent to the personal jurisdiction of such courts.
                </p>

                <p className="mb-4">
                  <strong className="text-[#F5F5F5]">9. ENTIRE AGREEMENT AND MODIFICATIONS.</strong> This Agreement constitutes the entire agreement between you and ATXCopy regarding the subject matter hereof and supersedes all prior agreements and understandings. ATXCopy reserves the right to modify these Terms at any time in its sole discretion. Continued use of the Service following any such modification constitutes your acceptance of the modified Terms.
                </p>

                <p className="mb-4">
                  <strong className="text-[#F5F5F5]">10. CONTACT INFORMATION.</strong> ATXCopy LLC is headquartered in Austin, Texas. For inquiries regarding this Agreement or the Service, please contact us at hello@atxcopy.com.
                </p>

                <p className="mt-6 text-[12px] text-[#4F4F4F] text-center">
                  Last Updated: December 2024
                </p>

                {/* End marker */}
                <div className="text-center py-4 text-[12px] text-[#4F4F4F]">
                  — End of Terms —
                </div>
              </div>
            </div>

            {/* Checkboxes and Actions */}
            <div className="px-8 py-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }}>
              {/* Double opt-in checkboxes */}
              <div className="space-y-3 mb-6">
                <label
                  className={`flex items-start gap-3 cursor-pointer transition-opacity ${!hasScrolledToBottom ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={checkbox1}
                      onChange={(e) => setCheckbox1(e.target.checked)}
                      disabled={!hasScrolledToBottom}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                      style={{
                        borderColor: checkbox1 ? '#E85D4F' : '#3A3A3A',
                        backgroundColor: checkbox1 ? '#E85D4F' : 'transparent',
                      }}
                    >
                      {checkbox1 && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 12L10 17L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[14px] text-[#A0A0A0]">
                    I have read and agree to the Terms of Service, including the no-refund policy and binding arbitration clause
                  </span>
                </label>

                <label
                  className={`flex items-start gap-3 cursor-pointer transition-opacity ${!hasScrolledToBottom ? 'opacity-40 pointer-events-none' : ''}`}
                >
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      checked={checkbox2}
                      onChange={(e) => setCheckbox2(e.target.checked)}
                      disabled={!hasScrolledToBottom}
                      className="sr-only"
                    />
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                      style={{
                        borderColor: checkbox2 ? '#E85D4F' : '#3A3A3A',
                        backgroundColor: checkbox2 ? '#E85D4F' : 'transparent',
                      }}
                    >
                      {checkbox2 && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M5 12L10 17L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-[14px] text-[#A0A0A0]">
                    I waive my right to sue ATXCopy LLC and agree to allow ATXCopy to address technical and billing concerns within a reasonable timeframe
                  </span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={onDecline}
                  className="flex-1 py-3 px-4 rounded-lg text-[15px] font-medium transition-all hover:bg-white/10"
                  style={{ color: '#A0A0A0' }}
                >
                  Decline
                </button>
                <button
                  onClick={onAccept}
                  disabled={!canAccept}
                  className="flex-1 py-3 px-4 rounded-lg text-[15px] font-medium transition-all"
                  style={{
                    backgroundColor: canAccept ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.15)',
                    color: canAccept ? '#0B0B0B' : '#6F6F6F',
                    cursor: canAccept ? 'pointer' : 'not-allowed',
                  }}
                >
                  Accept & Continue
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
