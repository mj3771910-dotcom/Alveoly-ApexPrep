import Navbar from "./Navbar";
import Footer from "./Footer";

const RefundPolicyPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col text-gray-800">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 text-center">
        <h1 className="text-4xl font-bold">Refund Policy</h1>
        <p className="mt-4">Our policy on payments and refunds.</p>
      </section>

      <section className="max-w-4xl mx-auto bg-white p-8 my-16 rounded-xl shadow space-y-6">
        
        <div>
          <h2 className="text-xl font-semibold">1. Subscription Payments</h2>
          <p className="text-gray-600">
            All subscription payments are processed securely via Paystack and are billed according to your selected plan.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">2. Refund Eligibility</h2>
          <p className="text-gray-600">
            Refunds may be granted within 7 days of purchase if no significant usage of the platform has occurred.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">3. Non-Refundable Cases</h2>
          <ul className="list-disc ml-6 text-gray-600">
            <li>After extensive usage of premium features</li>
            <li>After the refund window has passed</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">4. Requesting a Refund</h2>
          <p className="text-gray-600">
            To request a refund, contact our support team with your payment details.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">5. Processing Time</h2>
          <p className="text-gray-600">
            Approved refunds will be processed within 5–10 business days.
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

export default RefundPolicyPage;