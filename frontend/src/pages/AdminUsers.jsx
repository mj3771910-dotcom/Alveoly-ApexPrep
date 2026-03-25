import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash } from "react-icons/fa";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, role) => {
    try {
      await axios.put(
        `http://localhost:5000/api/users/${id}/role`,
        { role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      
      {/* HEADER */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          User Management
        </h2>
        <p className="text-gray-500 mt-1">
          Manage users, roles, and course assignments
        </p>
      </div>

      {/* EMPTY STATE */}
      {users.length === 0 && (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center">
          <p className="text-gray-500 text-lg">
            No users found 👤
          </p>
        </div>
      )}

      {/* TABLE */}
      <div className="overflow-x-auto bg-white shadow-sm rounded-xl border">
        <table className="min-w-full text-sm">
          
          {/* HEAD */}
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="p-4 text-left">User</th>
              <th className="p-4 text-left">Email</th>
              <th className="p-4 text-left">Course</th>
              <th className="p-4 text-left">Role</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {users.map((user) => (
              <tr
                key={user._id}
                className="border-t hover:bg-gray-50 transition"
              >
                
                {/* USER */}
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-gray-800">
                    {user.name}
                  </span>
                </td>

                {/* EMAIL */}
                <td className="p-4 text-gray-600">
                  {user.email}
                </td>

                {/* COURSE */}
                <td className="p-4 text-gray-600">
                  {user.courseId?.name || "None"}
                </td>

                {/* ROLE */}
                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(user._id, e.target.value)
                    }
                    className="border px-3 py-1 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                {/* ACTION */}
                <td className="p-4">
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-lg hover:bg-red-200 transition"
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
    </div>
  );
};

export default AdminUsers;