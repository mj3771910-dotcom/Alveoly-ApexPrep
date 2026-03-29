// utils/generateToken.js
import jwt from "jsonwebtoken";

const generateToken = (user, sessionId) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      sessionId, // ✅ IMPORTANT
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export default generateToken;