import type { Metadata } from "next";
import React from 'react';
import { Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Vayl College Predictor support. Email us at support@vayl.in for questions about our JEE college prediction tool, data requests, or feedback.",
  alternates: { canonical: "https://predictor.vayl.in/contact" },
  robots: { index: true, follow: true },
};


export default function ContactPage() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-2xl mx-auto glass-card p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-white mb-3 font-[family-name:var(--font-heading)]">Contact Us</h1>
        <p className="text-gray-400 mb-10">
          Have a question, found an issue, or want to share feedback? We&apos;d love to hear from you.
        </p>

        <div className="flex items-start gap-4 p-5 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-300 mb-1">Email Support</p>
            <a
              href="mailto:support@vayl.in"
              className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
            >
              support@vayl.in
            </a>
            <p className="text-xs text-gray-500 mt-2">
              We typically respond within 24–48 hours on business days.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-navy-700 text-sm text-gray-500 space-y-2">
          <p>For data deletion or privacy-related requests, please mention it in the subject line.</p>
          <p>
            See our{' '}
            <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>
            {' '}and{' '}
            <a href="/terms" className="text-blue-400 hover:underline">Terms of Service</a>
            {' '}for more information.
          </p>
        </div>
      </div>
    </div>
  );
}
