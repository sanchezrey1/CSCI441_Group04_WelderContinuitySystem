import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Dashboard from "./Dashboard";
import LoginApp from './Login';
import WelderListApp from './WelderList';
import "./Dashboard.css";
import AddWelder from "./AddWelder";


export default function App() {
  return(
  <BrowserRouter>
            <Routes>
                <Route path="/"          element={<LoginApp />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/welderlist" element={<WelderListApp/>}/>
                <Route path="/add-welder" element={<AddWelder />} />
            </Routes>
        </BrowserRouter>
  )
}
