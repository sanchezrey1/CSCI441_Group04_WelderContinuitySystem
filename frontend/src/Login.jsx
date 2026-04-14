import { useEffect, useState } from 'react'
import {useNavigate } from "react-router-dom"
import { login, register, getTokenPayload } from '../../services/api'
import { isLoggedIn } from "../../services/helpers"

function LoginApp() {
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("");
  const [credentials, setCredentials] = useState(null)
  let navigate = useNavigate();

//check if user is logged in and return to login page if not
  useEffect( () => {
    const p = isLoggedIn()
      if(p){
        navigate("/dashboard");
        return;
      }
    setCredentials(p);
  },[] );


  async function handleLogin(){
    setError("");
    try {
      const data = await login(email, password)
      
      if (data.detail){
        setEmail('');
        setPassword('');
        setError(data.detail)
        return
      }
      
      localStorage.setItem("token", data.access_token)

      const payload = getTokenPayload();
    
      navigate("/dashboard")
   
  }
  catch (err){
    console.error("Request failed: ", err.message);
    setError("something went wrong");
  }
}
  
  async function handleRegister(){
    setError("");
    try{
      const data = await register(email, password)
      if (data.detail){ //if error exists
        setError(data.detail)
        return
      }
      setSuccess("Registration successful!")
      setEmail('');
      setPassword('');
      
    } catch (err){
    console.error("Request failed: ", err.message);
    setError("somwthing went wrong");
    }
  }

  function clearInput(e) {
    e.preventDefault();
    setEmail('');
    setPassword('');
  }

  return (
  <div className="login-page">
    <div className="login-card">
      <div className="login-title">Compliance Portal</div>
      <div className="login-subtitle">Welder Qualification System</div>

      <label className="login-label">Email</label>
      <input
        className="login-input"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />

      <label className="login-label">Password</label>
      <input
        className="login-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
      />

      {error && <div className="login-error">{error}</div>}
      {success && <div className="login-success">{success}</div>}

      <button className="btn-login" onClick={handleLogin}>Login</button>
      <button className="btn-register" onClick={handleRegister}>Register</button>
    </div>
  </div>
)
  
}

export default LoginApp
