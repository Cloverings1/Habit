import { StaticPageShell, StaticSection, type TocItem } from './StaticPageShell';

export const TermsPage = () => {
  const toc: TocItem[] = [
    { id: 'agreement', label: 'Agreement' },
    { id: 'use', label: 'Use of service' },
    { id: 'account', label: 'Account' },
    { id: 'payments', label: 'Payments' },
    { id: 'termination', label: 'Termination' },
    { id: 'disputes', label: 'Disputes' },
    { id: 'support', label: 'Support' },
    { id: 'ip', label: 'IP' },
    { id: 'warranty', label: 'Warranties' },
    { id: 'liability', label: 'Liability' },
    { id: 'law', label: 'Governing law' },
    { id: 'changes', label: 'Changes' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <StaticPageShell
      kicker="Legal"
      title="Terms of Service"
      subtitle="These terms help protect the service and set clear expectations."
      meta="Last updated: December 23, 2025"
      toc={toc}
    >
      <StaticSection id="agreement" title="Agreement to terms" variant="clean">
        <p>
          By accessing or using the Habits application (the &quot;Service&quot;) operated by ATXCopy LLC
          (&quot;ATXCopy,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a company based in Austin, Texas,
          you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you
          may not access or use the Service.
        </p>
      </StaticSection>

      <StaticSection id="use" title="Use of the service" variant="clean">
        <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
        <ul>
          <li>Use the Service in any way that violates any applicable law or regulation</li>
          <li>Attempt to interfere with the proper working of the Service</li>
          <li>Attempt to access any portion of the Service that you are not authorized to access</li>
          <li>Use the Service to transmit any malicious code or harmful content</li>
          <li>Impersonate any person or entity or misrepresent your affiliation</li>
        </ul>
      </StaticSection>

      <StaticSection id="account" title="Account registration" variant="clean">
        <p>
          To use certain features of the Service, you must create an account. You are responsible for maintaining the
          confidentiality of your account credentials and for all activities that occur under your account. You agree to
          provide accurate, current, and complete information during registration and to update such information as
          necessary.
        </p>
      </StaticSection>

      <StaticSection id="payments" title="Payment terms & no refund policy" hint="Important" variant="clean">
        <p>
          <strong>ALL PAYMENTS ARE FINAL AND NON-REFUNDABLE.</strong> By subscribing to any paid plan, you acknowledge
          and agree that:
        </p>
        <ul>
          <li>
            No refunds will be issued under any circumstances, including but not limited to dissatisfaction with the
            Service, accidental purchases, or unused subscription time
          </li>
          <li>
            The Service requires significant server infrastructure, computing resources, and ongoing operational costs
            that are incurred immediately upon subscription
          </li>
          <li>Subscription fees are charged in advance and are non-refundable regardless of actual usage</li>
          <li>You are responsible for canceling your subscription before renewal to avoid future charges</li>
          <li>Chargebacks or payment disputes may result in immediate account termination</li>
        </ul>
      </StaticSection>

      <StaticSection id="termination" title="Account termination" hint="Important" variant="clean">
        <p>
          <strong>
            ATXCopy reserves the absolute right to suspend or terminate your account at any time, for any reason, with or
            without notice, and without any obligation to provide a refund.
          </strong>{' '}
          This includes, but is not limited to, violations of these Terms, suspicious activity, or at our sole
          discretion. Upon termination, your right to use the Service will immediately cease. We shall not be liable to
          you or any third party for any termination of your access to the Service.
        </p>
      </StaticSection>

      <StaticSection id="disputes" title="Dispute resolution" hint="Important" variant="clean">
        <p>
          <strong>
            BY USING THIS SERVICE, YOU EXPRESSLY WAIVE YOUR RIGHT TO SUE ATXCOPY LLC, ITS OWNERS, OFFICERS, DIRECTORS,
            EMPLOYEES, AGENTS, AND AFFILIATES.
          </strong>
        </p>
        <p>You agree that:</p>
        <ul>
          <li>Any disputes arising from or relating to the Service shall be resolved through binding arbitration in Austin, Texas</li>
          <li>You waive any right to participate in class action lawsuits or class-wide arbitration</li>
          <li>You release ATXCopy from any and all claims, demands, and damages of every kind, known or unknown</li>
          <li>The maximum liability of ATXCopy for any claim shall not exceed the amount you paid for the Service in the 12 months preceding the claim</li>
        </ul>
      </StaticSection>

      <StaticSection id="support" title="Technical & billing support" variant="clean">
        <p>
          You acknowledge and agree that ATXCopy will address any technical issues, billing concerns, or support requests
          within a reasonable timeframe. &quot;Reasonable&quot; shall be determined at the sole discretion of ATXCopy
          based on the nature and complexity of the issue. We are not obligated to provide 24/7 support or immediate
          resolution of issues.
        </p>
      </StaticSection>

      <StaticSection id="ip" title="Intellectual property" variant="clean">
        <p>
          The Service and its original content, features, and functionality are owned by ATXCopy and are protected by
          international copyright, trademark, patent, trade secret, and other intellectual property laws. You may not
          copy, modify, distribute, sell, or lease any part of the Service without our prior written consent.
        </p>
      </StaticSection>

      <StaticSection id="warranty" title="Disclaimer of warranties" variant="clean">
        <p>
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER
          EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
          PARTICULAR PURPOSE, AND NON-INFRINGEMENT. ATXCOPY DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
          SECURE, OR ERROR-FREE.
        </p>
      </StaticSection>

      <StaticSection id="liability" title="Limitation of liability" variant="clean">
        <p>
          IN NO EVENT SHALL ATXCOPY, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT,
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA,
          USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR
          USE THE SERVICE.
        </p>
      </StaticSection>

      <StaticSection id="law" title="Governing law" variant="clean">
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the State of Texas, United
          States, without regard to its conflict of law provisions. Any legal action or proceeding relating to these
          Terms shall be brought exclusively in the state or federal courts located in Travis County, Texas.
        </p>
      </StaticSection>

      <StaticSection id="changes" title="Changes to terms" variant="clean">
        <p>
          We reserve the right to modify these Terms at any time. We will provide notice of any material changes by
          posting the new Terms on this page. Your continued use of the Service following the posting of revised Terms
          constitutes your acceptance of such changes.
        </p>
      </StaticSection>

      <StaticSection id="contact" title="Contact" variant="clean">
        <p>If you have any questions about these Terms, please contact us at:</p>
        <div
          style={{
            marginTop: 12,
            padding: 14,
            borderRadius: 14,
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600 }}>ATXCopy LLC</p>
          <p>Austin, Texas</p>
          <p style={{ marginTop: 8, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
            hello@atxcopy.com
          </p>
        </div>
      </StaticSection>
    </StaticPageShell>
  );
};


