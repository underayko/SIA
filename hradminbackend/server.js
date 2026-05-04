import 'dotenv/config';
// backend/server.js
import express from "express";
import cors from "cors";
import { supabase } from "./supabase.js";

const app = express();
app.use(cors());
app.use(express.json());

async function resolveCurrentCycleId() {
  const openCycle = await supabase
    .from("ranking_cycles")
    .select("cycle_id, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!openCycle.error && openCycle.data?.cycle_id) {
    return openCycle.data.cycle_id;
  }

  const latestCycle = await supabase
    .from("ranking_cycles")
    .select("cycle_id, created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestCycle.error && latestCycle.data?.cycle_id) {
    return latestCycle.data.cycle_id;
  }

  return null;
}

async function upsertCycleParticipant({ cycleId, facultyId = null, inviteEmail = null, status = "invited", invitedBy = null }) {
  if (!cycleId) return { data: null, error: new Error("cycleId is required") };
  if (!facultyId && !inviteEmail) {
    return { data: null, error: new Error("facultyId or inviteEmail is required") };
  }

  let result = null;

  if (facultyId) {
    const existing = await supabase
      .from("cycle_participants")
      .select("participant_id")
      .eq("cycle_id", cycleId)
      .eq("faculty_id", facultyId)
      .maybeSingle();

    if (!existing.error && existing.data?.participant_id) {
      result = await supabase
        .from("cycle_participants")
        .update({
          status,
          invite_email: inviteEmail,
          invited_by: invitedBy,
          invited_at: new Date().toISOString(),
        })
        .eq("participant_id", existing.data.participant_id)
        .select("*")
        .maybeSingle();
    }
  }

  if (!result && !facultyId && inviteEmail) {
    const existingInvite = await supabase
      .from("cycle_participants")
      .select("participant_id")
      .eq("cycle_id", cycleId)
      .is("faculty_id", null)
      .ilike("invite_email", inviteEmail)
      .maybeSingle();

    if (!existingInvite.error && existingInvite.data?.participant_id) {
      result = await supabase
        .from("cycle_participants")
        .update({
          status,
          invited_by: invitedBy,
          invited_at: new Date().toISOString(),
        })
        .eq("participant_id", existingInvite.data.participant_id)
        .select("*")
        .maybeSingle();
    }
  }

  if (!result) {
    result = await supabase
      .from("cycle_participants")
      .insert([
        {
          cycle_id: cycleId,
          faculty_id: facultyId,
          invite_email: inviteEmail,
          status,
          invited_by: invitedBy,
        },
      ])
      .select("*")
      .maybeSingle();
  }

  // ✅ AUTO-CREATE APPLICATION when participant is created/updated with "accepted" status
  if (!result.error && result.data && status === "accepted" && result.data.faculty_id) {
    console.log(`📝 Auto-creating application for faculty ${result.data.faculty_id} in cycle ${cycleId}`);
    
    const { data: existingApp } = await supabase
      .from("applications")
      .select("application_id")
      .eq("faculty_id", result.data.faculty_id)
      .eq("cycle_id", cycleId)
      .maybeSingle();

    if (!existingApp) {
      const { data: facultyData } = await supabase
        .from("users")
        .select("current_rank")
        .eq("user_id", result.data.faculty_id)
        .maybeSingle();

      const { data: positions } = await supabase
        .from("positions")
        .select("position_id, position_name")
        .order("position_id", { ascending: true });

      let targetPositionId = positions?.[0]?.position_id;
      if (facultyData?.current_rank && positions) {
        const matchingPos = positions.find(p => 
          p.position_name?.toLowerCase().includes(facultyData.current_rank?.toLowerCase())
        );
        targetPositionId = matchingPos?.position_id || targetPositionId;
      }

      if (targetPositionId) {
        const { error: appError } = await supabase
          .from("applications")
          .insert({
            faculty_id: result.data.faculty_id,
            cycle_id: cycleId,
            target_position_id: targetPositionId,
            current_rank_at_time: facultyData?.current_rank || "Instructor I",
            application_number: `APP-${cycleId}-${result.data.faculty_id}-${Date.now()}`,
            status: "Draft",
          });

        if (appError) {
          console.warn("⚠️ Failed to auto-create application in upsert:", appError);
        } else {
          console.log("✅ Application auto-created successfully in upsert");
        }
      }
    }
  }

  return result;
}
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

app.get("/cycles", async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from("ranking_cycles")
      .select("cycle_id, title, semester, year, status, start_date, deadline, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Error getting cycles:", err);
    res.status(500).json({ error: "Error getting cycles" });
  }
});

app.get("/cycles/current", async (_req, res) => {
  try {
    const cycleId = await resolveCurrentCycleId();
    if (!cycleId) return res.status(404).json({ error: "No cycle found" });

    const { data, error } = await supabase
      .from("ranking_cycles")
      .select("cycle_id, title, semester, year, status, start_date, deadline, created_at")
      .eq("cycle_id", cycleId)
      .maybeSingle();
    if (error) throw error;
    res.json(data || null);
  } catch (err) {
    console.error("Error getting current cycle:", err);
    res.status(500).json({ error: "Error getting current cycle" });
  }
});

app.get("/cycles/:cycleId/participants", async (req, res) => {
  const { cycleId } = req.params;
  try {
    const { data, error } = await supabase
      .from("cycle_participants")
      .select("participant_id, cycle_id, faculty_id, invite_email, status, invited_by, invited_at, responded_at, created_at, updated_at")
      .eq("cycle_id", cycleId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err) {
    console.error("Error getting cycle participants:", err);
    res.status(500).json({ error: "Error getting cycle participants" });
  }
});

app.post("/cycles/:cycleId/participants", async (req, res) => {
  const { cycleId } = req.params;
  const { faculty_id, invite_email, status, invited_by } = req.body || {};

  if (!faculty_id && !invite_email) {
    return res.status(400).json({ error: "faculty_id or invite_email is required" });
  }

  try {
    const result = await upsertCycleParticipant({
      cycleId,
      facultyId: faculty_id || null,
      inviteEmail: invite_email || null,
      status: status || "invited",
      invitedBy: invited_by || null,
    });

    if (result.error) {
      console.error("Error upserting participant:", result.error);
      return res.status(500).json({ error: result.error.message || "Failed to save participant" });
    }

    return res.status(200).json({ participant: result.data });
  } catch (err) {
    console.error("Error creating participant:", err);
    return res.status(500).json({ error: "Failed to create participant" });
  }
});

app.patch("/cycles/:cycleId/participants/:facultyId", async (req, res) => {
  const { cycleId, facultyId } = req.params;
  const { status } = req.body || {};

  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }

  try {
    const { data, error } = await supabase
      .from("cycle_participants")
      .update({
        status,
        responded_at: status === "accepted" || status === "declined" ? new Date().toISOString() : null,
      })
      .eq("cycle_id", cycleId)
      .eq("faculty_id", facultyId)
      .select("*")
      .maybeSingle();

    if (error) throw error;

    // ✅ AUTO-CREATE APPLICATION when participant is accepted
    if (status === "accepted" && data?.faculty_id) {
      console.log(`📝 Auto-creating application for faculty ${data.faculty_id} in cycle ${cycleId}`);
      
      // Check if application already exists
      const { data: existingApp } = await supabase
        .from("applications")
        .select("application_id")
        .eq("faculty_id", data.faculty_id)
        .eq("cycle_id", cycleId)
        .maybeSingle();

      if (!existingApp) {
        // Get faculty current rank to determine target position
        const { data: facultyData } = await supabase
          .from("users")
          .select("current_rank")
          .eq("user_id", data.faculty_id)
          .maybeSingle();

        // Get positions to find matching target position
        const { data: positions } = await supabase
          .from("positions")
          .select("position_id, position_name")
          .order("position_id", { ascending: true });

        // Use first position or rank-matched position
        let targetPositionId = positions?.[0]?.position_id;
        if (facultyData?.current_rank && positions) {
          const matchingPos = positions.find(p => 
            p.position_name?.toLowerCase().includes(facultyData.current_rank?.toLowerCase())
          );
          targetPositionId = matchingPos?.position_id || targetPositionId;
        }

        if (targetPositionId) {
          const { error: appError } = await supabase
            .from("applications")
            .insert({
              faculty_id: data.faculty_id,
              cycle_id: cycleId,
              target_position_id: targetPositionId,
              current_rank_at_time: facultyData?.current_rank || "Instructor I",
              application_number: `APP-${cycleId}-${data.faculty_id}-${Date.now()}`,
              status: "Draft",
            });

          if (appError) {
            console.warn("⚠️ Failed to auto-create application:", appError);
          } else {
            console.log("✅ Application auto-created successfully");
          }
        }
      }
    }

    res.json({ participant: data || null });
  } catch (err) {
    console.error("Error updating participant:", err);
    res.status(500).json({ error: "Failed to update participant" });
  }
});

app.delete("/cycles/:cycleId/participants/:facultyId", async (req, res) => {
  const { cycleId, facultyId } = req.params;

  try {
    const { error } = await supabase
      .from("cycle_participants")
      .delete()
      .eq("cycle_id", cycleId)
      .eq("faculty_id", facultyId);

    if (error) throw error;
    res.json({ ok: true });
  } catch (err) {
    console.error("Error removing participant:", err);
    res.status(500).json({ error: "Failed to remove participant" });
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
  const { email, name_first, name_last, cycle_id, invited_by } = req.body;

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
    // If a cycle is provided (or there is a current cycle), mark the new user as 'ranking'
    const resolvedCycleId = cycle_id || (await resolveCurrentCycleId());
    const defaultStatus = resolvedCycleId ? 'ranking' : 'active';

    const { data: dbUsers, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          name_last,
          name_first,
          domain_email: email,
          password_hash: "supabase-auth",
          role: "Faculty",
          status: defaultStatus,
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

    let participant = null;
    if (resolvedCycleId) {
      const participantResult = await upsertCycleParticipant({
        cycleId: resolvedCycleId,
        facultyId: faculty?.user_id || null,
        inviteEmail: email,
        status: "accepted",
        invitedBy: invited_by || null,
      });

      if (participantResult.error) {
        console.warn("Invite succeeded but participant row failed:", participantResult.error?.message || participantResult.error);
      } else {
        participant = participantResult.data;
      }
    }

    return res.status(200).json({
      message: "Invitation email sent and faculty record created.",
      inviteUser: inviteData?.user ?? null,
      dbUser: faculty,
      participant,
    });
  } catch (err) {
    console.error("Unhandled error in /invite-faculty:", err);
    return res.status(500).json({ error: "Server error while inviting faculty" });
  }
});

// ══════════════════════════════════════════
// PERFORMANCE EVALUATION ENDPOINTS
// ══════════════════════════════════════════

// GET /perfeval/:applicationId
// Retrieve complete evaluation data for a specific application
app.get("/perfeval/:applicationId", async (req, res) => {
  const { applicationId } = req.params;

  try {
    // 1. Get application data with faculty info
    const { data: app, error: appError } = await supabase
      .from("applications")
      .select(`
        application_id,
        application_number,
        faculty_id,
        target_position_id,
        current_rank_at_time,
        status,
        hr_score,
        vpaa_score,
        final_score,
        hr_comment,
        vpaa_comment,
        created_at,
        submitted_at
      `)
      .eq("application_id", applicationId)
      .single();

    if (appError || !app) {
      return res.status(404).json({ error: "Application not found" });
    }

    // 2. Get faculty details
    const { data: faculty, error: facultyError } = await supabase
      .from("users")
      .select(`
        user_id,
        name_first,
        name_last,
        current_rank,
        department_id,
        current_salary,
        nature_of_appointment,
        educational_attainment,
        eligibility_exams,
        teaching_experience_years,
        industry_experience_years,
        applying_for,
        date_of_last_promotion
      `)
      .eq("user_id", app.faculty_id)
      .single();

    if (facultyError || !faculty) {
      return res.status(404).json({ error: "Faculty not found" });
    }

    // 3. Get department name
    const { data: dept, error: deptError } = await supabase
      .from("departments")
      .select("department_name, department_code")
      .eq("department_id", faculty.department_id)
      .single();

    // 4. Get area submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from("area_submissions")
      .select(`
        submission_id,
        area_id,
        hr_points,
        vpaa_points,
        csv_total_average_rate,
        uploaded_at,
        file_path
      `)
      .eq("application_id", app.application_id);

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
    }

    // 5. Get position details
    const { data: position, error: positionError } = await supabase
      .from("positions")
      .select("position_name, description")
      .eq("position_id", app.target_position_id)
      .single();

    res.json({
      application: app,
      faculty: {
        ...faculty,
        department: dept?.department_name || "Unknown",
      },
      submissions: submissions || [],
      position: position || null,
    });
  } catch (err) {
    console.error("Error fetching evaluation:", err);
    res.status(500).json({ error: "Failed to fetch evaluation data" });
  }
});

// GET /perfeval/faculty/:facultyId
// Get all evaluations for a specific faculty member
app.get("/perfeval/faculty/:facultyId", async (req, res) => {
  const { facultyId } = req.params;

  try {
    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        application_id,
        application_number,
        current_rank_at_time,
        status,
        final_score,
        created_at
      `)
      .eq("faculty_id", facultyId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json(applications || []);
  } catch (err) {
    console.error("Error fetching faculty evaluations:", err);
    res.status(500).json({ error: "Failed to fetch faculty evaluations" });
  }
});

// POST /perfeval/submit
// Submit/commit an evaluation (update application status and scores)
app.post("/perfeval/submit", async (req, res) => {
  const { applicationId, hrScore, vpaaScore, finalScore, hrComment, vpaaComment, reviewedBy } = req.body;

  if (!applicationId) {
    return res.status(400).json({ error: "applicationId is required" });
  }

  try {
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("applications")
      .update({
        hr_score: hrScore || 0,
        vpaa_score: vpaaScore || 0,
        final_score: finalScore || 0,
        hr_comment: hrComment || "",
        vpaa_comment: vpaaComment || "",
        status: "Under_HR_Review",
        hr_reviewed_by: reviewedBy || null,
        hr_reviewed_at: now,
      })
      .eq("application_id", applicationId)
      .select();

    if (error) throw error;

    // Log the activity
    await supabase.from("applicationlogs").insert({
      application_id: applicationId,
      changed_by: reviewedBy || null,
      old_status: "Submitted",
      new_status: "Under_HR_Review",
      comment: "Evaluation submitted for review",
      changed_at: now,
    });

    res.json({
      message: "Evaluation submitted successfully",
      application: data && data.length > 0 ? data[0] : null,
    });
  } catch (err) {
    console.error("Error submitting evaluation:", err);
    res.status(500).json({ error: "Failed to submit evaluation" });
  }
});

// ══════════════════════════════════════════
// REVIEW & SCORING ENDPOINTS
// ══════════════════════════════════════════

// GET /review/areas/:applicationId
// Fetch all areas with submissions and criteria for an application
app.get("/review/areas/:applicationId", async (req, res) => {
  const { applicationId } = req.params;

  try {
    // Get all areas
    const { data: areasData, error: areasError } = await supabase
      .from("areas")
      .select("*")
      .order("area_id", { ascending: true });

    if (areasError) throw areasError;

    // Get submissions for this application
    const { data: submissions, error: submissionsError } = await supabase
      .from("area_submissions")
      .select("*")
      .eq("application_id", applicationId);

    if (submissionsError) {
      console.error("Error fetching submissions:", submissionsError);
    }

    // Combine areas with their submissions
    const areasWithSubmissions = (areasData || []).map((area) => {
      const submission = (submissions || []).find(
        (s) => s.area_id === area.area_id
      );

      return {
        area_id: area.area_id,
        area_name: area.area_name,
        description: area.description,
        max_possible_points: area.max_possible_points,
        template_file_path: area.template_file_path,
        is_csv_based: area.is_csv_based,
        submission: submission || null,
        criteria: area.criteria || [], // Will be populated if stored in DB
      };
    });

    res.json(areasWithSubmissions);
  } catch (err) {
    console.error("Error fetching areas for review:", err);
    res.status(500).json({ error: "Failed to fetch areas" });
  }
});

// GET /review/area-detail/:areaId/:applicationId
// Fetch detailed scoring criteria for a specific area with submission data
app.get("/review/area-detail/:areaId/:applicationId", async (req, res) => {
  const { areaId, applicationId } = req.params;

  try {
    // Get area details
    const { data: area, error: areaError } = await supabase
      .from("areas")
      .select("*")
      .eq("area_id", areaId)
      .single();

    if (areaError || !area) {
      return res.status(404).json({ error: "Area not found" });
    }

    // Get submission for this area
    const { data: submission, error: submissionError } = await supabase
      .from("area_submissions")
      .select("*")
      .eq("area_id", areaId)
      .eq("application_id", applicationId)
      .single();

    if (submissionError) {
      console.error("Error fetching submission:", submissionError);
    }

    // Build scoring criteria based on area
    const scoringCriteria = getAreaCriteria(area.area_id, area.area_name);

    res.json({
      area,
      submission: submission || null,
      criteria: scoringCriteria,
    });
  } catch (err) {
    console.error("Error fetching area detail:", err);
    res.status(500).json({ error: "Failed to fetch area details" });
  }
});

// Helper function to return scoring criteria for each area
function getAreaCriteria(areaId, areaName) {
  const criteriaMap = {
    1: [ // AREA I: Educational Qualifications
      { label: "Associate Courses/Program (2 years)", max: 25, weight: 0.25 },
      { label: "Bachelor's Degree (4-5 years)", max: 45, weight: 0.45 },
      { label: "Diploma course (Above Bachelor's)", max: 46, weight: 0.46 },
      { label: "Master's Program (MA/MS)", max: 47, weight: 0.47 },
    ],
    2: [ // AREA II: Research and Publications
      { label: "Peer-reviewed research articles", max: 20, weight: 0.2 },
      { label: "Published books/chapters", max: 20, weight: 0.2 },
      { label: "International conference presentations", max: 15, weight: 0.15 },
      { label: "Local conference presentations", max: 15, weight: 0.15 },
    ],
    3: [ // AREA III: Teaching Experience
      { label: "Years of teaching experience", max: 30, weight: 0.3 },
      { label: "Course development", max: 20, weight: 0.2 },
      { label: "Instructional materials development", max: 15, weight: 0.15 },
      { label: "Teaching awards/recognition", max: 15, weight: 0.15 },
    ],
    4: [ // AREA IV: Performance Evaluation
      { label: "Faculty performance rating", max: 10, weight: 0.4 },
      { label: "Student feedback score", max: 10, weight: 0.3 },
      { label: "Peer review rating", max: 10, weight: 0.3 },
    ],
    5: [ // AREA V: Training and Seminars
      { label: "Local seminars attended", max: 15, weight: 0.3 },
      { label: "International training programs", max: 20, weight: 0.4 },
      { label: "Certificates obtained", max: 15, weight: 0.3 },
    ],
  };

  return criteriaMap[areaId] || [];
}

// GET /review/area-evaluation/:applicationId/:areaId
// Get complete area evaluation breakdown with editable scores
app.get("/review/area-evaluation/:applicationId/:areaId", async (req, res) => {
  const { applicationId, areaId } = req.params;

  try {
    // Get area details
    const { data: area, error: areaError } = await supabase
      .from("areas")
      .select("*")
      .eq("area_id", areaId)
      .single();

    if (areaError || !area) {
      return res.status(404).json({ error: "Area not found" });
    }

    // Get submission for this area
    const { data: submission, error: submissionError } = await supabase
      .from("area_submissions")
      .select("*")
      .eq("area_id", areaId)
      .eq("application_id", applicationId)
      .single();

    // Get all submissions for this application to calculate total
    const { data: allSubmissions, error: allSubmissionsError } = await supabase
      .from("area_submissions")
      .select("hr_points")
      .eq("application_id", applicationId);

    const totalScore = (allSubmissions || []).reduce((sum, sub) => {
      return sum + Number(sub.hr_points || 0);
    }, 0);

    const criteria = getAreaCriteria(parseInt(areaId), area.area_name);

    // Generate score breakdown for the criteria table
    const criteriaWithScores = criteria.map((criterion, idx) => ({
      ...criterion,
      score: submission ? Number(submission.hr_points || 0) * (criterion.weight || 0.2) : 0
    }));

    res.json({
      area,
      submission: submission || null,
      criteria: criteriaWithScores,
      totalScore,
      areaScore: submission?.hr_points || 0,
    });
  } catch (err) {
    console.error("Error fetching area evaluation:", err);
    res.status(500).json({ error: "Failed to fetch area evaluation" });
  }
});

// PATCH /review/area-score/:submissionId
// Update score for a specific area submission
app.patch("/review/area-score/:submissionId", async (req, res) => {
  const { submissionId } = req.params;
  const { hrPoints, vpaaPoints } = req.body;

  if (!submissionId) {
    return res.status(400).json({ error: "submissionId is required" });
  }

  try {
    const { data, error } = await supabase
      .from("area_submissions")
      .update({
        hr_points: hrPoints !== undefined ? hrPoints : undefined,
        vpaa_points: vpaaPoints !== undefined ? vpaaPoints : undefined,
      })
      .eq("submission_id", submissionId)
      .select();

    if (error) throw error;

    res.json({
      message: "Score updated successfully",
      submission: data && data.length > 0 ? data[0] : null,
    });
  } catch (err) {
    console.error("Error updating score:", err);
    res.status(500).json({ error: "Failed to update score" });
  }
});

// ══════════════════════════════════════════
// DEBUG ENDPOINTS (For troubleshooting)
// ══════════════════════════════════════════

// GET /debug/area-submissions
// Check raw area_submissions data to diagnose filtering issues
app.get("/debug/area-submissions", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("area_submissions")
      .select("*")
      .order("application_id");

    if (error) throw error;

    // Group by application_id to show the issue
    const grouped = {};
    (data || []).forEach(submission => {
      const appId = submission.application_id;
      if (!grouped[appId]) grouped[appId] = [];
      grouped[appId].push({
        submission_id: submission.submission_id,
        application_id: submission.application_id,
        area_id: submission.area_id,
        file_path: submission.file_path ? '✓ Has file' : '✗ No file'
      });
    });

    res.json({
      totalSubmissions: data?.length || 0,
      byApplicationId: grouped,
      firstFewRecords: (data || []).slice(0, 5)
    });
  } catch (err) {
    console.error("Error fetching area submissions:", err);
    res.status(500).json({ error: "Failed to fetch area submissions", details: err.message });
  }
});

// GET /debug/area-submissions/:applicationId
// Check submissions for a specific application
app.get("/debug/area-submissions/:applicationId", async (req, res) => {
  const { applicationId } = req.params;
  
  try {
    const { data, error } = await supabase
      .from("area_submissions")
      .select("*")
      .eq("application_id", applicationId);

    if (error) throw error;

    const { data: appData, error: appError } = await supabase
      .from("applications")
      .select("application_id, faculty_id")
      .eq("application_id", applicationId)
      .single();

    const { data: facultyData, error: facultyError } = appData && appData.faculty_id ? await supabase
      .from("users")
      .select("user_id, name_first, name_last")
      .eq("user_id", appData.faculty_id)
      .single() : { data: null, error: null };

    res.json({
      applicationId,
      applicationExists: !!appData,
      application: appData,
      facultyName: facultyData ? `${facultyData.name_first} ${facultyData.name_last}` : 'Unknown',
      submissionCount: data?.length || 0,
      submissions: data || [],
      message: data?.length === 0 ? '⚠️ NO submissions found for this application!' : `✓ Found ${data?.length} submissions`
    });
  } catch (err) {
    console.error("Error fetching submissions for app:", err);
    res.status(500).json({ error: "Failed to fetch submissions", details: err.message });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Sync participants from existing users who are marked 'For Ranking'
// Body: { action: 'invite' | 'accept' } — determines whether synced rows are invited or accepted
// Update a user's status (e.g., set 'ranking' or 'inactive')
app.patch('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!id) return res.status(400).json({ error: 'user id is required' });
  if (!status) return res.status(400).json({ error: 'status is required' });

  try {
    const { data, error } = await supabase
      .from('users')
      .update({ status })
      .eq('user_id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    res.json({ user: data || null });
  } catch (err) {
    console.error('Error updating user status:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});