import { useEffect } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

const PaymentSuccessful = () => {
  const { setUser } = useAuth();

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const reference = params.get("reference");

      if (!reference) return;

      const res = await axios.get(`/payments/verify?reference=${reference}`);

      // ✅ Refresh user data (auto login state update)
      const userRes = await axios.get("/auth/me");
      setUser(userRes.data);

      window.location.href = "/dashboard";
    };

    verify();
  }, []);

  return <p>Processing payment...</p>;
};

export default PaymentSuccessful;