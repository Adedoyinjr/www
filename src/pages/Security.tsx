import { Link } from 'react-router-dom';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-3">
    <h2 className="font-heading text-[18px] font-semibold tracking-[-0.4px] text-on-surface">
      {title}
    </h2>
    <div className="flex flex-col gap-2 font-body text-[14px] leading-[1.7] text-on-surface-variant">
      {children}
    </div>
  </div>
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
              Legal
            </span>
            <h1 className="font-heading text-[36px] font-bold tracking-[-1.5px] text-on-surface sm:text-[48px]">
              Security & Analytics
            </h1>
            <p className="font-body text-[14px] text-outline">
              Last updated: June 2025 &nbsp;·&nbsp; usewraith.xyz
            </p>
          </div>

          <Section title="First-party analytics endpoint">
            <p>
              This site uses a single, first-party analytics endpoint:{' '}
              <strong className="text-on-surface">Plausible Analytics</strong>, an
              open-source, EU-hosted, cookieless product. All custom events are forwarded to
              Plausible&apos;s event endpoint through the existing{' '}
              <code className="font-mono text-xs text-primary bg-surface-container px-1.5 py-0.5 border border-outline-variant">
                window.plausible()
              </code>{' '}
              integration. No other analytics provider, tag manager, or tracking pixel is loaded.
            </p>
          </Section>

          <Section title="No additional analytics providers">
            <p>
              Beyond Plausible, no third-party analytics, advertising, or fingerprinting scripts
              run on this site. The only other external resource fetched is the Google Fonts
              stylesheet, which is documented in our{' '}
              <Link to="/privacy" className="text-primary underline hover:text-on-surface">
                Privacy Policy
              </Link>
              .
            </p>
          </Section>

          <Section title="DNT / GPC enforcement">
            <p>
              Every named analytics event is routed through a single typed helper (
              <code className="font-mono text-xs text-primary bg-surface-container px-1.5 py-0.5 border border-outline-variant">
                track()
              </code>
              ) that checks the visitor&apos;s Do-Not-Track (DNT) and Global Privacy Control (GPC)
              browser signals before sending anything. When DNT or GPC is enabled,{' '}
              <strong className="text-on-surface">no analytics request is made at all</strong> —
              not even a pageview.
            </p>
          </Section>

          <Section title="Minimal payload collection">
            <p>Each analytics event carries only the minimum fields needed to understand usage:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>An event name (e.g. <code className="font-mono text-xs">cta_click</code>).</li>
              <li>
                A small set of flat string/number/boolean props such as{' '}
                <code className="font-mono text-xs">source</code>,{' '}
                <code className="font-mono text-xs">slug</code>,{' '}
                <code className="font-mono text-xs">locale</code>, or{' '}
                <code className="font-mono text-xs">category</code>.
              </li>
              <li>Web Vitals metrics (LCP / INP / CLS) as numeric values with a rating.</li>
            </ul>
          </Section>

          <Section title="No newsletter form contents in analytics">
            <p>
              The newsletter signup form transmits only the email address, and only to our
              privacy-respecting email provider (Buttondown) via a server-side proxy. The email
              address, or any part of it, is{' '}
              <strong className="text-on-surface">never</strong> included in any analytics event.
            </p>
          </Section>

          <Section title="No secrets or tokens">
            <p>
              API keys and server-side secrets (for example the Buttondown API key) live only in
              Vercel environment variables and are never exposed to the client or sent through
              analytics.
            </p>
          </Section>

          <Section title="No sensitive content in events">
            <p>
              Analytics events never contain wallet addresses, transaction hashes, stealth
              addresses, IP addresses, or any personally identifiable information. Only aggregate,
              non-identifying interaction metadata is recorded.
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
