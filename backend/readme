LaAries made this folder

login.py contains the python that responds to login and registration attempts
at port 8000 by using Uvicorn which is a python web server implementation

Make sure to install all Python packages listed in requirements.txt

when registering: React should send a POST request to http://localhost:8000/register
  the request body should contain {"email": email, "password":password}

when logging in: React should send a POST request to http://localhost:8000/login
  the request header "Content-Type" should be "application/x-www-form-urlencoded"
  the request body should contain new URLSearchParams({"username": email, "password": password})

After logging in: React now has a token in localStorage containing the email and role of the user
  access these with: 
    const token = localStorage.getItem("token");
    const payload = JSON.parse(atob(token.split(".")[1]));
    get email in Javascript: payload.sub
    get role in Javascript: payload.role

On every page you should check for a role to exist. If no role then send to login page.

On every admin page you should check for admin by payload.role == "ADMIN_CWI"

to install Python packages
  # 1. clone the repo
  git clone your-repo-url
  
  # 2. create a virtual environment
  python -m venv venv
  
  # 3. activate it
  venv\Scripts\activate        # Windows
  source venv/bin/activate     # Mac/Linux
  
  # 4. install everything
  pip install -r requirements.txt
  
  # 5. run the server
  uvicorn login:app --reload

