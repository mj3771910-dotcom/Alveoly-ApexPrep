import { useEffect, useState } from "react";
import axios from "../api/axios";
import { FaTrash, FaCheck, FaTimes, FaDownload } from "react-icons/fa";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);

  const fetchPayments = async () => {
    try {
      const res = await axios.get("/payments");
      setPayments(res.data);
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payment?")) return;

    try {
      await axios.delete(`/payments/${id}`);
      setPayments((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getPlanStatus = (payment) => {
    if (!payment.planId) return "-";

    if (payment.planId.expiresAt) {
      const expiresAt = new Date(payment.planId.expiresAt);
      return expiresAt > new Date() ? "Active" : "Expired";
    }

    return "Active";
  };

  const exportCSV = () => {
    const headers = [
      "Student",
      "Email",
      "Type",
      "Title",
      "Amount",
      "Payment Status",
      "Plan Status",
      "Date",
    ];

    const rows = payments.map((p) => [
      p.student || "N/A",
      p.email || "N/A",
      p.type || "N/A",
      p.title || "N/A",
      p.amount,
      p.status,
      getPlanStatus(p),
      new Date(p.date).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "all_payments.csv";
    link.click();
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          💳 Payments Overview
        </h2>

        <button
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition w-full sm:w-auto"
        >
          <FaDownload />
          Export CSV
        </button>
      </div>

      {/* ================= MOBILE VIEW ================= */}
      <div className="md:hidden space-y-4">
        {payments.length === 0 && (
          <p className="text-center text-gray-400">No payments found.</p>
        )}

        {payments.map((p) => (
          <div
            key={p._id}
            className="bg-white p-4 rounded-xl shadow space-y-2"
          >
            <div className="flex justify-between">
              <h3 className="font-semibold">{p.student || "N/A"}</h3>
              <span className="text-sm text-gray-500">
                ₵{p.amount}
              </span>
            </div>

            <p className="text-sm text-gray-600">{p.email}</p>

            <p className="text-sm">
              <strong>Type:</strong> {p.type || "N/A"}
            </p>

            <p className="text-sm">
              <strong>Title:</strong> {p.title || "N/A"}
            </p>

            {/* STATUS */}
            <div className="flex gap-2 flex-wrap">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  p.status === "success"
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {p.status}
              </span>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  getPlanStatus(p) === "Active"
                    ? "bg-green-100 text-green-600"
                    : getPlanStatus(p) === "Expired"
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {getPlanStatus(p)}
              </span>
            </div>

            <p className="text-xs text-gray-400">
              {new Date(p.date).toLocaleDateString()}
            </p>

            <button
              onClick={() => handleDelete(p._id)}
              className="w-full mt-2 bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-2"
            >
              <FaTrash />
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-white rounded-xl shadow border overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
            <tr>
              <th className="p-4 text-left">Student</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Payment</th>
              <th className="p-4 text-left">Plan</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-t hover:bg-gray-50">
                <td className="p-4">{p.student || "N/A"}</td>
                <td className="p-4">{p.email || "N/A"}</td>
                <td className="p-4">{p.type || "N/A"}</td>
                <td className="p-4">{p.title || "N/A"}</td>
                <td className="p-4 font-semibold">₵{p.amount}</td>

                <td className="p-4">
                  {p.status === "success" ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <FaCheck /> Success
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-600">
                      <FaTimes /> {p.status}
                    </span>
                  )}
                </td>

                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      getPlanStatus(p) === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {getPlanStatus(p)}
                  </span>
                </td>

                <td className="p-4 text-gray-500">
                  {new Date(p.date).toLocaleDateString()}
                </td>

                <td className="p-4">
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded-lg text-xs"
                  >
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {payments.length === 0 && (
          <p className="text-center text-gray-400 py-6">
            No payments found.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;