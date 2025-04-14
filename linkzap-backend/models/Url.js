import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortId: {
    type: String,
    required: true,
    unique: true,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  visitHistory: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  expiresAt: {
    type: Date,
    default: Date.now,
  },
  qrCode: {
    type: String, // Stores the QR Code as a base64-encoded image
  },
});

const Url = mongoose.model("Url", urlSchema);
export default Url;
