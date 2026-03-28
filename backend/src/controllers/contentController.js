// controllers/contentController.js
import Content from "../models/Content.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";
import { io } from "../../server.js";

export const uploadContent = async (req, res) => {
  try {
    const { title, type, courseId, subjectId, isPaid, price } =
      req.body;

    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "auto",
            folder: "alveoly-content",
          },
          (err, result) => {
            if (result) resolve(result);
            else reject(err);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await streamUpload();

    const content = await Content.create({
      title,
      type,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      courseId: courseId || null,
      subjectId: subjectId || null,
      isPaid,
      price,
    });

    io.emit("content:created", content);

    res.json(content);
  } catch (err) {
    res.status(500).json({ message: "Upload failed" });
  }
};

// ================= GET =================
export const getContents = async (req, res) => {
  const { subjectId, courseId } = req.query;

  const filter = {};
  if (subjectId) filter.subjectId = subjectId;
  if (courseId) filter.courseId = courseId;

  const contents = await Content.find(filter);

  res.json(contents);
};