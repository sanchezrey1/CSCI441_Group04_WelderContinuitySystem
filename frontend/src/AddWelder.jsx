import { useState } from "react";
import { Sidebar } from "./Dashboard";
import "./Dashboard.css";
//import "./AddWelder.css";

const API_BASE = "http://localhost:8000/api";

export default function AddWelder() {
    const [formData, setFormData] = useState({
        employee_id: "",
        first_name: "",
        last_name: "",
        department: "",
        hire_date: "",
        qualifications: [
            {
                proccess_id: 1,
                code_id: 1,
                qualified_date: "",
                expiration_date: ""
            }
        ]
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        updated[0][field] = value;
        setFormData({ ...formData, qualifications: updated });
    };

    const handleSubmit = async () => {
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

                <div className="topbar-right"></div>
            </div>

            {/* page body */}
            <div className="register-wrapper">
                <div className="register-card">
                    <h2 className="register-title">Welder Registration</h2>

                    <form onSubmit={handleSubmit} className="register-form">
                        
                        <label>Employee ID</label>
                        <input
                            name="employee_id"
                            placeholder="00067682"
                            onChange={handleChange}
                        />

                        <label>Name</label>
                        <input
                            name="full_name"
                            placeholder="Full Name"
                            onChange={handleChange}
                        />

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

                        <label>Hire Date</label>
                        <input
                            type="date"
                            name="hire_date"
                            onChange={handleChange}
                        />

                        <label>Role</label>
                        <select
                            name="role"
                            onChange={handleChange}
                        >
                            <option value="">Select a Role</option>
                            <option>Weldere</option>
                            <option>Supervisor</option>
                            <option>Inspector</option>
                        </select>

                        <label>Qualifications</label>
                        <input
                            name="qualifications"
                            placeholder="Select or Add All Qualification(s)"
                            onChange={handleChange}
                        />

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