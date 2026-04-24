
// 📄 SIA/frontend/src/pages/faculty/tabs/Home.jsx
//
// ── SUBMISSION MODEL ─────────────────────────────────────────────────────────
// REVISED (John Carlo, class rep):
//   • First-level numbered items (A.1, A.2, A.3, B.1 ...) = SEPARATE upload +
//     submit each. They represent distinct document categories.
//   • Sub-criteria (A.1.1, A.1.2 ...) = RUBRIC BULLETS grouped inside their
//     parent numbered item — NOT separate uploads.
//   • Letter Parts (A, B, C ...) that CONTAIN numbered sub-items become GROUP
//     HEADERS only — no upload at the letter-Part level itself.
//   • Letter Parts with NO numbered sub-items (most areas outside II) remain
//     a single "compile into one PDF" submission slot.
//
//   Areas using the group-header model: Area II (Parts A, B, C, D).
//   All other areas retain one upload per letter Part.
//
// ── REVISIONS ────────────────────────────────────────────────────────────────
// • Area II restructured: A/B/C/D are group headers; A.1/A.2/etc. are
//   separate submission slots; A.1.1/A.1.2/etc. are rubric bullets.
// • Submission window flag (MOCK_SUBMISSION_OPEN) gates upload/submit controls.
// • 2-level nav: Area list → Area detail with Part cards / group headers.
// • Score breakdown removed (HR-only), Ranking Summary added.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useMemo, useState } from "react";
import {
    Send,
    FileText,
    Eye,
    Download,
    RefreshCw,
    Paperclip,
    CheckCircle,
    X,
    School,
    Star,
    Building2,
    ArrowRight,
    Upload,
    Calendar,
    Megaphone,
    TrendingUp,
    ChevronLeft,
    Info,
    Lock,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// AREAS DATA
// Each `part` = one template download + one file upload + one submit button
// `what` bullets = the scoring rubric criteria for that Part (sub-items)
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// SUBMISSION WINDOW FLAG
// Default fallback used until ranking cycle data is hydrated from Supabase.
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_SUBMISSION_OPEN = false;

const AREAS_DATA = [
    // ── AREA I ─────────────────────────────────────────────────────────────────
    {
        id: "I",
        name: "Educational Qualifications",
        maxPts: 85,
        note: "Only the highest qualifying level is scored per group. Submit one file per applicable Part.",
        parts: [
            {
                id: "I-A",
                label: "Part A — Associate Courses / Program (2 years)",
                pts: "25.00",
                what: [
                    "Official Transcript of Records (TOR) showing completion of a 2-year Associate program",
                    "Diploma or Certificate of Completion (front and back)",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "I-B",
                label: "Part B — Bachelor's Degree (4–5 years)",
                pts: "45.00",
                what: [
                    "Official TOR showing completion of a 4 or 5-year Bachelor's program",
                    "Diploma (front and back)",
                ],
                status: "submitted",
                file: "TOR_Bachelors_Candido.pdf",
                date: "March 1, 2026 at 2:15 PM",
            },
            {
                id: "I-C",
                label: "Part C — Diploma Course (above Bachelor's Degree)",
                pts: "46.00",
                what: [
                    "Certificate of completion from the institution offering the post-baccalaureate diploma course",
                    "Must be a program taken after a Bachelor's degree",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "I-D",
                label: "Part D — Master's Program (units only, no degree yet)",
                pts: "47.00 – 55.00",
                what: [
                    "Official TOR showing earned MA/MS units (no degree conferred yet)",
                    "Scoring by unit count: D.1 = 6–12 units → 47 pts · D.2 = 13–18 → 49 · D.3 = 19–24 → 51 · D.4 = 25–30 → 53 · D.5 = 31+ → 55 pts",
                    "Attach the TOR that shows the highest applicable unit count",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "I-E",
                label: "Part E — Master's Comprehensive Exam Passed",
                pts: "58.00",
                what: [
                    "Official certification from the school/university that you passed the Master's Comprehensive Examination",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "I-F",
                label: "Part F — Master's Degree (non-thesis)",
                pts: "60.00",
                what: [
                    "Diploma of completion for a non-thesis Master's program",
                    "Official TOR showing all units completed and degree conferred",
                ],
                status: "submitted",
                file: "TOR_Masters_Candido.pdf",
                date: "March 1, 2026 at 2:18 PM",
            },
            {
                id: "I-G",
                label: "Part G — Master's Thesis Defended",
                pts: "62.00",
                what: [
                    "Certificate of Thesis Defense from the institution",
                    "Approved thesis title page or cover page signed by the panel",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "I-H",
                label: "Part H — Master's Degree (additional 2 pts for a second degree)",
                pts: "65.00",
                what: [
                    "Diploma for a second Master's degree",
                    "Official TOR of the additional Master's program",
                    "The base score is from Part F or G; the additional degree adds 2 pts",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "I-I",
                label: "Part I — LLB and MD (passed bar / board exam)",
                pts: "65.00",
                what: [
                    "Diploma for LLB or MD program",
                    "Proof of passing the bar (SC order) or medical board exam (PRC Certificate of Registration)",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "I-J",
                label: "Part J — Doctoral Program (units only, no degree yet)",
                pts: "67.00 – 75.00",
                what: [
                    "Official TOR showing earned doctoral units (no degree conferred yet)",
                    "Scoring by unit count: J.1 = 9–18 units → 67 pts · J.2 = 19–27 → 69 · J.3 = 28–36 → 71 · J.4 = 37–45 → 73 · J.5 = 46+ → 75 pts",
                    "Attach the TOR showing the highest applicable unit count",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "I-K",
                label: "Part K — Doctoral Comprehensive Exam Passed",
                pts: "80.00",
                what: [
                    "Official certification from the school/university that you passed the Doctoral Comprehensive Examination",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "I-L",
                label: "Part L — Doctorate Degree (additional 5 pts for a second doctorate)",
                pts: "85.00",
                what: [
                    "Diploma showing the Doctorate degree was conferred",
                    "Dissertation defense certificate or equivalent",
                    "For a second Doctorate: attach a separate diploma and TOR — the additional degree adds 5 pts",
                ],
                status: "empty",
                file: null,
                date: null,
            },
        ],
    },

    // ── AREA II ────────────────────────────────────────────────────────────────
    // REVISED: Parts A/B/C/D are now GROUP HEADERS (isGroup: true).
    // Each first-level numbered item (A.1, A.2, A.3...) is a separate submission.
    // Sub-criteria (A.1.1, A.1.2...) are rubric bullets inside each subpart.
    {
        id: "II",
        name: "Research and Publications",
        maxPts: 20,
        note: "Part A (Publications) capped at 10 pts · Part B (Research) capped at 10 pts · Parts C and D are add-ons. Each numbered item (A.1, A.2 ...) requires its own file upload.",
        parts: [
            // ── Part A — Publications ─────────────────────────────────────────
            {
                id: "II-A",
                label: "Part A — Publications",
                pts: "Max 10.00",
                isGroup: true,
                subparts: [
                    {
                        id: "II-A-1",
                        label: "A.1 — Published Books",
                        pts: "up to 2.00 pts / book",
                        what: [
                            "A.1.1 No. of Authors — Single author: 1.25 · Co-authored: 0.75 · Three or more: 0.25",
                            "A.1.2 Designation of Writer — Lead Author: 0.75 · Co-author: 0.50",
                            "A.1.3 Level — International: 1.00 · National/Regional: 0.75 · Institutional: 0.50",
                            "Required: front cover/title page, abstract, proof of publication (ISBN, DOI, publisher certificate). Indicate: no. of authors, your designation, and publication level.",
                        ],
                        status: "submitted",
                        file: "Books_A1_Candido.pdf",
                        date: "Feb 25, 2026 at 10:00 AM",
                    },
                    {
                        id: "II-A-2",
                        label: "A.2 — Published Research",
                        pts: "up to 2.00 pts / output",
                        what: [
                            "A.2.1 No. of Authors — Single author: 1.25 · Co-authored: 0.75 · Three or more: 0.25",
                            "A.2.2 Designation of Writer — Lead Author: 0.75 · Co-author: 0.50",
                            "A.2.3 Level — International: 1.00 · National/Regional: 0.75 · Institutional: 0.50",
                            "Required: journal volume/issue/page, DOI or publisher certificate. Indicate: no. of authors, your designation, and level.",
                        ],
                        status: "empty",
                        file: null,
                        date: null,
                    },
                    {
                        id: "II-A-3",
                        label: "A.3 — Monograph",
                        pts: "up to 1.00 pt / output",
                        what: [
                            "A.3.1 No. of Authors — Single: 0.75 · Co-authored: 0.50 · Three or more: 0.25",
                            "A.3.2 Designation of Writer — Lead Author: 0.50 · Co-author: 0.25",
                            "A.3.3 Level — International: 0.75 · National/Regional: 0.50 · Institutional: 0.25",
                            "Required: title page, abstract, proof of publication. Indicate: no. of authors, your designation, and level.",
                        ],
                        status: "empty",
                        file: null,
                        date: null,
                    },
                    {
                        id: "II-A-4",
                        label: "A.4 — Published Thesis/Dissertation (from another institution)",
                        pts: "3.00 pts flat",
                        what: [
                            "A.4 For a thesis or dissertation published and originating from another institution: 3.00 pts flat.",
                            "Required: front cover, abstract, and proof of publication from the awarding institution.",
                        ],
                        status: "empty",
                        file: null,
                        date: null,
                    },
                ],
            },
            // ── Part B — Research ─────────────────────────────────────────────
            {
                id: "II-B",
                label: "Part B — Research",
                pts: "Max 10.00",
                isGroup: true,
                subparts: [
                    {
                        id: "II-B-1",
                        label: "B.1 — Institutional Materials (books, manuals, modules)",
                        pts: "1.50 pts / output",
                        what: [
                            "B.1.1 No. of Researchers — Single: 1.25 · Two or more: 0.75",
                            "B.1.2 Designation — Lead researcher: 0.75 · Co-researcher: 0.50",
                            "B.1.3 Level — External: 0.50 · Institutional: 0.25",
                            "Required: title page, abstract, endorsement or certification from the Research Office or Dean. Indicate: no. of researchers, your designation, and level.",
                        ],
                        status: "submitted",
                        file: "InstitutionalMaterials_B1_Candido.pdf",
                        date: "Feb 25, 2026 at 10:05 AM",
                    },
                    {
                        id: "II-B-2",
                        label: "B.2 — Unpublished Research",
                        pts: "0.75 pts / output",
                        what: [
                            "B.2.1 No. of Researchers — Single: 0.75 · Two or more: 0.50",
                            "B.2.2 Designation — Lead researcher: 0.50 · Co-researcher: 0.25",
                            "B.2.3 Level — External: 0.50 · Institutional: 0.25",
                            "Required: title page, abstract, and certification that the research is unpublished. Indicate: no. of researchers, your designation, and level.",
                        ],
                        status: "empty",
                        file: null,
                        date: null,
                    },
                    {
                        id: "II-B-3",
                        label: "B.3 — Development of a Complete Set of Instructional Materials",
                        pts: "1.25 pts flat",
                        what: [
                            "B.3 For the development of a complete set of instructional materials: 1.25 pts flat.",
                            "Required: copy of the instructional materials and certification or endorsement from the Dean or Department Head.",
                        ],
                        status: "empty",
                        file: null,
                        date: null,
                    },
                ],
            },
            // ── Part C — Editor of a Professional Journal ─────────────────────
            {
                id: "II-C",
                label: "Part C — Editor of a Professional Journal (add-on)",
                pts: "0.50 – 1.25",
                isGroup: true,
                subparts: [
                    {
                        id: "II-C-1",
                        label: "C.1 — Editor-in-Chief / Honorary Editor-in-Chief",
                        pts: "0.75 – 1.25",
                        what: [
                            "C.1.1 Level — External: 0.75 · Institutional: 0.50",
                            "C.1.2 Type of Publication — Refereed: 1.25 · Non-refereed: 0.75",
                            "Required: certificate or letter of appointment, front page of the journal showing your name and role.",
                        ],
                        status: "draft",
                        file: "Editor_Chief_C1_Candido.pdf",
                        date: null,
                    },
                    {
                        id: "II-C-2",
                        label: "C.2 — Member of the Editorial Board",
                        pts: "0.50 – 1.25",
                        what: [
                            "C.2.1 Level — External: 0.75 · Institutional: 0.50",
                            "C.2.2 Type of Publication — Refereed: 1.25 · Non-refereed: 0.75",
                            "Required: certificate or letter of appointment, front page of the journal showing your name and board role.",
                        ],
                        status: "empty",
                        file: null,
                        date: null,
                    },
                ],
            },
            // ── Part D — Creative Works ───────────────────────────────────────
            {
                id: "II-D",
                label: "Part D — Creative Works (add-on, Max. 5 points)",
                pts: "Max 5.00",
                isGroup: true,
                subparts: [
                    {
                        id: "II-D-1",
                        label: "D.1 — Poems, Newspaper/Magazine Articles, Illustrations, Maps, Photography, Advertisements",
                        pts: "0.75 pts base",
                        what: [
                            "D.1.1 Level — International: 1.75 · National: 0.75 · Institutional: 0.50",
                            "D.1.2 No. of Authors — Single: 1.25 · Co-authored: 0.75 · Three or more: 0.50",
                            "Required: documentation of the work (published copy, scan, or program proceedings). Indicate: type of creative work, level, and number of authors.",
                        ],
                        status: "empty",
                        file: null,
                        date: null,
                    },
                    {
                        id: "II-D-2",
                        label: "D.2 — Short Stories, Lectures, Sermons, Addresses",
                        pts: "1.25 pts base",
                        what: [
                            "D.2.1 Level — International: 1.50 · National: 0.75 · Institutional: 0.50",
                            "D.2.2 No. of Authors — Single: 1.25 · Co-authored: 0.75 · Three or more: 0.50",
                            "Required: published copy or official documentation. Indicate: level and number of authors.",
                        ],
                        status: "empty",
                        file: null,
                        date: null,
                    },
                    {
                        id: "II-D-3",
                        label: "D.3 — Computer Programs, Paintings, Novels (non-fiction)",
                        pts: "1.50 pts base",
                        what: [
                            "D.3.1 Level — International: 1.50 · National: 0.75 · Institutional: 0.50",
                            "D.3.2 No. of Authors — Single: 1.00 · Co-authored: 0.75 · Three or more: 0.50",
                            "Required: documentation or published record of the work. Indicate: level and number of authors.",
                        ],
                        status: "empty",
                        file: null,
                        date: null,
                    },
                    {
                        id: "II-D-4",
                        label: "D.4 — Poster / Oral Presentation",
                        pts: "1.00 pt base",
                        what: [
                            "D.4.1 Level — International: 1.50 · National: 1.00 · Institutional: 0.25",
                            "D.4.2 No. of Authors — Single: 1.00 · Co-authored: 0.75 · Three or more: 0.50",
                            "Required: program proceedings or certificate of presentation. Indicate: level and number of authors.",
                        ],
                        status: "empty",
                        file: null,
                        date: null,
                    },
                ],
            },
        ],
    },

    // ── AREA III ───────────────────────────────────────────────────────────────
    {
        id: "III",
        name: "Teaching Experience and Professional Services",
        maxPts: 20,
        note: "Administrative designation (Part C) requires at least 1 full year of continuous service. Submit one file per Part.",
        parts: [
            {
                id: "III-A",
                label: "Part A — Teaching Experience in Gordon College",
                pts: "1.00 / yr (full-time) · 0.25 / yr (part-time)",
                what: [
                    "A.1 Full-time teaching in Gordon College: 1.00 pt per year",
                    "A.2 Part-time teaching in Gordon College: 0.25 pt per year",
                    "Required documents: Service Record from Gordon College HR, or Certificate of Employment specifying full-time or part-time designation and years covered.",
                    "Compile Part A.1 and A.2 records into one PDF.",
                ],
                status: "submitted",
                file: "TeachingGC_PartA_Candido.pdf",
                date: "Feb 24, 2026 at 3:30 PM",
            },
            {
                id: "III-B",
                label: "Part B — Teaching Experience in Other Institutions",
                pts: "0.50 / yr (full-time) · 0.25 / yr (part-time)",
                what: [
                    "B.1 Full-time teaching in other institutions: 0.50 pt per year",
                    "B.2 Part-time teaching in other institutions: 0.25 pt per year",
                    "Required documents: Certificate of Employment from each institution outside Gordon College, indicating full-time or part-time status and period covered.",
                    "Compile all other-institution records into one PDF.",
                ],
                status: "submitted",
                file: "TeachingOther_PartB_Candido.pdf",
                date: "Feb 24, 2026 at 3:33 PM",
            },
            {
                id: "III-C",
                label: "Part C — Administrative Designation (at least 1 year of service)",
                pts: "0.25 – 3.00 / yr",
                what: [
                    "C.1 President — Within Gordon College: 3.00/yr · Outside GC: 1.50/yr",
                    "C.2 Vice President — Within Gordon College: 2.50/yr · Outside GC: 1.25/yr",
                    "C.3 Dean / Head / Principal / Director — Within GC: 2.00/yr · Outside GC: 1.00/yr",
                    "C.4 Program Coordinator — Within GC: 1.00/yr · Outside GC: 0.50/yr",
                    "C.5 Area / Subject Coordinator — Within GC: 0.50/yr · Outside GC: 0.25/yr",
                    "Required documents: Special Order or appointment letter specifying the role and duration. Must show at least 1 full year of continuous service in the designated role.",
                    "Compile all administrative appointment documents into one PDF.",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "III-D",
                label: "Part D — Industry Experience (aligned to field, full-time)",
                pts: "0.25 / yr",
                what: [
                    "D. For every year of industry experience aligned to the field of specialization, as full-time: 0.25 pt per year",
                    "Required documents: Certificate of Employment from the industry employer specifying the position and period, and that it was full-time.",
                    "The position must be relevant and aligned to your academic field of specialization.",
                ],
                status: "empty",
                file: null,
                date: null,
            },
        ],
    },

    // ── AREA IV ────────────────────────────────────────────────────────────────
    {
        id: "IV",
        name: "Performance Evaluation",
        maxPts: 10,
        note: "Auto-scored by HR Department. No file submission required from faculty.",
        parts: [
            {
                id: "IV-auto",
                label: "Auto-scored by HR Department",
                pts: "1.00 – 10.00",
                auto: true,
                what: [
                    "No submission needed — HR scores this area from the student evaluation CSV uploaded each semester.",
                    "Rating scale: 1.00–1.39 = 1 pt (Poor) · 1.40–1.79 = 2 pts · 1.80–2.19 = 3 pts · 2.20–2.59 = 4 pts",
                    "2.60–2.99 = 5 pts (Satisfactory) · 3.00–3.39 = 6 pts · 3.40–3.79 = 7 pts · 3.80–4.19 = 8 pts",
                    "4.20–4.59 = 9 pts (Very Satisfactory) · 4.60–5.00 = 10 pts (Outstanding)",
                    "Contact the HR Department if you believe your student evaluation data is incorrect.",
                ],
                status: "auto",
                file: null,
                date: null,
            },
        ],
    },

    // ── AREA V ─────────────────────────────────────────────────────────────────
    {
        id: "V",
        name: "Training and Seminars",
        maxPts: 10,
        note: "Submit one compiled PDF per Part. Include all certificates for that Part in one file.",
        parts: [
            {
                id: "V-A",
                label: "Part A — Training Courses",
                pts: "1.00 – 5.00 per training",
                what: [
                    "A.1 International training course: 5.00 pts per training",
                    "A.2 National training course: 4.00 pts per training",
                    "A.3 Regional training course: 3.00 pts per training",
                    "A.4 Local training course: 2.00 pts per training",
                    "A.5 Institutional training course: 1.00 pt per training",
                    "Required documents: Certificates of Completion or Attendance for each training course attended. Compile all training certificates into one organized PDF, grouped by level.",
                ],
                status: "submitted",
                file: "Training_PartA_Candido.pdf",
                date: "Feb 22, 2026 at 11:15 AM",
            },
            {
                id: "V-B",
                label: "Part B — Conferences, Seminars, and Workshops",
                pts: "1.00 – 5.00 per event",
                what: [
                    "B.1 International conference/seminar/workshop: 5.00 pts per event",
                    "B.2 National conference/seminar/workshop: 4.00 pts per event",
                    "B.3 Regional conference/seminar/workshop: 3.00 pts per event",
                    "B.4 Local conference/seminar/workshop: 2.00 pts per event",
                    "B.5 Institutional conference/seminar/workshop: 1.00 pt per event",
                    "Required documents: Certificates of Participation or Attendance for each event. Compile all conference and seminar certificates into one organized PDF, grouped by level.",
                ],
                status: "submitted",
                file: "Seminars_PartB_Candido.pdf",
                date: "Feb 22, 2026 at 11:18 AM",
            },
        ],
    },

    // ── AREA VI ────────────────────────────────────────────────────────────────
    {
        id: "VI",
        name: "Expert Services Rendered",
        maxPts: 20,
        note: "Submit one file per applicable Part. Only submit Parts that apply to you.",
        parts: [
            {
                id: "VI-A",
                label: "Part A — Short-term Consultancy / Expert Service",
                pts: "1.00 – 5.00",
                what: [
                    "A.1 International level: 5.00 pts · A.2 National: 4.00 pts · A.3 Regional: 3.00 pts · A.4 Local: 2.00 pts · A.5 Institutional: 1.00 pt",
                    "Required documents: Contract, Memorandum of Agreement (MOA), or Certificate of Service as consultant or expert. Indicate the level of the engagement.",
                    "Compile all applicable consultancy documents into one PDF.",
                ],
                status: "submitted",
                file: "Consultancy_PartA_Candido.pdf",
                date: "Feb 27, 2026 at 2:00 PM",
            },
            {
                id: "VI-B",
                label: "Part B — Coordinator / Lecturer / Resource Person",
                pts: "1.00 – 5.00",
                what: [
                    "B.1 International level: 5.00 pts · B.2 National: 4.00 pts · B.3 Regional: 3.00 pts · B.4 Local: 2.00 pts · B.5 Institutional: 1.00 pt",
                    "Required documents: Certificate of Service as coordinator, lecturer, or resource person from the organizing body. Indicate the level of the event.",
                    "Compile all applicable certificates into one PDF.",
                ],
                status: "submitted",
                file: "Lecturer_PartB_Candido.pdf",
                date: "Feb 27, 2026 at 2:04 PM",
            },
            {
                id: "VI-C",
                label: "Part C — Adviser in Dissertation / Thesis",
                pts: "0.25 – 1.00 per advisee",
                what: [
                    "C.1 Doctoral Dissertation: 1.00 pt per advisee",
                    "C.2 Masteral Thesis: 0.50 pt per advisee",
                    "C.3 Undergraduate Thesis (conducted outside Gordon College): 0.25 pt per advisee",
                    "Required documents: Certificate of Advisership issued by the institution for each advisee. Compile all advisership certificates into one PDF.",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "VI-D",
                label: "Part D — Reviewer / Examiner (PRC or Civil Service Commission)",
                pts: "1.00 per service",
                what: [
                    "D. For certified services as reviewer or examiner for the Professional Regulatory Commission (PRC) or the Civil Service Commission: 1.00 pt per certified service.",
                    "Required documents: Certificate from PRC or CSC confirming your service as reviewer or examiner.",
                    "Compile all certificates into one PDF.",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "VI-E",
                label: "Part E — Expert Service in Accreditation Work",
                pts: "1.00 per service",
                what: [
                    "E. For expert services as member of Board of Directors, Technical Committee, or Consultant Group in accreditation work: 1.00 pt per service.",
                    "Required documents: Certificate of Service or appointment letter confirming your role in accreditation-related work.",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "VI-F",
                label: "Part F — Expert Service in Trade Skill Certification",
                pts: "1.00 per service",
                what: [
                    "F. For every expert service in trade skill certification: 1.00 pt per service.",
                    "Required documents: Certificate confirming your expert service in trade skill certification.",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "VI-G",
                label: "Part G — Service in Curricular / Extra-Curricular Activities",
                pts: "1.00 / yr",
                what: [
                    "G. For every year of service in curricular or extra-curricular activities: 1.00 pt per year.",
                    "Required documents: Certificate or Special Order of assignment specifying the role and duration of service.",
                ],
                status: "empty",
                file: null,
                date: null,
            },
        ],
    },

    // ── AREA VII ───────────────────────────────────────────────────────────────
    {
        id: "VII",
        name: "Involvement in Professional Organizations",
        maxPts: 10,
        note: "Submit one file per Part. Compile all relevant membership/appointment documents into one PDF per Part.",
        parts: [
            {
                id: "VII-A",
                label: "Part A — Professional Organizations",
                pts: "1.00 – 5.00",
                what: [
                    "A. International level — Officer: 5.00 pts · Member: 2.00 pts",
                    "B. National level — Officer: 4.00 pts · Member: 2.00 pts",
                    "C. Regional level — Officer: 3.00 pts · Member: 1.00 pt",
                    "Required documents: Membership ID, certificate of membership, or certificate of appointment as officer. Indicate the level and your role (Officer or Member).",
                    "Compile all professional organization documents into one organized PDF.",
                ],
                status: "submitted",
                file: "ProfOrg_PartA_Candido.pdf",
                date: "Today at 6:30 PM",
            },
            {
                id: "VII-B",
                label: "Part B — Civic Organizations",
                pts: "Officer 1.00 · Member 0.50",
                what: [
                    "A. Officer: 1.00 pt",
                    "B. Member: 0.50 pt",
                    "Required documents: Membership ID or certificate of membership/officership in a civic organization. Indicate your role (Officer or Member).",
                    "Compile all civic organization documents into one PDF.",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "VII-C",
                label: "Part C — Scholarship / Fellowship",
                pts: "1.00 – 5.00",
                what: [
                    "A. International — Doctorate: 5.00 pts · Masteral: 4.00 pts · Non-degree: 3.00 pts",
                    "B. National / Regional — Doctorate: 3.00 pts · Masteral: 2.00 pts · Non-degree: 1.00 pt",
                    "C. Local / Institutional — Doctorate: 2.00 pts · Masteral: 1.00 pt",
                    "Required documents: Award letter, certificate, or official documentation of scholarship or fellowship received. Indicate the level and type (Doctorate, Masteral, or Non-degree).",
                    "Compile all scholarship/fellowship documents into one PDF.",
                ],
                status: "empty",
                file: null,
                date: null,
            },
        ],
    },

    // ── AREA VIII ──────────────────────────────────────────────────────────────
    {
        id: "VIII",
        name: "Awards of Distinction",
        maxPts: 10,
        note: "Awards must be in recognition of achievements in your area of specialization, profession, or faculty assignment. Submit one compiled PDF for Part A.",
        parts: [
            {
                id: "VIII-A",
                label: "Part A — Awards of Distinction Received",
                pts: "1.00 – 5.00 per award",
                what: [
                    "A. International level: 5.00 pts per award",
                    "B. National level: 4.00 pts per award",
                    "C. Regional level: 3.00 pts per award",
                    "D. Local level: 2.00 pts per award",
                    "E. Institutional level: 1.00 pt per award",
                    "Required documents: Award certificate, plaque citation, trophy documentation, or official publication/news citation. Must be received in recognition of achievements in your area of specialization or faculty assignment.",
                    "Compile all award documents into one organized PDF, grouped by level (A–E).",
                ],
                status: "draft",
                file: "Awards_PartA_Candido.pdf",
                date: null,
            },
        ],
    },

    // ── AREA IX ────────────────────────────────────────────────────────────────
    {
        id: "IX",
        name: "Community Outreach",
        maxPts: 5,
        note: "Submit one compiled PDF for Part A covering all levels of community outreach participation.",
        parts: [
            {
                id: "IX-A",
                label: "Part A — Participation in Service-Oriented Projects",
                pts: "3.00 – 5.00",
                what: [
                    "A.1 International project: 5.00 pts",
                    "A.2 National project: 4.00 pts",
                    "A.3 Regional / Local / Institutional project: 3.00 pts base (1 additional pt per additional project at this level)",
                    "Required documents: Certificate of Participation or Completion from the organizing body for each community service project. Indicate the level (International, National, or Regional/Local/Institutional).",
                    "Compile all community outreach certificates into one organized PDF.",
                ],
                status: "empty",
                file: null,
                date: null,
            },
        ],
    },

    // ── AREA X ─────────────────────────────────────────────────────────────────
    {
        id: "X",
        name: "Professional Examination (PRC, CSC & TESDA)",
        maxPts: 10,
        note: "Submit a separate file for each applicable Part.",
        parts: [
            {
                id: "X-A1",
                label: "Part A.1 — Board / Professional Examinations (PRC-regulated)",
                pts: "10.00",
                what: [
                    "A.1 For every relevant licensure and other professional examination:",
                    "Applicable: Accounting, Customs Broker, Engineering, Nursing, Midwifery, Medicine, Law, Teacher's Board, and all other PRC-regulated professions — 10.00 pts",
                    "Required documents: PRC ID or Certificate of Registration showing the board or professional examination passed.",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "X-A2",
                label: "Part A.2 — Civil Service Eligibility",
                pts: "3.00 – 7.00",
                what: [
                    "A.2.1 Career Executive Service Officer (CESO): 7.00 pts",
                    "A.2.2 Professional License (CSC Professional level): 5.00 pts",
                    "A.2.3 Sub-Professional License: 3.00 pts",
                    "Required documents: CSC Certificate of Eligibility specifying the level (CESO, Professional, or Sub-Professional).",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "X-A3",
                label: "Part A.3 — Other Trade Certificates (NC II and above — TESDA)",
                pts: "3.00",
                what: [
                    "A.3 Other Trade Certificates (NC II onwards): 3.00 pts",
                    "Required documents: Official TESDA National Certificate (NC II or higher) from the certifying body. Compile multiple TESDA certificates into one PDF if applicable.",
                ],
                status: "empty",
                file: null,
                date: null,
            },
            {
                id: "X-A4",
                label: "Part A.4 — Specialty Certification (International / Local)",
                pts: "3.00",
                what: [
                    "A.4.1 International or Local specialty certification: 3.00 pts",
                    "Required documents: Official certificate from the certifying body showing the specialty certification granted.",
                ],
                status: "empty",
                file: null,
                date: null,
            },
        ],
    },
];

const DEFAULT_AREAS_DATA = withAreaIds(AREAS_DATA);

// ── Helpers ──

// Flattens an area's parts: if a part is a group header (isGroup), returns its
// subparts instead. This gives the flat list of actual submission slots.
function getLeafParts(area) {
    return area.parts.flatMap((p) => (p.isGroup ? p.subparts : [p]));
}

function getAreaStatus(area) {
    const uploadable = getLeafParts(area).filter((p) => !p.auto);
    if (uploadable.length === 0) return "auto";
    if (uploadable.every((p) => p.status === "submitted")) return "submitted";
    if (
        uploadable.some((p) => p.status === "submitted" || p.status === "draft")
    )
        return "progress";
    return "empty";
}
function getProgress(area) {
    const uploadable = getLeafParts(area).filter((p) => !p.auto);
    return {
        done: uploadable.filter((p) => p.status === "submitted").length,
        total: uploadable.length,
    };
}

// Activity log
const ACTIVITY_LOG = [
    {
        icon: "gold",
        IconComp: Paperclip,
        text: "Area VIII — Part A (Awards) file saved as draft",
        meta: "Today, 7:45 PM",
    },
    {
        icon: "green",
        IconComp: CheckCircle,
        text: "Area VII — Part A (Professional Organizations) submitted",
        meta: "Today, 6:30 PM",
    },
    {
        icon: "green",
        IconComp: CheckCircle,
        text: "Area VI — Parts A & B submitted",
        meta: "Feb 27, 2026",
    },
    {
        icon: "green",
        IconComp: CheckCircle,
        text: "Areas I–V multiple parts submitted",
        meta: "Feb 20–25, 2026",
    },
    {
        icon: "blue",
        IconComp: Megaphone,
        text: "Ranking cycle opened — 1st Semester AY 2026–2027",
        meta: "Feb 1, 2026 · Deadline: March 15, 2026",
    },
];

const DEFAULT_CYCLE_LABEL = "1st Semester AY 2026–2027";
const DEFAULT_DEADLINE_LABEL = "March 15, 2026";
const TEMPLATE_BUCKET =
    import.meta.env.VITE_SUPABASE_TEMPLATE_BUCKET || "templates";
const SUBMISSIONS_BUCKET =
    import.meta.env.VITE_SUPABASE_SUBMISSIONS_BUCKET || "submissions";
const TOAST_TTL_MS = 3200;
const AREA_TABLE_CANDIDATES = (
    import.meta.env.VITE_SUPABASE_AREA_TABLE_CANDIDATES ||
    "areas,ranking_areas,area_definitions"
)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
const AREA_PART_TABLE_CANDIDATES = (
    import.meta.env.VITE_SUPABASE_AREA_PART_TABLE_CANDIDATES ||
    "areaparts,area_parts,ranking_parts,area_criteria"
)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

function getFirstValue(source, keys, fallback = null) {
    if (!source) return fallback;
    for (const key of keys) {
        const value = source[key];
        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }
    return fallback;
}

function isColumnOrTableError(error) {
    const message = String(error?.message || "").toLowerCase();
    return (
        message.includes("does not exist") ||
        message.includes("column") ||
        message.includes("relation")
    );
}

function toBoolean(value, fallback = false) {
    if (typeof value === "boolean") return value;
    if (value === 1 || value === "1") return true;
    if (value === 0 || value === "0") return false;
    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();
        if (["true", "t", "yes", "y", "open"].includes(normalized)) {
            return true;
        }
        if (["false", "f", "no", "n", "closed"].includes(normalized)) {
            return false;
        }
    }
    return fallback;
}

function formatLongDate(value, fallback) {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;

    return date.toLocaleDateString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

function formatDateTime(value) {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleString("en-PH", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

function toDaysLeft(deadlineValue, fallback = 15) {
    if (!deadlineValue) return fallback;
    const date = new Date(deadlineValue);
    if (Number.isNaN(date.getTime())) return fallback;

    const diffMs = date.getTime() - Date.now();
    return Math.max(0, Math.ceil(diffMs / 86400000));
}

function normalizeSubmissionStatus(row) {
    const statusRaw = String(
        getFirstValue(row, ["status", "submission_status", "state"], ""),
    )
        .trim()
        .toLowerCase();

    if (statusRaw.includes("submit")) return "submitted";
    if (statusRaw.includes("draft") || statusRaw.includes("pending")) {
        return "draft";
    }

    const submittedAt = getFirstValue(row, [
        "submitted_at",
        "submittedAt",
        "date_submitted",
    ]);
    if (submittedAt) return "submitted";

    const fileName = getFirstValue(row, [
        "file_name",
        "filename",
        "name",
        "original_file_name",
    ]);
    const fileUrl = getFirstValue(row, ["file_url", "url", "path"]);
    if (fileName || fileUrl) return "draft";

    return "empty";
}

function parseTimestamp(row) {
    const raw = getFirstValue(row, [
        "updated_at",
        "submitted_at",
        "uploaded_at",
        "created_at",
    ]);
    if (!raw) return 0;
    const time = new Date(raw).getTime();
    return Number.isFinite(time) ? time : 0;
}

function stripUndefined(obj) {
    return Object.fromEntries(
        Object.entries(obj).filter(([, value]) => value !== undefined),
    );
}

function inferAreaIdFromPartId(partId) {
    if (!partId) return null;
    return String(partId).split("-")[0] || null;
}

function resolvePartAreaId(part) {
    return part?.areaId || inferAreaIdFromPartId(part?.id);
}

function sanitizeFileName(fileName) {
    return String(fileName || "document")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .slice(0, 120);
}

function buildTemplatePathForPart(part) {
    const areaId = resolvePartAreaId(part);
    if (!areaId || !part?.id) return null;
    return `area_${areaId}/${part.id}_template.xlsx`;
}

function normalizeWhatList(raw) {
    if (Array.isArray(raw)) {
        return raw
            .map((item) => String(item || "").trim())
            .filter(Boolean);
    }

    if (typeof raw === "string") {
        return raw
            .split(/\r?\n|\|\|/)
            .map((line) => line.trim())
            .filter(Boolean);
    }

    return [];
}

function toSortOrder(row, fallback = 0) {
    const value = Number(
        getFirstValue(row, [
            "sort_order",
            "display_order",
            "sequence",
            "order",
            "position",
            "idx",
        ]),
    );
    return Number.isFinite(value) ? value : fallback;
}

function makePartFromRow(row, areaId) {
    const id = String(
        getFirstValue(row, ["part_id", "subpart_id", "code", "id"], ""),
    ).trim();
    if (!id) return null;

    const label = String(
        getFirstValue(row, ["label", "name", "title", "part_label"], id),
    );
    const pts = String(
        getFirstValue(row, ["pts", "points", "score", "max_points"], ""),
    );
    const what = normalizeWhatList(
        getFirstValue(row, [
            "what",
            "rubric",
            "criteria",
            "requirements",
            "description_lines",
        ]),
    );

    return {
        id,
        label,
        pts,
        what,
        auto: toBoolean(getFirstValue(row, ["auto", "is_auto"]), false),
        isGroup: toBoolean(
            getFirstValue(row, ["is_group", "group", "is_header"]),
            false,
        ),
        areaId,
        status: "empty",
        file: null,
        date: null,
        _parentId: getFirstValue(row, [
            "parent_part_id",
            "parent_id",
            "group_part_id",
            "group_id",
        ]),
        _sortOrder: toSortOrder(row, 0),
    };
}

function stripPartMeta(part) {
    const { _parentId, _sortOrder, ...clean } = part;
    return clean;
}

function withAreaIds(areas) {
    return areas.map((area) => ({
        ...area,
        parts: area.parts.map((part) => {
            if (part.isGroup) {
                return {
                    ...part,
                    areaId: part.areaId || area.id,
                    subparts: (part.subparts || []).map((subpart) => ({
                        ...subpart,
                        areaId: subpart.areaId || area.id,
                    })),
                };
            }

            return {
                ...part,
                areaId: part.areaId || area.id,
            };
        }),
    }));
}

async function queryAllByTableCandidates(candidates) {
    for (const table of candidates) {
        const ordered = await supabase
            .from(table)
            .select("*")
            .order("sort_order", { ascending: true });
        if (!ordered.error && Array.isArray(ordered.data)) {
            return ordered.data;
        }

        const fallback = await supabase.from(table).select("*");
        if (!fallback.error && Array.isArray(fallback.data)) {
            return fallback.data;
        }
    }

    return [];
}

function buildAreasFromRows(areaRows, partRows) {
    if (!Array.isArray(areaRows) || areaRows.length === 0) {
        return [];
    }

    const resolved = areaRows
        .map((row, idx) => {
            const areaId = String(
                getFirstValue(row, ["area_id", "code", "id", "area_code"], ""),
            ).trim();
            if (!areaId) return null;

            const inlineParts = getFirstValue(row, ["parts", "part_definitions"]);
            if (Array.isArray(inlineParts) && inlineParts.length > 0) {
                const mappedInlineParts = inlineParts
                    .map((part, partIdx) => {
                        const mapped = makePartFromRow(part, areaId);
                        if (!mapped) return null;
                        return { ...mapped, _sortOrder: toSortOrder(part, partIdx) };
                    })
                    .filter(Boolean)
                    .sort((a, b) => a._sortOrder - b._sortOrder)
                    .map((part) => stripPartMeta(part));

                return {
                    id: areaId,
                    name: String(
                        getFirstValue(row, ["name", "title", "area_name"], `Area ${areaId}`),
                    ),
                    maxPts: Number(
                        getFirstValue(row, ["max_points", "max_pts", "maxPts"], 0),
                    ),
                    note: String(getFirstValue(row, ["note", "description"], "")),
                    parts: mappedInlineParts,
                    _sortOrder: toSortOrder(row, idx),
                };
            }

            const ownRows = (Array.isArray(partRows) ? partRows : []).filter((partRow) => {
                const partAreaId = String(
                    getFirstValue(partRow, ["area_id", "area", "area_code", "parent_area_id"], ""),
                ).trim();
                return partAreaId && partAreaId === areaId;
            });

            const mappedParts = ownRows
                .map((partRow, partIdx) => {
                    const mapped = makePartFromRow(partRow, areaId);
                    if (!mapped) return null;
                    return { ...mapped, _sortOrder: toSortOrder(partRow, partIdx) };
                })
                .filter(Boolean)
                .sort((a, b) => a._sortOrder - b._sortOrder);

            const byId = new Map(mappedParts.map((part) => [part.id, part]));
            const topLevel = [];
            for (const part of mappedParts) {
                const parentId = part._parentId ? String(part._parentId) : "";
                if (parentId && byId.has(parentId)) {
                    const parent = byId.get(parentId);
                    parent.isGroup = true;
                    parent.subparts = parent.subparts || [];
                    parent.subparts.push(stripPartMeta(part));
                } else {
                    topLevel.push(part);
                }
            }

            const cleanTopLevel = topLevel
                .sort((a, b) => a._sortOrder - b._sortOrder)
                .map((part) => {
                    if (part.isGroup && Array.isArray(part.subparts)) {
                        const sortedSubparts = part.subparts
                            .map((subpart, subIdx) => ({
                                ...subpart,
                                _sortOrder: toSortOrder(subpart, subIdx),
                            }))
                            .sort((a, b) => a._sortOrder - b._sortOrder)
                            .map((subpart) => stripPartMeta(subpart));
                        return {
                            ...stripPartMeta(part),
                            subparts: sortedSubparts,
                        };
                    }
                    return stripPartMeta(part);
                });

            return {
                id: areaId,
                name: String(
                    getFirstValue(row, ["name", "title", "area_name"], `Area ${areaId}`),
                ),
                maxPts: Number(
                    getFirstValue(row, ["max_points", "max_pts", "maxPts"], 0),
                ),
                note: String(getFirstValue(row, ["note", "description"], "")),
                parts: cleanTopLevel,
                _sortOrder: toSortOrder(row, idx),
            };
        })
        .filter((area) => area && Array.isArray(area.parts) && area.parts.length > 0)
        .sort((a, b) => a._sortOrder - b._sortOrder)
        .map((area) => {
            const clean = { ...area };
            delete clean._sortOrder;
            return clean;
        });

    return withAreaIds(resolved);
}

async function fetchAreaDefinitions() {
    const areaRows = await queryAllByTableCandidates(AREA_TABLE_CANDIDATES);
    if (areaRows.length === 0) return null;

    const partRows = await queryAllByTableCandidates(AREA_PART_TABLE_CANDIDATES);
    const built = buildAreasFromRows(areaRows, partRows);
    return built.length > 0 ? built : null;
}

function updatePartInAreas(areas, partId, updater) {
    return areas.map((area) => ({
        ...area,
        parts: area.parts.map((part) => {
            if (part.isGroup) {
                return {
                    ...part,
                    subparts: part.subparts.map((subpart) =>
                        subpart.id === partId ? updater(subpart) : subpart,
                    ),
                };
            }

            return part.id === partId ? updater(part) : part;
        }),
    }));
}

function buildToast(id, kind, message) {
    return { id, kind, message };
}

function mergePartWithSubmission(part, submissionRow) {
    if (!submissionRow) return part;

    const status = normalizeSubmissionStatus(submissionRow);
    const file =
        getFirstValue(submissionRow, [
            "file_name",
            "filename",
            "name",
            "original_file_name",
        ]) || part.file;
    const dateText =
        formatDateTime(
            getFirstValue(submissionRow, [
                "submitted_at",
                "updated_at",
                "uploaded_at",
                "created_at",
            ]),
        ) || part.date;
    const fileUrl = getFirstValue(submissionRow, [
        "file_url",
        "download_url",
        "url",
    ]);
    const storagePath = getFirstValue(submissionRow, [
        "file_path",
        "storage_path",
        "path",
        "object_path",
    ]);
    const submissionId = getFirstValue(submissionRow, ["id", "submission_id"]);

    return {
        ...part,
        status: status === "empty" ? part.status : status,
        file,
        date: dateText,
        fileUrl: fileUrl || part.fileUrl || null,
        storagePath: storagePath || part.storagePath || null,
        submissionId: submissionId || part.submissionId || null,
    };
}

function mergeAreasWithSubmissions(areas, submissionRows) {
    const latestByPartId = new Map();

    for (const row of submissionRows) {
        const partId = getFirstValue(row, [
            "part_id",
            "partId",
            "subpart_id",
            "subpartId",
            "criterion_id",
            "criterionId",
        ]);
        if (!partId) continue;

        const key = String(partId);
        const existing = latestByPartId.get(key);
        if (!existing || parseTimestamp(row) >= parseTimestamp(existing)) {
            latestByPartId.set(key, row);
        }
    }

    return areas.map((area) => ({
        ...area,
        parts: area.parts.map((part) => {
            if (part.isGroup) {
                return {
                    ...part,
                    subparts: part.subparts.map((subpart) =>
                        mergePartWithSubmission(
                            subpart,
                            latestByPartId.get(subpart.id),
                        ),
                    ),
                };
            }

            return mergePartWithSubmission(part, latestByPartId.get(part.id));
        }),
    }));
}

function pickUserFilterCandidates(user) {
    return [
        ["user_id", user?.id],
        ["faculty_id", user?.id],
        ["uid", user?.id],
        ["id", user?.id],
        ["email", user?.email],
        ["user_email", user?.email],
    ].filter(([, value]) => Boolean(value));
}

async function querySingleByCandidates(table, selectClause, candidates) {
    for (const [column, value] of candidates) {
        const result = await supabase
            .from(table)
            .select(selectClause)
            .eq(column, value)
            .maybeSingle();

        if (!result.error) return result.data;
        if (!isColumnOrTableError(result.error)) continue;
    }
    return null;
}

async function queryRowsByCandidates(table, selectClause, candidates) {
    for (const [column, value] of candidates) {
        const result = await supabase
            .from(table)
            .select(selectClause)
            .eq(column, value);

        if (!result.error && Array.isArray(result.data)) return result.data;
        if (!isColumnOrTableError(result.error)) continue;
    }
    return [];
}

// ── Styles ──
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap');
  :root {
    --gc-green:#1a6b3c;--gc-green-dark:#134f2c;--gc-green-light:#228b4e;
    --gc-green-pale:#eef7f2;--gc-gold:#c9a84c;--gc-gold-light:#e8c96b;
    --gc-gold-pale:#fdf8ec;--white:#ffffff;--off-white:#f8f7f4;
    --text-dark:#1a1a1a;--text-mid:#3a4a3e;--text-muted:#6b7c70;
    --border:#dde5df;--danger:#c0392b;--danger-pale:#fdf0ee;
    --blue:#2471a3;--blue-pale:#eaf3fb;
  }
  .hm-hero{background:linear-gradient(135deg,var(--gc-green-dark) 0%,var(--gc-green) 55%,#22704a 100%);border-radius:16px;padding:26px 28px;display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:16px;position:relative;overflow:hidden;box-shadow:0 8px 32px rgba(26,107,60,0.22);animation:hmFU .5s .1s ease both;}
  .hm-hero::before{content:'';position:absolute;top:-60px;right:-60px;width:260px;height:260px;border-radius:50%;background:rgba(201,168,76,0.09);pointer-events:none;}
  .hm-hero-left{display:flex;align-items:center;position:relative;z-index:1;flex:1;min-width:0;}
  .hm-hero-info{min-width:0;}
  .hm-cycle-tag{font-size:10.5px;color:var(--gc-gold-light);letter-spacing:1.5px;text-transform:uppercase;font-weight:600;margin-bottom:4px;}
  .hm-name{font-family:'Playfair Display',serif;font-size:20px;color:var(--white);font-weight:600;margin-bottom:7px;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .hm-rank-flow{display:flex;align-items:center;gap:7px;margin-bottom:7px;flex-wrap:wrap;}
  .hm-rank-chip{display:inline-flex;align-items:center;gap:5px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.22);border-radius:20px;padding:3px 11px;font-size:12px;color:var(--white);font-weight:500;}
  .hm-rank-chip.target{background:rgba(201,168,76,0.22);border-color:rgba(201,168,76,0.45);color:var(--gc-gold-light);}
  .hm-rank-arrow{color:rgba(255,255,255,0.45);display:flex;align-items:center;}
  .hm-status-pill{display:inline-flex;align-items:center;gap:5px;border-radius:12px;padding:3px 11px;font-size:11px;font-weight:600;}
  .hm-status-draft{background:rgba(201,168,76,0.2);border:1px solid rgba(201,168,76,0.4);color:var(--gc-gold-light);}
  .hm-dept-tag{font-size:12px;color:rgba(255,255,255,0.72);display:flex;align-items:center;gap:5px;}
  .hm-hero-right{position:relative;z-index:1;text-align:center;flex-shrink:0;}
  .hm-deadline-ring{width:96px;height:96px;position:relative;margin:0 auto 7px;}
  .hm-deadline-ring svg{width:96px;height:96px;transform:rotate(-90deg);}
  .hm-ring-bg{fill:none;stroke:rgba(255,255,255,0.12);stroke-width:7;}
  .hm-ring-fill{fill:none;stroke:var(--gc-gold);stroke-width:7;stroke-linecap:round;stroke-dasharray:251;stroke-dashoffset:63;}
  .hm-ring-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
  .hm-ring-days{font-size:20px;font-weight:700;color:var(--white);line-height:1;}
  .hm-ring-days-label{font-size:8px;color:rgba(255,255,255,0.55);letter-spacing:1px;text-transform:uppercase;margin-top:2px;}
  .hm-deadline-label{font-size:10px;color:rgba(255,255,255,0.6);}
  .hm-deadline-date{font-size:12px;font-weight:600;color:var(--gc-gold-light);margin-top:2px;}
  /* RANK SUMMARY */
  .hm-rank-summary{background:var(--white);border-radius:12px;border:1px solid var(--border);padding:16px 20px;margin-bottom:16px;display:flex;align-items:stretch;box-shadow:0 2px 6px rgba(0,0,0,0.04);overflow:hidden;animation:hmFU .5s .15s ease both;}
  .hm-rs-item{flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 20px;gap:4px;}
  .hm-rs-item:first-child{padding-left:0;}.hm-rs-item:last-child{padding-right:0;}
  .hm-rs-divider{width:1px;background:var(--border);flex-shrink:0;}
  .hm-rs-label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--text-muted);margin-bottom:2px;}
  .hm-rs-value{font-family:'Playfair Display',serif;font-size:15px;font-weight:600;color:var(--text-dark);line-height:1.2;display:flex;align-items:center;gap:6px;}
  .hm-rs-sub{font-size:11px;color:var(--text-muted);margin-top:1px;}
  .hm-rs-badge{display:inline-flex;align-items:center;gap:4px;font-size:10.5px;font-weight:700;padding:2px 9px;border-radius:8px;}
  .hm-rs-badge-retained{background:#fdf0ee;color:var(--danger);}
  .hm-rs-bar{height:5px;background:var(--border);border-radius:4px;overflow:hidden;margin-top:5px;}
  .hm-rs-bar-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--gc-green),var(--gc-green-light));}
  /* SUBMIT BAR */
  .hm-submit-bar{background:var(--white);border-radius:12px;border:1px solid var(--border);padding:16px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;gap:16px;box-shadow:0 2px 6px rgba(0,0,0,0.04);animation:hmFU .5s .2s ease both;}
  .hm-submit-info h4{font-size:14px;font-weight:600;color:var(--text-dark);margin-bottom:2px;}
  .hm-submit-info p{font-size:12px;color:var(--text-muted);}
  .hm-prog-track{width:260px;margin-left:auto;margin-right:16px;flex-shrink:0;}
  .hm-prog-label{display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:6px;font-weight:500;}
  .hm-prog-bar{height:10px;background:#e0e8e2;border-radius:8px;overflow:hidden;}
  .hm-prog-fill{height:100%;border-radius:8px;background:linear-gradient(90deg,var(--gc-green),var(--gc-green-light));}
  .hm-btn-submit-all{display:flex;align-items:center;gap:7px;padding:10px 20px;background:linear-gradient(135deg,var(--gc-green),var(--gc-green-light));color:var(--white);border:none;border-radius:9px;font-family:'Source Sans 3',sans-serif;font-size:13.5px;font-weight:600;cursor:pointer;transition:opacity .2s,transform .15s;box-shadow:0 4px 14px rgba(26,107,60,0.25);white-space:nowrap;}
  .hm-btn-submit-all:hover:not(:disabled){opacity:0.9;transform:translateY(-1px);}
  .hm-btn-submit-all:disabled{opacity:0.5;cursor:not-allowed;transform:none;}
  /* AREA LIST PANEL */
  .hm-areas-panel{background:var(--white);border-radius:14px;border:1px solid var(--border);padding:20px;box-shadow:0 2px 6px rgba(0,0,0,0.04);margin-bottom:20px;animation:hmFU .5s .25s ease both;}
  .hm-panel-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;gap:8px;}
  .hm-panel-title{font-family:'Playfair Display',serif;font-size:15px;font-weight:600;color:var(--text-dark);}
  .hm-panel-sub{font-size:11.5px;color:var(--text-muted);margin-top:2px;}
  .hm-badge-green{background:var(--gc-green-pale);color:var(--gc-green-dark);font-size:11px;font-weight:700;padding:3px 10px;border-radius:8px;white-space:nowrap;}
  /* AREA LIST CARDS */
  .hm-area-list{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;}
  .hm-alc{border-radius:12px;border:1.5px solid var(--border);padding:14px 16px;cursor:pointer;transition:all .18s;background:var(--off-white);display:flex;flex-direction:column;gap:6px;}
  .hm-alc:hover{border-color:var(--gc-green);background:var(--gc-green-pale);transform:translateY(-1px);box-shadow:0 4px 16px rgba(0,0,0,0.07);}
  .hm-alc.s{border-color:#a9dfbf;background:#f8fffe;}
  .hm-alc.p{border-color:var(--gc-gold);background:var(--gc-gold-pale);}
  .hm-alc.a{border-color:rgba(36,113,163,0.3);background:var(--blue-pale);cursor:default;}
  .hm-alc.a:hover{transform:none;border-color:rgba(36,113,163,0.3);background:var(--blue-pale);}
  .hm-alc-top{display:flex;align-items:center;justify-content:space-between;}
  .hm-alc-num{font-size:10px;font-weight:700;letter-spacing:0.8px;text-transform:uppercase;color:var(--text-muted);background:var(--white);border:1px solid var(--border);padding:2px 8px;border-radius:6px;}
  .hm-alc-badge{font-size:10px;font-weight:700;padding:2px 8px;border-radius:8px;}
  .hm-alc-badge.s{background:#eafaf1;color:#1e8449;}.hm-alc-badge.p{background:var(--gc-gold-pale);color:#7d5a10;}.hm-alc-badge.e{background:#f0f0f0;color:#888;}.hm-alc-badge.a{background:var(--blue-pale);color:var(--blue);}
  .hm-alc-name{font-size:13px;font-weight:600;color:var(--text-dark);line-height:1.3;}
  .hm-alc-bottom{display:flex;align-items:center;justify-content:space-between;}
  .hm-alc-prog-text{font-size:11px;color:var(--text-muted);}
  .hm-alc-maxpts{font-size:10.5px;color:var(--text-muted);}
  .hm-alc-prog-bar{height:3px;background:var(--border);border-radius:4px;overflow:hidden;margin-top:4px;}
  .hm-alc-prog-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--gc-green),var(--gc-green-light));transition:width .4s;}
  .hm-alc-hint{font-size:11px;font-weight:600;display:flex;align-items:center;gap:3px;margin-top:2px;}
  .hm-alc-hint.g{color:var(--gc-green);}.hm-alc-hint.b{color:var(--blue);}
  /* DETAIL VIEW */
  .hm-detail-back{display:flex;align-items:center;gap:8px;margin-bottom:16px;animation:hmFU .3s ease both;}
  .hm-back-btn{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:9px;border:1.5px solid var(--border);background:var(--white);font-size:13px;font-weight:600;color:var(--text-muted);cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .15s;}
  .hm-back-btn:hover{border-color:var(--gc-green);color:var(--gc-green);background:var(--gc-green-pale);}
  .hm-breadcrumb{font-size:12.5px;color:var(--text-muted);}
  .hm-breadcrumb strong{color:var(--gc-green-dark);}
  .hm-detail-header{background:linear-gradient(135deg,var(--gc-green-dark),var(--gc-green));border-radius:14px;padding:20px 24px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;animation:hmFU .35s ease both;}
  .hm-dh-num{font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--gc-gold-light);margin-bottom:5px;}
  .hm-dh-name{font-family:'Playfair Display',serif;font-size:18px;font-weight:600;color:var(--white);line-height:1.2;}
  .hm-dh-note{font-size:12px;color:rgba(255,255,255,0.7);margin-top:5px;line-height:1.5;}
  .hm-dh-right{text-align:right;flex-shrink:0;}
  .hm-dh-pts-label{font-size:10px;color:rgba(255,255,255,0.5);letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;}
  .hm-dh-pts{font-family:'Playfair Display',serif;font-size:26px;font-weight:700;color:var(--gc-gold-light);}
  /* PART CARDS */
  .hm-parts-list{display:flex;flex-direction:column;gap:12px;animation:hmFU .4s ease both;}
  .hm-pc{background:var(--white);border-radius:12px;border:1.5px solid var(--border);overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);}
  .hm-pc.s{border-color:#a9dfbf;}.hm-pc.d{border-color:var(--gc-gold);}.hm-pc.auto{border-color:rgba(36,113,163,0.3);}
  .hm-pc-header{display:flex;align-items:center;gap:10px;padding:13px 16px 11px;border-bottom:1px solid var(--border);flex-wrap:wrap;}
  .hm-pc-label{font-size:13.5px;font-weight:700;color:var(--text-dark);flex:1;line-height:1.3;min-width:0;}
  .hm-pc-pts{font-size:11px;font-weight:700;color:var(--gc-green-dark);background:var(--gc-green-pale);padding:2px 9px;border-radius:7px;white-space:nowrap;flex-shrink:0;}
  .hm-pc-status{font-size:10px;font-weight:700;padding:2px 8px;border-radius:7px;white-space:nowrap;flex-shrink:0;}
  .hm-pc-status.s{background:#eafaf1;color:#1e8449;}.hm-pc-status.d{background:var(--gc-gold-pale);color:#7d5a10;}.hm-pc-status.e{background:#f0f0f0;color:#888;}.hm-pc-status.auto{background:var(--blue-pale);color:var(--blue);}
  .hm-pc-body{padding:14px 16px;display:flex;flex-direction:column;gap:12px;}
  /* What to Submit rubric */
  .hm-pc-rubric{background:var(--off-white);border-radius:8px;padding:12px 14px;border-left:3px solid var(--gc-gold);}
  .hm-pc-rubric-label{font-size:9px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:var(--gc-gold);margin-bottom:8px;}
  .hm-pc-rubric-list{list-style:none;display:flex;flex-direction:column;gap:4px;}
  .hm-pc-rubric-list li{font-size:12px;color:var(--text-mid);line-height:1.55;padding-left:14px;position:relative;}
  .hm-pc-rubric-list li::before{content:'▸';position:absolute;left:0;color:var(--gc-gold);font-size:9.5px;top:2px;}
  .hm-pc-rubric-list li.indent{padding-left:24px;color:var(--text-muted);}
  .hm-pc-rubric-list li.indent::before{left:10px;}
  /* Auto info */
  .hm-auto-info{background:var(--blue-pale);border:1px solid rgba(36,113,163,0.2);border-radius:8px;padding:12px 14px;display:flex;align-items:flex-start;gap:10px;}
  .hm-auto-info p{font-size:13px;color:var(--blue);line-height:1.6;}
  /* File + controls */
  .hm-pc-controls{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
  .hm-btn-template{display:flex;align-items:center;gap:5px;padding:8px 13px;border-radius:8px;font-size:12px;font-weight:700;border:1.5px solid var(--gc-green);background:var(--gc-green-pale);color:var(--gc-green);cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:all .15s;white-space:nowrap;flex-shrink:0;}
  .hm-btn-template:hover{background:var(--gc-green);color:var(--white);}
  .hm-file-zone{flex:1;min-width:180px;display:flex;align-items:center;gap:7px;background:#f4f7f5;border-radius:8px;padding:8px 11px;font-size:12px;color:var(--text-mid);}
  .hm-file-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;}
  .hm-fab{width:26px;height:26px;border-radius:6px;display:flex;align-items:center;justify-content:center;border:none;cursor:pointer;transition:all .15s;flex-shrink:0;}
  .hm-fab-view{background:#e8f4fd;color:var(--blue);}.hm-fab-dl{background:var(--gc-green-pale);color:var(--gc-green);}.hm-fab-del{background:var(--danger-pale);color:var(--danger);}
  .hm-btn-attach{display:flex;align-items:center;gap:5px;padding:8px 13px;border-radius:8px;font-size:12px;font-weight:600;border:1.5px dashed var(--border);background:var(--white);cursor:pointer;font-family:'Source Sans 3',sans-serif;color:var(--text-muted);transition:all .15s;white-space:nowrap;flex:1;}
  .hm-btn-attach:hover{border-color:var(--gc-green);color:var(--gc-green);}
  .hm-btn-replace{display:flex;align-items:center;gap:5px;padding:8px 11px;border-radius:8px;font-size:12px;font-weight:600;border:1.5px solid var(--border);background:var(--white);cursor:pointer;font-family:'Source Sans 3',sans-serif;color:var(--text-muted);transition:background .15s;white-space:nowrap;flex-shrink:0;}
  .hm-btn-replace:hover{background:var(--off-white);}
  .hm-btn-submit{display:flex;align-items:center;gap:5px;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;border:none;cursor:pointer;font-family:'Source Sans 3',sans-serif;background:linear-gradient(135deg,var(--gc-green),var(--gc-green-light));color:var(--white);box-shadow:0 3px 10px rgba(26,107,60,0.2);transition:opacity .15s;white-space:nowrap;flex-shrink:0;}
  .hm-btn-submit:hover:not(:disabled){opacity:0.9;}
  .hm-btn-submit:disabled{background:linear-gradient(135deg,#27ae60,#2ecc71);cursor:default;box-shadow:none;}
  .hm-pc-date{font-size:11px;color:var(--text-muted);display:flex;align-items:center;gap:5px;}
    /* TOASTS */
    .hm-toast-wrap{position:fixed;right:18px;bottom:18px;display:flex;flex-direction:column;gap:8px;z-index:10000;max-width:min(360px,92vw);}
    .hm-toast{display:flex;align-items:flex-start;gap:8px;border-radius:10px;padding:10px 12px;font-size:12.5px;line-height:1.4;box-shadow:0 10px 22px rgba(0,0,0,0.14);border:1px solid transparent;background:#fff;}
    .hm-toast.success{border-color:#a9dfbf;background:#eafaf1;color:#1e8449;}
    .hm-toast.error{border-color:#f5b7b1;background:#fef2f2;color:#c0392b;}
    .hm-toast.info{border-color:#bcd7ea;background:#eef6fc;color:#1f5f8a;}
  /* ACTIVITY LOG */
  .hm-activity-panel{background:var(--white);border-radius:14px;border:1px solid var(--border);padding:20px;box-shadow:0 2px 6px rgba(0,0,0,0.04);animation:hmFU .5s .3s ease both;}
  .hm-activity-list{display:flex;flex-direction:column;}
  .hm-act-item{display:flex;align-items:flex-start;gap:14px;padding:12px 0;border-bottom:1px solid #f0f3f1;}
  .hm-act-item:last-child{border-bottom:none;}
  .hm-act-icon{width:34px;height:34px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;}
  .hm-ai-gold{background:var(--gc-gold-pale);color:#b7950b;}.hm-ai-green{background:#eafaf1;color:#1e8449;}.hm-ai-blue{background:var(--blue-pale);color:var(--blue);}
  .hm-act-title{font-size:13px;font-weight:600;color:var(--text-dark);margin-bottom:3px;line-height:1.4;}
  .hm-act-meta{font-size:11.5px;color:var(--text-muted);}
  /* RESPONSIVE */
  @media(max-width:900px){
    .hm-area-list{grid-template-columns:1fr;}
    .hm-rank-summary{flex-wrap:wrap;}.hm-rs-divider{display:none;}.hm-rs-item{padding:0;flex:1 1 calc(50% - 12px);}
    .hm-submit-bar{flex-direction:column;align-items:stretch;gap:12px;}.hm-prog-track{width:100%;margin:0;}.hm-btn-submit-all{justify-content:center;}
  }
  @media(max-width:640px){
    .hm-hero{flex-direction:column;align-items:flex-start;padding:20px;}
    .hm-hero-right{align-self:stretch;display:flex;align-items:center;gap:16px;}
    .hm-deadline-ring{width:72px;height:72px;margin:0;}.hm-deadline-ring svg{width:72px;height:72px;}
    .hm-ring-days{font-size:16px;}.hm-name{font-size:17px;}.hm-rank-flow{gap:5px;}.hm-rank-chip{font-size:11px;padding:2px 8px;}
    .hm-rs-item{flex:1 1 100%;}
    .hm-detail-header{flex-direction:column;align-items:flex-start;gap:8px;}.hm-dh-right{text-align:left;}
    .hm-pc-controls{flex-direction:column;align-items:stretch;}
    .hm-btn-template,.hm-btn-attach,.hm-btn-replace,.hm-btn-submit{justify-content:center;}
  }
  /* ── GROUP HEADER (isGroup parts — Area II) ── */
  .hm-part-group{border:1.5px solid #dde5df;border-radius:14px;overflow:hidden;margin-bottom:0;}
  .hm-pg-header{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:14px 18px;background:#f8f7f4;border-bottom:1.5px solid #dde5df;}
  .hm-pg-label{font-family:'Playfair Display',serif;font-size:14px;font-weight:600;color:#1a1a1a;}
  .hm-pg-pts{font-size:12px;font-weight:700;color:#1a6b3c;background:#eef7f2;padding:3px 10px;border-radius:8px;white-space:nowrap;}
  .hm-pg-subparts{display:flex;flex-direction:column;gap:0;}
  .hm-pg-subparts .hm-pc{border-radius:0;border-left:none;border-right:none;border-top:none;border-bottom:1px solid #f0f3f1;margin-bottom:0;}
  .hm-pg-subparts .hm-pc:last-child{border-bottom:none;}
  .hm-pg-subparts .hm-pc.s{border-left:3px solid #1a6b3c;}
  .hm-pg-subparts .hm-pc.d{border-left:3px solid #c9a84c;}
  @keyframes hmFU{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
`;

// ── Part Card — renders either a group header (isGroup) or a submission slot ──
// Group headers (Area II Parts A/B/C/D) display a title bar and nest subpart cards.
// Submission slots are the leaf nodes that have their own upload + submit controls.
function PartCard({
    part,
    submissionOpen,
    getBusyAction,
    onDownloadTemplate,
    onAttachFile,
    onReplaceFile,
    onRemoveDraft,
    onSubmitPart,
    onViewFile,
    onDownloadFile,
}) {
    // ── GROUP HEADER BRANCH ──
    // If this part is a group (isGroup: true), render a section header and
    // map each subpart as its own PartCard submission slot.
    if (part.isGroup) {
        return (
            <div className="hm-part-group">
                <div className="hm-pg-header">
                    <span className="hm-pg-label">{part.label}</span>
                    <span className="hm-pg-pts">{part.pts}</span>
                </div>
                <div className="hm-pg-subparts">
                    {part.subparts.map((sp) => (
                        <PartCard
                            key={sp.id}
                            part={sp}
                            submissionOpen={submissionOpen}
                            getBusyAction={getBusyAction}
                            onDownloadTemplate={onDownloadTemplate}
                            onAttachFile={onAttachFile}
                            onReplaceFile={onReplaceFile}
                            onRemoveDraft={onRemoveDraft}
                            onSubmitPart={onSubmitPart}
                            onViewFile={onViewFile}
                            onDownloadFile={onDownloadFile}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // ── SUBMISSION SLOT BRANCH (existing code below) ──
    const sc = part.auto
        ? "auto"
        : part.status === "submitted"
          ? "s"
          : part.status === "draft"
            ? "d"
            : "e";
    const statusLabel = part.auto
        ? "Auto-scored"
        : part.status === "submitted"
          ? "✓ Submitted"
          : part.status === "draft"
            ? "Draft"
            : "Pending";
        const partBusyAction = getBusyAction?.(part.id) || null;
        const isBusy = Boolean(partBusyAction);

    return (
        <div className={`hm-pc ${sc}`}>
            <div className="hm-pc-header">
                <span className="hm-pc-label">{part.label}</span>
                <span className="hm-pc-pts">{part.pts}</span>
                <span className={`hm-pc-status ${sc}`}>{statusLabel}</span>
            </div>
            <div className="hm-pc-body">
                {/* Rubric — "What to Submit" bullets, always visible */}
                <div className="hm-pc-rubric">
                    <div className="hm-pc-rubric-label">
                        What to Submit · Scoring Criteria
                    </div>
                    <ul className="hm-pc-rubric-list">
                        {part.what.map((line, i) => (
                            <li
                                key={i}
                                className={
                                    line.startsWith("  •") ? "indent" : ""
                                }
                            >
                                {line.startsWith("  •")
                                    ? line.replace("  •", "").trim()
                                    : line}
                            </li>
                        ))}
                    </ul>
                </div>

                {part.auto ? (
                    <div className="hm-auto-info">
                        <Lock
                            size={15}
                            color="var(--blue)"
                            style={{ flexShrink: 0, marginTop: 2 }}
                        />
                        <p>
                            <strong>No file upload needed.</strong> HR scores
                            this area automatically from the student evaluation
                            CSV each semester. Your rating will appear here once
                            HR uploads the CSV for this cycle.
                        </p>
                    </div>
                ) : !submissionOpen ? (
                    /* ── CLOSED STATE ── shown when HR has not yet opened the cycle,
                       or after the submission deadline has passed. */
                    <>
                        {/* Still allow template download and viewing submitted files when closed */}
                        <div className="hm-pc-controls">
                            <button
                                type="button"
                                className="hm-btn-template"
                                onClick={() => onDownloadTemplate(part)}
                                disabled={isBusy}
                            >
                                <Download size={12} /> Download Template
                            </button>

                            {/* Show existing file (view/download only) if one was submitted */}
                            {(part.status === "submitted" ||
                                part.status === "draft") && (
                                <div className="hm-file-zone">
                                    <FileText size={12} />
                                    <span className="hm-file-name">
                                        {part.file}
                                    </span>
                                    <button
                                        type="button"
                                        className="hm-fab hm-fab-view"
                                        title="View"
                                        onClick={() => onViewFile(part)}
                                        disabled={isBusy}
                                    >
                                        <Eye size={11} />
                                    </button>
                                    <button
                                        type="button"
                                        className="hm-fab hm-fab-dl"
                                        title="Download"
                                        onClick={() => onDownloadFile(part)}
                                        disabled={isBusy}
                                    >
                                        <Download size={11} />
                                    </button>
                                </div>
                            )}

                            {/* Locked submit — disabled with lock icon */}
                            <button
                                type="button"
                                className="hm-btn-submit"
                                disabled
                                style={{ opacity: 0.45, cursor: "not-allowed" }}
                            >
                                <Lock size={12} /> Submissions Closed
                            </button>
                        </div>

                        {/* Closed notice */}
                        <div
                            className="hm-auto-info"
                            style={{
                                marginTop: 10,
                                background: "#fdf8ec",
                                borderColor: "#e8c96b",
                            }}
                        >
                            <Lock
                                size={15}
                                color="#b7950b"
                                style={{ flexShrink: 0, marginTop: 2 }}
                            />
                            <p style={{ color: "#7d5a10" }}>
                                <strong>
                                    Submissions are currently closed.
                                </strong>{" "}
                                The ranking cycle has not been opened by HR yet,
                                or the submission deadline has passed. You will
                                be notified when the next cycle opens.
                            </p>
                        </div>

                        {part.date && (
                            <div className="hm-pc-date">
                                <Calendar size={11} /> Submitted {part.date}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Controls: Template + File + Submit */}
                        <div className="hm-pc-controls">
                            {/* Template download for this Part */}
                            <button
                                type="button"
                                className="hm-btn-template"
                                onClick={() => onDownloadTemplate(part)}
                                disabled={isBusy}
                            >
                                <Download size={12} /> Download Template
                            </button>

                            {/* File slot */}
                            {part.status === "submitted" ||
                            part.status === "draft" ? (
                                <>
                                    <div className="hm-file-zone">
                                        <FileText size={12} />
                                        <span className="hm-file-name">
                                            {part.file}
                                        </span>
                                        <button
                                            type="button"
                                            className="hm-fab hm-fab-view"
                                            title="View"
                                            onClick={() => onViewFile(part)}
                                            disabled={isBusy}
                                        >
                                            <Eye size={11} />
                                        </button>
                                        <button
                                            type="button"
                                            className="hm-fab hm-fab-dl"
                                            title="Download"
                                            onClick={() => onDownloadFile(part)}
                                            disabled={isBusy}
                                        >
                                            <Download size={11} />
                                        </button>
                                        {part.status === "draft" && (
                                            <button
                                                type="button"
                                                className="hm-fab hm-fab-del"
                                                title="Remove draft"
                                                onClick={() => onRemoveDraft(part)}
                                                disabled={isBusy}
                                            >
                                                <X size={11} />
                                            </button>
                                        )}
                                    </div>
                                    {/* Replace button for submitted files */}
                                    {part.status === "submitted" && (
                                        <button
                                            type="button"
                                            className="hm-btn-replace"
                                            onClick={() => onReplaceFile(part)}
                                            disabled={isBusy}
                                        >
                                            <RefreshCw size={11} /> Replace
                                        </button>
                                    )}
                                </>
                            ) : (
                                <button
                                    type="button"
                                    className="hm-btn-attach"
                                    onClick={() => onAttachFile(part)}
                                    disabled={isBusy}
                                >
                                    <Paperclip size={12} /> Attach File
                                </button>
                            )}

                            {/* Submit button */}
                            {part.status === "submitted" ? (
                                <button
                                    type="button"
                                    className="hm-btn-submit"
                                    disabled
                                >
                                    <CheckCircle size={12} /> Submitted
                                </button>
                                                        ) : part.status === "draft" ? (
                                <button
                                    type="button"
                                    className="hm-btn-submit"
                                    onClick={() => onSubmitPart(part)}
                                    disabled={isBusy}
                                >
                                    <Send size={12} /> Submit Part
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="hm-btn-submit"
                                    disabled
                                    style={{
                                        opacity: 0.4,
                                        cursor: "not-allowed",
                                    }}
                                >
                                    <Send size={12} /> Submit Part
                                </button>
                            )}
                        </div>

                        {part.date && (
                            <div className="hm-pc-date">
                                <Calendar size={11} /> Submitted {part.date}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ── Area List Card (Level 1) ──
function AreaListCard({ area, onClick }) {
    const st = getAreaStatus(area);
    const { done, total } = getProgress(area);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const badgeText =
        st === "submitted"
            ? "Complete"
            : st === "progress"
              ? "In Progress"
              : st === "auto"
                ? "Auto-scored"
                : "Pending";
    const cls =
        st === "submitted"
            ? "s"
            : st === "progress"
              ? "p"
              : st === "auto"
                ? "a"
                : "";

    return (
        <div
            className={`hm-alc ${cls}`}
            onClick={st !== "auto" ? onClick : undefined}
        >
            <div className="hm-alc-top">
                <span className="hm-alc-num">Area {area.id}</span>
                <span
                    className={`hm-alc-badge ${st === "submitted" ? "s" : st === "progress" ? "p" : st === "auto" ? "a" : "e"}`}
                >
                    {badgeText}
                </span>
            </div>
            <div className="hm-alc-name">{area.name}</div>
            {st !== "auto" && (
                <>
                    <div className="hm-alc-bottom">
                        <span className="hm-alc-prog-text">
                            {done} of {total} part{total !== 1 ? "s" : ""}{" "}
                            submitted
                        </span>
                        <span className="hm-alc-maxpts">
                            Max {area.maxPts} pts
                        </span>
                    </div>
                    <div className="hm-alc-prog-bar">
                        <div
                            className="hm-alc-prog-fill"
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <div className="hm-alc-hint g">
                        Open Area {area.id} <ArrowRight size={11} />
                    </div>
                </>
            )}
            {st === "auto" && (
                <div className="hm-alc-hint b">
                    <Info size={11} /> Scored by HR · no upload needed · Max{" "}
                    {area.maxPts} pts
                </div>
            )}
        </div>
    );
}

// ── Main Export ──
export default function Home({ user }) {
    const userId = user?.id || null;
    const userEmail = user?.email || null;

    const [view, setView] = useState("list");
    const [openAreaId, setOpenAreaId] = useState(null);

    const [areasData, setAreasData] = useState(DEFAULT_AREAS_DATA);
    const [submissionOpen, setSubmissionOpen] = useState(MOCK_SUBMISSION_OPEN);
    const [cycleInfo, setCycleInfo] = useState({
        id: null,
        label: DEFAULT_CYCLE_LABEL,
        deadlineLabel: DEFAULT_DEADLINE_LABEL,
        daysLeft: 15,
    });
    const [profileInfo, setProfileInfo] = useState({
        currentRank: "Instructor I",
        department: "Department of Computer Studies",
    });
    const [applicationInfo, setApplicationInfo] = useState({
        id: null,
        targetRank: "Instructor II",
        status: "Draft",
        minimumScore: 200,
        lastScore: 86,
        lastCycleLabel: "2nd Sem AY 2025–2026",
        lastCycleResult: "Rank Retained",
    });
    const [isSubmittingApplication, setIsSubmittingApplication] =
        useState(false);
    const [partActionMap, setPartActionMap] = useState({});
    const [toasts, setToasts] = useState([]);

    const setPartAction = (partId, action) => {
        setPartActionMap((prev) => {
            const next = { ...prev };
            if (!action) {
                delete next[partId];
            } else {
                next[partId] = action;
            }
            return next;
        });
    };

    const getBusyAction = (partId) => partActionMap[partId] || null;

    const pushToast = (kind, message) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        setToasts((prev) => [...prev, buildToast(id, kind, message)]);
        window.setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, TOAST_TTL_MS);
    };

    const patchPartLocal = (partId, updater) => {
        setAreasData((prev) => updatePartInAreas(prev, partId, updater));
    };

    const openUrl = (url, downloadName = null) => {
        if (!url) return;
        if (downloadName) {
            const a = document.createElement("a");
            a.href = url;
            a.download = downloadName;
            a.target = "_blank";
            a.rel = "noreferrer";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            return;
        }

        window.open(url, "_blank", "noopener,noreferrer");
    };

    const getPartFileUrl = async (part) => {
        const directUrl = part.fileUrl;
        if (directUrl && /^https?:\/\//i.test(directUrl)) {
            return directUrl;
        }

        if (part.storagePath) {
            const signed = await supabase.storage
                .from(SUBMISSIONS_BUCKET)
                .createSignedUrl(part.storagePath, 3600);
            if (!signed.error && signed.data?.signedUrl) {
                return signed.data.signedUrl;
            }
        }

        return null;
    };

    const pickSingleFile = (onFile) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf,.doc,.docx,.png,.jpg,.jpeg";
        input.style.display = "none";
        const cleanup = () => {
            if (document.body.contains(input)) {
                document.body.removeChild(input);
            }
        };
        input.onchange = (event) => {
            const file = event.target?.files?.[0] || null;
            onFile(file);
            cleanup();
        };
        input.oncancel = cleanup;
        document.body.appendChild(input);
        input.click();
    };

    const writeSubmissionRow = async ({
        part,
        status,
        fileName,
        fileUrl,
        storagePath,
    }) => {
        const nowIso = new Date().toISOString();
        const areaId = resolvePartAreaId(part);
        const userPairs = [
            ["user_id", userId],
            ["faculty_id", userId],
            ["uid", userId],
            ["email", userEmail],
            ["user_email", userEmail],
        ].filter(([, value]) => Boolean(value));
        const cyclePairs = [
            ["cycle_id", cycleInfo.id],
            ["ranking_cycle_id", cycleInfo.id],
            ["cycleId", cycleInfo.id],
        ].filter(([, value]) => Boolean(value));

        const userPair = userPairs[0] || null;
        const cyclePair = cyclePairs[0] || null;

        const basePayload = {
            area_id: areaId,
            part_id: part.id,
            file_name: fileName,
            file_url: fileUrl,
            file_path: storagePath,
            status,
            updated_at: nowIso,
            uploaded_at: nowIso,
            submitted_at: status === "submitted" ? nowIso : undefined,
        };

        const payloadVariants = [
            stripUndefined(basePayload),
            stripUndefined({
                ...basePayload,
                ...(userPair ? { [userPair[0]]: userPair[1] } : {}),
            }),
            stripUndefined({
                ...basePayload,
                ...(userPair ? { [userPair[0]]: userPair[1] } : {}),
                ...(cyclePair ? { [cyclePair[0]]: cyclePair[1] } : {}),
            }),
        ];

        let saved = null;
        if (part.submissionId) {
            for (const payload of payloadVariants) {
                const result = await supabase
                    .from("areasubmissions")
                    .update(payload)
                    .eq("id", part.submissionId)
                    .select("*")
                    .maybeSingle();
                if (!result.error) {
                    saved = result.data;
                    break;
                }
            }
        }

        if (!saved) {
            for (const payload of payloadVariants) {
                const result = await supabase
                    .from("areasubmissions")
                    .insert([payload])
                    .select("*")
                    .maybeSingle();
                if (!result.error) {
                    saved = result.data;
                    break;
                }
            }
        }

        return saved;
    };

    const deleteSubmissionRow = async (part) => {
        if (part.submissionId) {
            const byIdResult = await supabase
                .from("areasubmissions")
                .delete()
                .eq("id", part.submissionId);
            if (!byIdResult.error) return true;
        }

        const partColumns = [
            "part_id",
            "partId",
            "subpart_id",
            "subpartId",
            "criterion_id",
            "criterionId",
        ];
        const userPairs = [
            ["user_id", userId],
            ["faculty_id", userId],
            ["uid", userId],
            ["email", userEmail],
            ["user_email", userEmail],
        ].filter(([, value]) => Boolean(value));
        const cyclePairs = [
            ["cycle_id", cycleInfo.id],
            ["ranking_cycle_id", cycleInfo.id],
            ["cycleId", cycleInfo.id],
        ].filter(([, value]) => Boolean(value));

        for (const partColumn of partColumns) {
            const scopedPairs = [
                ...userPairs.slice(0, 1),
                ...cyclePairs.slice(0, 1),
            ];

            const attempts = [scopedPairs, userPairs.slice(0, 1), []];
            for (const pairs of attempts) {
                let query = supabase
                    .from("areasubmissions")
                    .delete()
                    .eq(partColumn, part.id);
                for (const [column, value] of pairs) {
                    query = query.eq(column, value);
                }

                const result = await query;
                if (!result.error) return true;
                if (!isColumnOrTableError(result.error)) return false;
            }
        }

        return false;
    };

    const uploadFileForPart = async (part, file, nextStatus) => {
        const areaId = resolvePartAreaId(part);
        const cycleSegment = cycleInfo.id || "current-cycle";
        const userSegment = userId || userEmail || "anonymous";
        const cleanName = sanitizeFileName(file.name);
        const storagePath = `${cycleSegment}/${userSegment}/area_${areaId}/${part.id}/${Date.now()}_${cleanName}`;

        const uploadResult = await supabase.storage
            .from(SUBMISSIONS_BUCKET)
            .upload(storagePath, file, { upsert: true });
        if (uploadResult.error) {
            throw uploadResult.error;
        }

        const signed = await supabase.storage
            .from(SUBMISSIONS_BUCKET)
            .createSignedUrl(storagePath, 3600);
        const fileUrl = signed.data?.signedUrl || null;

        const saved = await writeSubmissionRow({
            part,
            status: nextStatus,
            fileName: file.name,
            fileUrl,
            storagePath,
        });

        const nowText = formatDateTime(new Date().toISOString()) || part.date;
        patchPartLocal(part.id, (prev) => ({
            ...prev,
            status: nextStatus,
            file: file.name,
            date: nowText,
            fileUrl,
            storagePath,
            submissionId:
                getFirstValue(saved, ["id", "submission_id"], null) ||
                prev.submissionId ||
                null,
        }));
    };

    const handleDownloadTemplate = async (part) => {
        const templatePath = buildTemplatePathForPart(part);
        if (!templatePath) return;

        setPartAction(part.id, "template");
        try {
            const signed = await supabase.storage
                .from(TEMPLATE_BUCKET)
                .createSignedUrl(templatePath, 600);

            if (signed.error || !signed.data?.signedUrl) {
                pushToast(
                    "error",
                    "Template file is not available yet for this part.",
                );
                return;
            }

            openUrl(signed.data.signedUrl);
            pushToast("success", "Template download is ready.");
        } finally {
            setPartAction(part.id, null);
        }
    };

    const handleViewFile = async (part) => {
        setPartAction(part.id, "view");
        try {
            const url = await getPartFileUrl(part);
            if (!url) {
                pushToast(
                    "error",
                    "Unable to locate the uploaded file for this part.",
                );
                return;
            }
            openUrl(url);
        } finally {
            setPartAction(part.id, null);
        }
    };

    const handleDownloadFile = async (part) => {
        setPartAction(part.id, "download");
        try {
            const url = await getPartFileUrl(part);
            if (!url) {
                pushToast(
                    "error",
                    "Unable to locate the uploaded file for this part.",
                );
                return;
            }
            openUrl(url, part.file || `${part.id}.pdf`);
            pushToast("success", "File download started.");
        } finally {
            setPartAction(part.id, null);
        }
    };

    const handleAttachFile = (part) => {
        pickSingleFile(async (file) => {
            if (!file) return;

            setPartAction(part.id, "attach");
            try {
                await uploadFileForPart(part, file, "draft");
                pushToast("success", "Draft file attached successfully.");
            } catch {
                pushToast("error", "File upload failed. Please try again.");
            }
            setPartAction(part.id, null);
        });
    };

    const handleReplaceFile = (part) => {
        pickSingleFile(async (file) => {
            if (!file) return;

            setPartAction(part.id, "replace");
            try {
                await uploadFileForPart(part, file, part.status || "draft");
                pushToast("success", "File replaced successfully.");
            } catch {
                pushToast(
                    "error",
                    "File replacement failed. Please try again.",
                );
            }
            setPartAction(part.id, null);
        });
    };

    const handleRemoveDraft = async (part) => {
        if (part.status !== "draft") return;

        setPartAction(part.id, "remove");
        try {
            const deleted = await deleteSubmissionRow(part);
            if (!deleted) {
                pushToast("error", "Unable to remove draft right now.");
                return;
            }

            if (part.storagePath) {
                await supabase.storage
                    .from(SUBMISSIONS_BUCKET)
                    .remove([part.storagePath]);
            }

            patchPartLocal(part.id, (prev) => ({
                ...prev,
                status: "empty",
                file: null,
                date: null,
                fileUrl: null,
                storagePath: null,
                submissionId: null,
            }));
            pushToast("success", "Draft removed.");
        } catch {
            pushToast("error", "Unable to remove draft right now.");
        } finally {
            setPartAction(part.id, null);
        }
    };

    const handleSubmitPart = async (part) => {
        if (part.status !== "draft") return;

        setPartAction(part.id, "submit");
        try {
            const nowIso = new Date().toISOString();
            const fileName = part.file || `${part.id}.pdf`;

            const saved = await writeSubmissionRow({
                part,
                status: "submitted",
                fileName,
                fileUrl: part.fileUrl || null,
                storagePath: part.storagePath || null,
            });

            await supabase.from("applicationlogs").insert([
                stripUndefined({
                    user_id: userId,
                    cycle_id: cycleInfo.id,
                    area_id: resolvePartAreaId(part),
                    part_id: part.id,
                    action: "submitted",
                    file_name: fileName,
                    timestamp: nowIso,
                    created_at: nowIso,
                }),
            ]);

            patchPartLocal(part.id, (prev) => ({
                ...prev,
                status: "submitted",
                date: formatDateTime(nowIso) || prev.date,
                submissionId:
                    getFirstValue(saved, ["id", "submission_id"], null) ||
                    prev.submissionId ||
                    null,
            }));
            pushToast("success", "Part submitted successfully.");
        } catch {
            pushToast("error", "Unable to submit this part right now.");
        } finally {
            setPartAction(part.id, null);
        }
    };

    useEffect(() => {
        let isActive = true;

        const hydrateHome = async () => {
            const backendAreas = await fetchAreaDefinitions();
            const baseAreas = backendAreas || DEFAULT_AREAS_DATA;

            if (!userId && !userEmail) {
                if (!isActive) return;
                setAreasData(baseAreas);
                return;
            }

            const candidates = pickUserFilterCandidates({
                id: userId,
                email: userEmail,
            });

            let nextSubmissionOpen = MOCK_SUBMISSION_OPEN;
            let nextCycleInfo = {
                id: null,
                label: DEFAULT_CYCLE_LABEL,
                deadlineLabel: DEFAULT_DEADLINE_LABEL,
                daysLeft: 15,
            };

            const cycleResult = await supabase
                .from("rankingcycles")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!cycleResult.error && cycleResult.data) {
                const cycle = cycleResult.data;
                const deadline = getFirstValue(cycle, [
                    "deadline",
                    "deadline_at",
                    "submission_deadline",
                    "end_date",
                    "closing_date",
                ]);

                nextSubmissionOpen = toBoolean(
                    getFirstValue(cycle, [
                        "submission_open",
                        "is_open",
                        "open",
                    ]),
                    MOCK_SUBMISSION_OPEN,
                );

                nextCycleInfo = {
                    id: getFirstValue(cycle, ["id", "cycle_id"], null),
                    label: String(
                        getFirstValue(cycle, ["cycle", "cycle_name", "name"], DEFAULT_CYCLE_LABEL),
                    ),
                    deadlineLabel: formatLongDate(deadline, DEFAULT_DEADLINE_LABEL),
                    daysLeft: toDaysLeft(deadline, 15),
                };
            }

            if (!isActive) return;
            setSubmissionOpen(nextSubmissionOpen);
            setCycleInfo(nextCycleInfo);

            const profileRow = await querySingleByCandidates(
                "users",
                "*",
                candidates,
            );
            if (profileRow && isActive) {
                setProfileInfo({
                    currentRank: String(
                        getFirstValue(
                            profileRow,
                            [
                                "current_rank",
                                "rank",
                                "position_rank",
                                "faculty_rank",
                            ],
                            "Instructor I",
                        ),
                    ),
                    department: String(
                        getFirstValue(
                            profileRow,
                            [
                                "department",
                                "department_name",
                                "dept",
                                "college_department",
                            ],
                            "Department of Computer Studies",
                        ),
                    ),
                });
            }

            let applicationRow = await querySingleByCandidates(
                "applications",
                "*",
                candidates,
            );

            let positionRow = null;
            if (applicationRow?.position_id) {
                const positionResult = await supabase
                    .from("positions")
                    .select("*")
                    .eq("id", applicationRow.position_id)
                    .maybeSingle();

                if (!positionResult.error) {
                    positionRow = positionResult.data;
                }
            }

            if (applicationRow && isActive) {
                const minScore = Number(
                    getFirstValue(
                        applicationRow,
                        [
                            "minimum_score",
                            "required_score",
                            "score_threshold",
                        ],
                        getFirstValue(positionRow, ["minimum_score"], 200),
                    ),
                );
                const lastScore = Number(
                    getFirstValue(
                        applicationRow,
                        [
                            "last_cycle_score",
                            "previous_cycle_score",
                            "score",
                            "total_score",
                        ],
                        86,
                    ),
                );

                setApplicationInfo({
                    id: getFirstValue(applicationRow, ["id", "application_id"], null),
                    targetRank: String(
                        getFirstValue(
                            applicationRow,
                            ["target_rank", "applying_for"],
                            getFirstValue(positionRow, ["name", "position_name", "rank", "title"], "Instructor II"),
                        ),
                    ),
                    status: String(
                        getFirstValue(
                            applicationRow,
                            ["status", "application_status"],
                            "Draft",
                        ),
                    ),
                    minimumScore: Number.isFinite(minScore) ? minScore : 200,
                    lastScore: Number.isFinite(lastScore) ? lastScore : 86,
                    lastCycleLabel: String(
                        getFirstValue(
                            applicationRow,
                            [
                                "last_cycle_label",
                                "previous_cycle",
                                "cycle_label",
                            ],
                            "2nd Sem AY 2025–2026",
                        ),
                    ),
                    lastCycleResult: String(
                        getFirstValue(
                            applicationRow,
                            ["last_cycle_result", "result", "result_label"],
                            "Rank Retained",
                        ),
                    ),
                });
            }

            const submissionRows = await queryRowsByCandidates(
                "areasubmissions",
                "*",
                candidates,
            );

            if (!isActive) return;

            const scopedRows = nextCycleInfo.id
                ? submissionRows.filter((row) => {
                      const cycleId = getFirstValue(row, [
                          "cycle_id",
                          "ranking_cycle_id",
                          "cycleId",
                      ]);
                      return cycleId
                          ? String(cycleId) === String(nextCycleInfo.id)
                          : true;
                  })
                : submissionRows;

            if (scopedRows.length > 0) {
                setAreasData(mergeAreasWithSubmissions(baseAreas, scopedRows));
            } else {
                setAreasData(baseAreas);
            }
        };

        void hydrateHome();

        return () => {
            isActive = false;
        };
    }, [userEmail, userId]);

    const openArea = (id) => {
        setOpenAreaId(id);
        setView("detail");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const backToList = () => {
        setView("list");
        setOpenAreaId(null);
    };

    const currentArea = areasData.find((a) => a.id === openAreaId);

    const submittable = areasData.filter((a) => getAreaStatus(a) !== "auto");
    const completed = submittable.filter(
        (a) => getAreaStatus(a) === "submitted",
    ).length;
    const allDone = completed === submittable.length;

    const appStatus = String(applicationInfo.status || "Draft").toLowerCase();
    const appStatusLabel = appStatus.includes("submit")
        ? "Submitted"
        : appStatus.includes("review")
          ? "Under Review"
          : "Draft";
    const isApplicationSubmitted = appStatus.includes("submit");

    const scoreShort = Math.max(
        applicationInfo.minimumScore - applicationInfo.lastScore,
        0,
    );
    const summaryProgressPct =
        applicationInfo.minimumScore > 0
            ? Math.min(
                  100,
                  Math.round(
                      (applicationInfo.lastScore / applicationInfo.minimumScore) *
                          100,
                  ),
              )
            : 0;
    const submitProgressPct = useMemo(() => {
        if (submittable.length === 0) return 0;
        return Math.round((completed / submittable.length) * 100);
    }, [completed, submittable.length]);

    const handleSubmitApplication = async () => {
        if (!applicationInfo.id || isApplicationSubmitted) return;

        setIsSubmittingApplication(true);
        const { error } = await supabase
            .from("applications")
            .update({
                status: "Submitted",
                submitted_at: new Date().toISOString(),
            })
            .eq("id", applicationInfo.id);

        if (!error) {
            setApplicationInfo((prev) => ({
                ...prev,
                status: "Submitted",
            }));
            pushToast("success", "Application submitted successfully.");
        } else {
            pushToast("error", "Unable to submit application right now.");
        }

        setIsSubmittingApplication(false);
    };

    return (
        <>
            <style>{styles}</style>

            {/* ── HERO ── */}
            <div className="hm-hero">
                <div className="hm-hero-left">
                    <div className="hm-hero-info">
                        <div className="hm-cycle-tag">
                            {cycleInfo.label} ·{" "}
                            {submissionOpen
                                ? "Open Cycle"
                                : "Submissions Closed"}
                        </div>
                        <div className="hm-name">
                            {user?.displayName || "Faculty Member"}
                        </div>
                        <div className="hm-rank-flow">
                            <span className="hm-rank-chip">
                                <School size={11} /> {profileInfo.currentRank}
                            </span>
                            <span className="hm-rank-arrow">
                                <ArrowRight size={13} />
                            </span>
                            <span className="hm-rank-chip target">
                                <Star size={11} /> {applicationInfo.targetRank}
                            </span>
                            <span className="hm-status-pill hm-status-draft">
                                ● {appStatusLabel}
                            </span>
                        </div>
                        <div className="hm-dept-tag">
                            <Building2 size={12} /> {profileInfo.department}
                        </div>
                    </div>
                </div>
                <div className="hm-hero-right">
                    {submissionOpen ? (
                        <>
                            <div className="hm-deadline-ring">
                                <svg viewBox="0 0 96 96">
                                    <circle
                                        className="hm-ring-bg"
                                        cx="48"
                                        cy="48"
                                        r="40"
                                    />
                                    <circle
                                        className="hm-ring-fill"
                                        cx="48"
                                        cy="48"
                                        r="40"
                                    />
                                </svg>
                                <div className="hm-ring-center">
                                    <span className="hm-ring-days">
                                        {cycleInfo.daysLeft}
                                    </span>
                                    <span className="hm-ring-days-label">
                                        Days Left
                                    </span>
                                </div>
                            </div>
                            <div className="hm-deadline-label">
                                Submission Deadline
                            </div>
                            <div className="hm-deadline-date">
                                {cycleInfo.deadlineLabel}
                            </div>
                        </>
                    ) : (
                        /* Closed state — shown when submission_open = false in Supabase */
                        <>
                            <div
                                className="hm-deadline-ring"
                                style={{ opacity: 0.55 }}
                            >
                                <svg viewBox="0 0 96 96">
                                    <circle
                                        className="hm-ring-bg"
                                        cx="48"
                                        cy="48"
                                        r="40"
                                    />
                                </svg>
                                <div className="hm-ring-center">
                                    <Lock
                                        size={22}
                                        color="rgba(255,255,255,0.7)"
                                    />
                                </div>
                            </div>
                            <div className="hm-deadline-label">Submissions</div>
                            <div
                                className="hm-deadline-date"
                                style={{ color: "rgba(255,255,255,0.6)" }}
                            >
                                Closed
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── RANKING SUMMARY ── */}
            <div className="hm-rank-summary">
                <div className="hm-rs-item">
                    <div className="hm-rs-label">Current Rank</div>
                    <div className="hm-rs-value">
                        <School size={14} color="var(--gc-green)" />{" "}
                        {profileInfo.currentRank}
                    </div>
                    <div className="hm-rs-sub">Since June 2020</div>
                </div>
                <div className="hm-rs-divider" />
                <div className="hm-rs-item">
                    <div className="hm-rs-label">Applying For</div>
                    <div className="hm-rs-value">
                        <TrendingUp size={14} color="var(--gc-green)" />{" "}
                        {applicationInfo.targetRank}
                    </div>
                    <div className="hm-rs-sub">This cycle's target</div>
                </div>
                <div className="hm-rs-divider" />
                <div className="hm-rs-item">
                    <div className="hm-rs-label">Score Needed</div>
                    <div className="hm-rs-value">
                        {applicationInfo.lastScore} / {applicationInfo.minimumScore} pts
                    </div>
                    <div className="hm-rs-bar">
                        <div
                            className="hm-rs-bar-fill"
                            style={{ width: `${summaryProgressPct}%` }}
                        />
                    </div>
                    <div className="hm-rs-sub">
                        Last score: {applicationInfo.lastScore} pts · {scoreShort} pts short
                    </div>
                </div>
                <div className="hm-rs-divider" />
                <div className="hm-rs-item">
                    <div className="hm-rs-label">Last Cycle Result</div>
                    <div className="hm-rs-value">
                        <span className="hm-rs-badge hm-rs-badge-retained">
                            {applicationInfo.lastCycleResult}
                        </span>
                    </div>
                    <div className="hm-rs-sub">
                        {applicationInfo.lastCycleLabel} · {applicationInfo.lastScore} pts
                    </div>
                </div>
            </div>

            {/* ── SUBMIT BAR ── */}
            <div className="hm-submit-bar">
                <div className="hm-submit-info">
                    <h4>Ready to submit your application?</h4>
                    <p>
                        Complete all required Parts across all 9 areas. Area IV
                        is auto-scored by HR.
                    </p>
                </div>
                <div className="hm-prog-track">
                    <div className="hm-prog-label">
                        <span>Areas completed</span>
                        <span>
                            {completed} / {submittable.length}
                        </span>
                    </div>
                    <div className="hm-prog-bar">
                        <div
                            className="hm-prog-fill"
                            style={{
                                width: `${submitProgressPct}%`,
                            }}
                        />
                    </div>
                </div>
                <button
                    className="hm-btn-submit-all"
                    onClick={handleSubmitApplication}
                    disabled={
                        !allDone ||
                        !submissionOpen ||
                        isSubmittingApplication ||
                        !applicationInfo.id ||
                        isApplicationSubmitted
                    }
                >
                    {!submissionOpen ? (
                        <>
                            <Lock size={14} /> Submissions Closed
                        </>
                    ) : isSubmittingApplication ? (
                        <>
                            <Upload size={14} /> Submitting...
                        </>
                    ) : isApplicationSubmitted ? (
                        <>
                            <CheckCircle size={14} /> Application Submitted
                        </>
                    ) : (
                        <>
                            <Upload size={14} /> Submit Application
                        </>
                    )}
                </button>
            </div>

            {/* ── LEVEL 1: AREA LIST or LEVEL 2: AREA DETAIL ── */}
            {view === "list" ? (
                <div className="hm-areas-panel">
                    <div className="hm-panel-header">
                        <div>
                            <div className="hm-panel-title">
                                Career Advancement Areas
                            </div>
                            <div className="hm-panel-sub">
                                Click an area to open it. Each Part inside has
                                its own template download and submission slot.
                            </div>
                        </div>
                        <span className="hm-badge-green">
                            {areasData.length} Areas
                        </span>
                    </div>
                    <div className="hm-area-list">
                        {areasData.map((area) => (
                            <AreaListCard
                                key={area.id}
                                area={area}
                                onClick={() => openArea(area.id)}
                            />
                        ))}
                    </div>
                </div>
            ) : currentArea ? (
                <div>
                    <div className="hm-detail-back">
                        <button className="hm-back-btn" onClick={backToList}>
                            <ChevronLeft size={15} /> Back to Areas
                        </button>
                        <span className="hm-breadcrumb">
                            Dashboard &rsaquo;{" "}
                            <strong>
                                Area {currentArea.id} — {currentArea.name}
                            </strong>
                        </span>
                    </div>
                    <div className="hm-detail-header">
                        <div>
                            <div className="hm-dh-num">
                                Area {currentArea.id}
                            </div>
                            <div className="hm-dh-name">{currentArea.name}</div>
                            <div className="hm-dh-note">{currentArea.note}</div>
                        </div>
                        <div className="hm-dh-right">
                            <div className="hm-dh-pts-label">Max Points</div>
                            <div className="hm-dh-pts">
                                {currentArea.maxPts}.00
                            </div>
                        </div>
                    </div>
                    <div className="hm-parts-list">
                        {currentArea.parts.map((part) => (
                            <PartCard
                                key={part.id}
                                part={part}
                                submissionOpen={submissionOpen}
                                getBusyAction={getBusyAction}
                                onDownloadTemplate={handleDownloadTemplate}
                                onAttachFile={handleAttachFile}
                                onReplaceFile={handleReplaceFile}
                                onRemoveDraft={handleRemoveDraft}
                                onSubmitPart={handleSubmitPart}
                                onViewFile={handleViewFile}
                                onDownloadFile={handleDownloadFile}
                            />
                        ))}
                    </div>
                </div>
            ) : null}

            {/* Activity log — list view only */}
            {view === "list" && (
                <div className="hm-activity-panel">
                    <div className="hm-panel-header">
                        <div>
                            <div className="hm-panel-title">
                                Application Log
                            </div>
                            <div className="hm-panel-sub">
                                Submission and review activity for this cycle
                            </div>
                        </div>
                        <span className="hm-badge-green">Current Cycle</span>
                    </div>
                    <div className="hm-activity-list">
                        {ACTIVITY_LOG.map((a, i) => (
                            <div className="hm-act-item" key={i}>
                                <div className={`hm-act-icon hm-ai-${a.icon}`}>
                                    <a.IconComp size={15} />
                                </div>
                                <div>
                                    <div className="hm-act-title">{a.text}</div>
                                    <div className="hm-act-meta">{a.meta}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {toasts.length > 0 && (
                <div className="hm-toast-wrap" role="status" aria-live="polite">
                    {toasts.map((toast) => (
                        <div
                            key={toast.id}
                            className={`hm-toast ${toast.kind || "info"}`}
                        >
                            {toast.message}
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
