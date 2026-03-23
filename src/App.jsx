import { Routes, Route } from "react-router-dom";
import SignIn from "./Auth/SignIn";
import Home from "./Components/Home";
import LandingPage from "./Pages/LandingPage";
import Admission from "./Components/CardPages/Admission";
import FacultyDetails from "./Components/CardPages/FacultyDetails";
import UniAtAGlance from "./Components/CardPages/UniAtAGlance";
import Tnp from "./Components/CardPages/Tnp";
import Infrastructure from "./Components/CardPages/Infrastructure";
import Enrollment from "./Components/CardPages/Enrollment";
import Achievements from "./Components/CardPages/Achievements";
import TrainingPrograms from "./Components/CardPages/TrainingPrograms";
import Budget from "./Components/CardPages/Budget";
import Mou from "./Components/CardPages/Mou";
import StudentFeedback from "./Components/CardPages/StudentFeedback";
import ParentFeedback from "./Components/CardPages/ParentFeedback";
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/admission" element={<Admission />} />
      <Route path="/facultyDetails" element={<FacultyDetails />} />

      <Route path="/uniAtAGlance" element={<UniAtAGlance />} />
      <Route path="/tnp" element={<Tnp />} />
      <Route path="/infrastructure" element={<Infrastructure />} />

      <Route path="/enrollment" element={<Enrollment />} />

      <Route path="/achievements" element={<Achievements />} />

      <Route path="/trainingPrograms" element={<TrainingPrograms />} />

      <Route path="/budget" element={<Budget />} />

      <Route path="/mou" element={<Mou />} />
      <Route path="/studentFeedback" element={<StudentFeedback />} />
      <Route path="/parentFeedback" element={<ParentFeedback />} />
    </Routes>
  );
}

export default App;
