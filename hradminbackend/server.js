// backend/server.js
import express from "express";
import cors from "cors";
import db from "./firebase.js";

const app = express();
app.use(cors());
app.use(express.json());

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const snapshot = await db.collection("users").where("email", "==", email).get();
    if (snapshot.empty) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = snapshot.docs[0].data();
    // Simple password check (plaintext, for demo)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Optionally return token or user info
    res.json({ message: "Login successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


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

app.post("/add-faculty", async (req, res) => {
  try {
    const newFaculty = req.body;
    // Save to the 'faculty' collection using the Admin SDK
    const docRef = await db.collection("faculty").add(newFaculty);
    
    // Return the new object with its generated ID
    res.json({ id: docRef.id, ...newFaculty });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save faculty data" });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});