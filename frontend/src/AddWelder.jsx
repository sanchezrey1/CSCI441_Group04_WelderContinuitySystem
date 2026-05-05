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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        e. preventDefault();

        try {
            const res = await fetch(`${API_BASE}/welders/full`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.detail);

            alert("Welder added!");
        } catch (err) {
            console.error(err);
            alert("Error adding welder");
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
                            placeholder="00067682"
                            onChange={handleChange}
                        />
                        </div>

                        <div className="form-group">
                        <label>Name</label>
                        <input
                            name="full_name"
                            placeholder="Full Name"
                            onChange={handleChange}
                        />
                        </div>

                        <div className="form-grou">
                        <label>Department</label>
                        <select
                            name="department"
                            onChange={handleChange}
                        >
                            <option value="">Select a Department</option>
                            <option>Production</option>
                            <option>Fabrication</option>
                            <option>QA</option>
                        </select>
                        </div>

                        <div className="form-group">
                        <label>Hire Date</label>
                        <input
                            type="date"
                            name="hire_date"
                            onChange={handleChange}
                        />
                        </div>

                        <div className="form-group">
                        <label>Role</label>
                        <select
                            name="role"
                            onChange={handleChange}
                        >
                            <option value="">Select a Role</option>
                            <option>Welder</option>
                            <option>Supervisor</option>
                            <option>Inspector</option>
                        </select>
                        </div>

                        <div className="form-group">
                        <label>Qualifications</label>
                        <input
                            name="qualifications"
                            placeholder="Select or Add All Qualification(s)"
                            onChange={handleChange}
                        />
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