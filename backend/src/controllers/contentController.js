// controllers/contentController.js
import Content from "../models/Content.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";
import { io } from "../../server.js";

export const uploadContent = async (req, res) => {
  try {
    const { title, type, courseId, subjectId, isPaid, price } = req.body;

    // ================= FILE UPLOAD =================
    const uploadToCloudinary = (file) =>
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

        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const mainFile = req.files?.file?.[0];
    const thumbFile = req.files?.thumbnail?.[0];

    if (!mainFile) {
      return res.status(400).json({ message: "Main file required" });
    }

    const mainUpload = await uploadToCloudinary(mainFile);

    let thumbUpload = null;

    // ================= THUMBNAIL =================
    if (thumbFile) {
      thumbUpload = await uploadToCloudinary(thumbFile);
    } else {
      // AUTO THUMBNAIL FOR VIDEO/PDF
      if (type === "video") {
        thumbUpload = {
          secure_url: mainUpload.secure_url.replace(
            "/upload/",
            "/upload/so_1/"
          ),
        };
      }

      if (type === "pdf") {
        thumbUpload = {
          secure_url: mainUpload.secure_url.replace(".pdf", ".jpg"),
        };
      }

      if (type === "image") {
        thumbUpload = {
          secure_url: mainUpload.secure_url,
        };
      }
    }

    // ================= SAVE =================
    const content = await Content.create({
      title,
      type,
      fileUrl: mainUpload.secure_url,
      publicId: mainUpload.public_id,

      thumbnailUrl: thumbUpload?.secure_url || "",
      thumbnailPublicId: thumbUpload?.public_id || "",

      courseId: courseId || null,
      subjectId: subjectId || null,
      isPaid,
      price,
    });

    io.emit("content:created", content);

    res.json(content);
  } catch (err) {
    console.error(err);
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

export const deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ message: "Not found" });
    }

    // DELETE MAIN FILE
    if (content.publicId) {
      await cloudinary.uploader.destroy(content.publicId, {
        resource_type: "auto",
      });
    }

    // DELETE THUMBNAIL
    if (content.thumbnailPublicId) {
      await cloudinary.uploader.destroy(content.thumbnailPublicId);
    }

    await content.deleteOne();

    io.emit("content:deleted", content._id);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
};

export const updateContent = async (req, res) => {
  try {
    const { title, isPaid, price } = req.body;

    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { title, isPaid, price },
      { new: true }
    );

    io.emit("content:updated", content);

    res.json(content);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
};