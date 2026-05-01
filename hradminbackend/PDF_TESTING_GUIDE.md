# Manual PDF Upload Guide for Testing

## Overview
This guide shows you how to manually add PDFs to test the performance criteria scoring interface.

---

## Method 1: Using the Helper Script (Recommended)

### Quick Start
```bash
cd d:\SIA\hradminbackend
node scripts/add-test-pdf.mjs
```

**What it does:**
1. ✅ Lists available applications and areas
2. ✅ Creates a sample test PDF
3. ✅ Uploads it to Supabase Storage
4. ✅ Creates/updates an area submission record
5. ✅ Returns the public URL for download

### Customizing the Script
Edit these values in `add-test-pdf.mjs` before running:
```javascript
const applicationId = 500;  // Change to your application ID
const areaId = '4';         // Change to your area ID
const hrPoints = 7.5;       // Change to desired score
```

---

## Method 2: Manual Supabase Storage Upload

### Step 1: Upload PDF via Supabase Dashboard

1. Go to your Supabase project: https://app.supabase.com/
2. Click **Storage** in left sidebar
3. Create a new bucket called `evidence-pdfs` (if not exists)
   - Settings: **Public** (so PDFs can be downloaded)
4. Upload your test PDF file
5. Copy the **public URL** from the file details

**Expected URL format:**
```
https://[your-project].supabase.co/storage/v1/object/public/evidence-pdfs/[path/to/file].pdf
```

---

## Method 3: Using SQL via Supabase Dashboard

### Step 1: Find Your Test Data
First, identify which application and area you want to test:

```sql
-- List all applications
SELECT application_id, faculty_id, status 
FROM applications 
LIMIT 5;

-- List all areas
SELECT area_id, area_name, max_possible_points 
FROM areas;
```

### Step 2: Insert or Update Submission

**Option A: Insert New Submission**
```sql
INSERT INTO area_submissions 
  (application_id, area_id, file_path, hr_points, vpaa_points, uploaded_at)
VALUES 
  (500, '4', 'https://your-supabase.../evidence.pdf', 7.5, 0, NOW());
```

**Option B: Update Existing Submission**
```sql
UPDATE area_submissions 
SET 
  file_path = 'https://your-supabase.../evidence.pdf',
  hr_points = 7.5,
  uploaded_at = NOW()
WHERE 
  application_id = 500 AND area_id = '4';
```

### Step 3: Verify
```sql
SELECT * FROM area_submissions 
WHERE application_id = 500 AND area_id = '4';
```

---

## Method 4: Using the Backend API

### Create/Update via API Call

```bash
# Using curl
curl -X PATCH http://localhost:5000/review/area-score/[SUBMISSION_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "hrPoints": 7.5,
    "vpaaPoints": 0
  }'
```

**Note:** This updates the score but doesn't handle file upload. You still need to upload the PDF to Supabase Storage first.

---

## Creating Test PDFs

### Option 1: Use Any Existing PDF
Simply use a PDF file you have. Any PDF works for testing.

### Option 2: Create a Simple PDF Online
1. Go to https://www.pdf-online.com/osa/merge.html or similar
2. Create a simple test document
3. Download as PDF
4. Upload to Supabase Storage

### Option 3: Create Programmatically
The helper script automatically creates a minimal test PDF:
```javascript
// Minimal PDF content (base64 encoded)
const pdfContent = Buffer.from('...');
fs.writeFileSync('test.pdf', pdfContent);
```

---

## Complete Testing Workflow

### 1. First Time Setup
```bash
# Install dependencies (if needed)
npm install dotenv @supabase/supabase-js

# Create .env with:
# SUPABASE_URL=your_url
# SUPABASE_SERVICE_ROLE_KEY=your_key
```

### 2. Check Available Data
```bash
# Run and follow prompts
node scripts/add-test-pdf.mjs
```

### 3. Access Review Screen
1. Start the frontend: `npm run dev`
2. Navigate to **Review & Score** page
3. Click on an application
4. You should see the area with the uploaded PDF
5. Click the **eye icon** to view the submission
6. Click **Download PDF** to test the download

### 4. Test Editing Scores
1. In the Scoring Details panel, click **Edit Score**
2. Change the HR Points value
3. Click **Save**
4. Verify the score updates in both the UI and database

---

## Testing Scenarios

### Scenario 1: Single Area Submission
- Upload 1 PDF for 1 area
- Test downloading
- Test score editing

### Scenario 2: Multiple Areas
- Upload PDFs for multiple areas (e.g., Area 1, 2, 3, 4)
- Test switching between areas
- Test that each area shows its own PDF

### Scenario 3: Score Calculation
- Upload PDFs with different scores
- Verify total application score sums correctly
- Test validation (score cannot exceed max_possible_points)

### Scenario 4: Edge Cases
- Very small PDF files
- Large PDF files (>10MB)
- PDF with special characters in filename
- Multiple submissions for same area (update test)

---

## Troubleshooting

### PDF won't download
**Problem:** 404 error or "not found"
**Solution:** 
- Verify the URL is correct in the database
- Ensure the Supabase Storage bucket is set to **Public**
- Check the file path matches what's in storage

### Submission not showing
**Problem:** Area submission doesn't appear in review screen
**Solution:**
```sql
-- Verify the submission was created
SELECT * FROM area_submissions 
WHERE application_id = YOUR_APP_ID;

-- Check if the application exists
SELECT * FROM applications 
WHERE application_id = YOUR_APP_ID;

-- Check if the area exists
SELECT * FROM areas WHERE area_id = '4';
```

### Score won't update
**Problem:** "Save" button doesn't work
**Solution:**
- Check the score is numeric
- Verify it doesn't exceed `max_possible_points`
- Check browser console for errors (F12)
- Verify backend is running (`npm start`)

### Storage bucket not found
**Problem:** "Could not find bucket" error
**Solution:**
```sql
-- Create the bucket via SQL
-- Or use Supabase dashboard: Storage > Create New Bucket
-- Name: evidence-pdfs
-- Access: Public
```

---

## Database Schema Reference

### area_submissions table
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| submission_id | BIGINT | Auto | Primary key |
| application_id | BIGINT | ✅ | Foreign key to applications |
| area_id | VARCHAR | ✅ | Foreign key to areas |
| file_path | TEXT | ✅ | Full Supabase Storage URL |
| hr_points | NUMERIC | ❌ | Default: 0 |
| vpaa_points | NUMERIC | ❌ | Default: 0 |
| csv_total_average_rate | NUMERIC | ❌ | Optional |
| uploaded_at | TIMESTAMP | ✅ | Default: NOW() |

---

## Next Steps

After testing PDFs:
1. ✅ Verify download functionality works
2. ✅ Test score editing and saving
3. ✅ Test multiple areas per application
4. ✅ Test the Summary/Qualification view
5. Deploy to production with real faculty PDFs
