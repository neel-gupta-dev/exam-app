import type { Metadata } from "next";
import React from 'react';

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Vayl College Predictor terms of service. Understand your rights and responsibilities when using our free JEE college prediction tool.",
  alternates: { canonical: "https://predictor.vayl.in/terms" },
  robots: { index: true, follow: true },
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto glass-card p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-white mb-6 font-[family-name:var(--font-heading)]">Terms of Service</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: April 2026</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-400">
              By accessing and using the Vayl College Predictor ("the Service"), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
            <p className="text-gray-400">
              The Service provides predictive algorithms to estimate potential college admissions based on user-provided academic ranks (e.g., JEE Mains, JEE Advanced, BITSAT) and historical cutoff data. 
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Disclaimer of Accuracy</h2>
            <p className="text-gray-400">
              <strong>The Service is predictive and for informational purposes only.</strong> The results provided are estimates based on historical data and do not guarantee admission into any specific institute, branch, or program. Actual cutoffs fluctuate annually based on numerous external factors. You should not make critical academic or financial decisions solely based on the results provided by this Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. User Responsibilities</h2>
            <p className="text-gray-400">
              You agree to provide accurate information when using the Service. You agree not to misuse the Service, attempt to bypass our security measures (including reCAPTCHA), or use automated scripts to scrape or mass-query the Service without explicit permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Limitation of Liability</h2>
            <p className="text-gray-400">
              In no event shall Vayl, its founders, or affiliates be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with your use of the Service, including but not limited to decisions made during college counseling processes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Changes to Terms</h2>
            <p className="text-gray-400">
              We reserve the right to modify these Terms of Service at any time. Your continued use of the Service after any changes constitutes your acceptance of the new Terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
