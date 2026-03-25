import Testimonial from "../models/Testimonial.js";

// Create testimonial (student)
export const createTestimonial = async (req, res) => {
  try {
    const { name, course, rating, feedback } = req.body;

    const testimonial = await Testimonial.create({
      studentId: req.user._id,
      name,
      course,
      rating,
      feedback,
      status: "pending",
    });

    res.status(201).json(testimonial);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error creating testimonial" });
  }
};

// Get approved testimonials (public)
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: "approved" })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: "Error fetching testimonials" });
  }
};

// Get testimonials for logged-in student
export const getMyTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ studentId: req.user._id }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    res.status(500).json({ message: "Error fetching your testimonials" });
  }
};

// Admin approve testimonial
export const approveTestimonial = async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: "Error approving testimonial" });
  }
};

// Admin reject testimonial
export const rejectTestimonial = async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    );
    res.json(t);
  } catch (err) {
    res.status(500).json({ message: "Error rejecting testimonial" });
  }
};

// Get all pending testimonials (ADMIN)
export const getPendingTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching pending testimonials" });
  }
};