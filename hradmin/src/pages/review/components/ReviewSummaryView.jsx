import React from 'react';

export default function ReviewSummaryView({
  FacultyInfoCard,
  selectedFaculty,
  selectedApplicationForDisplay,
  onEditFinalScore,
  isEditingFinalScore,
  draftFinalScore,
  onDraftFinalScoreChange,
  onSaveFinalScore,
  isSavingFinalScore,
  SummaryView,
  onBack,
  areaScores,
}) {
  return (
    <>
      <FacultyInfoCard
        facultyData={selectedFaculty}
        applicationData={selectedApplicationForDisplay}
        onEditFinalScore={onEditFinalScore}
        isEditingFinalScore={isEditingFinalScore}
        draftScore={draftFinalScore}
        onDraftScoreChange={onDraftFinalScoreChange}
        onSaveFinalScore={onSaveFinalScore}
        isSavingFinalScore={isSavingFinalScore}
      />
      <div className="submitted-label">Qualification Review</div>
      <SummaryView onBack={onBack} areaScores={areaScores} />
    </>
  );
}
