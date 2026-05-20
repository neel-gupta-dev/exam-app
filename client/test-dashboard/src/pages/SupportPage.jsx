const supportCards = [
  ['Test did not open', 'Allow pop-ups for this site, then start the test again from Tests.'],
  ['Answers not saving', 'Keep the test window open and connected. Submission is blocked if the latest save fails.'],
  ['Result missing', 'Open Analytics after submission. If evaluation is still running, refresh after a short wait.'],
  ['Need admin help', 'Share the test title, account name, and approximate attempt time with your institute admin.'],
];

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Help Center</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">Support</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base">
          Fast guidance for common CBT issues before, during, and after a test.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {supportCards.map(([title, body]) => (
          <article key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <span className="material-symbols-outlined rounded-2xl bg-indigo-50 p-3 text-indigo-600">support_agent</span>
            <h2 className="mt-5 text-lg font-black text-slate-950">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-950">Contact Support</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              For platform issues, write to support with your account name and test title.
            </p>
          </div>
          <a href="mailto:support@vayl.in" className="inline-flex items-center justify-center rounded-2xl border border-slate-950 bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-slate-800">
            support@vayl.in
          </a>
        </div>
      </section>
    </div>
  );
}
