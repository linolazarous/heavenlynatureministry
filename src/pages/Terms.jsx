// src/pages/Terms.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms & Conditions</h1>
          <p className="text-lg text-gray-600">Effective date: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing and using Heavenly Nature Ministry's website and services, 
                you accept and agree to be bound by these Terms and Conditions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. Donations</h2>
              <p className="text-gray-700 mb-4">All donations made through our platform are subject to the following terms:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Donations are voluntary and non-refundable</li>
                <li>We provide electronic receipts for all donations</li>
                <li>Donations are used to support our ministry programs and operations</li>
                <li>We reserve the right to refuse any donation that doesn't align with our mission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content on this website, including text, graphics, logos, and images, 
                is the property of Heavenly Nature Ministry and protected by copyright laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. User Conduct</h2>
              <p className="text-gray-700 mb-4">You agree not to:</p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Use the website for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to any part of the website</li>
                <li>Interfere with the proper functioning of the website</li>
                <li>Submit false or misleading information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. Limitation of Liability</h2>
              <p className="text-gray-700">
                Heavenly Nature Ministry shall not be liable for any indirect, incidental, 
                special, or consequential damages resulting from the use or inability to use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Changes to Terms</h2>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. Continued use of our 
                services after changes constitutes acceptance of the modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. Governing Law</h2>
              <p className="text-gray-700">
                These terms shall be governed by and construed in accordance with the laws of South Sudan.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about these Terms & Conditions, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> info@heavenlynature.org</p>
                <p className="text-gray-700"><strong>Phone:</strong> +211 926 006 202</p>
              </div>
            </section>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-green-600 hover:text-green-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
