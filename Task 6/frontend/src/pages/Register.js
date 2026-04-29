import axios from 'axios';
import { useState } from 'react';

export default function Register() {
    const [form, setForm] = useState({});

    const handleSignup = async () => {
        await axios.post('http://localhost:5000/api/auth/signup', form);
        alert("User created");
    };

    return (
        <div>
            <input placeholder="Username" onChange={e => setForm({...form, username:e.target.value})}/>
            <input placeholder="Email" onChange={e => setForm({...form, email:e.target.value})}/>
            <input type="password" onChange={e => setForm({...form, password:e.target.value})}/>
            <select onChange={e => setForm({...form, role:e.target.value})}>
                <option value="employee">Employee</option>
                <option value="owner">Owner</option>
            </select>
            <button onClick={handleSignup}>Signup</button>
        </div>
    );
}