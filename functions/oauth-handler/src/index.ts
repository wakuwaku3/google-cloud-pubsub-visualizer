import * as functions from "firebase-functions";
import fetch from "node-fetch";

export const oauthHandler = functions.https.onRequest(async (req, res) => {
  try {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("OAuth Error:", err);
    res.status(500).json({ error: "OAuth token exchange failed." });
  }
});
