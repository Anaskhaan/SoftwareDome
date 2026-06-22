import StaticPage from "@/components/legal/StaticPage";

export default function CookiesPage() {
  return (
    <StaticPage
      eyebrow="Legal"
      title="Cookie Policy"
      description="How SoftwareDome uses cookies and similar technologies."
      updatedAt="June 22, 2026"
    >
      <h2>1. What are cookies</h2>
      <p>
        Cookies are small text files stored on your device that help websites remember information
        about your visit, such as your preferences and login state.
      </p>

      <h2>2. How we use cookies</h2>
      <ul>
        <li><strong>Essential cookies</strong> — required for core functionality like staying logged in.</li>
        <li><strong>Preference cookies</strong> — remember settings such as your selected category filters.</li>
        <li><strong>Analytics cookies</strong> — help us understand how visitors use the directory so we can improve it.</li>
      </ul>

      <h2>3. Managing cookies</h2>
      <p>
        Most browsers let you control cookies through their settings, including blocking or deleting
        them. Disabling essential cookies may affect how parts of SoftwareDome function.
      </p>

      <h2>4. Third-party cookies</h2>
      <p>
        Some pages may include content or analytics from third-party providers, which may set their
        own cookies in line with their respective privacy policies.
      </p>

      <h2>5. Questions</h2>
      <p>
        If you have questions about our use of cookies, please visit our <a href="/contact">contact page</a>.
      </p>
    </StaticPage>
  );
}
