import express from "express";
import {
  createTestimonial,
  getTestimonials,
  getMyTestimonials,
  approveTestimonial,
  rejectTestimonial,
  getPendingTestimonials,
} from "../controllers/testimonialController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// STUDENT: submit testimonial
router.post("/", protect, createTestimonial);

// STUDENT: get own testimonials
router.get("/my", protect, getMyTestimonials);

// PUBLIC: get approved testimonials
router.get("/", getTestimonials);

// ADMIN: get all pending testimonials
router.get("/pending", protect, adminOnly, getPendingTestimonials);

// ADMIN: approve/reject testimonial
router.patch("/:id/approve", protect, adminOnly, approveTestimonial);
router.patch("/:id/reject", protect, adminOnly, rejectTestimonial);

export default router;