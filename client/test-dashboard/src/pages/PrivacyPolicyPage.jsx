import React from 'react';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <a href="/" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition mb-6">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Home
          </a>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 font-headline">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm space-y-10"
        >
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 font-headline">1. Information We Collect</h2>
            <div className="space-y-4 text-sm leading-7 text-slate-600">
              <p>We collect several types of information from and about users of our platform, including:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Personal Identifiers:</strong> Name, email address, profile picture (if linked via Google), and account credentials.</li>
                <li><strong>Academic & Testing Data:</strong> Test scores, question-level accuracy, subjects attempted, and overall performance metrics.</li>
                <li><strong>Behavioral Telemetry:</strong> Time spent per question, device information, browser type, and interaction patterns during active test sessions.</li>
                <li><strong>Institutional Data:</strong> For students enrolled via coaching institutes (B2B), we may collect batch IDs, enrollment numbers, and instructor assignments.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 font-headline">2. How We Use Your Information</h2>
            <div className="space-y-4 text-sm leading-7 text-slate-600">
              <p>The information we collect is strictly used to provide, maintain, and improve our educational services. Specifically, we use it to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Generate detailed, personalized performance analytics and insights.</li>
                <li>Maintain competitive, anonymized leaderboards and percentile rankings.</li>
                <li>Ensure academic integrity and prevent fraudulent behavior during test attempts.</li>
                <li>Communicate important account updates, service changes, or technical notices.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 font-headline">3. Data Sharing and Disclosure</h2>
            <div className="space-y-4 text-sm leading-7 text-slate-600">
              <p>We prioritize your privacy and do not sell your personal data to third-party marketers. We only share information under the following circumstances:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Coaching Institutes (B2B):</strong> If your account is provisioned by or linked to an educational institution, your test results and analytics are shared directly with your institution's administrators and instructors.</li>
                <li><strong>Service Providers:</strong> We may share data with trusted cloud hosting providers, database managers, and analytics platforms strictly for operational purposes.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required to do so by law or in response to valid requests by public authorities.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 font-headline">4. Data Security & Retention</h2>
            <p className="text-sm leading-7 text-slate-600">
              We implement robust, industry-standard security measures, including encryption in transit and at rest, to protect your personal data from unauthorized access, alteration, or disclosure. We retain your performance data for as long as your account remains active to provide historical analytics. You may request account deletion at any time, which will permanently anonymize or erase your testing history.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 font-headline">5. Changes to This Policy</h2>
            <p className="text-sm leading-7 text-slate-600">
              We may update our Privacy Policy periodically to reflect changes in our practices or legal obligations. We will notify you of any material changes by posting the new Privacy Policy on this page and updating the "Last updated" date. Continued use of the platform constitutes your acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 font-headline">6. Contact Us</h2>
            <p className="text-sm leading-7 text-slate-600">
              If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact our privacy team at <a href="mailto:support@vayl.in" className="font-semibold text-indigo-600 hover:text-indigo-700 transition">support@vayl.in</a>.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
