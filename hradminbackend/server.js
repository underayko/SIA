// backend/server.js
import express from "express";
import cors from "cors";
import db from "./firebase.js";

const app = express();
app.use(cors());
app.use(express.json());

// Example route: get users from Firebase
app.get("/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => doc.data());
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting users");
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});