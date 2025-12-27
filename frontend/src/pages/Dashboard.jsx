import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('teachers');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Search + filters
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherDeptFilter, setTeacherDeptFilter] = useState('all');
  const [subjectDeptFilter, setSubjectDeptFilter] = useState('all');
  const [subjectTypeFilter, setSubjectTypeFilter] = useState('all');
  const [subjectCampusFilter, setSubjectCampusFilter] = useState('all');
  const [subjectSemesterFilter, setSubjectSemesterFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [teachersRes, subjectsRes] = await Promise.all([
        api.get(`/teachers?campus=${user.campus}`),
        api.get(`/subjects?campus=${user.campus}`)
      ]);

      const teachersData = Array.isArray(teachersRes.data)
        ? teachersRes.data
        : teachersRes.data.teachers || teachersRes.data.data || [];

      const subjectsData = Array.isArray(subjectsRes.data)
        ? subjectsRes.data
        : subjectsRes.data.subjects || subjectsRes.data.data || [];

      setTeachers(teachersData);
      setSubjects(subjectsData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAvgRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 'N/A';

    const sum = reviews.reduce((acc, review) => {
      const ratings = Object.values(review.ratings);
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      return acc + avg;
    }, 0);

    return (sum / reviews.length).toFixed(1);
  };

  // --------- FILTERING ----------
  const normalizedSearch = searchTerm.toLowerCase().trim();

  const teacherDepartments = [...new Set(teachers.map((t) => t.department).filter(Boolean))];
  const subjectDepartments = [...new Set(subjects.map((s) => s.department).filter(Boolean))];
  const subjectTypes = [...new Set(subjects.map((s) => s.type).filter(Boolean))];
  const subjectSemesters = [...new Set(subjects.map((s) => s.semester).filter(Boolean))].sort((a, b) => a - b);

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      !normalizedSearch ||
      (t.name && t.name.toLowerCase().includes(normalizedSearch)) ||
      (t.department && t.department.toLowerCase().includes(normalizedSearch));

    const matchesDept =
      teacherDeptFilter === 'all' || t.department === teacherDeptFilter;

    return matchesSearch && matchesDept;
  });

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      !normalizedSearch ||
      (s.name && s.name.toLowerCase().includes(normalizedSearch)) ||
      (s.department && s.department.toLowerCase().includes(normalizedSearch));

    const matchesDept =
      subjectDeptFilter === 'all' || s.department === subjectDeptFilter;

    const matchesType =
      subjectTypeFilter === 'all' || s.type === subjectTypeFilter;

    const matchesCampus =
      subjectCampusFilter === 'all' || 
      s.campus === subjectCampusFilter || 
      s.campus === 'both';

    const matchesSemester =
      subjectSemesterFilter === 'all' || 
      String(s.semester) === String(subjectSemesterFilter);

    return matchesSearch && matchesDept && matchesType && matchesCampus && matchesSemester;
  });
  // -------------------------------

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-loading">Loading...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="dashboard-container">
          <div className="dashboard-error">
            {error}
            <button onClick={fetchData} className="dashboard-retry-button">
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="dashboard-container">
        {/* SEARCH + FILTER ROW */}
        <div className="dashboard-top-bar">
          <input
            type="text"
            placeholder="Search teachers or electives..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dashboard-search-input"
          />

          <div className="dashboard-filter-wrapper">
            <button
              className="dashboard-filter-button"
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              Filter
              <span className="filter-icon">▼</span>
            </button>

            {showFilterDropdown && (
              <div className="dashboard-filter-dropdown">
                {activeTab === 'teachers' ? (
                  <div className="filter-section">
                    <label className="filter-label">Department</label>
                    <select
                      value={teacherDeptFilter}
                      onChange={(e) => setTeacherDeptFilter(e.target.value)}
                      className="filter-select"
                    >
                      <option value="all">All departments</option>
                      {teacherDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="filter-section">
                      <label className="filter-label">Type</label>
                      <select
                        value={subjectTypeFilter}
                        onChange={(e) => setSubjectTypeFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">All types</option>
                        {subjectTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-section">
                      <label className="filter-label">Semester</label>
                      <select
                        value={subjectSemesterFilter}
                        onChange={(e) => setSubjectSemesterFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">All semesters</option>
                        {subjectSemesters.map((semester) => (
                          <option key={semester} value={semester}>
                            Semester {semester}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-section">
                      <label className="filter-label">Campus</label>
                      <select
                        value={subjectCampusFilter}
                        onChange={(e) => setSubjectCampusFilter(e.target.value)}
                        className="filter-select"
                      >
                        <option value="all">All campuses</option>
                        <option value="62">Campus 62</option>
                        <option value="128">Campus 128</option>
                        <option value="both">Both campuses</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* TABS */}
        <div className="dashboard-tabs">
          <button
            onClick={() => setActiveTab('teachers')}
            className={
              'dashboard-tab' + (activeTab === 'teachers' ? ' active' : '')
            }
          >
            Teachers ({teachers.length})
          </button>
          <button
            onClick={() => setActiveTab('subjects')}
            className={
              'dashboard-tab' + (activeTab === 'subjects' ? ' active' : '')
            }
          >
            Elective Subjects ({subjects.length})
          </button>
        </div>

        {/* GRID */}
        {activeTab === 'teachers' ? (
          <div className="dashboard-grid">
            {filteredTeachers.length === 0 ? (
              <div className="dashboard-empty-state">
                No teachers found for current search or filters.
              </div>
            ) : (
              filteredTeachers.map((teacher, idx) => (
                <div
                  key={teacher._id}
                  className="dashboard-card fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  onClick={() => navigate(`/teacher/${teacher._id}`)}
                >
                  <div className="dashboard-card-header">
                    <div>
                      <h3 className="dashboard-card-title">{teacher.name}</h3>
                      <p className="dashboard-card-subtitle">
                        {teacher.department || 'N/A'}
                      </p>
                    </div>
                    <div className="dashboard-rating-badge">
                      ⭐ {calculateAvgRating(teacher.reviews)}
                    </div>
                  </div>
                  <p className="dashboard-review-count">
                    📝 {teacher.reviews?.length || 0} reviews
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="dashboard-grid">
            {filteredSubjects.length === 0 ? (
              <div className="dashboard-empty-state">
                No subjects found for current search or filters.
              </div>
            ) : (
              filteredSubjects.map((subject, idx) => (
                <div
                  key={subject._id}
                  className="dashboard-card fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                  onClick={() => navigate(`/subject/${subject._id}`)}
                >
                  <div className="dashboard-campus-badges">
                    {subject.campus === 'both' ? (
                      <>
                        <span className="dashboard-card-badge">Campus 62</span>
                        <span className="dashboard-card-badge">Campus 128</span>
                      </>
                    ) : (
                      <span className="dashboard-card-badge">
                        Campus {subject.campus}
                      </span>
                    )}
                  </div>
                  <div className="dashboard-card-header">
                    <div>
                      <h3 className="dashboard-card-title">{subject.name}</h3>
                      <p className="dashboard-card-subtitle">
                        {subject.department || 'N/A'}
                      </p>
                    </div>
                    <div className="dashboard-rating-badge">
                      ⭐ {calculateAvgRating(subject.reviews)}
                    </div>
                  </div>
                  <p className="dashboard-review-count">
                    📝 {subject.reviews?.length || 0} reviews
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;