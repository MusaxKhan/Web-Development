"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AddLeadPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    budget: "",
    propertyInterest: "Residential",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    const res = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-user-id": userId,
        "x-user-role": role,
      },
      body: JSON.stringify({ ...formData, budget: Number(formData.budget) }),
    });

    if (res.ok) {
      router.push("/agent/dashboard");
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create lead");
      setLoading(false);
    }
  };

return (
  <div className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center p-6">
    
    <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl shadow-xl p-8 space-y-6">

      {/* HEADER */}
      <div>
        <Link
          href="/agent/dashboard"
          className="text-sm text-blue-400 hover:text-blue-300 font-medium"
        >
          ← Back to Dashboard
        </Link>

        <h2 className="text-3xl font-bold mt-4">Create New Lead</h2>
        <p className="text-sm text-gray-400">
          Add a new property inquiry into your CRM pipeline
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          required
          placeholder="Client Name"
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <input
          required
          type="email"
          placeholder="Email Address"
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <input
          type="text"
          placeholder="Phone Number (923001234567)"
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        <input
          required
          type="number"
          placeholder="Budget (PKR)"
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.budget}
          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
        />

        <select
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.propertyInterest}
          onChange={(e) =>
            setFormData({ ...formData, propertyInterest: e.target.value })
          }
        >
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Plot">Plot</option>
        </select>

        <textarea
          placeholder="Notes about client requirements..."
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formData.notes}
          onChange={(e) =>
            setFormData({ ...formData, notes: e.target.value })
          }
        />

        {/* INFO BOX */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-xs text-blue-300 font-medium">
          💡 Priority is auto-assigned:
          <span className="text-white font-semibold">
            {" "}High (20M+), Medium (10M–20M), Low (&lt;10M)
          </span>
        </div>

        {/* BUTTON */}
        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 transition text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Creating Lead..." : "Create Lead"}
        </button>
      </form>

    </div>
  </div>
);
}
