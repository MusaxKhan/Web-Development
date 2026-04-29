import axios from 'axios';

export default function Dashboard() {
    const role = localStorage.getItem("role");

    const addData = async () => {
        await axios.post('http://localhost:5000/api/data/add', {}, {
            headers: { Authorization: localStorage.getItem("token") }
        });
        alert("Added!");
    };

    return (
        <div>
            <h1>Dashboard</h1>

            {role === "owner" && (
                <button onClick={addData}>Add Data</button>
            )}
        </div>
    );
}