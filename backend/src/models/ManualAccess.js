import mongoose from "mongoose";

const manualAccessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
      index: true,
    },

    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    note: String,
  },
  { timestamps: true }
);

export default mongoose.model("ManualAccess", manualAccessSchema);