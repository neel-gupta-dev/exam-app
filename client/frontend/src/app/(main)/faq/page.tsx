import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Vayl",
  description: "Find answers to commonly asked questions about Vayl, the JEE ecosystem, our apps, and how we help students achieve their dream college.",
};

export default function FAQPage() {
  const faqs = [
    {
      question: "What is Vayl?",
      answer: "Vayl is a comprehensive educational ecosystem built specifically for JEE aspirants. It is designed to modernize test prep with gamified tracking, high-yield analytics, and an expanding suite of interconnected applications to cover every aspect of your preparation journey.",
    },
    {
      question: "What apps are included in the Vayl Ecosystem?",
      answer: "The Vayl ecosystem consists of multiple specialized platforms:\n\n1. Vayl Tracker (Main App): Your central hub for gamified syllabus tracking, daily goals, productivity analytics, and flashcards.\n2. JEE Battle (battle.vayl.in): A real-time 1v1 multiplayer platform to solve JEE questions under time pressure against friends or random opponents.\n3. Vayl College Predictor (predictor.vayl.in): An AI-powered tool that uses historical JoSAA, CSAB, and BITSAT data to predict your admission chances at top engineering colleges.\n4. Vayl Assessments: A proctored testing environment for high-quality mock exams.",
    },
    {
      question: "Is Vayl free to use?",
      answer: "Yes, the core tracking features, JEE Battle, and the College Predictor are currently completely free to use without any paywalls.",
    },
    {
      question: "Do I need a separate account for each app?",
      answer: "No! Vayl is building a unified ecosystem. You use a single Vayl account (powered by Google Auth) to seamlessly access the Tracker, JEE Battle, and our other authenticated applications.",
    },
    {
      question: "How does the gamified tracking work?",
      answer: "As you complete syllabus topics, review flashcards, and hit your daily study goals, you earn XP and level up. This helps maintain consistency, turning your rigorous preparation into an engaging, rewarding experience.",
    },
    {
      question: "How accurate is the College Predictor?",
      answer: "Our predictor strictly uses the official closing ranks published by JoSAA and CSAB from previous years, across all categories and seat types. While cutoffs fluctuate every year, it provides highly reliable, data-backed estimations of your chances.",
    },
    {
      question: "How can I report a bug or request a feature?",
      answer: "We love community feedback! You can reach out to us via our 'Contact Us' page, or join our community discussions on the r/Vayl subreddit to suggest features directly to our development team.",
    }
  ];

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-4xl mx-auto px-4 py-24 sm:py-32 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Everything you need to know about Vayl, our ecosystem, and how we help you conquer the JEE.
          </p>
        </div>

        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-[#16191f] border border-white/5 p-6 md:p-8 rounded-2xl shadow-xl hover:border-white/10 transition-colors">
              <h3 className="text-xl font-bold text-white mb-4 flex items-start gap-3">
                <span className="text-indigo-400 text-2xl leading-none font-black opacity-50">Q.</span>
                {faq.question}
              </h3>
              <div className="text-gray-400 leading-relaxed whitespace-pre-line pl-9">
                {faq.answer}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center p-8 bg-blue-500/5 rounded-2xl border border-blue-500/10">
          <h2 className="text-xl font-bold text-white mb-2">Still have questions?</h2>
          <p className="text-gray-400 mb-6">We&apos;re always here to help you navigate your preparation journey.</p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
