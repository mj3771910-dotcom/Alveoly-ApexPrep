import Navbar from "./Navbar";
import Footer from "./Footer";

const TermsConditionsPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col text-gray-800">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 text-center">
        <h1 className="text-4xl font-bold">Terms & Conditions</h1>
        <p className="mt-4">Please read these terms carefully before using Alveoly AI.</p>
      </section>

      <section className="max-w-4xl mx-auto bg-white p-8 my-16 rounded-xl shadow space-y-6">
        
        <div>
          <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
          <p className="text-gray-600">
            By accessing and using Alveoly AI, you agree to comply with these terms and all applicable laws.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">2. Use of Services</h2>
          <p className="text-gray-600">
            You agree to use our platform for lawful educational purposes only. Misuse of the system may result in account suspension.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">3. Account Responsibility</h2>
          <p className="text-gray-600">
            You are responsible for maintaining the confidentiality of your account and password.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">4. Payments & Subscriptions</h2>
          <p className="text-gray-600">
            Payments are processed securely via Paystack. Subscription fees are billed based on your selected plan.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">5. Intellectual Property</h2>
          <p className="text-gray-600">
            All content, materials, and resources on this platform are owned by Alveoly AI and may not be reproduced without permission.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">6. Termination</h2>
          <p className="text-gray-600">
            We reserve the right to suspend or terminate accounts that violate our terms.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">7. Changes to Terms</h2>
          <p className="text-gray-600">
            We may update these terms at any time. Continued use of the platform means acceptance of the updated terms.
          </p>
        </div>

        <p className="text-sm text-gray-400 text-center">
          Last updated: {new Date().getFullYear()}
        </p>
      </section>

      <Footer />
    </div>
  );
};

export default TermsConditionsPage;