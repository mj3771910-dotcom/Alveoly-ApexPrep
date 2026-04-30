// controllers/contentController.js
import Content from "../models/Content.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";
import { io } from "../../server.js";

// ================= UPLOAD CONTENT =================
// controllers/contentController.js - Update uploadContent
export const uploadContent = async (req, res) => {
  try {
    const { title, type, courseId, subjectId, isPaid, price } = req.body;

    // VALIDATION: Ensure both courseId and subjectId are provided
    if (!subjectId && req.body.linkType === "subject") {
      return res.status(400).json({ message: "Subject ID is required" });
    }
    
    if (!courseId && req.body.linkType === "course") {
      return res.status(400).json({ message: "Course ID is required" });
    }

    const uploadToCloudinary = (file, type, folder = "alveoly-content") =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: type === "pdf" ? "raw" : "auto",
            folder,
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

    // Generate thumbnail
    let thumbUpload = null;
    if (thumbFile) {
      thumbUpload = await uploadToCloudinary(thumbFile, "image", "alveoly-thumbnails");
    } else {
      if (type === "video") {
        thumbUpload = {
          secure_url: cloudinary.url(mainUpload.public_id + ".jpg", { 
            resource_type: "video", 
            quality: "auto", 
            fetch_format: "auto" 
          }),
          public_id: mainUpload.public_id + "-thumb",
        };
      } else if (type === "pdf") {
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
        thumbUpload = {
          secure_url: mainUpload.secure_url,
          public_id: mainUpload.public_id + "-thumb",
        };
      }
    }

    // If subjectId is provided but courseId isn't, get courseId from subject
    let finalCourseId = courseId;
    let finalSubjectId = subjectId;
    
    if (subjectId && !courseId) {
      const Subject = mongoose.model("Subject");
      const subject = await Subject.findById(subjectId);
      if (subject) {
        finalCourseId = subject.courseId;
      }
    }

    // Save to DB
    const content = await Content.create({
      title,
      type,
      fileUrl: mainUpload.secure_url,
      publicId: mainUpload.public_id,
      thumbnailUrl: thumbUpload?.secure_url || "",
      thumbnailPublicId: thumbUpload?.public_id || "",
      courseId: finalCourseId,
      subjectId: finalSubjectId,
      isPaid: isPaid === "true" || isPaid === true,
      price: Number(price) || 0,
    });

    io.emit("content:created", content);
    res.json(content);
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ message: err.message });
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

    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    const uploadToCloudinary = (file, type, folder = "alveoly-content") =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: type === "pdf" ? "raw" : "auto",
            folder,
          },
          (err, result) => {
            if (result) resolve(result);
            else reject(err);
          }
        );
        streamifier.createReadStream(file.buffer).pipe(stream);
      });

    const newFile = req.files?.file?.[0] || null;
    const newThumb = req.files?.thumbnail?.[0] || null;

    // 🔁 UPDATE MAIN FILE
    if (newFile) {
      if (content.publicId) {
        await cloudinary.uploader.destroy(content.publicId, {
          resource_type: content.type === "video" ? "video" : "image",
        });
      }

      const uploaded = await uploadToCloudinary(newFile, content.type);
      content.fileUrl = uploaded.secure_url;
      content.publicId = uploaded.public_id;
    }

    // 🖼 UPDATE THUMBNAIL
    if (newThumb) {
      if (content.thumbnailPublicId) {
        await cloudinary.uploader.destroy(content.thumbnailPublicId, {
          resource_type: "image",
        });
      }

      const uploadedThumb = await uploadToCloudinary(
        newThumb,
        "image",
        "alveoly-thumbnails"
      );

      content.thumbnailUrl = uploadedThumb.secure_url;
      content.thumbnailPublicId = uploadedThumb.public_id;
    }

    // ✏️ TEXT UPDATE
    if (title !== undefined) content.title = title;

    if (isPaid !== undefined) {
      content.isPaid = isPaid === "true" || isPaid === true;
    }

    if (price !== undefined) {
      content.price = Number(price) || 0;
    }

    const updated = await content.save();

    io.emit("content:updated", updated);

    res.json(updated);
  } catch (err) {
    console.error("🔥 UPDATE ERROR:", err.message);
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};