import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import axios from "../api/axios";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/users");

      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================= ROLE CHANGE =================
  const handleRoleChange = async (id, role) => {
    try {
      setLoading(true);

      await axios.put(`/users/${id}/role`, { role });

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role } : u))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      setLoading(true);

      await axios.delete(`/users/${id}`);

      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      
      {/* HEADER */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
          User Management
        </h2>
        <p className="text-gray-500 text-sm sm:text-base mt-1">
          Manage users, roles, and course assignments
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500 mb-4">
          Loading...
        </p>
      )}

      {/* EMPTY */}
      {!loading && users.length === 0 && (
        <div className="bg-white p-6 sm:p-10 rounded-xl shadow-sm text-center">
          <p className="text-gray-500 text-base sm:text-lg">
            No users found 👤
          </p>
        </div>
      )}

      {/* ================= MOBILE VIEW (CARDS) ================= */}
      <div className="grid gap-4 md:hidden">
        {users.map((user) => (
          <div
            key={user._id}
            className="bg-white p-4 rounded-xl shadow-sm border"
          >
            {/* TOP */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-800">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>

            {/* COURSE */}
            <p className="text-sm text-gray-600 mb-2">
              <strong>Course:</strong>{" "}
              {user.courseId?.name || "None"}
            </p>

            {/* ROLE */}
            <div className="mb-3">
              <label className="text-xs text-gray-500 block mb-1">
                Role
              </label>
              <select
                value={user.role}
                onChange={(e) =>
                  handleRoleChange(user._id, e.target.value)
                }
                className="w-full border px-3 py-2 rounded-lg text-sm"
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* ACTION */}
            <button
              onClick={() => handleDelete(user._id)}
              className="w-full flex items-center justify-center gap-2 bg-red-100 text-red-600 py-2 rounded-lg text-sm hover:bg-red-200"
            >
              <FaTrash />
              Delete User
            </button>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      {users.length > 0 && (
        <div className="hidden md:block overflow-x-auto bg-white shadow-sm rounded-xl border">
          <table className="min-w-full text-sm">
            
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="p-4 text-left">User</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Course</th>
                <th className="p-4 text-left">Role</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">
                      {user.name}
                    </span>
                  </td>

                  <td className="p-4 text-gray-600">
                    {user.email}
                  </td>

                  <td className="p-4 text-gray-600">
                    {user.courseId?.name || "None"}
                  </td>

                  <td className="p-4">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user._id, e.target.value)
                      }
                      className="border px-3 py-1 rounded-lg"
                    >
                      <option value="student">Student</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(user._id)}
                      className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200"
                    >
                      <FaTrash />
                      Delete
                    </button>
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

export default AdminUsers;