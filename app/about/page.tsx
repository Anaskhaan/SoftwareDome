import StaticPage from "@/components/legal/StaticPage";

export default function AboutPage() {
  return (
    <StaticPage
      eyebrow="Company"
      title="About SoftwareDome"
      description="The industry's most trusted verification layer for SaaS tools."
    >
      <h2>Who we are</h2>
      <p>
        SoftwareDome is a software directory built to help buyers cut through marketing noise and
        find tools that actually fit their needs. We audit, compare, and verify software listings so
        you don't have to spend hours researching on your own.
      </p>

      <h2>What we do</h2>
      <p>
        Every listing on SoftwareDome includes a structured breakdown — introduction, our verdict,
        key takeaways, pros and cons, specifications, and real user sentiment — so you can evaluate a
        product in minutes, not days.
      </p>

      <h2>Why it matters</h2>
      <p>
        Choosing the wrong software is expensive: lost time, wasted budget, and a painful migration
        down the line. We exist to make that decision easier and more transparent for every team that
        relies on us.
      </p>
    </StaticPage>
  );
}
