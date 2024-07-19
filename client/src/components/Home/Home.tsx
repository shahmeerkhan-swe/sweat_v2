import { Link } from 'react-router-dom';
import './home.css';
import Branding from '../Branding/Branding';

const Home = () => {
  return (
    <div className="home">
      <Branding />

      {/* small about icon top right opens About/ page component */}
      <button
        className="aboutButton btn btn-secondary mx-3 my-3 fixed-top col-sm-1"
        onClick={() => {
          // open About.tsx
          window.location.href = '/about';
        }}
      >
        About
      </button>

      <div>
        <label htmlFor="faculty">Faculty:</label>
        <select
          name="faculty"
          id="faculty"
          style={{
            width: '100px',
            height: '30px',
            marginBottom: '20px',
            marginLeft: '6px',
          }}
        >
          <option value="faculty1">CS</option>
          <option value="faculty2">EEE</option>
          <option value="faculty3">Some other faculty goes here</option>
        </select>
        <label htmlFor="department" style={{ marginLeft: '20px' }}>
          Department:
        </label>
        <select
          name="department"
          id="department"
          style={{
            width: '100px',
            height: '30px',
            marginBottom: '20px',
            marginLeft: '6px',
          }}
        >
          <option value="department1">EEE</option>
          <option value="department2">CS</option>
          <option value="department3">Some other department goes here</option>
        </select>
      </div>

      <h1>Home</h1>
      <div className="linkContainer">
        <Link to="/student">Students go here</Link>
      </div>
      <div className="linkContainer">
        <Link to="/staff">Staff (passkey required)</Link>
      </div>
      <div className="linkContainer">
        <Link to="/admin/">Admin (passkey required)</Link>
      </div>
    </div>
  );
};

export default Home;
