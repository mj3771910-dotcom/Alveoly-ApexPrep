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
    const headers = ["Subject", "Amount", "Status", "Date"];

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
    <div className="max-w-7xl mx-auto p-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            Payment History
          </h2>
          <p className="text-gray-500 mt-1">
            Track all your purchases and transactions
          </p>
        </div>

        {/* EXPORT BUTTON */}
        <button
          onClick={exportCSV}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <FaDownload />
          Export CSV
        </button>
      </div>

      {/* EMPTY STATE */}
      {payments.length === 0 && (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center">
          <p className="text-gray-500 text-lg">
            No payments yet 💳
          </p>
        </div>
      )}

      {/* TABLE */}
      {payments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
          <table className="w-full text-sm">
            
            {/* HEAD */}
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">Item</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Date</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  
                  {/* ITEM */}
                  <td className="p-4 font-medium text-gray-800">
                    {p.planTitle || p.subject || "N/A"}
                  </td>

                  {/* AMOUNT */}
                  <td className="p-4 text-gray-700">
                    ₵{p.amount}
                  </td>

                  {/* STATUS */}
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

                  {/* DATE */}
                  <td className="p-4 text-gray-500">
                    {new Date(p.date).toLocaleDateString()}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default StudentPayments;