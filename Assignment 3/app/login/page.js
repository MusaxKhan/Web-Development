"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Login failed");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);

    if (data.role === "Admin") {
      window.location.href = "/admin/dashboard";
    } else {
      window.location.href = "/agent/dashboard";
    }
  };

  return (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6 text-gray-100">

    {/* LOGIN CARD */}
    <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">

      {/* HEADER */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-500">
          Property CRM
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Sign in to access your dashboard
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        <input
          required
          type="email"
          placeholder="Email Address"
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <input
          required
          type="password"
          placeholder="Password"
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        {/* BUTTON */}
        <button
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-500 transition text-white py-3 rounded-lg font-semibold disabled:opacity-50"
        >
          {loading ? "Signing In..." : "Login"}
        </button>

      </form>

      {/* FOOTER */}
      <p className="text-center text-gray-500 text-sm mt-6">
        Don’t have an account?{" "}
        <Link
          href="/signup"
          className="text-blue-400 font-semibold hover:text-blue-300"
        >
          Create Account
        </Link>
      </p>

    </div>

  </div>
);
}
