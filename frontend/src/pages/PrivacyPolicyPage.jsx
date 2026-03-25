import Navbar from "./Navbar";
import Footer from "./Footer";

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Privacy Policy
        </h1>
        <p className="max-w-2xl mx-auto text-lg">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
        </p>
      </section>

      {/* CONTENT */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow space-y-8">

          {/* INTRO */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
            <p className="text-gray-600">
              Welcome to Alveoly AI Licensure Prep. We are committed to protecting your personal data and your privacy.
              This Privacy Policy explains how we handle your information when you use our platform.
            </p>
          </div>

          {/* DATA COLLECTION */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">2. Information We Collect</h2>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>Personal information (name, email address, account details)</li>
              <li>Payment information processed securely via Paystack</li>
              <li>Usage data (pages visited, features used)</li>
              <li>Device and browser information</li>
            </ul>
          </div>

          {/* HOW WE USE */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>To provide and improve our services</li>
              <li>To personalize your learning experience</li>
              <li>To process payments and subscriptions</li>
              <li>To communicate updates and support messages</li>
            </ul>
          </div>

          {/* PAYMENTS */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">4. Payments</h2>
            <p className="text-gray-600">
              All payments are securely processed through Paystack. We do not store your card or financial details on our servers.
            </p>
          </div>

          {/* DATA SHARING */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">5. Data Sharing</h2>
            <p className="text-gray-600">
              We do not sell your personal data. We may share limited information with trusted third-party services
              such as payment providers and analytics tools to operate our platform effectively.
            </p>
          </div>

          {/* DATA SECURITY */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">6. Data Security</h2>
            <p className="text-gray-600">
              We implement industry-standard security measures to protect your data. However, no system is completely secure,
              and we cannot guarantee absolute protection.
            </p>
          </div>

          {/* USER RIGHTS */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">7. Your Rights</h2>
            <ul className="list-disc ml-6 text-gray-600 space-y-2">
              <li>You can access, update, or delete your personal data</li>
              <li>You can unsubscribe from communications at any time</li>
              <li>You can request a copy of your stored data</li>
            </ul>
          </div>

          {/* COOKIES */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">8. Cookies</h2>
            <p className="text-gray-600">
              We use cookies to enhance your experience, analyze traffic, and improve our services.
            </p>
          </div>

          {/* CHANGES */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">9. Changes to This Policy</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. Any changes will be posted on this page.
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <h2 className="text-2xl font-semibold mb-2">10. Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us through our Contact page.
            </p>
          </div>

          <p className="text-sm text-gray-400 text-center">
            Last updated: {new Date().getFullYear()}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;