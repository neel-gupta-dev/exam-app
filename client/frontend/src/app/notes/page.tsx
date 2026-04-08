export default function NotesPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 lg:p-24 bg-surface text-on-surface">
      <div className="z-10 max-w-5xl w-full text-center">
        <h1 className="text-5xl font-bold font-montserrat text-primary mb-6">Vayl Notes</h1>
        <p className="text-xl font-poppins text-on-surface/80">
          Curated, high-yield study material and PYQs for elite academic preparation.
        </p>
        <div className="mt-12 inline-block rounded-full bg-primary/10 px-6 py-2 border border-primary/20">
          <span className="font-hanken text-primary font-medium">Coming Soon</span>
        </div>
      </div>
    </main>
  );
}
