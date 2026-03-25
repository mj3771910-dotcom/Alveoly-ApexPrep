import Subject from "../models/Subject.js";
import Course from "../models/Course.js";
import Payment from "../models/Payment.js";
import Plan from "../models/Plan.js";
import { io } from "../../server.js";

// ================= GET SUBJECTS =================
export const getSubjects = async (req, res) => {
  try {
    const userId = req.user?._id;
    const course = req.query.course;

    let subjects;

    // ✅ FILTER BY COURSE (student)
    if (course && course !== "undefined" && course !== "null") {
      subjects = await Subject.find({ courseId: course });
    } else {
      // ✅ ADMIN (all subjects)
      subjects = await Subject.find();
    }

    // ================= GET ACTIVE PAYMENTS =================
    let activePlan = null;
    let activeSubjectPayments = [];

    if (userId) {
      const now = new Date();

      // ✅ Get active plan
      const planPayment = await Payment.findOne({
        userId,
        planId: { $ne: null },
        status: "success",
        expiresAt: { $gt: now },
      }).populate({
        path: "planId",
        populate: { path: "subjects", select: "_id" },
      });

      if (planPayment && planPayment.planId) {
        activePlan = planPayment.planId.subjects.map((s) =>
          s._id.toString()
        );
      }

      // ✅ Get active subject purchases
      const subjectPayments = await Payment.find({
        userId,
        subjectId: { $ne: null },
        status: "success",
        expiresAt: { $gt: now },
      });

      activeSubjectPayments = subjectPayments.map((p) =>
        p.subjectId.toString()
      );
    }

    // ================= FORMAT =================
    const formatted = subjects.map((subj) => {
      let isUnlocked = !subj.isPaid; // free subjects

      if (userId && subj.isPaid) {
        const subjectIdStr = subj._id.toString();

        const hasSubjectPurchase =
          activeSubjectPayments.includes(subjectIdStr);

        const hasPlanAccess =
          activePlan && activePlan.includes(subjectIdStr);

        isUnlocked = hasSubjectPurchase || hasPlanAccess;
      }

      return {
        ...subj._doc,
        isUnlocked,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Get Subjects Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= GET SINGLE SUBJECT =================
export const getSubjectById = async (req, res) => {
  try {
    const subjectId = req.params.subjectId;

    const subject = await Subject.findById(subjectId);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    res.json(subject);
  } catch (err) {
    console.error("Get Subject By ID Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= CREATE SUBJECT =================
export const createSubject = async (req, res) => {
  try {
    const { name, courseId, isPaid, price } = req.body;

    if (!name || !courseId) {
      return res.status(400).json({
        message: "Name and Course are required",
      });
    }

    const courseExists = await Course.findById(courseId);
    if (!courseExists) {
      return res.status(400).json({
        message: "Invalid course selected",
      });
    }

    const subject = await Subject.create({
      name,
      courseId,
      isPaid,
      price: isPaid ? price : 0,
    });

    io.emit("subject:created", subject);

    res.status(201).json(subject);
  } catch (error) {
    console.error("Create Subject Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= UPDATE SUBJECT =================
export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    Object.assign(subject, req.body);
    const updated = await subject.save();

    io.emit("subject:updated", updated);

    res.json(updated);
  } catch (error) {
    console.error("Update Subject Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= DELETE SUBJECT =================
export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    await subject.deleteOne();

    io.emit("subject:deleted", req.params.id);

    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    console.error("Delete Subject Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};