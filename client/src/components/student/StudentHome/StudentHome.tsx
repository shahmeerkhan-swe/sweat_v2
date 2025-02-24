import { Link } from 'react-router-dom';
import './StudentHome.css';
// import Branding from '../../Branding/Branding';
import logo from '../../Branding/logo.png';
import uniLogo from '../../Branding/uniLogo.png';
import FeedbackButton from '../../Feedback/FeedbackButton';

const StudentHome = () => {
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
          bottom: '0',
          left: '22px',
        }}
      />
      <h1>Student Home</h1>
      <button
        className="backButton btn btn-secondary mx-3 my-3 fixed-top col-sm-1"
        onClick={() => {
          window.location.href = '/';
        }}
      >
        Home
      </button>
      {/* student */}
      <div className="linkContainer">
        <Link to="/Graph">Workload Profiles</Link>
      </div>
      <div className="linkContainer">
        <Link to="/cwcalendar">Your CW Calendar</Link>
      </div>
    </div>
  );
};

export default StudentHome;
