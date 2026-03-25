import { useState, useEffect } from "react";
import axios from "../api/axios";
import { FaEdit, FaTrash, FaTag } from "react-icons/fa";

const AIPlansAdmin = () => {
  const [plans, setPlans] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("days");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await axios.get("/ai-plans");
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to fetch AI plans:", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSave = async () => {
    if (!name || !price || !durationValue)
      return alert("Please fill required fields");

    setLoading(true);
    try {
      const data = {
        name,
        description,
        price,
        durationValue,
        durationUnit,
      };

      if (editingId) {
        await axios.put(`/ai-plans/${editingId}`, data);
        setEditingId(null);
      } else {
        await axios.post("/ai-plans", data);
      }

      setName("");
      setDescription("");
      setPrice("");
      setDurationValue("");
      setDurationUnit("days");

      fetchPlans();
    } catch (err) {
      alert("Failed to save plan");
    }
    setLoading(false);
  };

  const handleEdit = (plan) => {
    setName(plan.name);
    setDescription(plan.description);
    setPrice(plan.price);
    setDurationValue(plan.durationValue);
    setDurationUnit(plan.durationUnit);
    setEditingId(plan._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      await axios.delete(`/ai-plans/${id}`);
      fetchPlans();
    } catch (err) {
      alert("Failed to delete plan");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        
        {/* LEFT: FORM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-6 h-fit">
          
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <FaTag /> {editingId ? "Edit Plan" : "Create Plan"}
          </h2>

          <div className="space-y-4">
            
            <input
              type="text"
              placeholder="Plan Name*"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="number"
              placeholder="Price*"
              className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Duration*"
                className="border p-3 rounded-lg"
                value={durationValue}
                onChange={(e) => setDurationValue(e.target.value)}
              />

              <select
                className="border p-3 rounded-lg"
                value={durationUnit}
                onChange={(e) => setDurationUnit(e.target.value)}
              >
                <option value="minutes">Minutes</option>
                <option value="hours">Hours</option>
                <option value="days">Days</option>
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
                <option value="years">Years</option>
              </select>
            </div>

            <textarea
              placeholder="Description"
              className="w-full border p-3 rounded-lg min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <button
              onClick={handleSave}
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-medium transition ${
                loading
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Plan"
                : "Create Plan"}
            </button>
          </div>
        </div>

        {/* RIGHT: PLANS */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            All Plans
          </h3>

          {plans.length === 0 && (
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <p className="text-gray-500">
                No plans created yet 💳
              </p>
            </div>
          )}

          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan._id}
                className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition"
              >
                
                <div className="flex justify-between items-start">
                  
                  {/* INFO */}
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">
                      {plan.name}
                    </h3>

                    <p className="text-sm text-gray-500 mb-2">
                      {plan.description}
                    </p>

                    <p className="text-blue-600 font-semibold text-lg">
                      ₵{plan.price}
                    </p>

                    <p className="text-xs text-gray-500">
                      {plan.durationValue} {plan.durationUnit}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleEdit(plan)}
                      className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-lg hover:bg-yellow-200"
                    >
                      <FaEdit /> Edit
                    </button>

                    <button
                      onClick={() => handleDelete(plan._id)}
                      className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlansAdmin;