// controllers/courseController.js
import Course from "../models/Course.js";
import { io } from "../../server.js";

// GET ALL COURSES (for signup + admin)
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    console.error("Get Courses Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// CREATE COURSE
export const createCourse = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: "Course name is required" });
    }

    const course = await Course.create({
      name: req.body.name,
      createdBy: req.user.id,
    });

    // Emit event to all connected clients
    io.emit("course:created", course);

    res.status(201).json(course);
  } catch (error) {
    console.error("Create Course Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE COURSE
export const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    course.name = req.body.name || course.name;
    const updated = await course.save();

    io.emit("course:updated", updated);

    res.json(updated);
  } catch (error) {
    console.error("Update Course Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE COURSE
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    io.emit("course:deleted", req.params.id);

    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Delete Course Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};