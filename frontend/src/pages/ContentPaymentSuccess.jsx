// pages/ContentPaymentSuccess.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";

const ContentPaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(location.search);
      const reference = urlParams.get('reference');
      const contentId = urlParams.get('contentId');
      
      if (!reference) {
        toast.error("No payment reference found");
        navigate(-1);
        return;
      }
      
      try {
        const res = await axios.post("/content-payments/verify", {
          reference: reference,
          contentId: contentId,
        });
        
        if (res.data.success) {
          setSuccess(true);
          toast.success("Payment successful! Content unlocked.");
          
          // Get the subjectId from localStorage or redirect back
          const subjectId = localStorage.getItem('current_subject_id');
          localStorage.removeItem('payment_session_id');
          localStorage.removeItem('current_subject_id');
          
          setTimeout(() => {
            if (subjectId) {
              navigate(`/student/lessons/${subjectId}`);
            } else {
              navigate(-2);
            }
          }, 2000);
        } else {
          toast.error("Payment verification failed");
          setTimeout(() => navigate(-1), 2000);
        }
      } catch (err) {
        console.error("Verification error:", err);
        toast.error("Failed to verify payment");
        setTimeout(() => navigate(-1), 2000);
      } finally {
        setVerifying(false);
      }
    };
    
    verifyPayment();
  }, [location, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
        {verifying ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Verifying Payment...</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your payment.</p>
          </>
        ) : success ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your content has been unlocked.</p>
            <button
              onClick={() => navigate(-2)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Return to Lessons
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h2>
            <p className="text-gray-600 mb-6">Something went wrong with your payment.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ContentPaymentSuccess;