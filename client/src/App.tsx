import DateSetter from './components/TermDateSetter/DateSetter';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import ProgrammeDesignPage from './pages/admin/ProgrammeDesign/ProgrammeDesignPage';
import CreateModulePage from './pages/admin/CreateModule/CreateModulePage';
import CourseworkCalendar from './components/CourseworkCalendar/CourseworkCalendar';
import AcademicEventCalendar from './components/AcademicEventCalendar/AcademicEventCalendar';
import AdminHome from './components/admin/AdminHome/AdminHome';
import StaffHome from './components/staff/StaffHome/StaffHome';
// import StudentHome from './components/student/StudentHome/StudentHome';
import Home from './components/Home/Home';
import EffortGraph from './components/Graph/EffortGraph';
import 'bootstrap/dist/css/bootstrap.min.css';
import About from './components/About/About';
import StudentCalendar from './components/student/StudentCalendar/StudentCalendar';
import AdminSettings from './components/admin/Settings/adminSettings';
// import WIP from './components/WIP/WIP';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/staff" element={<StaffHome />} />
        {/* <Route path="/student" element={<StudentHome />} /> */}
        <Route path="/student" element={<StudentCalendar />} />
        {/* <Route path="/student" element={<WIP />} /> */}

        <Route path="/about" element={<About />} />
        <Route path="/cwcalendar" element={<StudentCalendar />} />

        <Route path="/admin/set-key-dates" element={<DateSetter />} />
        <Route path="/coursework-calendar" element={<CourseworkCalendar />} />
        <Route
          path="/academic-event-calendar"
          element={<AcademicEventCalendar />}
        />
        <Route path="/admin/create-module" element={<CreateModulePage />} />
        <Route
          path="/admin/programme-design"
          element={<ProgrammeDesignPage />}
        />
        <Route path="/Graph" element={<EffortGraph />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
