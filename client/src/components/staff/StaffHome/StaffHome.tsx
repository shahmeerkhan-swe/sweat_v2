import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './StaffHome.css';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import Branding from '../../Branding/Branding';
import logo from '../../Branding/logo.png';
import uniLogo from '../../Branding/uniLogo.png';
import FeedbackButton from '../../Feedback/FeedbackButton';

const StaffHome = () => {
  const staffPassword = import.meta.env.VITE_STAFF_PASSWORD;
  const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check local storage for staff login status on component mount
    const isStaff = localStorage.getItem('isStaff');
    if (isStaff === 'true') {
      toast.success('Welcome back staff!');
      setIsLoggedIn(true);
    }
  }, []);

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const password = document.querySelector('input')?.value;
    if (password === staffPassword || password === adminPassword) {
      setIsLoggedIn(true);
      localStorage.setItem('isStaff', 'true');
      toast.success('Welcome staff!');
    } else {
      toast.error('Incorrect password');
    }
  };

  return (
    <div className="home">
      <img
        src={logo}
        alt="Logo"
        className="logo"
        style={{
          width: '150px',
          height: '150px',
          position: 'absolute',
          bottom: '0',
          right: '0',
        }}
      />
      <img
        src={uniLogo}
        alt="University Logo"
        className="uniLogo"
        style={{
          width: '190px',
          position: 'absolute',
          top: '0',
          right: '15px',
        }}
      />
      <h1 className="">Staff Portal</h1>
      <button
        className="backButton btn btn-secondary mx-3 my-3 fixed-top col-sm-1"
        onClick={() => {
          window.location.href = '/';
        }}
      >
        Home
      </button>
      {!isLoggedIn ? (
        <div className="linkContainer">
          <form action="submit">
            <input
              type="password"
              id="password"
              placeholder="Enter password"
              className="px-2 py-2"
            />
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-primary mx-2 px-2 py-2"
            >
              Submit
            </button>
          </form>
        </div>
      ) : (
        <>
          <div>
            {/* dropdown for selecting current academic year */}
            <span>Academic Year: </span>
            <select className="mb-4">
              <option value="2023/24">2023/24</option>
              <option value="2024/25">2024/25</option>
              <option value="2025/26">2025/26</option>
            </select>
          </div>

          <div>
            <label>Calendar Version: </label>
            {/* Dropdown for selecting calendar version */}
            <select className="mb-4">
              <option value="CV1">CV1</option>
            </select>
          </div>
          <div
            className="makeResponsiveScrollable"
            style={{
              overflowY: 'scroll',
              // display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div className="linkContainer">
              <Link to="/admin/set-key-dates">Set Key Dates</Link>
            </div>
            <div className="linkContainer">
              <Link to="/coursework-calendar">
                Coursework Calendar
              </Link>
            </div>
            <div className="linkContainer">
              <Link to="/admin/programme-design">My Modules</Link>
            </div>
            <div className="linkContainer">
              <Link to="/academic-event-calendar">Academic Event Calendar</Link>
            </div>
            <div className="linkContainer">
              <Link to="/Graph">Workload Profiles</Link>
            </div>
          </div>
        </>
      )}
      <FeedbackButton />
    </div>
  );
};

export default StaffHome;
