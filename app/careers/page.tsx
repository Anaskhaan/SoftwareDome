import StaticPage from "@/components/legal/StaticPage";

export default function CareersPage() {
  return (
    <StaticPage
      eyebrow="Company"
      title="Careers at SoftwareDome"
      description="Help us build the most trusted software directory on the web."
    >
      <h2>Why work with us</h2>
      <p>
        We're a small, focused team obsessed with making software research painless for buyers
        everywhere. If you care about clarity, accuracy, and building products people actually rely
        on, you'll fit right in.
      </p>

      <h2>Open roles</h2>
      <p>
        We don't have any open positions listed right now, but we're always interested in hearing
        from people who'd be a great fit for the team.
      </p>

      <h2>Get in touch</h2>
      <p>
        Send your resume and a short note about why you're interested via our <a href="/contact">contact page</a>{" "}
        and we'll reach out when a relevant role opens up.
      </p>
    </StaticPage>
  );
}
