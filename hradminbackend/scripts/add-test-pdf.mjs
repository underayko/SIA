#!/usr/bin/env node
/**
 * Helper script to manually add PDFs and test submissions
 * Usage: node add-test-pdf.mjs
 */

import 'dotenv/config';
import { supabase } from '../supabase.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// STEP 1: Upload a PDF to Supabase Storage
async function uploadPdf(filePath, bucketName = 'evidence-pdfs') {
  try {
    console.log(`📤 Uploading PDF: ${filePath}`);
    
    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const timestamp = Date.now();
    const uniquePath = `test/${timestamp}-${fileName}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uniquePath, fileBuffer, {
        contentType: 'application/pdf',
        upsert: false,
      });
    
    if (error) {
      console.error('❌ Upload error:', error);
      return null;
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniquePath);
    
    console.log('✅ PDF uploaded successfully');
    console.log('📍 Storage path:', uniquePath);
    console.log('🔗 Public URL:', publicUrlData.publicUrl);
    
    return {
      storagePath: uniquePath,
      publicUrl: publicUrlData.publicUrl,
    };
  } catch (error) {
    console.error('❌ Error uploading PDF:', error);
    return null;
  }
}

// STEP 2: Create a test submission with the PDF
async function createTestSubmission(applicationId, areaId, pdfUrl, hrPoints = 7.5) {
  try {
    console.log(`\n📝 Creating test submission...`);
    
    // Check if application exists
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select('application_id')
      .eq('application_id', applicationId)
      .single();
    
    if (appError || !app) {
      console.error('❌ Application not found:', applicationId);
      return null;
    }
    
    // Check if area exists
    const { data: area, error: areaError } = await supabase
      .from('areas')
      .select('area_id, max_possible_points')
      .eq('area_id', areaId)
      .single();
    
    if (areaError || !area) {
      console.error('❌ Area not found:', areaId);
      return null;
    }
    
    // Validate HR points
    if (hrPoints > area.max_possible_points) {
      console.warn(`⚠️  HR Points (${hrPoints}) exceeds max (${area.max_possible_points}). Using max.`);
      hrPoints = area.max_possible_points;
    }
    
    // Check if submission already exists
    const { data: existingSubmission } = await supabase
      .from('area_submissions')
      .select('submission_id')
      .eq('application_id', applicationId)
      .eq('area_id', areaId)
      .single();
    
    if (existingSubmission) {
      console.log(`📌 Updating existing submission ID: ${existingSubmission.submission_id}`);
      
      const { data, error: updateError } = await supabase
        .from('area_submissions')
        .update({
          file_path: pdfUrl,
          hr_points: hrPoints,
          uploaded_at: new Date().toISOString(),
        })
        .eq('submission_id', existingSubmission.submission_id)
        .select();
      
      if (updateError) {
        console.error('❌ Update error:', updateError);
        return null;
      }
      
      console.log('✅ Submission updated successfully');
      console.log('📊 Details:', {
        submissionId: existingSubmission.submission_id,
        applicationId,
        areaId,
        hrPoints,
        filePath: pdfUrl,
      });
      
      return data?.[0];
    }
    
    // Create new submission
    const { data, error: insertError } = await supabase
      .from('area_submissions')
      .insert([
        {
          application_id: applicationId,
          area_id: areaId,
          file_path: pdfUrl,
          hr_points: hrPoints,
          vpaa_points: 0,
          csv_total_average_rate: null,
          uploaded_at: new Date().toISOString(),
        },
      ])
      .select();
    
    if (insertError) {
      console.error('❌ Insert error:', insertError);
      return null;
    }
    
    console.log('✅ Submission created successfully');
    console.log('📊 Details:', {
      submissionId: data[0].submission_id,
      applicationId,
      areaId,
      hrPoints,
      filePath: pdfUrl,
    });
    
    return data[0];
  } catch (error) {
    console.error('❌ Error creating submission:', error);
    return null;
  }
}

// STEP 3: Create sample PDF for testing
function createSamplePdf() {
  try {
    const pdfPath = path.join(__dirname, 'sample-evidence.pdf');
    
    // Create a very basic PDF using text (base64 encoded minimal PDF)
    const minimalPdf = Buffer.from(
      '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj 4 0 obj<</Length 44>>stream BT /F1 12 Tf 50 750 Td (Test Evidence PDF) Tj ET endstream endobj 5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj xref 0 6 0000000000 65535 f 0000000009 00000 n 0000000058 00000 n 0000000115 00000 n 0000000214 00000 n 0000000308 00000 n trailer<</Size 6/Root 1 0 R>>startxref 387 %%EOF',
      'binary'
    );
    
    fs.writeFileSync(pdfPath, minimalPdf);
    console.log(`✅ Sample PDF created: ${pdfPath}`);
    return pdfPath;
  } catch (error) {
    console.error('❌ Error creating sample PDF:', error);
    return null;
  }
}

// STEP 4: List available applications and areas
async function listAvailableData() {
  try {
    console.log('\n📋 Available Applications:');
    const { data: apps, error: appsError } = await supabase
      .from('applications')
      .select('application_id, faculty_id, status')
      .limit(5);
    
    if (appsError) throw appsError;
    if (apps && apps.length > 0) {
      apps.forEach((app) => {
        console.log(`  • Application ID: ${app.application_id} | Faculty: ${app.faculty_id} | Status: ${app.status}`);
      });
    } else {
      console.log('  ℹ️  No applications found');
    }
    
    console.log('\n📋 Available Areas:');
    const { data: areas, error: areasError } = await supabase
      .from('areas')
      .select('area_id, area_name, max_possible_points');
    
    if (areasError) throw areasError;
    if (areas && areas.length > 0) {
      areas.forEach((area) => {
        console.log(`  • Area ID: ${area.area_id} | Name: ${area.area_name} | Max Points: ${area.max_possible_points}`);
      });
    } else {
      console.log('  ℹ️  No areas found');
    }
  } catch (error) {
    console.error('❌ Error listing data:', error);
  }
}

// Main workflow
async function main() {
  console.log('🚀 PDF Test Submission Helper\n');
  
  // List available data
  await listAvailableData();
  
  // Create or use sample PDF
  const samplePdfPath = createSamplePdf();
  if (!samplePdfPath) {
    console.error('Failed to create sample PDF');
    process.exit(1);
  }
  
  // Upload PDF
  const uploadResult = await uploadPdf(samplePdfPath);
  if (!uploadResult) {
    console.error('Failed to upload PDF');
    process.exit(1);
  }
  
  // Create test submission (using first available application and area)
  const applicationId = 500; // Change this to your test application ID
  const areaId = '4'; // Change this to your test area ID
  const hrPoints = 7.5; // Change this to desired score
  
  console.log(`\n💡 Creating submission for:`);
  console.log(`   Application ID: ${applicationId}`);
  console.log(`   Area ID: ${areaId}`);
  console.log(`   HR Points: ${hrPoints}`);
  
  const submission = await createTestSubmission(
    applicationId,
    areaId,
    uploadResult.publicUrl,
    hrPoints
  );
  
  if (submission) {
    console.log('\n✨ Success! Your test submission is ready.');
    console.log('You can now view it in the Review & Score interface.');
  } else {
    console.error('\n❌ Failed to create submission');
    process.exit(1);
  }
}

main().catch(console.error);
