import { StaticPageShell, StaticSection, type TocItem } from './StaticPageShell';

export const PrivacyPage = () => {
  const toc: TocItem[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'collect', label: 'What we collect' },
    { id: 'use', label: 'How we use it' },
    { id: 'security', label: 'Security' },
    { id: 'retention', label: 'Retention' },
    { id: 'third-parties', label: 'Third parties' },
    { id: 'rights', label: 'Your rights' },
    { id: 'children', label: "Children's privacy" },
    { id: 'changes', label: 'Changes' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <StaticPageShell
      kicker="Legal"
      title="Privacy Policy"
      subtitle="A clear explanation of what we collect, why we collect it, and how your data is protected."
      meta="Last updated: December 23, 2025"
      toc={toc}
    >
      <StaticSection id="overview" title="Overview" variant="clean">
        <p>
          ATXCopy LLC (&quot;ATXCopy,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a company based in
          Austin, Texas, operates the Habits application (the &quot;Service&quot;). This Privacy Policy explains how we
          collect, use, disclose, and safeguard your information when you use our Service.
        </p>
      </StaticSection>

      <StaticSection id="collect" title="Information we collect" hint="Only what we need" variant="clean">
        <p>We collect information you provide directly to us, including:</p>
        <ul>
          <li>Account information (email address, password)</li>
          <li>Profile information (display name, avatar)</li>
          <li>Habit data (habit names, completion records, streak information)</li>
          <li>Usage data (app interactions, feature usage patterns)</li>
          <li>Payment information (processed securely through Stripe)</li>
        </ul>
      </StaticSection>

      <StaticSection id="use" title="How we use your information" variant="clean">
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve the Service</li>
          <li>Process transactions and send related information</li>
          <li>Send technical notices, updates, and support messages</li>
          <li>Respond to your comments and questions</li>
          <li>Analyze usage patterns to improve user experience</li>
          <li>Protect against fraudulent or illegal activity</li>
        </ul>
      </StaticSection>

      <StaticSection id="security" title="Data security" hint="Defense-in-depth" variant="clean">
        <p>
          We implement industry-standard security measures to protect your personal information. Your data is encrypted
          in transit and at rest. We use row-level security (RLS) to ensure complete data isolation between users.
          However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot
          guarantee absolute security.
        </p>
      </StaticSection>

      <StaticSection id="retention" title="Data retention" variant="clean">
        <p>
          We retain your personal information for as long as your account is active or as needed to provide you
          services. If you wish to cancel your account or request that we no longer use your information, please contact
          us. We will retain and use your information as necessary to comply with our legal obligations, resolve
          disputes, and enforce our agreements.
        </p>
      </StaticSection>

      <StaticSection id="third-parties" title="Third-party services" variant="clean">
        <p>We use the following third-party services:</p>
        <ul>
          <li>
            <strong>Supabase</strong> — Database and authentication services
          </li>
          <li>
            <strong>Stripe</strong> — Payment processing
          </li>
        </ul>
        <p>These services have their own privacy policies governing the use of your information.</p>
      </StaticSection>

      <StaticSection id="rights" title="Your rights" variant="clean">
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal information we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Export your data in a portable format</li>
          <li>Opt out of marketing communications</li>
        </ul>
      </StaticSection>

      <StaticSection id="children" title="Children's privacy" variant="clean">
        <p>
          The Service is not intended for children under 13 years of age. We do not knowingly collect personal
          information from children under 13. If we discover that a child under 13 has provided us with personal
          information, we will delete such information from our servers.
        </p>
      </StaticSection>

      <StaticSection id="changes" title="Changes to this policy" variant="clean">
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
          Privacy Policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service
          after any modifications indicates your acceptance of the updated Privacy Policy.
        </p>
      </StaticSection>

      <StaticSection id="contact" title="Contact" variant="clean">
        <p>If you have any questions about this Privacy Policy, please contact us at:</p>
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
