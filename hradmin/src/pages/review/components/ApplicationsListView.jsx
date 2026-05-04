import React from 'react';

const REVIEWED_STATUSES = ['Under_VPAA_Review', 'For_Publishing', 'Published'];

export default function ApplicationsListView({
  filteredApplications,
  paginatedApplications,
  searchTerm,
  setSearchTerm,
  departmentFilter,
  setDepartmentFilter,
  statusFilter,
  setStatusFilter,
  applicationPageStart,
  applicationPageSize,
  safeApplicationPage,
  totalApplicationPages,
  setApplicationPage,
  onReviewClick,
}) {
  return (
    <>
      <div className="toolbar">
        <div className="toolbar-left">
          <span className="toolbar-label">Faculty Applications ({filteredApplications.length})</span>
          <div className="search-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              placeholder="Search faculty name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-wrap">
            <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
              <option value="all">All Departments</option>
              <option value="CCS">CCS</option>
              <option value="CEAS">CEAS</option>
              <option value="CBA">CBA</option>
              <option value="BSA">BSA</option>
            </select>
          </div>
          <div className="filter-wrap">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
        </div>
      </div>

      {filteredApplications.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <div style={{ fontSize: '16px', marginBottom: '8px' }}>No ranking faculty submissions found</div>
          <div style={{ fontSize: '14px' }}>
            Only faculty who are For Ranking and have submitted files in the active cycle are shown.
          </div>
        </div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Rank</th><th>Name</th><th>Department</th>
                <th>Current Rank</th><th>Final Score</th>
                <th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedApplications.map((application, index) => (
                <tr key={application.id}>
                  <td>{applicationPageStart + index + 1}</td>
                  <td className="faculty-name">{application.faculty.name_last}, {application.faculty.name_first}</td>
                  <td>{application.faculty.department_name}</td>
                  <td>{application.faculty.current_rank}</td>
                  <td>{application.display_score ?? 'Not scored'}</td>
                  <td>
                    <span className={`badge ${
                      REVIEWED_STATUSES.includes(application.status)
                        ? 'badge-reviewed'
                        : 'badge-pending'
                    }`}>
                      {REVIEWED_STATUSES.includes(application.status) ? 'Reviewed' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <button className="review-btn" onClick={() => onReviewClick(application)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/>
                        <path d="M14 17h7M17 14v7"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{
            marginTop: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              Showing {applicationPageStart + 1}-{Math.min(applicationPageStart + applicationPageSize, filteredApplications.length)} of {filteredApplications.length}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setApplicationPage((p) => Math.max(1, p - 1))}
                disabled={safeApplicationPage <= 1}
              >
                Previous
              </button>
              <span style={{ fontSize: '12px', color: '#4b5563' }}>
                Page {safeApplicationPage} of {totalApplicationPages}
              </span>
              <button
                type="button"
                className="btn"
                onClick={() => setApplicationPage((p) => Math.min(totalApplicationPages, p + 1))}
                disabled={safeApplicationPage >= totalApplicationPages}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
