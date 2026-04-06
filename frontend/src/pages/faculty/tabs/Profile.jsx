// 📄 SIA/frontend/src/pages/faculty/tabs/Profile.jsx
//
// ── REVISION NOTES (Midterm Demo Feedback) ──────────────────────────────────
// • Removed "Current Salary" field — salary must not be disclosed to faculty
// • Removed "Applying For" field — HR manages target position, not faculty
// • Removed "Faculty Performance Rating" card from profile —
//     rating is now shown in the Dashboard hero only (see Home.jsx)
// • Added Data Privacy Provision section at the bottom
// • Added last-cycle performance rating chip in the hero (read-only)
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
    User,
    Building2,
    Mail,
    School,
    Briefcase,
    GraduationCap,
    ClipboardList,
    Star,
    Lock,
    Eye,
    EyeOff,
    CheckCircle,
    Info,
    BadgeCheck,
    Calendar,
    Pencil,
    X,
    Plus,
    Camera,
    Clock,
    AlertCircle,
    Upload,
    Shield,
} from "lucide-react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');

  :root {
    --gc-green: #1a6b3c;
    --gc-green-dark: #134f2c;
    --gc-green-light: #228b4e;
    --gc-green-pale: #eef7f2;
    --gc-gold: #c9a84c;
    --gc-gold-light: #e8c96b;
    --gc-gold-pale: #fdf8ec;
    --white: #ffffff;
    --off-white: #f8f7f4;
    --text-dark: #1a1a1a;
    --text-mid: #3a4a3e;
    --text-muted: #6b7c70;
    --border: #dde5df;
    --danger: #c0392b;
    --danger-pale: #fdf0ee;
    --blue: #2471a3;
    --blue-pale: #eaf3fb;
    --pending: #d35400;
    --pending-pale: #fef0e6;
  }

  /* ── HERO ── */
  .pf-hero {
    background: linear-gradient(135deg, var(--gc-green-dark) 0%, var(--gc-green) 55%, #22704a 100%);
    border-radius: 16px; padding: 26px 28px; margin-bottom: 20px;
    display: flex; align-items: center; gap: 20px;
    box-shadow: 0 8px 32px rgba(26,107,60,0.22);
    position: relative; overflow: hidden;
    animation: pfFadeUp 0.5s 0.1s ease both;
  }
  .pf-hero::before {
    content:''; position:absolute; top:-60px; right:-60px;
    width:240px; height:240px; border-radius:50%;
    background:rgba(201,168,76,0.09); pointer-events:none;
  }

  /* Avatar with camera overlay */
  .pf-avatar-wrap {
    position:relative; flex-shrink:0; cursor:pointer;
  }
  .pf-hero-avatar {
    width:80px; height:80px; border-radius:50%;
    background:rgba(255,255,255,0.18); border:3px solid rgba(255,255,255,0.35);
    display:flex; align-items:center; justify-content:center;
    color:rgba(255,255,255,0.9); overflow:hidden;
  }
  .pf-hero-avatar img { width:100%; height:100%; object-fit:cover; }
  .pf-avatar-overlay {
    position:absolute; inset:0; border-radius:50%;
    background:rgba(0,0,0,0.45);
    display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;
    opacity:0; transition:opacity 0.2s; color:var(--white);
  }
  .pf-avatar-wrap:hover .pf-avatar-overlay { opacity:1; }
  .pf-avatar-label { font-size:9px; font-weight:700; letter-spacing:0.5px; line-height:1; }
  .pf-avatar-pending {
    position:absolute; bottom:0; right:0;
    width:20px; height:20px; border-radius:50%;
    background:var(--pending); border:2px solid var(--white);
    display:flex; align-items:center; justify-content:center;
  }

  .pf-hero-info { flex:1; min-width:0; position:relative; z-index:1; }
  .pf-hero-tag  {
    font-size:10.5px; color:var(--gc-gold-light); letter-spacing:1.5px;
    text-transform:uppercase; font-weight:600; margin-bottom:5px;
  }
  .pf-hero-name {
    font-family:'Playfair Display',serif; font-size:22px; color:var(--white);
    font-weight:600; margin-bottom:10px; line-height:1.2;
  }
  .pf-hero-chips { display:flex; flex-wrap:wrap; gap:8px; }
  .pf-chip {
    display:inline-flex; align-items:center; gap:5px;
    background:rgba(255,255,255,0.14); border:1px solid rgba(255,255,255,0.2);
    border-radius:20px; padding:4px 12px; font-size:12px; color:var(--white); font-weight:500;
  }
  .pf-chip.gold {
    background:rgba(201,168,76,0.22); border-color:rgba(201,168,76,0.45);
    color:var(--gc-gold-light);
  }
  .pf-status-box { text-align:right; flex-shrink:0; position:relative; z-index:1; }
  .psb-label  { font-size:10px; color:rgba(255,255,255,0.55); letter-spacing:1px; text-transform:uppercase; margin-bottom:3px; }
  .psb-active { font-size:14px; font-weight:700; color:#7debb0; display:flex; align-items:center; gap:5px; justify-content:flex-end; }
  .psb-sub    { font-size:12.5px; color:rgba(255,255,255,0.7); font-weight:500; }

  /* ── CARD ── */
  .pf-card {
    background:var(--white); border-radius:14px; border:1px solid var(--border);
    padding:20px; box-shadow:0 2px 6px rgba(0,0,0,0.04); margin-bottom:18px;
    animation: pfFadeUp 0.5s ease both;
  }
  .pf-card-header {
    display:flex; align-items:center; gap:10px; margin-bottom:18px;
    padding-bottom:14px; border-bottom:1px solid var(--border);
  }
  .pf-card-icon {
    width:34px; height:34px; border-radius:9px;
    background:var(--gc-green-pale); color:var(--gc-green);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .pf-card-title { font-family:'Playfair Display',serif; font-size:15px; font-weight:600; color:var(--text-dark); flex:1; }
  .pf-card-editable-badge {
    display:inline-flex; align-items:center; gap:4px;
    font-size:10px; font-weight:600; color:var(--gc-green);
    background:var(--gc-green-pale); padding:3px 9px; border-radius:20px;
  }
  .pf-card-readonly-badge {
    display:inline-flex; align-items:center; gap:4px;
    font-size:10px; font-weight:600; color:var(--text-muted);
    background:var(--off-white); border:1px solid var(--border);
    padding:3px 9px; border-radius:20px;
  }

  /* ── GRIDS ── */
  .pf-grid-2      { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:0px; }
  .pf-grid-2-asym { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:18px; }

  /* ── FIELDS ── */
  .pf-fields { display:flex; flex-direction:column; gap:14px; }
  .pf-row    { display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:14px; }
  .pf-item   { display:flex; flex-direction:column; gap:4px; }
  .pf-item.full { grid-column:1/-1; }
  .pf-label  {
    font-size:11px; font-weight:600; color:var(--text-muted);
    letter-spacing:0.5px; text-transform:uppercase;
    display:flex; align-items:center; gap:5px;
  }
  .pf-label-required { color:var(--gc-gold); font-size:10px; }
  .pf-value  { font-size:14px; font-weight:500; color:var(--text-dark); line-height:1.4; }
  .pf-tag {
    display:inline-flex; align-items:center;
    background:var(--gc-green-pale); color:var(--gc-green-dark);
    font-size:12px; font-weight:600; padding:3px 10px; border-radius:8px;
  }

  /* ── EDITABLE FIELD ── */
  .pf-editable-field { display:flex; flex-direction:column; gap:4px; }
  .pf-edit-row { display:flex; align-items:center; gap:6px; }
  .pf-edit-input {
    flex:1; padding:8px 12px; border:1.5px solid var(--border); border-radius:8px;
    font-family:'Source Sans 3',sans-serif; font-size:14px; color:var(--text-dark);
    background:var(--white); outline:none; transition:border-color 0.2s;
  }
  .pf-edit-input:focus { border-color:var(--gc-green); }
  .pf-edit-btn {
    width:30px; height:30px; border-radius:7px; border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
    transition:all 0.15s;
  }
  .pf-edit-btn-pencil { background:var(--gc-green-pale); color:var(--gc-green); }
  .pf-edit-btn-pencil:hover { background:var(--gc-green); color:var(--white); }
  .pf-edit-btn-save { background:var(--gc-green); color:var(--white); }
  .pf-edit-btn-save:hover { opacity:0.85; }
  .pf-edit-btn-cancel { background:var(--off-white); color:var(--text-muted); }
  .pf-edit-btn-cancel:hover { background:var(--border); }

  /* Pending badge on a field */
  .pf-pending-badge {
    display:inline-flex; align-items:center; gap:4px;
    font-size:10.5px; font-weight:600; color:var(--pending);
    background:var(--pending-pale); border:1px solid rgba(211,84,0,0.2);
    padding:2px 8px; border-radius:6px; margin-top:3px;
  }

  /* ── EDUCATION LIST (editable) ── */
  .pf-edu-list { display:flex; flex-direction:column; gap:12px; }
  .pf-edu-item {
    display:flex; align-items:flex-start; gap:12px;
    padding:12px; border-radius:10px; background:var(--off-white);
    border:1px solid var(--border); position:relative;
  }
  .pf-edu-level {
    font-size:10px; font-weight:700; padding:3px 8px; border-radius:6px;
    white-space:nowrap; flex-shrink:0; margin-top:2px; letter-spacing:0.5px;
  }
  .edu-bachelor  { background:#e8f4fd; color:var(--blue); }
  .edu-masters   { background:var(--gc-green-pale); color:var(--gc-green-dark); }
  .edu-doctorate { background:#f5f0fb; color:#6c3483; }
  .pf-edu-degree { font-size:13.5px; font-weight:600; color:var(--text-dark); margin-bottom:3px; }
  .pf-edu-school { font-size:12px; color:var(--text-muted); display:flex; align-items:center; gap:4px; }
  .pf-edu-add {
    display:flex; align-items:center; gap:6px;
    padding:9px 14px; border-radius:9px; border:1.5px dashed var(--border);
    background:var(--white); cursor:pointer; font-size:13px; font-weight:600;
    color:var(--text-muted); font-family:'Source Sans 3',sans-serif;
    transition:all 0.15s; width:100%;
  }
  .pf-edu-add:hover { border-color:var(--gc-green); color:var(--gc-green); }

  /* ── ELIGIBILITY (editable) ── */
  .pf-elig-list { display:flex; flex-direction:column; gap:8px; }
  .pf-elig-item {
    display:flex; align-items:center; gap:10px;
    font-size:13.5px; color:var(--text-mid);
    padding:8px 12px; border-radius:8px; background:var(--off-white);
    border:1px solid var(--border);
  }
  .pf-elig-dot {
    width:8px; height:8px; border-radius:50%;
    background:var(--gc-green); flex-shrink:0;
  }
  .pf-elig-text { flex:1; }
  .pf-elig-add {
    display:flex; align-items:center; gap:6px;
    padding:9px 14px; border-radius:9px; border:1.5px dashed var(--border);
    background:var(--white); cursor:pointer; font-size:13px; font-weight:600;
    color:var(--text-muted); font-family:'Source Sans 3',sans-serif;
    transition:all 0.15s; width:100%;
  }
  .pf-elig-add:hover { border-color:var(--gc-green); color:var(--gc-green); }

  /* ── DATA PRIVACY ── */
  .pf-privacy-body {
    font-size:13.5px; color:var(--text-mid); line-height:1.75;
  }
  .pf-privacy-body p { margin-bottom:12px; }
  .pf-privacy-body p:last-child { margin-bottom:0; }
  .pf-privacy-list {
    list-style:none; display:flex; flex-direction:column; gap:7px;
    margin:10px 0 12px 0;
  }
  .pf-privacy-list li {
    display:flex; align-items:flex-start; gap:8px;
    font-size:13px; color:var(--text-mid); line-height:1.5;
  }
  .pf-privacy-list li::before {
    content:'▸'; color:var(--gc-gold); flex-shrink:0; font-size:11px; margin-top:2px;
  }

  /* ── NOTICES ── */
  .pf-notice {
    border-radius:10px; padding:14px 18px; margin-bottom:18px;
    display:flex; align-items:flex-start; gap:10px;
    font-size:13px; line-height:1.6;
    animation: pfFadeUp 0.5s 0.3s ease both;
  }
  .pf-notice-blue    { background:var(--blue-pale); border:1px solid rgba(36,113,163,0.2); color:var(--blue); }
  .pf-notice-pending { background:var(--pending-pale); border:1px solid rgba(211,84,0,0.2); color:var(--pending); }
  .pf-notice strong  { color:var(--gc-green-dark); }

  /* ── CHANGE PASSWORD ── */
  .pf-cp-fields { display:flex; flex-direction:column; gap:14px; margin-bottom:18px; }
  .pf-cp-field  { display:flex; flex-direction:column; gap:6px; }
  .pf-cp-wrap {
    display:flex; align-items:center;
    border:1.5px solid var(--border); border-radius:8px;
    background:var(--white); overflow:hidden; transition:border-color 0.2s;
  }
  .pf-cp-wrap:focus-within { border-color:var(--gc-green); }
  .pf-cp-input {
    flex:1; padding:11px 14px; border:none; outline:none;
    font-family:'Source Sans 3',sans-serif; font-size:14px;
    color:var(--text-dark); background:transparent;
  }
  .pf-cp-input::placeholder { color:#b0bdb5; }
  .pf-cp-eye {
    padding:0 12px; background:none; border:none;
    cursor:pointer; color:var(--text-muted); transition:color 0.15s;
    display:flex; align-items:center;
  }
  .pf-cp-eye:hover { color:var(--gc-green); }
  .pf-strength-bar   { height:4px; border-radius:4px; background:var(--border); margin-top:6px; overflow:hidden; }
  .pf-strength-fill  { height:100%; border-radius:4px; transition:width 0.3s, background 0.3s; }
  .pf-strength-label { font-size:11px; font-weight:600; margin-top:4px; }
  .pf-match-msg      { font-size:11.5px; font-weight:600; min-height:16px; display:flex; align-items:center; gap:4px; }
  .pf-cp-actions { display:flex; gap:10px; justify-content:flex-end; }
  .pf-cp-cancel {
    padding:9px 18px; border-radius:8px; border:1.5px solid var(--border); background:var(--white);
    font-size:13px; font-weight:600; color:var(--text-muted);
    cursor:pointer; font-family:'Source Sans 3',sans-serif; transition:background 0.15s;
  }
  .pf-cp-cancel:hover { background:var(--off-white); }
  .pf-cp-save {
    padding:9px 20px; border-radius:8px; border:none;
    background:linear-gradient(135deg,var(--gc-green),var(--gc-green-light));
    font-size:13px; font-weight:600; color:var(--white);
    cursor:pointer; font-family:'Source Sans 3',sans-serif;
    box-shadow:0 4px 12px rgba(26,107,60,0.25); transition:opacity 0.15s, transform 0.15s;
  }
  .pf-cp-save:hover { opacity:0.9; transform:translateY(-1px); }
  .pf-cp-success {
    display:flex; align-items:center; gap:12px;
    background:#eafaf1; border:1.5px solid #a9dfbf;
    border-radius:10px; padding:14px 16px;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 900px) {
    .pf-grid-2      { grid-template-columns: 1fr; }
    .pf-grid-2-asym { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .pf-hero         { flex-direction: column; align-items: flex-start; padding: 20px; }
    .pf-hero-name    { font-size: 18px; }
    .pf-status-box   { text-align: left; }
    .psb-active      { justify-content: flex-start; }
    .pf-row          { grid-template-columns: 1fr 1fr; }
    .pf-cp-actions   { flex-direction: column; }
    .pf-cp-cancel, .pf-cp-save { width: 100%; text-align: center; justify-content: center; }
  }
  @media (max-width: 400px) {
    .pf-row        { grid-template-columns: 1fr; }
    .pf-hero-chips { flex-direction: column; }
  }

  @keyframes pfFadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE EDIT WINDOW FLAG
// TODO (backend): fetch from Firestore — rankingcycles collection (same doc as submission_open)
//   const cycleDoc = await getDoc(doc(db, "rankingcycles", currentCycleId));
//   const profileEditOpen = cycleDoc.data().profile_edit_open; // boolean
//   HR sets this independently from submission_open — faculty can only edit their
//   profile during the window HR defines, typically at the start of a new cycle.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_PROFILE_EDIT_OPEN = false; // TODO: replace with Firestore value above

function getStrength(pw) {
    if (!pw) return { label: "", color: "", pct: "0%" };
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    if (s <= 1) return { label: "Weak", color: "#e74c3c", pct: "25%" };
    if (s === 2) return { label: "Fair", color: "#e67e22", pct: "50%" };
    if (s === 3) return { label: "Good", color: "#f1c40f", pct: "75%" };
    return { label: "Strong", color: "#27ae60", pct: "100%" };
}

// ── Reusable editable field component ──
function EditableField({ label, value, onSave, pending, disabled }) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(value);

    const handleSave = () => {
        if (draft.trim() && draft !== value) onSave(draft.trim());
        setEditing(false);
    };
    const handleCancel = () => {
        setDraft(value);
        setEditing(false);
    };

    return (
        <div className="pf-editable-field">
            <div className="pf-label">{label}</div>
            {editing ? (
                <div className="pf-edit-row">
                    <input
                        className="pf-edit-input"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleSave();
                            if (e.key === "Escape") handleCancel();
                        }}
                        autoFocus
                    />
                    <button
                        className="pf-edit-btn pf-edit-btn-save"
                        onClick={handleSave}
                    >
                        {" "}
                        <CheckCircle size={13} />
                    </button>
                    <button
                        className="pf-edit-btn pf-edit-btn-cancel"
                        onClick={handleCancel}
                    >
                        {" "}
                        <X size={13} />
                    </button>
                </div>
            ) : (
                <div className="pf-edit-row">
                    <div className="pf-value" style={{ flex: 1 }}>
                        {value}
                    </div>
                    {/* Pencil hidden when: field has a pending change, or the edit window is closed */}
                    {!pending && !disabled && (
                        <button
                            className="pf-edit-btn pf-edit-btn-pencil"
                            onClick={() => setEditing(true)}
                        >
                            <Pencil size={13} />
                        </button>
                    )}
                </div>
            )}
            {pending && (
                <div className="pf-pending-badge">
                    <Clock size={10} /> Pending HR verification
                </div>
            )}
        </div>
    );
}

export default function Profile({ user }) {
    // TODO: replace with Firestore fetch — see MOCK_PROFILE_EDIT_OPEN comment above
    const profileEditOpen = MOCK_PROFILE_EDIT_OPEN;
    // ── Editable field states ──
    // TODO: fetch all initial values from Firestore — users collection, doc ID = auth.currentUser.uid
    const [middleName, setMiddleName] = useState("B.");
    const [altEmail, setAltEmail] = useState("");
    const [teachingYears, setTeachingYears] = useState("6 years");
    const [industryYears, setIndustryYears] = useState("3 years");
    const [avatarPending, setAvatarPending] = useState(false);

    // Pending changes — fields that have been edited but not yet approved by HR
    // TODO: fetch from Firestore — profile_change_requests collection
    //       filter by user_id = auth.currentUser.uid and status = "pending"
    const [pendingFields, setPendingFields] = useState({});

    // Education entries
    // TODO: fetch from Firestore — users.educational_attainment field
    const [eduList, setEduList] = useState([
        {
            level: "Bachelor's",
            levelClass: "edu-bachelor",
            degree: "Bachelor of Science in Computer Science",
            school: "Gordon College · 2014",
            pending: false,
        },
        {
            level: "Master's",
            levelClass: "edu-masters",
            degree: "Master of Science in Information Technology",
            school: "Pamantasan ng Lungsod ng Maynila · 2019",
            pending: false,
        },
    ]);

    // Eligibility entries
    // TODO: fetch from Firestore — users.eligibility_exams field
    const [eligList, setEligList] = useState([
        {
            text: "Civil Service Professional (CSC) — Passed 2014",
            pending: false,
        },
        {
            text: "Electronics Engineer (ECE Board) — Passed 2015",
            pending: false,
        },
    ]);

    // Change password states
    const [cpCurrent, setCpCurrent] = useState("");
    const [cpNew, setCpNew] = useState("");
    const [cpConfirm, setCpConfirm] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [cpSuccess, setCpSuccess] = useState(false);

    const strength = getStrength(cpNew);
    const passwordsMatch = cpNew.length > 0 && cpNew === cpConfirm;

    // ── Handlers ──

    const handleFieldSave = (field, value) => {
        // TODO: write to Firestore — profile_change_requests collection
        // doc structure: { user_id, field, old_value, new_value, status:"pending", requested_at: serverTimestamp() }
        // HR portal will show this as a pending change to review and approve or reject
        setPendingFields((prev) => ({ ...prev, [field]: value }));
    };

    const handleAvatarChange = () => {
        // TODO: open file picker → upload to Firebase Storage → save URL to profile_change_requests
        // path: profile_pictures/{userId}/{timestamp}.jpg
        // set users.profile_picture_pending = download URL
        // HR approves → copy to users.profile_picture
        setAvatarPending(true);
    };

    const handleAddEdu = () => {
        // TODO: open a modal to input new degree details
        // save to profile_change_requests with field="educational_attainment"
        // new entry shown with pending:true until HR approves
        const newEntry = {
            level: "New Degree",
            levelClass: "edu-bachelor",
            degree: "[Degree Title]",
            school: "[School · Year]",
            pending: true,
        };
        setEduList((prev) => [...prev, newEntry]);
    };

    const handleAddElig = () => {
        // TODO: open a modal to input new eligibility/board exam
        // save to profile_change_requests with field="eligibility_exams"
        const newEntry = {
            text: "[New Eligibility / Board Exam]",
            pending: true,
        };
        setEligList((prev) => [...prev, newEntry]);
    };

    const handleCpSubmit = () => {
        if (!cpCurrent || !cpNew || !cpConfirm) return;
        if (cpNew !== cpConfirm || cpNew.length < 8) return;
        // TODO: connect Firebase
        // import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
        // import { auth } from "../../firebase/auth";
        // const credential = EmailAuthProvider.credential(auth.currentUser.email, cpCurrent);
        // await reauthenticateWithCredential(auth.currentUser, credential);
        // await updatePassword(auth.currentUser, cpNew);
        setCpSuccess(true);
        setTimeout(() => {
            setCpSuccess(false);
            setCpCurrent("");
            setCpNew("");
            setCpConfirm("");
        }, 4000);
    };

    const hasPendingChanges =
        Object.keys(pendingFields).length > 0 ||
        avatarPending ||
        eduList.some((e) => e.pending) ||
        eligList.some((e) => e.pending);

    return (
        <>
            <style>{styles}</style>

            {/* ── HERO ── */}
            {/* TODO: fetch profile data from Firestore — users collection, doc ID = auth.currentUser.uid */}
            <div className="pf-hero">
                {/* Profile picture — faculty can request change, requires HR approval */}
                {/* Avatar click is only active when the profile edit window is open */}
                <div
                    className="pf-avatar-wrap"
                    onClick={profileEditOpen ? handleAvatarChange : undefined}
                    style={!profileEditOpen ? { cursor: "default" } : undefined}
                >
                    <div className="pf-hero-avatar">
                        {/* TODO: show users.profile_picture if exists, else show default icon */}
                        <User size={34} />
                    </div>
                    <div className="pf-avatar-overlay">
                        <Camera size={16} />
                        <span className="pf-avatar-label">Change</span>
                    </div>
                    {avatarPending && (
                        <div className="pf-avatar-pending">
                            <Clock size={10} color="white" />
                        </div>
                    )}
                </div>

                <div className="pf-hero-info">
                    <div className="pf-hero-tag">
                        Faculty Profile · Some fields require HR verification
                    </div>
                    <div className="pf-hero-name">
                        {user?.displayName || "David Bryan B. Candido"}
                    </div>
                    <div className="pf-hero-chips">
                        <span className="pf-chip">
                            <School size={12} /> Instructor I
                        </span>
                        <span className="pf-chip">
                            <Building2 size={12} /> Dept. of Computer Studies
                        </span>
                        <span className="pf-chip">
                            <Mail size={12} />{" "}
                            {user?.email || "202011090@gordoncollege.edu.ph"}
                        </span>
                        {/* Performance rating chip — read-only, sourced from last published cycle */}
                        {/* TODO: fetch from Firestore — areasubmissions where area_id = Area IV
                            for the most recently published cycle of this faculty member.
                            Show csv_total_average_rate (e.g. "4.52 · Outstanding") */}
                        <span className="pf-chip gold">
                            <Star size={12} /> 4.52 · Outstanding
                        </span>
                    </div>
                </div>

                <div className="pf-status-box">
                    <div className="psb-label">Account Status</div>
                    <div className="psb-active">
                        <BadgeCheck size={14} /> Active
                    </div>
                    <div className="psb-label" style={{ marginTop: 10 }}>
                        Member Since
                    </div>
                    {/* TODO: fetch from users.created_at */}
                    <div className="psb-sub">June 12, 2020</div>
                </div>
            </div>

            {/* Profile edit window closed notice */}
            {/* TODO (backend): shown when rankingcycles.profile_edit_open = false */}
            {!profileEditOpen && (
                <div
                    className="pf-notice"
                    style={{
                        background: "#fdf8ec",
                        border: "1px solid rgba(201,168,76,0.35)",
                        color: "#7d5a10",
                        marginBottom: 18,
                    }}
                >
                    <Lock size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <p>
                        <strong>Profile editing is currently closed.</strong> HR
                        has not yet opened the profile edit window for this
                        cycle. You will be notified when you can update your
                        information.
                    </p>
                </div>
            )}

            {/* Pending changes notice */}
            {hasPendingChanges && (
                <div className="pf-notice pf-notice-pending">
                    <Clock size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                    <p>
                        You have <strong>pending changes</strong> awaiting HR
                        verification. They will be visible to others only after
                        HR approves them.
                    </p>
                </div>
            )}

            {/* ── ROW 1: Personal Info + Experience ── */}
            <div className="pf-grid-2">
                {/* Personal Info */}
                <div className="pf-card">
                    <div className="pf-card-header">
                        <div className="pf-card-icon">
                            <User size={16} />
                        </div>
                        <div className="pf-card-title">
                            Personal Information
                        </div>
                        <span className="pf-card-editable-badge">
                            <Pencil size={10} /> Partially editable
                        </span>
                    </div>
                    <div className="pf-fields">
                        {/* Read-only */}
                        <div className="pf-row">
                            <div className="pf-item">
                                <div className="pf-label">Last Name</div>
                                <div className="pf-value">Candido</div>
                            </div>
                            <div className="pf-item">
                                <div className="pf-label">First Name</div>
                                <div className="pf-value">David Bryan</div>
                            </div>
                        </div>
                        {/* Editable */}
                        <EditableField
                            label="Middle Name"
                            value={pendingFields.middleName || middleName}
                            pending={!!pendingFields.middleName}
                            onSave={(v) => handleFieldSave("middleName", v)}
                            disabled={!profileEditOpen}
                        />
                        <div className="pf-row">
                            <div className="pf-item">
                                <div className="pf-label">
                                    <Mail size={11} /> Domain Email
                                </div>
                                <div className="pf-value">
                                    {user?.email ||
                                        "202011090@gordoncollege.edu.ph"}
                                </div>
                            </div>
                            <div className="pf-item">
                                <div className="pf-label">
                                    <Building2 size={11} /> Department
                                </div>
                                <div className="pf-value">Computer Studies</div>
                            </div>
                        </div>
                        {/* Editable alternate email */}
                        <EditableField
                            label="Personal / Alternate Email"
                            value={
                                pendingFields.altEmail || altEmail || "Not set"
                            }
                            pending={!!pendingFields.altEmail}
                            onSave={(v) => handleFieldSave("altEmail", v)}
                            disabled={!profileEditOpen}
                        />
                    </div>
                </div>

                {/* Experience */}
                <div className="pf-card">
                    <div className="pf-card-header">
                        <div className="pf-card-icon">
                            <Briefcase size={16} />
                        </div>
                        <div className="pf-card-title">Experience</div>
                        <span className="pf-card-editable-badge">
                            <Pencil size={10} /> Editable
                        </span>
                    </div>
                    <div className="pf-fields">
                        <EditableField
                            label={
                                <>
                                    Teaching Experience{" "}
                                    <span className="pf-label-required">
                                        <Star size={10} /> Required
                                    </span>
                                </>
                            }
                            value={pendingFields.teachingYears || teachingYears}
                            pending={!!pendingFields.teachingYears}
                            onSave={(v) => handleFieldSave("teachingYears", v)}
                            disabled={!profileEditOpen}
                        />
                        <EditableField
                            label="Industry Experience"
                            value={pendingFields.industryYears || industryYears}
                            pending={!!pendingFields.industryYears}
                            onSave={(v) => handleFieldSave("industryYears", v)}
                            disabled={!profileEditOpen}
                        />
                    </div>
                </div>
            </div>

            {/* ── ROW 2: Rank & Employment — read only ── */}
            <div className="pf-card">
                <div className="pf-card-header">
                    <div className="pf-card-icon">
                        <School size={16} />
                    </div>
                    <div className="pf-card-title">Rank &amp; Employment</div>
                    <span className="pf-card-readonly-badge">
                        <Lock size={10} /> HR managed
                    </span>
                </div>
                {/* TODO: fetch from Firestore — users collection fields:
                    current_rank, nature_of_appointment, date_of_last_promotion
                    Note: current_salary and applying_for are intentionally NOT shown here.
                    Salary is not disclosed to faculty per system policy.
                    Target rank (applying_for) is visible in the Dashboard only. */}
                <div className="pf-fields">
                    <div className="pf-row">
                        <div className="pf-item">
                            <div className="pf-label">
                                Present Faculty Rank{" "}
                                <span className="pf-label-required">
                                    <Star size={10} /> Required
                                </span>
                            </div>
                            <div className="pf-value">Instructor I</div>
                        </div>
                        <div className="pf-item">
                            <div className="pf-label">
                                Nature of Appointment
                            </div>
                            <div className="pf-value">Full-time Permanent</div>
                        </div>
                        <div className="pf-item">
                            <div className="pf-label">
                                <Calendar size={11} /> Date of Last Promotion
                            </div>
                            <div className="pf-value">June 12, 2020</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── ROW 3: Education + Eligibility (stacked) ── */}
            <div className="pf-grid-2-asym">
                {/* Educational Attainment — faculty can add entries */}
                <div className="pf-card" style={{ marginBottom: 0 }}>
                    <div className="pf-card-header">
                        <div className="pf-card-icon">
                            <GraduationCap size={16} />
                        </div>
                        <div className="pf-card-title">
                            Educational Attainment
                        </div>
                        <span className="pf-card-editable-badge">
                            <Plus size={10} /> Can add
                        </span>
                    </div>
                    {/* TODO: fetch from Firestore — users.educational_attainment
                        new entries go to profile_change_requests with field="educational_attainment"
                        pending entries shown with orange badge until HR approves */}
                    <div className="pf-edu-list">
                        {eduList.map((edu, i) => (
                            <div className="pf-edu-item" key={i}>
                                <span
                                    className={`pf-edu-level ${edu.levelClass}`}
                                >
                                    {edu.level}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div className="pf-edu-degree">
                                        {edu.degree}
                                    </div>
                                    <div className="pf-edu-school">
                                        <Building2 size={11} /> {edu.school}
                                    </div>
                                    {edu.pending && (
                                        <div
                                            className="pf-pending-badge"
                                            style={{ marginTop: 6 }}
                                        >
                                            <Clock size={10} /> Pending HR
                                            verification
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {/* Add button hidden when profile edit window is closed */}
                        {profileEditOpen && (
                            <button
                                className="pf-edu-add"
                                onClick={handleAddEdu}
                            >
                                <Plus size={14} /> Add degree or credential
                            </button>
                        )}
                    </div>
                </div>

                {/* Eligibility only — Performance Rating removed from profile */}
                {/* NOTE: Faculty Performance Rating is displayed in the Dashboard (Home.jsx hero) only.
                    It was removed from Profile per midterm feedback — rating should not appear here. */}
                <div className="pf-card" style={{ marginBottom: 0 }}>
                    <div className="pf-card-header">
                        <div className="pf-card-icon">
                            <ClipboardList size={16} />
                        </div>
                        <div className="pf-card-title">
                            Eligibility &amp; Licensure
                        </div>
                        <span className="pf-card-editable-badge">
                            <Plus size={10} /> Can add
                        </span>
                    </div>
                    {/* TODO: fetch from Firestore — users.eligibility_exams
                        new entries go to profile_change_requests with field="eligibility_exams" */}
                    <div className="pf-elig-list">
                        {eligList.map((e, i) => (
                            <div className="pf-elig-item" key={i}>
                                <span className="pf-elig-dot" />
                                <span className="pf-elig-text">{e.text}</span>
                                {e.pending && (
                                    <div
                                        className="pf-pending-badge"
                                        style={{ flexShrink: 0 }}
                                    >
                                        <Clock size={10} /> Pending
                                    </div>
                                )}
                            </div>
                        ))}
                        <button className="pf-elig-add" onClick={handleAddElig}>
                            <Plus size={14} /> Add eligibility or board exam
                        </button>
                    </div>
                </div>
            </div>

            {/* ── READ-ONLY NOTICE ── */}
            <div className="pf-notice pf-notice-blue">
                <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <p>
                    Fields marked <strong>HR managed</strong> were set by the{" "}
                    <strong>HR Department</strong> and cannot be edited here.
                    For corrections, contact HR directly. Editable fields
                    require HR verification before changes become visible.
                </p>
            </div>

            {/* ── DATA PRIVACY PROVISION ── */}
            {/* Added per midterm feedback — required by VPAA */}
            <div className="pf-card">
                <div className="pf-card-header">
                    <div className="pf-card-icon">
                        <Shield size={16} />
                    </div>
                    <div className="pf-card-title">
                        Faculty Data Privacy Provision
                    </div>
                    <span className="pf-card-readonly-badge">
                        <Lock size={10} /> Read only
                    </span>
                </div>
                {/* TODO (backend): store a faculty's data privacy acknowledgement flag in Firestore
                    — users.privacy_acknowledged: boolean
                    — users.privacy_acknowledged_at: timestamp
                    When this field is false (new users), show a prompt to accept before proceeding.
                    This screen is read-only for now; acknowledgement logic to be implemented later. */}
                <div className="pf-privacy-body">
                    <p>
                        Gordon College is committed to protecting the privacy
                        and confidentiality of all personal information
                        collected through the <strong>GCFARES</strong> system,
                        in accordance with{" "}
                        <strong>Republic Act No. 10173</strong>, otherwise known
                        as the <em>Data Privacy Act of 2012</em>.
                    </p>

                    <p>By using this system, you acknowledge that:</p>

                    <ul className="pf-privacy-list">
                        <li>
                            Your personal and professional information (name,
                            educational background, employment records) is
                            collected solely for the purpose of faculty ranking
                            and advancement evaluation.
                        </li>
                        <li>
                            Your data will only be accessible to authorized
                            personnel — specifically the{" "}
                            <strong>HR Department</strong> and the{" "}
                            <strong>Office of the VPAA</strong> — for the
                            duration of an active evaluation cycle.
                        </li>
                        <li>
                            Uploaded documents submitted for evaluation are
                            stored securely and will not be shared outside of
                            the ranking process without your written consent.
                        </li>
                        <li>
                            <strong>Salary information</strong> is classified
                            and is not disclosed within the faculty-facing
                            portal. Only authorized HR personnel may view salary
                            records.
                        </li>
                        <li>
                            You have the right to request access to, correction
                            of, or deletion of your personal data by contacting
                            the MIS Office or the Data Privacy Officer of Gordon
                            College.
                        </li>
                    </ul>

                    <p>
                        For questions or concerns regarding your data, contact
                        the <strong>Gordon College MIS Office</strong> or email{" "}
                        <strong>[dpo@gordoncollege.edu.ph]</strong>.
                    </p>
                </div>
            </div>

            {/* ── CHANGE PASSWORD ── */}
            <div className="pf-card">
                <div className="pf-card-header">
                    <div className="pf-card-icon">
                        <Lock size={16} />
                    </div>
                    <div className="pf-card-title">Change Password</div>
                </div>

                {cpSuccess ? (
                    <div className="pf-cp-success">
                        <CheckCircle size={22} color="#1e8449" />
                        <div>
                            <div
                                style={{
                                    fontSize: 13.5,
                                    fontWeight: 600,
                                    color: "#1e8449",
                                }}
                            >
                                Password updated successfully
                            </div>
                            <div
                                style={{
                                    fontSize: 12,
                                    color: "var(--text-muted)",
                                    marginTop: 2,
                                }}
                            >
                                You can now use your new password to log in.
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="pf-cp-fields">
                            <div className="pf-cp-field">
                                <label className="pf-label">
                                    Current Password
                                </label>
                                <div className="pf-cp-wrap">
                                    <input
                                        type={showCurrent ? "text" : "password"}
                                        className="pf-cp-input"
                                        placeholder="Enter current password"
                                        value={cpCurrent}
                                        onChange={(e) =>
                                            setCpCurrent(e.target.value)
                                        }
                                        autoComplete="current-password"
                                    />
                                    <button
                                        className="pf-cp-eye"
                                        onClick={() =>
                                            setShowCurrent((v) => !v)
                                        }
                                    >
                                        {showCurrent ? (
                                            <EyeOff size={15} />
                                        ) : (
                                            <Eye size={15} />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="pf-cp-field">
                                <label className="pf-label">New Password</label>
                                <div className="pf-cp-wrap">
                                    <input
                                        type={showNew ? "text" : "password"}
                                        className="pf-cp-input"
                                        placeholder="At least 8 characters"
                                        value={cpNew}
                                        onChange={(e) =>
                                            setCpNew(e.target.value)
                                        }
                                        autoComplete="new-password"
                                    />
                                    <button
                                        className="pf-cp-eye"
                                        onClick={() => setShowNew((v) => !v)}
                                    >
                                        {showNew ? (
                                            <EyeOff size={15} />
                                        ) : (
                                            <Eye size={15} />
                                        )}
                                    </button>
                                </div>
                                {cpNew && (
                                    <>
                                        <div className="pf-strength-bar">
                                            <div
                                                className="pf-strength-fill"
                                                style={{
                                                    width: strength.pct,
                                                    background: strength.color,
                                                }}
                                            />
                                        </div>
                                        <div
                                            className="pf-strength-label"
                                            style={{ color: strength.color }}
                                        >
                                            {strength.label}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="pf-cp-field">
                                <label className="pf-label">
                                    Confirm New Password
                                </label>
                                <div className="pf-cp-wrap">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        className="pf-cp-input"
                                        placeholder="Re-enter new password"
                                        value={cpConfirm}
                                        onChange={(e) =>
                                            setCpConfirm(e.target.value)
                                        }
                                        autoComplete="new-password"
                                    />
                                    <button
                                        className="pf-cp-eye"
                                        onClick={() =>
                                            setShowConfirm((v) => !v)
                                        }
                                    >
                                        {showConfirm ? (
                                            <EyeOff size={15} />
                                        ) : (
                                            <Eye size={15} />
                                        )}
                                    </button>
                                </div>
                                {cpConfirm && (
                                    <div
                                        className="pf-match-msg"
                                        style={{
                                            color: passwordsMatch
                                                ? "#1e8449"
                                                : "var(--danger)",
                                        }}
                                    >
                                        {passwordsMatch ? (
                                            <>
                                                <CheckCircle size={13} />{" "}
                                                Passwords match
                                            </>
                                        ) : (
                                            "✗ Passwords do not match"
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="pf-cp-actions">
                            <button
                                className="pf-cp-cancel"
                                onClick={() => {
                                    setCpCurrent("");
                                    setCpNew("");
                                    setCpConfirm("");
                                }}
                            >
                                Cancel
                            </button>
                            {/* TODO: connect Firebase — reauthenticateWithCredential + updatePassword
                                Password change does NOT go through profile_change_requests — it's instant via Firebase Auth */}
                            <button
                                className="pf-cp-save"
                                onClick={handleCpSubmit}
                            >
                                Update Password
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
