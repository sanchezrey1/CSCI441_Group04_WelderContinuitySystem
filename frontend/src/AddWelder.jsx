import { useState } from "react";

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
        <div style={{padding: "20px" }}>
            <h2>Add Welder</h2>

            <input name="employee_id" placeholder="Employee ID" onChange={handleChange} />
            <input name="first_name" placeholder="First Name" onChange={handleChange} />
            <input name="last_name" placeholder="Last Name" onChange={handleChange} />
            <input name="department" placeholder="Department" onChange={handleChange} />
            <input type="date" name="hire_date" onChange={handleChange} />

            <h3>Qualification</h3>
             <input type="date" onChange={(e) => handleQualChange("qualified_date", e.target.value)} />
             <input type="date" onChange={(e) => handleQualChange("expiration_date", e.target.value)} />

             <button onClick={handleSubmit}>Submit</button>
        </div>
    );
}