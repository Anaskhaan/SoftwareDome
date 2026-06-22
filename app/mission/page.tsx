import StaticPage from "@/components/legal/StaticPage";

export default function MissionPage() {
  return (
    <StaticPage
      eyebrow="Company"
      title="Our Mission"
      description="Helping every team find software they can trust."
    >
      <h2>Our mission</h2>
      <p>
        We believe software buying decisions should be driven by evidence, not marketing budgets.
        Our mission is to build the most reliable, independently verified software directory on the
        web — one where every listing is backed by real research and real user feedback.
      </p>

      <h2>How we measure success</h2>
      <p>
        We succeed when a buyer finds the right tool faster, with fewer regrets, because the
        information they needed was already laid out clearly on SoftwareDome.
      </p>

      <h2>Looking ahead</h2>
      <p>
        As the directory grows, we're committed to expanding coverage across every major software
        category while holding every listing to the same standard of accuracy and transparency.
      </p>
    </StaticPage>
  );
}
