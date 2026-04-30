// models/Content.js - UPDATED
import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "image", "pdf"],
      required: true,
    },
    fileUrl: String,
    publicId: String,
    thumbnailUrl: String,
    thumbnailPublicId: String,
    
    // MAKE THESE REQUIRED
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true, // Changed from default: null
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true, // Changed from default: null
    },
    isPaid: { 
      type: Boolean, 
      default: false 
    },
    price: { 
      type: Number, 
      default: 0 
    },
  },
  { timestamps: true }
);

export default mongoose.model("Content", contentSchema);