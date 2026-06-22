import StaticPage from "@/components/legal/StaticPage";

export default function TermsPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Terms of Service"
      description="The rules and guidelines for using SoftwareDome."
      updatedAt="June 22, 2026"
    >
      <h2>1. Acceptance of terms</h2>
      <p>
        By accessing or using SoftwareDome, you agree to be bound by these Terms of Service. If you
        do not agree, please do not use the platform.
      </p>

      <h2>2. Use of the platform</h2>
      <p>
        SoftwareDome is a directory and review platform for software products. You agree to use the
        platform only for lawful purposes and not to submit false, misleading, or defamatory content.
      </p>

      <h2>3. User content</h2>
      <p>
        Reviews, comments, and other content you submit remain yours, but by posting you grant
        SoftwareDome a non-exclusive, royalty-free license to display and distribute that content on
        the platform.
      </p>

      <h2>4. Listings and accuracy</h2>
      <p>
        Software listings are provided for informational purposes. While we strive for accuracy, we
        do not guarantee that listing details (pricing, features, ratings) are complete or up to
        date. Always verify details directly with the vendor.
      </p>

      <h2>5. Termination</h2>
      <p>
        We may suspend or terminate access to the platform for users who violate these terms or
        misuse the service.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        SoftwareDome is provided "as is" without warranties of any kind. We are not liable for any
        damages arising from your use of the platform or reliance on listed information.
      </p>

      <h2>7. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Continued use of the platform after changes
        constitutes acceptance of the updated terms.
      </p>
    </StaticPage>
  );
}
