import { useState } from "react";
import { Sidebar } from "./Dashboard";
import "./Dashboard.css";

const API_BASE = "http://localhost:8000/api";

export default function AddWelder() {
    const [formData, setFormData] = useState({
        employee_id: "",
        first_name: "",
        last_name: "",
        department: "",
        hire_date: "", 
        qualifications: ""
    });

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");

    const validate = () => {
    const newErrors = {};

    if (!formData.employee_id.trim())
        newErrors.employee_id = "Employee ID is required";

    if (!formData.first_name.trim())
        newErrors.first_name = "First name is required";

    if (!formData.last_name.trim())
        newErrors.last_name = "Last name is required";

    if (!formData.department)
        newErrors.department = "Department is required";

    if (!formData.hire_date)
        newErrors.hire_date = "Hire date is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
};

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return; // stop if invalid

        try {
            setSubmitError("");

            const res = await fetch(`${API_BASE}/welders/full`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                let message = "Request failed";

                try {
                    const errorData = await res.json();
                    message = errorData.detail || message;
                } catch {
                    // fallback if response is not JSON
                    message = await res.text();
                }

                throw new Error(message);
            }

            alert("Welder added!");

            //optional reset
            setFormData({
                employee_id: "",
                first_name: "",
                last_name: "",
                department: "",
                hire_date: "",
                qualifications: ""
            });

            setErrors({});
            setSubmitError("");
        
        } catch (err) {
            console.error(err);
            setSubmitError(err.message);
        }
    };

    return (
        <div className="app-shell">
            <Sidebar active="Add Welder" />

            <main className="main-content">

                {/* top bar */}
                <div className="topbar">
                    <div className="topbar-search">
                        <span className="search-icon"></span>
                        <input
                            className="search-input"
                            placeholder="Search"
                        />
                </div>

                <div className="topbar-right">Admin</div>
            </div>

            {/* page body */}
            <div className="page-body">

            <div className="form-card">
                <div className="form-title">
                    <b>Welder Registration</b>
                    </div>
                    <br></br>
                    <br></br>

                    {/*Global Error */}
                    {submitError && (
                        <div className="error-banner">
                            {submitError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="form-group">
                        
                        <div className="form-group">
                        <label>Employee ID</label>&emsp;
                        <input
                            name="employee_id"
                            value={formData.employee_id}
                            placeholder="E000"
                            onChange={handleChange}
                        />
                        {errors.employee_id && (
                            <span className="error">{errors.employee_id}</span>
                        )}
                        </div>
                        <br></br>

                        <div className="form-group">
                        <label>Name</label>&emsp;
                        <input 
                            name="first_name" 
                            value={formData.first_name}
                            placeholder="First Name" 
                            onChange={handleChange} 
                        />&ensp;
                        {errors.first_name && (
                            <span className="error">{errors.first_name}</span>
                        )}
                        <input 
                            name="last_name"
                            value={formData.last_name} 
                            placeholder="Last Name" 
                            onChange={handleChange} 
                        />
                        {errors.last_name && (
                            <span className="error">{errors.last_name}</span>
                        )}
                        </div>
                        <br></br>

                        <div className="form-group">
                        <label>Department</label>&emsp;
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                        >
                            <option value="">Select a Department</option>
                            <option>Structural</option>
                            <option>Fabrication</option>
                            <option>Pipeline</option>
                        </select>
                        {errors.department && (
                            <span className="error">{errors.department}</span>
                        )}
                        </div>
                        <br></br>

                        <div className="form-group">
                        <label>Hire Date</label>&emsp;
                        <input
                            type="date"
                            name="hire_date"
                            value={formData.hire_date}
                            onChange={handleChange}
                        />
                        {errors.hire_date && (
                            <span className="error">{errors.hire_date}</span>
                        )}
                        </div>
                        <br></br>

                        <div className="form-group">
                        <label>Qualifications</label>&emsp;
                        <input
                            name="qualifications"
                            value={formData.qualifications}
                            placeholder="Select or Add All Qualification(s)"
                            onChange={handleChange}
                        />
                        </div>
                        <br></br>

                        <button type="submit" className="add-record-btn">
                            Add Record
                        </button>

                    </form>
                </div>
            </div>
        </main>
    </div>
    );
}