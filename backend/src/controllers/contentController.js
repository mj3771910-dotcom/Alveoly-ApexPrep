// controllers/contentController.js
import Content from "../models/Content.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";
import { io } from "../../server.js";

// ================= UPLOAD CONTENT =================
export const uploadContent = async (req, res) => {
  try {
    const { title, type, courseId, subjectId, isPaid, price } = req.body;

    // Helper to upload any file to Cloudinary
   const uploadToCloudinary = (file, type, folder = "alveoly-content") =>
  new Promise((resolve, reject) => {
   const stream = cloudinary.uploader.upload_stream(
  {
    resource_type: type === "pdf" ? "image" : "auto",
    folder,
    access_mode: "public",   // 🔥 IMPORTANT
    type: "upload",          // 🔥 IMPORTANT
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

    // Upload main content
    const mainUpload = await uploadToCloudinary(mainFile, type);

    // ================= THUMBNAIL =================
let thumbUpload = null;

if (thumbFile) {
  // Use uploaded thumbnail
  thumbUpload = await uploadToCloudinary(thumbFile, "image", "alveoly-thumbnails");
} else {
  // Auto-generate thumbnail for video/pdf/image
  if (type === "video") {
    // Generate video poster frame (first frame)
    thumbUpload = {
      secure_url: cloudinary.url(mainUpload.public_id + ".jpg", { 
        resource_type: "video", 
        quality: "auto", 
        fetch_format: "auto" 
      }),
      public_id: mainUpload.public_id + "-thumb",
    };
  } else if (type === "pdf") {
    // Generate first page thumbnail as image
    thumbUpload = {
      secure_url: cloudinary.url(mainUpload.public_id + ".jpg", { 
        resource_type: "image", 
        page: 1, 
        quality: "auto", 
        fetch_format: "auto" 
      }),
      public_id: mainUpload.public_id + "-thumb",
    };
  } else if (type === "image") {
    // For images, just use the main image as thumbnail
    thumbUpload = {
      secure_url: mainUpload.secure_url,
      public_id: mainUpload.public_id + "-thumb",
    };
  }
}
    // ================= SAVE TO DB =================
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
    console.error("Upload failed:", err);
    res.status(500).json({ message: "Upload failed" });
  }
};

// ================= GET CONTENTS =================
export const getContents = async (req, res) => {
  try {
    const { subjectId, courseId } = req.query;

    const filter = {};
    if (subjectId) filter.subjectId = subjectId;
    if (courseId) filter.courseId = courseId;

    const contents = await Content.find(filter).sort({ createdAt: -1 });

    res.json(contents);
  } catch (err) {
    console.error("Fetch contents failed:", err);
    res.status(500).json({ message: "Failed to fetch contents" });
  }
};

// ================= DELETE CONTENT =================
export const deleteContent = async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // DELETE MAIN FILE
    try {
      if (content.publicId) {
        await cloudinary.uploader.destroy(content.publicId, {
          resource_type: "auto",
        });
      }
    } catch (err) {
      console.error("Failed to delete main file:", err);
    }

    // DELETE THUMBNAIL
    try {
      if (content.thumbnailPublicId) {
        await cloudinary.uploader.destroy(content.thumbnailPublicId, {
          resource_type: "auto",
        });
      }
    } catch (err) {
      console.error("Failed to delete thumbnail:", err);
    }

    await content.deleteOne();

    io.emit("content:deleted", content._id);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete failed:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};

// ================= UPDATE CONTENT =================
export const updateContent = async (req, res) => {
  try {
    const { title, isPaid, price } = req.body;

    const content = await Content.findByIdAndUpdate(
      req.params.id,
      { title, isPaid, price },
      { new: true }
    );

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    io.emit("content:updated", content);

    res.json(content);
  } catch (err) {
    console.error("Update failed:", err);
    res.status(500).json({ message: "Update failed" });
  }
};