import 'dotenv/config';
// backend/server.js
import express from "express";
import cors from "cors";
import { supabase } from "./supabase.js";

const app = express();
app.use(cors());
app.use(express.json());

// Login endpoint
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();
    if (error || !user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    // Simple password check (plaintext, for demo)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({ message: "Login successful", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


// Example route: get faculty users from database (SQL public.users)
app.get("/users", async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("user_id, name_first, name_last, domain_email, role, status, created_at, current_rank, department_id")
      .eq("role", "Faculty")
      .neq("domain_email", "admin@gordoncollege.edu.ph");
    if (error) throw error;
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error getting users");
  }
});

// Debug/utility route: get all users with all columns (no filters)
app.get("/all-users", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*");

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error getting all users:", err);
    res.status(500).json({ error: "Error getting all users" });
  }
});

// Get list of departments from database
app.get("/departments", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("departments")
      .select("department_id, department_name, department_code")
      .order("department_name", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Error getting departments:", err);
    res.status(500).json({ error: "Error getting departments" });
  }
});

app.post("/add-faculty", async (req, res) => {
  try {
    const newFaculty = req.body;
    const { data, error } = await supabase
      .from("users")
      .insert([newFaculty])
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save faculty data" });
  }
});

// Invite a faculty member: send Supabase Auth email invite and create SQL user row
app.post("/invite-faculty", async (req, res) => {
  const { email, name_first, name_last } = req.body;

  if (!email || !name_first || !name_last) {
    return res.status(400).json({ error: "email, name_first and name_last are required" });
  }

  try {
    // 1) Send invite email via Supabase Auth
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        name_first,
        name_last,
        role: "Faculty",
      },
    });

    if (inviteError) {
      console.error("Error sending invite:", inviteError);
      return res.status(500).json({ error: "Failed to send invite" });
    }

    // 2) Create matching row in users table (SQL) for HR system
    const now = new Date().toISOString();
    const { data: dbUsers, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          name_last,
          name_first,
          domain_email: email,
          password_hash: "supabase-auth",
          role: "Faculty",
          status: "active",
          is_first_login: true,
          created_at: now,
        },
      ])
      .select();

    if (insertError) {
      console.error("Error creating faculty row:", insertError);
      return res.status(200).json({
        message: "Invite sent, but failed to create faculty record.",
        inviteUser: inviteData?.user ?? null,
        dbUser: null,
        warning: insertError.message,
      });
    }

    const faculty = Array.isArray(dbUsers) && dbUsers.length > 0 ? dbUsers[0] : null;

    return res.status(200).json({
      message: "Invitation email sent and faculty record created.",
      inviteUser: inviteData?.user ?? null,
      dbUser: faculty,
    });
  } catch (err) {
    console.error("Unhandled error in /invite-faculty:", err);
    return res.status(500).json({ error: "Server error while inviting faculty" });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});