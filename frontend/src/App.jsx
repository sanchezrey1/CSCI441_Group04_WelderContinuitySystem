import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Dashboard from "./Dashboard";
import LoginApp from './Login';
import WelderListApp from './WelderList';
import "./Dashboard.css";
import AddWelder from "./AddWelder";
import Notifications from "./Notifications";
import Settings from "./Settings";
import WelderCard from "./WelderCard";

export default function App() {
  return(
  <BrowserRouter>
            <Routes>
                <Route path="/"          element={<LoginApp />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/welderlist" element={<WelderListApp/>}/>
                <Route path="/add-welder" element={<AddWelder />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/welderCard/:welder_id" element={<WelderCard />} />
            </Routes>
        </BrowserRouter>
  )
}
