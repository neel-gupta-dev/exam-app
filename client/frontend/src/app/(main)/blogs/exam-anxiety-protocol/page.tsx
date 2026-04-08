import BlogArticle from "@/components/BlogArticle";

export default function Page() {
  return (
    <BlogArticle
      slug="exam-anxiety-protocol"
      title="Mental Fortitude: The Protocol for Managing JEE Pressure"
      category="Mindset"
      date="March 23, 2024"
      readTime="7 min"
      takeaways={['Anxiety reframing', 'Early momentum strategy', 'Tactical breathing']}
      related={[
        { title: 'The Geometry of Focus', category: 'Focus', slug: 'deep-work-for-aspirants' },
        { title: 'The Definitive 2026 Roadmap', category: 'Strategy', slug: 'the-jee-2026-roadmap' }
      ]}
      content={`
        <h2>The Pressure Protocol</h2>
        <p>Anxiety is often just misinterpreted energy. Learn to reframe exam stress as <strong>"Readiness."</strong> Your body is preparing you for a high-intensity task. That racing heart is oxygen being delivered to your brain for faster processing.</p>
        
        <h3>The First 5 Minutes Strategy</h3>
        <p>The first 5 minutes of your exam determine your entire flow. Do not start with the hardest question. Scan for "Easy Wins."</p>
        
        <h3>Tactical Breathing for Clarity</h3>
        <p>If you feel a "brain freeze" during the test, use the Box Breathing technique: Inhale for 4, Hold for 4, Exhale for 4, Hold for 4.</p>
      `}
    />
  );
}
