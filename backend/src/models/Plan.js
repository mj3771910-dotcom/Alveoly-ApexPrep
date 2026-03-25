import mongoose from "mongoose";

const planSchema = new mongoose.Schema(
  {
    title: String,

    price: Number, // admin controls this

    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],

    // ================= NEW FIELDS =================
    duration: {
      type: Number,
      required: true,
      default: 1, // fallback
    },

    durationUnit: {
      type: String,
      enum: ["minutes", "hours", "days", "weeks", "months"],
      default: "days",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Plan", planSchema);