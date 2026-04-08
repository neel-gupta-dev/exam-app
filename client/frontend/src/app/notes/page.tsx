import { getPdfs } from "./lib/getPdfs";
import NotesArchive from "./components/NotesArchive";

export default async function NotesPage() {
  const pdfs = await getPdfs();

  return (
    <main className="flex min-h-screen flex-col items-center p-6 pt-16 lg:p-24 bg-surface text-on-surface">
      <div className="z-10 max-w-5xl w-full text-center mb-16">
        <h1 className="text-5xl font-bold font-montserrat text-primary mb-6">
          Vayl Notes
        </h1>
        <p className="text-xl font-poppins text-on-surface/80">
          Curated, high-yield study material and PYQs for elite academic preparation.
        </p>
      </div>

      <NotesArchive initialPdfs={pdfs} />
    </main>
  );
}
