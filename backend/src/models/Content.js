// models/Content.js
import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    title: String,

    type: {
      type: String,
      enum: ["video", "image", "pdf"],
    },

    fileUrl: String,
    publicId: String,

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      default: null,
    },

    isPaid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Content", contentSchema);