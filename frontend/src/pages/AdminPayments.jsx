import { useEffect, useState } from "react";
import axios from "../api/axios";
import { FaTrash, FaCheck, FaTimes, FaDownload } from "react-icons/fa";

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);

  // ================= FETCH =================
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

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this payment?")) return;

    try {
      await axios.delete(`/payments/${id}`);
      setPayments((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ================= PLAN STATUS =================
  const getPlanStatus = (payment) => {
    if (!payment.planId) return "-";

    if (payment.planId.expiresAt) {
      const expiresAt = new Date(payment.planId.expiresAt);
      return expiresAt > new Date() ? "Active" : "Expired";
    }

    return "Active";
  };

  // ================= EXPORT CSV =================
  const exportCSV = () => {
    const headers = [
      "Student",
      "Email",
      "Type",
      "Title / Subject",
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
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          💳 Payments Overview
        </h2>

        <button
          onClick={exportCSV}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          <FaDownload />
          Export CSV
        </button>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Type</th>
                <th className="p-4 text-left">Title / Subject</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Payment</th>
                <th className="p-4 text-left">Plan</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {payments.map((p) => (
                <tr
                  key={p._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4 font-medium">
                    {p.student || "N/A"}
                  </td>

                  <td className="p-4 text-gray-600">
                    {p.email || "N/A"}
                  </td>

                  <td className="p-4 capitalize">
                    {p.type || "N/A"}
                  </td>

                  <td className="p-4">
                    {p.title || "N/A"}
                  </td>

                  <td className="p-4 font-semibold">
                    ₵{p.amount}
                  </td>

                  {/* PAYMENT STATUS */}
                  <td className="p-4">
                    {p.status === "success" ? (
                      <span className="flex items-center gap-1 text-green-600 font-medium">
                        <FaCheck className="text-xs" />
                        Success
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600 font-medium">
                        <FaTimes className="text-xs" />
                        {p.status}
                      </span>
                    )}
                  </td>

                  {/* PLAN STATUS */}
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        getPlanStatus(p) === "Active"
                          ? "bg-green-100 text-green-700"
                          : getPlanStatus(p) === "Expired"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {getPlanStatus(p)}
                    </span>
                  </td>

                  {/* DATE */}
                  <td className="p-4 text-gray-500">
                    {new Date(p.date).toLocaleDateString()}
                  </td>

                  {/* ACTION */}
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-xs transition"
                    >
                      <FaTrash className="text-xs" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payments.length === 0 && (
            <p className="text-center text-gray-400 py-10">
              No payments found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;