import axios from "../api/axios";

const PaystackPayment = ({ plan }) => {
  const handlePayment = async () => {
    try {
      const res = await axios.post("/payments/initiate-plan", {
        planId: plan._id,
      });

      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    }
  };

  return (
    <button
      onClick={handlePayment}
      className="bg-blue-600 text-white py-3 px-6 rounded-lg"
    >
      Pay ₵{plan.price}
    </button>
  );
};

export default PaystackPayment;