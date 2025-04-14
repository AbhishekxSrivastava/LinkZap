import express from "express";
import Url from "../models/Url.js";
import { nanoid } from "nanoid";
import QRCode from "qrcode"; // Import QRCode library

const router = express.Router();

router.post("/shorten", async (req, res) => {
  try {
    const { originalUrl, customAlias, expiresAt } = req.body;

    let shortId = customAlias || nanoid(6);

    // Check if the custom alias already exists
    const existingUrl = await Url.findOne({ shortId });
    if (existingUrl) {
      return res.status(400).json({ message: "Custom alias already taken!" });
    }

    const shortUrl = `${process.env.BASE_URL}/${shortId}`;

    // Generate QR Code
    const qrCode = await QRCode.toDataURL(shortUrl);

    const newUrl = new Url({
      originalUrl,
      shortId,
      expiresAt: expiresAt ? new Date(expiresAt) : null, // Store expiry date if provided
      qrCode, // Store generated QR code
    });

    await newUrl.save();
    res.json({ shortUrl, qrCode });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:shortId", async (req, res) => {
  try {
    const shortUrl = await Url.findOne({ shortId: req.params.shortId });

    if (!shortUrl) {
      return res.status(404).json({ message: "Short URL not found!" });
    }

    // Check if the URL is expired
    if (shortUrl.expiresAt && shortUrl.expiresAt < new Date()) {
      return res.status(410).json({ message: "This short URL has expired!" });
    }

    shortUrl.clicks += 1;
    shortUrl.visitHistory.push({ timestamp: new Date() });
    await shortUrl.save();

    res.redirect(shortUrl.originalUrl);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// Get analytics for a short URL
router.get("/:shortId/stats", async (req, res) => {
  try {
    const { shortId } = req.params;
    const url = await Url.findOne({ shortId });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    res.json({
      shortUrl: `${process.env.BASE_URL}/api/url/${shortId}`,
      totalClicks: url.clicks,
      visits: url.visits,
      expiresAt: url.expiresAt,
    });
  } catch (error) {
    console.error("Error in fetching stats:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get QR Code for a short URL
router.get("/:shortId/qrcode", async (req, res) => {
  try {
    const { shortId } = req.params;
    const url = await Url.findOne({ shortId });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    res.json({ qrCode: url.qrCode });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
