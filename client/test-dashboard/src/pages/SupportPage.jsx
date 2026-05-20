import { motion } from 'framer-motion';

const supportCards = [
  {
    title: 'Test did not open',
    body: 'Allow pop-ups for this site, then start the test again from Tests.',
    icon: 'open_in_new',
    color: 'text-sky-600',
    bg: 'bg-sky-50',
  },
  {
    title: 'Answers not saving',
    body: 'Keep the test window open and connected. Submission is blocked if the latest save fails.',
    icon: 'save',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  {
    title: 'Result missing',
    body: 'Open Analytics after submission. If evaluation is still running, refresh after a short wait.',
    icon: 'analytics',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    title: 'Need admin help',
    body: 'Share the test title, account name, and approximate attempt time with your institute admin.',
    icon: 'support_agent',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 p-6 shadow-sm md:p-8"
      >
        <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="relative">
          <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-sky-700">Help Center</span>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl font-headline">Support</h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">
            Fast guidance for common CBT issues before, during, and after a test.
          </p>
        </div>
      </motion.section>

      {/* FAQ Cards */}
      <motion.section variants={container} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2">
        {supportCards.map(({ title, body, icon, color, bg }) => (
          <motion.article
            key={title}
            variants={cardItem}
            whileHover={{ y: -2, boxShadow: '0 8px 30px -8px rgba(99,102,241,0.1)' }}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${bg}`}>
              <span className={`material-symbols-outlined ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
            </div>
            <h2 className="mt-4 text-lg font-black text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
          </motion.article>
        ))}
      </motion.section>

      {/* Contact */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden rounded-3xl border border-sky-100 bg-white p-6 shadow-sm"
      >
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-sky-100/50 blur-2xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-sky-600" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
              <h2 className="text-xl font-black text-slate-900">Contact Support</h2>
            </div>
            <p className="text-sm leading-6 text-slate-500">
              For platform issues, write to support with your account name and test title.
            </p>
          </div>
          <motion.a
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.97 }}
            href="mailto:support@vayl.in"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-sky-200 transition hover:bg-sky-700 hover:shadow-xl"
          >
            <span className="material-symbols-outlined text-base">mail</span>
            support@vayl.in
          </motion.a>
        </div>
      </motion.section>
    </div>
  );
}
