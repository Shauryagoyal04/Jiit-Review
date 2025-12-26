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
  const [activeTab, setActiveTab] = useState('teachers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.campus) {
      fetchData();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tRes, sRes] = await Promise.all([
        api.get(`/teachers?campus=${user.campus}`),
        api.get(`/subjects?campus=${user.campus}`)
      ]);

      const teachersData = Array.isArray(tRes.data)
        ? tRes.data
        : tRes.data?.teachers || tRes.data?.data || [];

      const subjectsData = Array.isArray(sRes.data)
        ? sRes.data
        : sRes.data?.subjects || sRes.data?.data || [];

      setTeachers(teachersData);
      setSubjects(subjectsData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const avgRating = (reviews) => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 'N/A';

    const total = reviews.reduce((sum, r) => {
      const values = Object.values(r.ratings || {});
      if (!values.length) return sum;
      return sum + values.reduce((a, b) => a + b, 0) / values.length;
    }, 0);

    return (total / reviews.length).toFixed(1);
  };

  const list =
    activeTab === 'teachers'
      ? teachers
      : subjects;

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="dashboard-loading">Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="dashboard-error">
          {error}
          <button
            className="dashboard-retry-button"
            onClick={fetchData}
          >
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1 className="dashboard-title">
            Campus {user.campus} Reviews
          </h1>
          <p className="dashboard-disclaimer">
            All reviews are anonymous. Rate honestly and respectfully.
          </p>
        </header>

        <div className="dashboard-tabs">
          <button
            className={`dashboard-tab ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => setActiveTab('teachers')}
          >
            Teachers ({teachers.length})
          </button>

          <button
            className={`dashboard-tab ${activeTab === 'subjects' ? 'active' : ''}`}
            onClick={() => setActiveTab('subjects')}
          >
            Elective Subjects ({subjects.length})
          </button>
        </div>

        <div className="dashboard-grid">
          {list.length === 0 && (
            <div className="dashboard-empty-state">
              No data available
            </div>
          )}

          {list.map((item) => (
            <div
              key={item._id}
              className="dashboard-card fade-in"
              onClick={() =>
                navigate(`/${activeTab.slice(0, -1)}/${item._id}`)
              }
            >
              <span className="dashboard-card-badge">
                Campus {item.campus || user.campus}
              </span>

              <div className="dashboard-card-header">
                <div>
                  <h3 className="dashboard-card-title">
                    {item.name}
                  </h3>
                  <p className="dashboard-card-subtitle">
                    {item.department}
                  </p>
                </div>

                <div className="dashboard-rating-badge">
                  ⭐ {avgRating(item.reviews)}
                </div>
              </div>

              <p className="dashboard-review-count">
                📝 {item.reviews?.length || 0} reviews
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
