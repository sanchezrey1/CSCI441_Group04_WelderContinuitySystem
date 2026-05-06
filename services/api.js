const BASE_URL = "http://localhost:8000"

//helper function so we dont repeat the token logic everywhere

//if logged in, returns the payload of the JWT token containing
// user role and email ("sub")
export function getTokenPayload(){
    const token = localStorage.getItem("token");

    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload;
}

//--- AUTH ---
export async function register(email, password){
    const res = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({"email" : email, "password":password})
    })
    return res.json();
}

export async function login(email, password){
    const res = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {"Content-Type": "application/x-www-form-urlencoded"},
        body: new URLSearchParams({"username": email, "password": password})
    })
    return res.json()
}

export function logout(){
    localStorage.removeItem("token");
}

export async function getWelders(){
    const res = await fetch(`${BASE_URL}/api/welderlist`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
    return await res.json();
}

export async function getWelder(welder_id){
    const res = await fetch(`${BASE_URL}/api/welder/${welder_id}`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        return await res.json();
}

export async function getDashboard(){
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/api/dashboard`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    return await res.json();
}