import { useState, useEffect } from 'react';
import Sidebar from '../components/sidenav';
import '../styles/layout.css';
import './review.css';
import { supabase } from '../supabase';
import ApplicationsListView from './review/components/ApplicationsListView';
import ReviewDetailView from './review/components/ReviewDetailView';
import ReviewSummaryView from './review/components/ReviewSummaryView';
import {
  FacultyInfoCard,
  DocumentViewer,
  ScoringCriteriaPanel,
  AreaCard,
  SummaryView,
} from './review/components/ReviewHelpers';

// ══ MAIN COMPONENT ═══════════════════════════════════════════
export default function Review() {
  const [view, setView] = useState('list'); // 'list' | 'detail' | 'summary'
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [areaSubmissions, setAreaSubmissions] = useState([]);
  const [areas, setAreas] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedAreaId, setExpandedAreaId] = useState(null);
  const [draftScores, setDraftScores] = useState({});
  const [savingAreaId, setSavingAreaId] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [areaCriteria, setAreaCriteria] = useState([]);
  const [loadingAreaDetails, setLoadingAreaDetails] = useState(false);
  const [savingAreaScore, setSavingAreaScore] = useState(false);
  const [editingFinalScore, setEditingFinalScore] = useState(false);
  const [draftFinalScore, setDraftFinalScore] = useState('');
  const [savingFinalScore, setSavingFinalScore] = useState(false);
  const [viewingDocument, setViewingDocument] = useState(null);
  const [applicationPage, setApplicationPage] = useState(1);

  const APPLICATION_PAGE_SIZE = 10;

  // Fetch data on component mount
  useEffect(() => {
    fetchApplicationsData();
  }, []);

  const fetchApplicationsData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching applications data (Supabase)...');

      // ═══════════════════════════════════════════════════════════════
      // COMPREHENSIVE DEBUG: Check what's actually in cycle_participants
      // ═══════════════════════════════════════════════════════════════
      const { data: debugAllParticipants, error: debugError1 } = await supabase
        .from('cycle_participants')
        .select('*')
        .limit(100);
      
      console.log('🔍 DEBUG: Total participants in DB:', {
        count: debugAllParticipants?.length || 0,
        sampleRecords: debugAllParticipants?.slice(0, 5),
        allStatuses: debugAllParticipants?.map(p => ({ cycle_id: p.cycle_id, faculty_id: p.faculty_id, status: p.status, status_type: typeof p.status }))
      });

      // Strategy: Find cycles that HAVE participants, prioritizing those with status open/submissions_closed
      // First, get all cycles with any participants
      const { data: allCycles, error: allCyclesError } = await supabase
        .from('ranking_cycles')
        .select('*')
        .order('created_at', { ascending: false });
      if (allCyclesError) throw allCyclesError;

      console.log('📅 All cycles in system:', allCycles?.map(c => ({ id: c.cycle_id, status: c.status, sem: c.semester })));

      // Get cycles that have accepted participants
      const { data: cyclesWithParticipants, error: cyclesWithParticipantsError } = await supabase
        .from('cycle_participants')
        .select('cycle_id, status')
        .eq('status', 'accepted');
      if (cyclesWithParticipantsError) throw cyclesWithParticipantsError;

      console.log('🔍 RAW cycle_participants query (status=accepted):', {
        count: cyclesWithParticipants?.length || 0,
        data: cyclesWithParticipants
      });

      // Also get ALL participants to see what statuses exist
      const { data: allParticipantsDebug } = await supabase
        .from('cycle_participants')
        .select('cycle_id, status');
      
      const uniqueStatuses = new Set(allParticipantsDebug?.map(p => p.status) || []);
      console.log('🔎 DEBUG: ALL participant statuses in system:', Array.from(uniqueStatuses));

      // If no accepted found, try alternative statuses
      if ((!cyclesWithParticipants || cyclesWithParticipants.length === 0) && allParticipantsDebug && allParticipantsDebug.length > 0) {
        const firstStatus = allParticipantsDebug[0].status;
        console.warn(`⚠️ No 'accepted' status found! First status in DB is: "${firstStatus}". Trying that...`);
        
        const { data: cyclesWithFirstStatus } = await supabase
          .from('cycle_participants')
          .select('cycle_id, status')
          .eq('status', firstStatus);
        
        console.log(`🔄 Query with status="${firstStatus}":`, {
          count: cyclesWithFirstStatus?.length || 0,
          data: cyclesWithFirstStatus
        });
      }

      const cycleIdsWithParticipants = new Set(
        (cyclesWithParticipants || []).map((p) => p.cycle_id)
      );
      console.log('🎯 Cycles with accepted participants:', Array.from(cycleIdsWithParticipants));

      // Filter to cycles that both (a) exist and (b) have participants
      const cyclesWithData = (allCycles || []).filter((c) =>
        cycleIdsWithParticipants.has(c.cycle_id)
      );

      console.log('✅ Cycles WITH participants:', cyclesWithData?.map(c => ({ id: c.cycle_id, status: c.status })));

      // Prefer open/submissions_closed, otherwise latest
      let activeCycle = cyclesWithData.find(c =>
        ['open', 'submissions_closed'].includes(c.status)
      ) || cyclesWithData[0];

      if (!activeCycle) {
        console.warn('❌ No cycles with participants found');
        console.log('🔴 COMPREHENSIVE DEBUG INFO:', {
          totalCycles: allCycles?.length,
          allCycleIds: allCycles?.map(c => ({ id: c.cycle_id, status: c.status })),
          totalParticipants: debugAllParticipants?.length,
          participantsByStatus: {
            allRecords: allParticipantsDebug?.length,
            cycleIdsInParticipants: Array.from(cycleIdsWithParticipants),
            acceptedCount: cyclesWithParticipants?.length
          },
          cycleIdsWithDataCount: cyclesWithData?.length,
          cycleIdsWithData: cyclesWithData?.map(c => c.cycle_id),
          sample_first_participant: debugAllParticipants?.[0]
        });
        setCurrentCycle(null);
        setApplications([]);
        return;
      }

      setCurrentCycle(activeCycle);
      console.log('✅ Active cycle selected:', { 
        cycle_id: activeCycle.cycle_id, 
        status: activeCycle.status, 
        semester: activeCycle.semester, 
        year: activeCycle.year
      });
      console.log('⚠️ IS THIS CYCLE 25?', activeCycle.cycle_id === 25 ? '✅ YES' : `❌ NO, it is ${activeCycle.cycle_id}`);

      // First check: ANY participants for this cycle (regardless of status)
      const { data: allParticipants, error: allParticipantsError } = await supabase
        .from('cycle_participants')
        .select('*')
        .eq('cycle_id', activeCycle.cycle_id);
      if (allParticipantsError) throw allParticipantsError;
      console.log('🔎 ALL participants (any status) for cycle', activeCycle.cycle_id, ':', {
        count: allParticipants?.length || 0,
        data: allParticipants
      });

      // Get participants for this cycle (only accepted are considered actively applied)
      const { data: participantsData, error: participantsError } = await supabase
        .from('cycle_participants')
        .select('faculty_id, status')
        .eq('cycle_id', activeCycle.cycle_id)
        .eq('status', 'accepted');
      if (participantsError) throw participantsError;

      console.log('📋 ACCEPTED participants response:', {
        count: participantsData?.length || 0,
        cycle_id: activeCycle.cycle_id,
        data: participantsData
      });

      const participantFacultyIds = Array.from(
        new Set((participantsData || []).map((p) => {
          console.log('🔍 Mapping participant:', p, '-> faculty_id:', p.faculty_id);
          return p.faculty_id;
        }).filter(Boolean))
      );

      console.log('👥 Extracted participant faculty IDs:', participantFacultyIds);

      if (participantFacultyIds.length === 0) {
        // No one applied for this cycle yet
        console.warn('⚠️ No accepted participants for this cycle');
        setApplications([]);
        return;
      }

      // Get areas for lookup
      const { data: areasData, error: areasError } = await supabase
        .from('areas')
        .select('*');
      if (areasError) throw areasError;
      setAreas(areasData || []);

      // Get departments for faculty name lookup
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('department_id, department_name');
      if (departmentsError) throw departmentsError;

      const departmentById = new Map(
        (departmentsData || []).map((dept) => [dept.department_id, dept.department_name])
      );

      // Get applications only for faculty who are participants in the active cycle
      // AND belong to the active cycle (critical for cycle isolation)
      const { data: applicationsData, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .in('faculty_id', participantFacultyIds)
        .eq('cycle_id', activeCycle.cycle_id)
        .order('created_at', { ascending: false });
      if (applicationsError) throw applicationsError;

      console.log('📊 Applications query result:', {
        participantFacultyIds,
        cycle_id: activeCycle.cycle_id,
        applicationsCount: applicationsData?.length || 0,
        firstApp: applicationsData?.[0],
        allApps: applicationsData
      });

      const applicationIdsForCycle = (applicationsData || []).map((app) => app.application_id);
      let submissionCountByApplicationId = new Map();

      if (applicationIdsForCycle.length > 0) {
        const { data: applicationSubmissions, error: applicationSubmissionsError } = await supabase
          .from('area_submissions')
          .select('application_id')
          .eq('cycle_id', activeCycle.cycle_id)
          .in('application_id', applicationIdsForCycle);

        if (applicationSubmissionsError) throw applicationSubmissionsError;

        submissionCountByApplicationId = (applicationSubmissions || []).reduce((acc, row) => {
          const current = acc.get(row.application_id) || 0;
          acc.set(row.application_id, current + 1);
          return acc;
        }, new Map());
      }

      console.log('📎 Submission counts for cycle applications:', {
        cycle_id: activeCycle.cycle_id,
        submissionCountByApplicationId: Array.from(submissionCountByApplicationId.entries())
      });

      // Keep only latest application per faculty for the active cycle view
      const latestByFaculty = new Map();
      for (const app of (applicationsData || [])) {
        if (!latestByFaculty.has(app.faculty_id)) {
          latestByFaculty.set(app.faculty_id, app);
        }
      }
      const cycleScopedApplications = Array.from(latestByFaculty.values());

      console.log('🎯 After deduping (latest per faculty):', {
        totalCount: cycleScopedApplications.length,
        facultyIds: cycleScopedApplications.map(a => a.faculty_id)
      });

      const applicationIds = cycleScopedApplications.map((app) => app.application_id);
      let fallbackScoreByApplicationId = new Map();

      // Auto-fetch score fallback by summing per-area HR points when final_score is not yet saved.
      if (applicationIds.length > 0) {
        const { data: allSubmissions, error: submissionsError } = await supabase
          .from('area_submissions')
          .select('application_id, hr_points')
          .in('application_id', applicationIds);
        if (submissionsError) throw submissionsError;

        fallbackScoreByApplicationId = (allSubmissions || []).reduce((acc, row) => {
          const current = acc.get(row.application_id) || 0;
          acc.set(row.application_id, current + Number(row.hr_points || 0));
          return acc;
        }, new Map());
      }

      const applicationsWithFaculty = [];
      for (const appData of cycleScopedApplications) {
        // Get faculty data
        const { data: facultyData, error: facultyError } = await supabase
          .from('users')
          .select('*')
          .eq('user_id', appData.faculty_id)
          .single();
        if (facultyError) continue;

        const isRankingFaculty = (facultyData?.status || '').toString().trim().toLowerCase() === 'ranking';
        const hasSubmittedFiles = (submissionCountByApplicationId.get(appData.application_id) || 0) > 0;

        if (!isRankingFaculty || !hasSubmittedFiles) {
          console.log('⏭️ Skipping application because faculty is not ranking or has no submissions', {
            application_id: appData.application_id,
            faculty_id: appData.faculty_id,
            faculty_status: facultyData?.status,
            hasSubmittedFiles,
          });
          continue;
        }

        // Skip VPAA users - only show faculty
        if ((facultyData?.role || '').toString().trim().toLowerCase() === 'vpaa') {
          console.log(`⏭️ Skipping VPAA user: ${facultyData.name_first} ${facultyData.name_last}`);
          continue;
        }

        const fallbackScore = fallbackScoreByApplicationId.get(appData.application_id);
        const displayScore = appData.final_score ?? appData.hr_score ?? fallbackScore ?? null;

        applicationsWithFaculty.push({
          id: appData.application_id,
          ...appData,
          display_score: displayScore,
          faculty: {
            ...facultyData,
            department_name: departmentById.get(facultyData.department_id) || 'Unknown'
          }
        });
      }

      setApplications(applicationsWithFaculty);
      console.log('✅ Fetched applications:', applicationsWithFaculty.length);

    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      alert('Error loading applications data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAreaSubmissions = async (applicationId) => {
    try {
      console.log('📄 Fetching area submissions for application:', applicationId, typeof applicationId);

      // ⚠️ DEBUG: Check if application_id field exists
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('area_submissions')
        .select('*')
        .eq('application_id', applicationId);
      
      if (submissionsError) {
        console.error('❌ Database error:', submissionsError);
        throw submissionsError;
      }

      console.log('📊 Raw submissions from DB:', {
        count: submissionsData?.length || 0,
        applicationIdParam: applicationId,
        firstRecord: submissionsData?.[0],
        allApplicationIds: submissionsData?.map(s => ({ id: s.submission_id, app_id: s.application_id }))
      });

      const submissions = (submissionsData || []).map((submissionData) => {
        const area = areas.find((a) => a.area_id === submissionData.area_id);

        return {
          id: submissionData.submission_id,
          ...submissionData,
          area: area || { area_name: `Unknown Area ${submissionData.area_id}`, max_possible_points: 0 }
        };
      });

      // 🆕 Add areas with rubric templates but no submissions yet
      // These areas should appear for all applications so everyone is scored consistently
      const areasWithRubrics = areas.filter(a => a.template_file_path); // Areas that have rubrics uploaded
      const submittedAreaIds = new Set(submissions.map(s => s.area_id));
      
      const areasWithoutSubmissions = areasWithRubrics
        .filter(area => !submittedAreaIds.has(area.area_id))
        .map(area => ({
          id: `placeholder-${area.area_id}-${applicationId}`, // Unique placeholder ID
          submission_id: `placeholder-${area.area_id}-${applicationId}`,
          application_id: applicationId,
          area_id: area.area_id,
          file_path: null,
          hr_points: 0,
          vpaa_points: 0,
          csv_total_average_rate: null,
          uploaded_at: null,
          is_placeholder: true, // Flag to show this is not an actual submission yet
          area: area
        }));

      const allSubmissions = [...submissions, ...areasWithoutSubmissions];

      setAreaSubmissions(allSubmissions);
      setDraftScores(
        allSubmissions.reduce((acc, item) => {
          acc[item.id] = item.hr_points ?? '';
          return acc;
        }, {})
      );
      setExpandedAreaId(null);
      console.log('✅ Fetched area submissions:', submissions.length, 'actual +', areasWithoutSubmissions.length, 'from rubrics, total:', allSubmissions.length, 'for application:', applicationId);
    } catch (error) {
      console.error('❌ Error fetching area submissions:', error);
    }
  };

  const handleReviewClick = async (application) => {
    setSelectedApplication(application);
    setSelectedFaculty(application.faculty);
    await fetchAreaSubmissions(application.id);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedApplication(null);
    setSelectedFaculty(null);
    setAreaSubmissions([]);
    setDraftScores({});
    setExpandedAreaId(null);
  };

  const handleBackToDetail = () => {
    setView('detail');
  };

  const handleToggleArea = (areaId) => {
    setExpandedAreaId((prev) => (prev === areaId ? null : areaId));
  };

  const handleDraftScoreChange = (submissionId, value) => {
    setDraftScores((prev) => ({
      ...prev,
      [submissionId]: value
    }));
  };

  const calculateTotalScore = (submissions) => {
    return submissions.reduce((sum, submission) => sum + Number(submission.hr_points || 0), 0);
  };

  const handleSaveAreaScore = async (area) => {
    const parsedScore = Number.parseFloat(draftScores[area.id]);
    const maxPoints = Number(area.max || 0);

    if (!Number.isFinite(parsedScore)) {
      alert('Please enter a valid numeric score before saving.');
      return;
    }

    if (parsedScore < 0 || parsedScore > maxPoints) {
      alert(`Score must be between 0 and ${maxPoints}.`);
      return;
    }

    try {
      setSavingAreaId(area.id);

      const { error: submissionUpdateError } = await supabase
        .from('area_submissions')
        .update({ hr_points: parsedScore })
        .eq('submission_id', area.id);
      if (submissionUpdateError) throw submissionUpdateError;

      const updatedSubmissions = areaSubmissions.map((submission) =>
        submission.id === area.id ? { ...submission, hr_points: parsedScore } : submission
      );
      setAreaSubmissions(updatedSubmissions);

      const totalScore = calculateTotalScore(updatedSubmissions);

      if (selectedApplication?.id) {
        const { error: appUpdateError } = await supabase
          .from('applications')
          .update({ hr_score: totalScore })
          .eq('application_id', selectedApplication.id);
        if (appUpdateError) throw appUpdateError;

        const updatedSelectedApplication = {
          ...selectedApplication,
          hr_score: totalScore,
          display_score: selectedApplication.final_score ?? totalScore
        };

        setSelectedApplication(updatedSelectedApplication);
        setApplications((prev) =>
          prev.map((app) =>
            app.id === selectedApplication.id
              ? { ...app, hr_score: totalScore, display_score: app.final_score ?? totalScore }
              : app
          )
        );
      }

      alert('Score saved successfully.');
    } catch (error) {
      console.error('❌ Error saving score:', error);
      alert('Failed to save score. Please try again.');
    } finally {
      setSavingAreaId(null);
    }
  };

  const handleEditFinalScore = () => {
    setDraftFinalScore(selectedApplication?.final_score || selectedApplication?.hr_score || '');
    setEditingFinalScore(true);
  };

  const handleSaveFinalScore = async () => {
    const parsedScore = Number.parseFloat(draftFinalScore);

    if (!Number.isFinite(parsedScore)) {
      alert('Please enter a valid numeric score.');
      return;
    }

    try {
      setSavingFinalScore(true);

      const { error: updateError } = await supabase
        .from('applications')
        .update({ final_score: parsedScore })
        .eq('application_id', selectedApplication.id);

      if (updateError) throw updateError;

      const updatedSelectedApplication = {
        ...selectedApplication,
        final_score: parsedScore,
        display_score: parsedScore
      };

      setSelectedApplication(updatedSelectedApplication);
      setApplications((prev) =>
        prev.map((app) =>
          app.id === selectedApplication.id
            ? { ...app, final_score: parsedScore, display_score: parsedScore }
            : app
        )
      );

      setEditingFinalScore(false);
      alert('Final score saved successfully.');
    } catch (error) {
      console.error('❌ Error saving final score:', error);
      alert('Failed to save final score. Please try again.');
    } finally {
      setSavingFinalScore(false);
    }
  };

  const handleSelectArea = async (area) => {
    setLoadingAreaDetails(true);
    try {
      // Find the submission from local state
      const localSubmission = areaSubmissions.find(s => s.id === area.id);
      
      // Get area ID and application ID
      const areaId = area.area_id || area.id || 1;
      const appId = selectedApplication?.id;
      
      // Try to fetch detailed area evaluation data from backend for criteria
      try {
        const response = await fetch(`http://localhost:5000/review/area-evaluation/${appId}/${areaId}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedArea({
            ...area,
            ...data.area,
            description: data.area?.description || area.description || ''
          });
          setAreaCriteria(data.criteria || []);
        } else {
          // Fall back to local area data if backend fails
          setSelectedArea({
            ...area,
            description: localSubmission?.area?.description || area.description || ''
          });
          setAreaCriteria([]);
        }
      } catch (err) {
        console.log('Backend not available, using local area data');
        setSelectedArea({
          ...area,
          description: localSubmission?.area?.description || area.description || ''
        });
        setAreaCriteria([]);
      }
    } catch (err) {
      console.error('Error in handleSelectArea:', err);
      setSelectedArea(area);
      setAreaCriteria([]);
    } finally {
      setLoadingAreaDetails(false);
    }
  };

  const handleCloseAreaDetails = () => {
    setSelectedArea(null);
    setAreaCriteria([]);
  };

  const handleAreaScoreChange = async (submissionId, newScore) => {
    if (!submissionId) {
      alert('No submission ID found');
      return;
    }

    setSavingAreaScore(true);
    try {
      const response = await fetch(`http://localhost:5000/review/area-score/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hrPoints: newScore }),
      });

      if (!response.ok) {
        throw new Error('Failed to update score');
      }

      const updatedSubmission = await response.json();
      
      // Update local state
      const updatedSubmissions = areaSubmissions.map((sub) =>
        sub.id === submissionId ? { ...sub, hr_points: newScore } : sub
      );
      setAreaSubmissions(updatedSubmissions);

      // Update total score in application
      const totalScore = updatedSubmissions.reduce((sum, submission) => {
        return sum + Number(submission.hr_points || 0);
      }, 0);

      if (selectedApplication?.id) {
        const { error: appUpdateError } = await supabase
          .from('applications')
          .update({ hr_score: totalScore })
          .eq('application_id', selectedApplication.id);
        if (!appUpdateError) {
          const updatedApp = { ...selectedApplication, hr_score: totalScore, display_score: selectedApplication.final_score ?? totalScore };
          setSelectedApplication(updatedApp);
          setApplications((prev) =>
            prev.map((app) => app.id === selectedApplication.id ? { ...app, hr_score: totalScore, display_score: app.final_score ?? totalScore } : app)
          );
        }
      }

      alert('Score updated successfully');
    } catch (err) {
      console.error('Error updating score:', err);
      alert('Failed to update score: ' + err.message);
    } finally {
      setSavingAreaScore(false);
    }
  };

  // Filter applications based on search and filters
  const filteredApplications = applications.filter(app => {
    const matchesSearch = !searchTerm || 
      app.faculty.name_first.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.faculty.name_last.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || 
      app.faculty.department_name === departmentFilter ||
      app.faculty.department === departmentFilter;
    
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'pending' && ['Draft', 'Submitted', 'Under_HR_Review'].includes(app.status)) ||
      (statusFilter === 'reviewed' && ['Under_VPAA_Review', 'For_Publishing', 'Published'].includes(app.status));

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  useEffect(() => {
    setApplicationPage(1);
  }, [searchTerm, departmentFilter, statusFilter, applications.length]);

  const totalApplicationPages = Math.max(1, Math.ceil(filteredApplications.length / APPLICATION_PAGE_SIZE));
  const safeApplicationPage = Math.min(applicationPage, totalApplicationPages);
  const applicationPageStart = (safeApplicationPage - 1) * APPLICATION_PAGE_SIZE;
  const applicationPageEnd = applicationPageStart + APPLICATION_PAGE_SIZE;
  const paginatedApplications = filteredApplications.slice(applicationPageStart, applicationPageEnd);

  // Convert area submissions to the format expected by AreaCard
  const submittedAreas = areaSubmissions.map(submission => ({
    id: submission.id,
    label: submission.area.area_name,
    max: Number(submission.area.max_possible_points || 0),
    score: Number(submission.hr_points || 0).toFixed(2),
    criteria: [] // For now, we'll keep this empty since criteria would need separate implementation
  }));

  const selectedDisplayScore = selectedApplication
    ? (selectedApplication.final_score ?? selectedApplication.hr_score ?? areaSubmissions.reduce((sum, submission) => sum + Number(submission.hr_points || 0), 0))
    : null;

  const selectedApplicationForDisplay = selectedApplication
    ? { ...selectedApplication, display_score: selectedDisplayScore }
    : selectedApplication;

  const summaryAreaScores = areaSubmissions
    .map((submission) => {
      const score = Number(submission.hr_points || 0);
      const max = Number(submission.area?.max_possible_points || 0);
      const pct = max > 0 ? Math.min(100, Math.round((score / max) * 100)) : 0;

      return {
        label: submission.area?.area_name || submission.area_id,
        max,
        score,
        pct
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));

  if (loading) {
    return (
      <div className="app">
        <Sidebar />
        <div className="main">
          <div className="content">
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading applications...</div>
              <div style={{ color: '#666' }}>Please wait while we fetch the data from the database.</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Sidebar />

      <div className="main">
        <div className="content">

          <div className="rk-card-header">
            <span className="rk-card-title">Review and Score</span>
            <span className="rk-semester">{currentCycle ? `${currentCycle.semester} ${currentCycle.year}` : '1st Semester AY 2026–2027'}</span>
          </div>

          {/* ── LIST VIEW ── */}
          {view === 'list' && (
            <ApplicationsListView
              filteredApplications={filteredApplications}
              paginatedApplications={paginatedApplications}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              departmentFilter={departmentFilter}
              setDepartmentFilter={setDepartmentFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              applicationPageStart={applicationPageStart}
              applicationPageSize={APPLICATION_PAGE_SIZE}
              safeApplicationPage={safeApplicationPage}
              totalApplicationPages={totalApplicationPages}
              setApplicationPage={setApplicationPage}
              onReviewClick={handleReviewClick}
            />
          )}

          {/* ── DETAIL VIEW ── */}
          {view === 'detail' && (
            <ReviewDetailView
              FacultyInfoCard={FacultyInfoCard}
              AreaCard={AreaCard}
              ScoringCriteriaPanel={ScoringCriteriaPanel}
              selectedFaculty={selectedFaculty}
              selectedApplicationForDisplay={selectedApplicationForDisplay}
              onEditFinalScore={handleEditFinalScore}
              isEditingFinalScore={editingFinalScore}
              draftFinalScore={draftFinalScore}
              onDraftFinalScoreChange={setDraftFinalScore}
              onSaveFinalScore={handleSaveFinalScore}
              isSavingFinalScore={savingFinalScore}
              submittedAreas={submittedAreas}
              expandedAreaId={expandedAreaId}
              draftScores={draftScores}
              onToggleArea={handleToggleArea}
              onDraftScoreChange={handleDraftScoreChange}
              onSaveAreaScore={handleSaveAreaScore}
              savingAreaId={savingAreaId}
              areaSubmissions={areaSubmissions}
              areas={areas}
              selectedApplication={selectedApplication}
              onSelectArea={handleSelectArea}
              onBackToList={handleBackToList}
              onOpenSummary={() => setView('summary')}
              selectedArea={selectedArea}
              areaCriteria={areaCriteria}
              onCloseAreaDetails={handleCloseAreaDetails}
              onAreaScoreChange={handleAreaScoreChange}
              savingAreaScore={savingAreaScore}
              onViewDocument={setViewingDocument}
            />
          )}

          {/* ── SUMMARY / QUALIFICATION VIEW ── */}
          {view === 'summary' && (
            <ReviewSummaryView
              FacultyInfoCard={FacultyInfoCard}
              selectedFaculty={selectedFaculty}
              selectedApplicationForDisplay={selectedApplicationForDisplay}
              onEditFinalScore={handleEditFinalScore}
              isEditingFinalScore={editingFinalScore}
              draftFinalScore={draftFinalScore}
              onDraftFinalScoreChange={setDraftFinalScore}
              onSaveFinalScore={handleSaveFinalScore}
              isSavingFinalScore={savingFinalScore}
              SummaryView={SummaryView}
              onBack={handleBackToDetail}
              areaScores={summaryAreaScores}
            />
          )}

        </div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer 
          fileUrl={viewingDocument.url}
          fileName={viewingDocument.name}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  );
}