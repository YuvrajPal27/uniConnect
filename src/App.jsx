import { Routes, Route } from "react-router-dom";

import LandingPage from "./Pages/LandingPage";
import SignIn from "./Auth/SignIn";
import SignUp from "./Auth/SignUp";
import ProtectedRoute from "./Auth/ProtectedRoute";
import Home from "./Components/Home";

import ChancellorDashboard from "./Pages/ChancellorDashboard";
import ChancellorUniversity from "./Pages/ChancellorUniversity";
import ChancellorAdmission from "./Pages/ChancellorAdmission";
import ChancellorCapacity from "./Pages/ChancellorCapacity";
import ChancellorInfrastructure from "./Pages/ChancellorInfrastructure";
import ChancellorCollectionPage from "./Pages/ChancellorCollectionPage";
import { ChancellorStudentFeedback, ChancellorParentFeedback } from "./Pages/ChancellorFeedback";

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
import Capacity from "./Components/CardPages/Capacity";
import Ranking from "./Components/CardPages/Ranking";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      <Route element={<ProtectedRoute allowedRoles={["university"]} />}>
        <Route path="/home" element={<Home />} />
        <Route path="/admission" element={<Admission />} />
        <Route path="/facultyDetails" element={<FacultyDetails />} />
        <Route path="/uniAtAGlance" element={<UniAtAGlance />} />
        <Route path="/tnp" element={<Tnp />} />
        <Route path="/infrastructure" element={<Infrastructure />} />
        <Route path="/capacity" element={<Capacity />} />
        <Route path="/enrollment" element={<Enrollment />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/trainingPrograms" element={<TrainingPrograms />} />
        <Route path="/budget" element={<Budget />} />
        <Route path="/mou" element={<Mou />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/studentFeedback" element={<StudentFeedback />} />
        <Route path="/parentFeedback" element={<ParentFeedback />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["chancellor"]} />}>
        <Route path="/chancellor" element={<ChancellorDashboard />} />
        <Route path="/chancellor/:university" element={<ChancellorUniversity />} />
        <Route path="/chancellor/admission/:university" element={<ChancellorAdmission />} />
        <Route path="/chancellor/capacity/:university" element={<ChancellorCapacity />} />
        <Route path="/chancellor/infrastructure/:university" element={<ChancellorInfrastructure />} />
        <Route path="/chancellor/ranking/:university" element={<ChancellorCollectionPage collectionName="rankingSystemDetails" title="Ranking" />} />
        <Route path="/chancellor/facultyDetails/:university" element={<ChancellorCollectionPage collectionName="facultyDetails" title="Faculty Details" />} />
        <Route path="/chancellor/tnp/:university" element={<ChancellorCollectionPage collectionName="TnP" title="Training and Placement" />} />
        <Route path="/chancellor/enrollment/:university" element={<ChancellorCollectionPage collectionName="enrollment" title="Enrollment" />} />
        <Route path="/chancellor/achievements/:university" element={<ChancellorCollectionPage collectionName="achievements" title="Achievements" />} />
        <Route path="/chancellor/training/:university" element={<ChancellorCollectionPage collectionName="training" title="Training Programs" />} />
        <Route path="/chancellor/budget/:university" element={<ChancellorCollectionPage collectionName="budget" title="Budget" />} />
        <Route path="/chancellor/mou/:university" element={<ChancellorCollectionPage collectionName="mou" title="MoU" />} />
        <Route path="/chancellor/studentFeedback/:university" element={<ChancellorStudentFeedback />} />
        <Route path="/chancellor/parentFeedback/:university" element={<ChancellorParentFeedback />} />
      </Route>
    </Routes>
  );
}

export default App;
