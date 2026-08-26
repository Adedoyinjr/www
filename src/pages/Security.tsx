import { Link } from 'react-router-dom';

const ANALYTICS_ENDPOINT = 'https://plausible.io/api/event';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="flex flex-col gap-3">
    <h2 className="font-heading text-[18px] font-semibold tracking-[-0.4px] text-on-surface">
      {title}
    </h2>
    <div className="flex flex-col gap-2 font-body text-[14px] leading-[1.7] text-on-surface-variant">
      {children}
    </div>
  </section>
);

export default function Security() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Wraith" width={30} height={24} className="h-6 opacity-90" />
          <span className="font-heading text-[13px] font-bold tracking-[2px] text-on-surface">
            WRAITH PROTOCOL
          </span>
        </Link>
      </header>

      <main className="mx-auto max-w-[720px] px-6 py-16 md:px-12">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4 border-b border-outline-variant pb-10">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[2px] text-outline">
              Security
            </span>
            <h1 className="font-heading text-[36px] font-bold tracking-[-1.5px] text-on-surface sm:text-[48px]">
              Security & Analytics
            </h1>
            <p className="font-body text-[14px] text-outline">usewraith.xyz</p>
          </div>

          <Section title="Analytics endpoint">
            <p>
              The site uses Plausible for aggregate analytics. Custom analytics events are delivered
              to exactly{' '}
              <code className="break-all font-mono text-xs text-primary">{ANALYTICS_ENDPOINT}</code>{' '}
              through the existing <code className="font-mono text-xs">window.plausible()</code>{' '}
              integration. No additional analytics provider, tag manager, or tracking pixel is added
              by issue #133.
            </p>
          </Section>

          <Section title="DNT / GPC enforcement">
            <p>
              Do-Not-Track and Global Privacy Control are enforced before Plausible is loaded. When
              either signal opts the visitor out, the analytics script is not requested and no
              request is made to <code className="font-mono text-xs">{ANALYTICS_ENDPOINT}</code>.
              Named events use the shared privacy gate in{' '}
              <code className="font-mono text-xs">src/utils/privacy.ts</code>, and Web Vitals reuse
              the same check.
            </p>
          </Section>

          <Section title="Typed event boundary">
            <p>
              Custom event names and payloads are defined in{' '}
              <code className="font-mono text-xs">src/utils/track.ts</code>. Payloads are flattened
              to string, number, and boolean properties before they reach Plausible, and fields with
              an undefined value are dropped.
            </p>
          </Section>

          <Section title="Sensitive data exclusions">
            <ul className="ml-4 list-disc space-y-1">
              <li>Wallet and stealth addresses are never included.</li>
              <li>Transaction hashes and transaction amounts are never included.</li>
              <li>Newsletter email addresses and form contents are never included.</li>
              <li>Outbound events record a destination category, not the full target URL.</li>
              <li>No new cookie, fingerprint, or persistent cross-site identifier is introduced.</li>
            </ul>
          </Section>

          <Section title="Event inventory and retention">
            <p>
              The complete event-name, trigger, payload, status, retention, and endpoint inventory is
              maintained on the{' '}
              <Link to="/privacy" className="text-primary underline hover:text-on-surface">
                Privacy Policy
              </Link>
              . Reserved event types are documented there as not emitted when the corresponding UI
              does not exist.
            </p>
          </Section>

          <div className="border-t border-outline-variant pt-8">
            <Link
              to="/"
              className="font-heading text-[11px] font-semibold tracking-[1.5px] text-on-surface-variant transition-colors hover:text-on-surface"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
