import Navbar from "./Navbar";
import Footer from "./Footer";

const CookiePolicyPage = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col text-gray-800">
      <Navbar />

      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 text-center">
        <h1 className="text-4xl font-bold">Cookie Policy</h1>
        <p className="mt-4">How we use cookies to improve your experience.</p>
      </section>

      <section className="max-w-4xl mx-auto bg-white p-8 my-16 rounded-xl shadow space-y-6">
        
        <div>
          <h2 className="text-xl font-semibold">1. What Are Cookies?</h2>
          <p className="text-gray-600">
            Cookies are small data files stored on your device to improve your browsing experience.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">2. How We Use Cookies</h2>
          <ul className="list-disc ml-6 text-gray-600">
            <li>To remember your login session</li>
            <li>To analyze site traffic</li>
            <li>To personalize your experience</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold">3. Third-Party Cookies</h2>
          <p className="text-gray-600">
            We may use trusted third-party services like analytics and payment providers that use cookies.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">4. Managing Cookies</h2>
          <p className="text-gray-600">
            You can control or disable cookies through your browser settings.
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

export default CookiePolicyPage;