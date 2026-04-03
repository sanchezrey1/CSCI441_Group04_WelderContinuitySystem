from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from passlib.context import CryptContext
from jose import jwt, JWTError
import sqlite3
from pathlib import Path
from pydantic import BaseModel
from backend.dashboard import router as dashboard_router

# Create the FastAPI app - this is the thing that listens for requests from React
app = FastAPI()

# Tell FastAPI to allow requests from React's dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard_router)

# keep secret key in since it's a simple local project
SECRET_KEY = "secret_key"

pwd_context = CryptContext(schemes=["bcrypt"])


# This tells FastAPI that protected routes expect a token sent in the request header
# It also automatically creates a /login route in FastAPI's built-in docs
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# The path to the SQLite database file
DB_PATH = Path(__file__).parent.parent / "db" / "myapp.db"
SQL_PATH = Path(__file__).parent.parent / "db" / "schema.sql"

# --- DATABASE SETUP ---

def init_db():
    #Connect to the SQLite database (it will be created if it doesn't exist)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    with open(SQL_PATH, "r") as f:
        schema = f.read()
        cursor.executescript(schema)
    
    conn.commit()
    conn.close()
    
    print("tables created successfully")
    
# Run the setup function when the app starts
init_db()

# --- Register a new user ---

class UserIn(BaseModel):
    email: str
    password: str

@app.post("/register")
def register(user: UserIn):
    conn = sqlite3.connect(DB_PATH)
    
    try: 
        conn.execute("INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)",
                    (
                        user.email,
                        pwd_context.hash(user.password),
                        "VIEWER"
                    )
        )
        conn.commit()
    except sqlite3.IntegrityError:
        #This error occurs if the username already exists (because of the UNIQUE constraint)
        raise HTTPException(status_code=400, detail="Username already exists")
    
    finally:
        conn.close()
        
    return {"status": "registered"} #send this JSON back to React


# --- LOGIN viewer/admin---

# OAuth2PasswordRequestForm is a special FastAPI object that expects
# username and password sent as form data (not JSON)  

@app.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    #look up the user by username in the database
    #fetchone() returns a single row, or None if no matching user is found
    row = conn.execute(
        "SELECT password_hash, role FROM users WHERE email = ?",
        (form.username,)
    ).fetchone()
    
    conn.close()
    
    #If no user is found, or the password doesn't match, raise an error
    #pwd_context.verify() hashes the user submitted password and compares it to the stored hash
    if not row or not pwd_context.verify(form.password, row[0]):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    #password was correct, so create a JWT token that includes the username and role
    token_data = {
        "sub": form.username,
        "role": row[1]
    }
    
    token = jwt.encode(token_data, SECRET_KEY, algorithm="HS256")
    return {"access_token": token, "token_type": "bearer"}

# --- PROTECTED ROUTE ---

#decode the token to get the current user's role and username for validation later
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {
            "email": payload.get("sub"),
            "role": payload.get("role") 
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

#Example protected route for testing
@app.get("/admin")
def example_route(user: dict = Depends(get_current_user)):
    if user["role"] != "ADMIN_CWI":
        raise HTTPException(status_code=403, detail="Admins only")
    return {"adminData": f"Hello {user['email']}. real admin data here."}



