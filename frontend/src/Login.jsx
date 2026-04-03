import { useState } from 'react'
import {useNavigate } from "react-router-dom"
import { login, register } from '../../services/api'
import { getTokenPayload } from "../../services/api"


function LoginApp() {
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  let navigate = useNavigate();

  async function handleLogin(){
    try {
      const data = await login(email, password)
      
      if (data.detail){
        error
        setError(data.detail)
        return
      }
      
      localStorage.setItem("token", data.access_token)

      const payload = getTokenPayload();
    
      if(payload.role === "ADMIN_CWI"){
        navigate("/admin")
      } else {
        navigate("/dashboard")
      }
  }
  catch (err){
    console.error("Request failed: ", err.message);
    setError("somwthing went wrong");
  }
}
  
  async function handleRegister(){
    try{
      const data = await register(email, password)
      if (data.detail){ //if error exists
        setError(data.detail)
        return
      }
      
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
    <>
      <h1>LOGIN</h1>
      <form onSubmit={clearInput}>
        <label>Email:</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Username"/>
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"/>
        
        <button onClick={handleLogin}>Login</button>
        <button onClick={handleRegister}>Register</button>
      </form>
    </>
  )
}

export default LoginApp
