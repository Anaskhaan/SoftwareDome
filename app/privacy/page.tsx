import StaticPage from "@/components/legal/StaticPage";

export default function PrivacyPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Privacy Policy"
      description="How SoftwareDome collects, uses, and protects your information."
      updatedAt="June 22, 2026"
    >
      <h2>1. Information we collect</h2>
      <p>
        We collect information you provide directly to us, such as your name and email address
        when you create an account, submit a review, or contact us. We also collect usage data —
        pages visited, searches performed, and device/browser information — to help us improve the
        directory.
      </p>

      <h2>2. How we use your information</h2>
      <p>
        We use the information we collect to operate and improve SoftwareDome, personalize your
        experience, respond to support requests, and send you updates you've opted into. We do not
        sell your personal information to third parties.
      </p>

      <h2>3. Sharing your information</h2>
      <p>
        We may share information with service providers who help us run the platform (such as
        hosting and analytics providers), or when required by law. Any reviews or comments you post
        publicly are visible to other visitors.
      </p>

      <h2>4. Data retention</h2>
      <p>
        We retain account information for as long as your account is active, or as needed to provide
        you services. You can request deletion of your account and associated data at any time.
      </p>

      <h2>5. Your rights</h2>
      <p>
        Depending on your location, you may have the right to access, correct, or delete your
        personal data. Contact us at the address below to exercise these rights.
      </p>

      <h2>6. Contact us</h2>
      <p>
        Questions about this policy? Reach out via our <a href="/contact">contact page</a>.
      </p>
    </StaticPage>
  );
}
