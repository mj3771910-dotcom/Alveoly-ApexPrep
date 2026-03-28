// controllers/contentPaymentController.js
import axios from "axios";
import Content from "../models/Content.js";
import ContentPayment from "../models/ContentPayment.js";

export const initiateContentPayment = async (req, res) => {
  try {
    const { contentId } = req.body;
    const user = req.user;

    const content = await Content.findById(contentId);

    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    const payment = await ContentPayment.create({
      userId: user._id,
      contentId,
      amount: content.price,
      status: "pending",
    });

    // PAYSTACK INIT
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: user.email,
        amount: content.price * 100,
        metadata: {
          contentId,
          paymentId: payment._id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    payment.reference = response.data.data.reference;
    await payment.save();

    res.json({
      authorizationUrl: response.data.data.authorization_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment error" });
  }
};