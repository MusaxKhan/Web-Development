import axios from 'axios';
import { useState } from 'react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
            email, password
        });

        localStorage.setItem('token', res.data.token);
        localStorage.setItem('role', res.data.role);

        window.location.href = '/dashboard';
    };

    return (
        <div>
            <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
            <input type="password" onChange={e => setPassword(e.target.value)} />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}