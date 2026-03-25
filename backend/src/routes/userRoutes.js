import express from "express";
import { adminOnly, protect } from "../middleware/authMiddleware.js";

import {
  getAllUsers,
  updateUserRole,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

// ADMIN ONLY
router.get("/", protect, adminOnly, getAllUsers);
router.put("/:id/role", protect, adminOnly, updateUserRole);
router.delete("/:id", protect, adminOnly, deleteUser);

export default router;