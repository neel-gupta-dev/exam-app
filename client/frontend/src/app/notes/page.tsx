import { getPdfs } from "./lib/getPdfs";
import NotesArchive from "./components/NotesArchive";
import Image from "next/image";
import Link from "next/link";

export default async function NotesPage() {
  const pdfs = await getPdfs();

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10 h-14 flex items-center px-6">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/vayl-logo.png" alt="Vayl" width={28} height={28} className="object-contain" />
            <span className="text-base font-heading font-black tracking-widest text-on-surface uppercase italic">Vayl Notes</span>
          </Link>
          <div className="flex items-center gap-6 text-xs font-interface font-black uppercase tracking-widest text-on-surface-variant">
            <Link href="/" className="hover:text-primary transition-colors hidden sm:block">Home</Link>
            <a href="https://predictor.vayl.in" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
              🎓 College Predictor
            </a>
            <Link href="/signup" className="px-4 py-1.5 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-opacity">
              Join Vayl
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex min-h-screen flex-col items-center p-6 pt-24 lg:p-24 lg:pt-28 bg-surface text-on-surface">
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
    </>
  );
}
