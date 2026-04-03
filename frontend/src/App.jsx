import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Dashboard from "./Dashboard";
import LoginApp from './Login';
import "./Dashboard.css";

export default function App() {
  return(
  <BrowserRouter>
            <Routes>
                <Route path="/"          element={<LoginApp />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
  )
}
