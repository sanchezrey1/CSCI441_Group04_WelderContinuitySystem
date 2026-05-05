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
        hire_date: ""
    });

    const [errors, setErrors] = useState({});

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
            const res = await fetch(`${API_BASE}/welders/full`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.detail || "Request failed");
            }

            alert("Welder added!");

            //optional reset
            setFormData({
                employee_id: "",
                first_name: "",
                last_name: "",
                department: "",
                hire_date: "",
            });
        
        } catch (err) {
            console.error(err);
            alert(err.message);
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
                    Welder Registration
                    </div>

                    <form onSubmit={handleSubmit} className="form-group">
                        
                        <div className="form-group">
                        <label>Employee ID</label>
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

                        <div className="form-group">
                        <label>Name</label>
                        <input 
                            name="first_name" 
                            value={formData.first_name}
                            placeholder="First Name" 
                            onChange={handleChange} 
                        />
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

                        <div className="form-group">
                        <label>Department</label>
                        <select
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                        >
                            <option value="">Select a Department</option>
                            <option>Production</option>
                            <option>Fabrication</option>
                            <option>QA</option>
                        </select>
                        {errors.department && (
                            <span className="error">{errors.department}</span>
                        )}
                        </div>

                        <div className="form-group">
                        <label>Hire Date</label>
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