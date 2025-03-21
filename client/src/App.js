import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./Components/Home";
import Login from "./Components/Login";
import Nav from "./Components/Navbar";
import ViewVoter from "./Components/ViewVoter";
import Logs from "./Components/Logs";
import UserProfile from "./Components/UserProfile/UserProfile";
import Dashboard from "./Components/Dashboard/Dashboard";
import { fetchAndStoreIp } from "./Components/Vars";
import Warding from "./Components/Warding";
import WardingList from "./Components/WardingList";
import WardingListAll from "./Components/WardingListAll";
import WardingLogs from "./Components/WardingLogs"
import Settings from "./Components/Settings";
import LeaderReport from "./Components/LeaderReport";
import HouseHoldReport from "./Components/HouseholdReport";
import OldWarding from "./Components/WardingOld";
import LeaderManagement from "./Components/WardingLeaderList";
import WardingReport from "./Components/WardingReport";
import Registration from "./Components/LeaderRegistration";
import LiquidationReport from "./Components/LiquidationReport";
import HouseholdWarding from "./Components/HouseholdWarding";
import IncRegistration from "./Components/IncRegistration";
import LiquidationIncReport from "./Components/LiquidationIncReport";

function App() {
  fetchAndStoreIp();
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route path="/main" element={[<Nav />, <Home />]} />
        <Route path="/login" element={<Login />} />
        <Route path="/viewVoter" element={[<Nav />, <ViewVoter />]} />
        <Route path="/logs" element={[<Nav />, <Logs />]} />
        <Route path="/wardinglogs" element={[<Nav />, <WardingLogs />]} />
        <Route path="/profile" element={[<Nav />, <UserProfile />]} />
        <Route path="/dashboard" element={[<Nav />, <Dashboard />]} />
        <Route path="/warding" element={[<Nav />, <Warding />]} />
        <Route path="/warding_old" element={[<Nav />, <OldWarding />]} />
        <Route path="/wardinglist" element={[<Nav />, <WardingList />]} />
        <Route path="/wardinglistall" element={[<Nav />, <WardingListAll />]} />
        <Route path="/settings" element={[<Nav />, <Settings />]} />
        <Route path="/leaderreport" element={[<Nav />,<LeaderReport />]} />
        <Route path="/householdreport" element={[<Nav />,<HouseHoldReport />]} />
        <Route path="/leaderwardinglist" element={[<Nav />,<LeaderManagement />]} />
        <Route path="/liquidationreport" element={[<Nav />,<LiquidationReport />]} />
        <Route path="/householdwarding" element={[<Nav />,<HouseholdWarding />]} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/incregistration" element={<IncRegistration />} />
        <Route path="/liquidationincreport" element={[<Nav />,<LiquidationIncReport />]} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
