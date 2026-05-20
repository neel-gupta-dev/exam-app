import React from 'react';
import { motion } from 'framer-motion';

export default function TermsPage() {
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
          <h1 className="text-4xl font-black tracking-tight text-slate-900 font-headline">Terms of Service</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm space-y-10"
        >
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 font-headline">1. Acceptance of Terms</h2>
            <p className="text-sm leading-7 text-slate-600">
              By accessing, registering for, or using the Vayl CBT Platform (the "Service"), you agree to be bound by these Terms of Service. If you are using the Service on behalf of an educational institution, you represent that you have the authority to bind that institution to these terms. If you disagree with any part of the terms, you must discontinue use immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 font-headline">2. Platform Usage & Academic Integrity</h2>
            <div className="space-y-4 text-sm leading-7 text-slate-600">
              <p>The Service is designed to simulate authentic testing environments for educational and preparational purposes. You agree to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Maintain strict academic integrity during assessments and mock examinations.</li>
                <li>Not use automated scripts, bots, or unauthorized software to answer questions or manipulate telemetry data.</li>
                <li>Not engage in behavior that disrupts the server infrastructure or degrades the testing experience for other users.</li>
              </ul>
              <p>Violation of these rules may result in immediate score invalidation and account termination.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 font-headline">3. Account Responsibilities</h2>
            <p className="text-sm leading-7 text-slate-600">
              You are solely responsible for safeguarding your account credentials. You must immediately notify us of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to protect your login information. Shared accounts are strictly prohibited unless explicitly authorized under a B2B institutional license.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 font-headline">4. Intellectual Property</h2>
            <p className="text-sm leading-7 text-slate-600">
              All materials provided on the Service, including but not limited to test questions, solutions, interface design, source code, and analytics algorithms, are the intellectual property of Vayl or our educational partners. You are granted a limited, non-exclusive, non-transferable license to use the Service for personal study. You may not scrape, copy, reproduce, distribute, or commercially exploit any platform content without explicit written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 font-headline">5. Limitation of Liability</h2>
            <p className="text-sm leading-7 text-slate-600">
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. While we strive for accuracy, we make no warranties regarding the absolute correctness of test questions, the uninterrupted availability of the platform, or the guarantee of real-world exam results based on your mock performance. In no event shall Vayl be liable for any indirect, incidental, or consequential damages arising from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-900 mb-4 font-headline">6. Account Termination</h2>
            <p className="text-sm leading-7 text-slate-600">
              We reserve the right to suspend or terminate your account immediately, without prior notice or liability, for any material breach of these Terms. Upon termination, your right to use the Service will cease immediately, and your testing data may be permanently archived or deleted.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
