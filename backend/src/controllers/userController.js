import User from "../models/User.js";

// ================= GET ALL USERS =================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("courseId", "name");

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE USER ROLE =================
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ Prevent admin from changing their own role
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        message: "You cannot change your own role",
      });
    }

    user.role = role;
    await user.save();

    res.json({ message: "Role updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE USER =================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ Prevent self delete
    if (req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    await user.deleteOne();

    res.json({ message: "User deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};