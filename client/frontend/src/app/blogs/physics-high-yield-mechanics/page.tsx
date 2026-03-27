import BlogArticle from "@/components/BlogArticle";

export default function Page() {
  return (
    <BlogArticle
      slug="physics-high-yield-mechanics"
      title="Mechanics of Success: Breaking Down High-Yield Physics"
      category="Physics"
      date="March 24, 2024"
      readTime="10 min"
      takeaways={['FBD visualization', 'Conservation laws mastery', 'Trunk-to-leaf learning']}
      related={[
        { title: 'Organic Synthesis Mastery', category: 'Chemistry', slug: 'mastering-organic-chemistry' },
        { title: 'The Definitive 2026 Roadmap', category: 'Strategy', slug: 'the-jee-2026-roadmap' }
      ]}
      content={`
        <h2>The Law of High Yield</h2>
        <p>Mechanics is the trunk of the Physics tree. If your mechanics is weak, Electrodynamics, Magnetism, and even Modern Physics will inevitably suffer. Treat Newton's Laws and Rotational Dynamics as your primary tools of trade.</p>
        
        <h3>The FBD Protocol</h3>
        <p>Never solve a physics problem without a Free Body Diagram. The FBD is the architectural blueprint of the problem. If the blueprint is wrong, the building will fall.</p>
        
        <h3>The Conservation Framework</h3>
        <p>Whenever you are stuck, look for constants. Conservation of Momentum, Energy, and Angular Momentum are the "cheat codes" of JEE Physics.</p>
      `}
    />
  );
}
