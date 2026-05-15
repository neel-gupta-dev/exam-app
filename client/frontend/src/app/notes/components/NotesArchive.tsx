"use client";

import { useState } from "react";
import { Search, FileText } from "lucide-react";
import Link from "next/link";
import { PdfDocument } from "../lib/getPdfs";

export default function NotesArchive({ initialPdfs }: { initialPdfs: PdfDocument[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPdfs = initialPdfs.filter((pdf) =>
    pdf.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
      {/* Search Bar */}
      <div className="relative w-full max-w-xl mb-12 group">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-surface-bright border border-outline-variant/60 rounded-xl outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm text-on-surface placeholder:text-on-surface-variant transition-all"
          placeholder="Search for notes (e.g. Aliphatic Chart)..."
        />
      </div>

      {/* PDF Grid */}
      {filteredPdfs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-4 sm:px-0">
          {filteredPdfs.map((pdf) => (
            <div
              key={pdf.id}
              className="flex flex-col p-6 bg-surface-bright border border-outline-variant/30 rounded-2xl shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden"
            >
              {/* Top Accent line */}
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 group-hover:bg-primary transition-colors" />

              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-primary/10 rounded-xl text-primary">
                  <FileText size={24} />
                </div>
                <span className="text-xs font-interface font-medium px-2.5 py-1 bg-surface-variant text-on-surface-variant rounded-full">
                  PDF
                </span>
              </div>

              <h3 className="text-lg font-montserrat font-semibold text-on-surface mb-2 line-clamp-2">
                {pdf.title}
              </h3>

              <div className="mt-auto pt-4 flex items-center justify-between border-t border-outline-variant/20">
                <span className="text-sm font-interface text-on-surface-variant">
                  {pdf.dateAdded}
                </span>

                <Link
                  href={`/notes/doc/${pdf.slug}`}
                  className="text-sm font-interface font-medium text-primary hover:text-primary-dim transition-colors flex items-center gap-1"
                >
                  Open <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surface-variant text-on-surface-variant mb-4">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-montserrat font-medium text-on-surface mb-2">
            No notes found
          </h3>
          <p className="text-on-surface-variant">
            We couldn't find any PDF matching "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
