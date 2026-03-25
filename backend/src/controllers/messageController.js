import Message from "../models/Message.js";

// CREATE MESSAGE (from contact form)
export const createMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    const newMessage = await Message.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Error saving message" });
  }
};

// GET ALL MESSAGES (ADMIN)
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
};

// MARK AS REPLIED
export const markAsReplied = async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { status: "replied" },
      { new: true }
    );

    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: "Error updating message" });
  }
};