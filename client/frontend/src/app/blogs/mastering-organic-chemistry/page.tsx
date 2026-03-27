import BlogArticle from "@/components/BlogArticle";

export default function Page() {
  return (
    <BlogArticle
      slug="mastering-organic-chemistry"
      title="Organic Synthesis: A Structural Approach to Mastery"
      category="Chemistry"
      date="March 25, 2024"
      readTime="15 min"
      takeaways={['Electronic mechanism focus', 'Reagent categorization', 'Recursive reaction mapping']}
      related={[
        { title: 'The Definitive 2026 Roadmap', category: 'Strategy', slug: 'the-jee-2026-roadmap' },
        { title: 'Mechanics of Success', category: 'Physics', slug: 'physics-high-yield-mechanics' }
      ]}
      content={`
        <h2>Mechanisms over Memorization</h2>
        <p>Do not memorize 500 named reactions. That is a recipe for failure in JEE Advanced. Instead, master the movement of electrons. If you understand <strong>nucleophiles</strong> and <strong>electrophiles</strong>, you can derive almost any reaction on the spot.</p>
        
        <h3>The Electronic Logic</h3>
        <p>Organic Chemistry is a story of charge imbalance. Electrons move from where they are (Lone pairs, π-bonds) to where they want to be. Once you see this "electron flow," the mechanisms become intuitive.</p>
        
        <h3>The Reagent Protocol</h3>
        <p>Categorize your reagents by their functionality: Oxidizing agents, Reducing agents, Carbanion-formers, and Leaving groups.</p>
      `}
    />
  );
}
