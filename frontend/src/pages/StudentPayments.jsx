import { useEffect, useState } from "react";
import axios from "../api/axios";
import { FaDownload } from "react-icons/fa";

const StudentPayments = () => {
  const [payments, setPayments] = useState([]);

  const fetchPayments = async () => {
    try {
      const res = await axios.get("/payments/mine");
      setPayments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const exportCSV = () => {
    const headers = ["Item", "Amount", "Status", "Date"];

    const rows = payments.map((p) => [
      p.planTitle || p.subject,
      p.amount,
      p.status,
      new Date(p.date).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "my_payments.csv";
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold text-gray-800">
            Payment History
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Track all your purchases and transactions
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
        >
          <FaDownload />
          Export CSV
        </button>
      </div>

      {/* EMPTY */}
      {payments.length === 0 && (
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-sm text-center">
          <p className="text-gray-500 text-sm sm:text-lg">
            No payments yet 💳
          </p>
        </div>
      )}

      {/* ================= DESKTOP TABLE ================= */}
      {payments.length > 0 && (
        <>
          <div className="hidden md:block bg-white rounded-xl shadow-sm border overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="p-4 text-left">Item</th>
                  <th className="p-4 text-left">Amount</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-left">Date</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="p-4 font-medium text-gray-800">
                      {p.planTitle || p.subject || "N/A"}
                    </td>

                    <td className="p-4 text-gray-700">
                      ₵{p.amount}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          p.status === "success"
                            ? "bg-green-100 text-green-700"
                            : p.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="p-4 text-gray-500">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ================= MOBILE CARDS ================= */}
          <div className="md:hidden space-y-4">
            {payments.map((p) => (
              <div
                key={p._id}
                className="bg-white p-4 rounded-xl shadow-sm border"
              >
                <div className="flex justify-between items-center mb-2">
                  <p className="font-semibold text-gray-800 text-sm">
                    {p.planTitle || p.subject || "N/A"}
                  </p>

                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      p.status === "success"
                        ? "bg-green-100 text-green-700"
                        : p.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-1">
                  Amount: <span className="font-medium">₵{p.amount}</span>
                </p>

                <p className="text-xs text-gray-400">
                  {new Date(p.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentPayments;