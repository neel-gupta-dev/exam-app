import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto glass-card p-8 sm:p-12">
        <h1 className="text-3xl font-bold text-white mb-6 font-[family-name:var(--font-heading)]">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-8">Last updated: April 2026</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p className="mb-3">
              When you use the College Predictor, we collect the following information to provide you with accurate predictions and improve our service:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li><strong>Personal Information:</strong> Your name.</li>
              <li><strong>Academic Data:</strong> Your JEE Mains rank, JEE Advanced rank, BITSAT score, category, home state, and gender.</li>
              <li><strong>Preferences:</strong> Your selected branch preferences and college lifestyle preferences (city life, placements, reputation, campus life).</li>
              <li><strong>Device Information:</strong> Browser type, operating system, language, and screen resolution.</li>
              <li><strong>Network Information:</strong> Your IP address (for security and rate-limiting purposes).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect for the following purposes:</p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>To generate accurate college predictions based on your ranks and preferences.</li>
              <li>To understand user demographics and trends to improve the Vayl platform.</li>
              <li>To protect against malicious activity and bots.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Data Security and Storage</h2>
            <p className="text-gray-400">
              Your data is stored securely in our databases. We implement standard industry practices to protect your data from unauthorized access, alteration, or disclosure. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Third-Party Services</h2>
            <p className="text-gray-400 mb-3">
              We use the following third-party services which may collect data in accordance with their own privacy policies:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-400">
              <li>
                <strong>Google reCAPTCHA v3:</strong> Used to prevent spam and bots. Your use of reCAPTCHA is subject to the Google <a href="https://policies.google.com/privacy" className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">Privacy Policy</a> and <a href="https://policies.google.com/terms" className="text-blue-400 hover:underline" target="_blank" rel="noreferrer">Terms of Service</a>.
              </li>
              <li><strong>Vercel:</strong> Our hosting provider, which may log basic network request data.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Contact Us</h2>
            <p className="text-gray-400">
              If you have any questions or concerns about this Privacy Policy or wish to request the deletion of your data, please contact us at support@vayl.in.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
