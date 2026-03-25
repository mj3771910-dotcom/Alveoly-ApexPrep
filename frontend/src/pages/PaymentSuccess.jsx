import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";

const PaymentSuccess = () => {
  const { search } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const reference = params.get("reference");
    const courseId = params.get("courseId");

    if (!reference) return;

    const verify = async () => {
      try {
        await axios.get(`/payments/verify?reference=${reference}`);

        alert("✅ Payment successful! Subject unlocked.");

        // ✅ go back WITH courseId
        navigate(`/student/subjects?course=${courseId}`);

      } catch (err) {
        console.error(err);
        alert("Verification failed");
      }
    };

    verify();
  }, [search]);

  return (
    <h2 className="text-center mt-10 text-lg font-semibold">
      Verifying payment...
    </h2>
  );
};

export default PaymentSuccess;