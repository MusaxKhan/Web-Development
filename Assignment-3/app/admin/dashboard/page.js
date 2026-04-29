"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

export default function AdminDashboard() {
  const [leads, setLeads] = useState([]);
  const [agents, setAgents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Timeline Modal
  const [selectedLead, setSelectedLead] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const socketRef = useRef();

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const role = localStorage.getItem("role");
      const headers = {
        Authorization: `Bearer ${token}`,
        "x-user-id": userId,
        "x-user-role": role,
      };
      const [leadRes, agentRes, analyticsRes] = await Promise.all([
        fetch("/api/leads", { headers }),
        fetch("/api/admin/agents", { headers }),
        fetch("/api/admin/analytics", { headers }),
      ]);
      if (leadRes.ok) {
        const data = await leadRes.json();
        setLeads(Array.isArray(data) ? data : []);
      }
      if (agentRes.ok) setAgents(await agentRes.json());
      if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
      setLoading(false);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setLoading(false);
    }
  };

  const fetchTimeline = async (lead) => {
    setSelectedLead(lead);
    setShowModal(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/leads/${lead._id}/timeline`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setTimeline(data);
    } catch (err) {
      console.error("Timeline Fetch Error:", err);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");
    if (!token || role?.toLowerCase() !== "admin") {
      window.location.href = "/login";
      return;
    }
    fetchData();

    const initSocket = async () => {
      await fetch("/api/socket");
      if (!socketRef.current) {
        socketRef.current = io();
        socketRef.current.on("connect", () =>
          console.log("Admin Socket: Connected")
        );
        socketRef.current.on("update-ui", () => {
          console.log("Admin: Real-time update received");
          fetchData();
        });
      }
    };
    initSocket();

    // Polling fallback every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => {
      if (socketRef.current) { socketRef.current.disconnect(); socketRef.current = null; }
      clearInterval(interval);
    };
  }, []);

  const handleAssign = async (leadId, agentId) => {
    const token = localStorage.getItem("token");
    const res = await fetch("/api/admin/assign", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ leadId, agentId }),
    });
    if (res.ok) {
      if (socketRef.current) socketRef.current.emit("lead-activity", { message: "Lead Reassigned by Admin", leadId });
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Permanently delete this lead?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/delete-lead?id=${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      if (socketRef.current) socketRef.current.emit("lead-activity", { message: "Lead Deleted by Admin", leadId: id });
      fetchData();
    }
  };

  // Apply filters client-side
  const filteredLeads = leads.filter((lead) => {
    if (filterStatus && lead.status !== filterStatus) return false;
    if (filterPriority && lead.score !== filterPriority) return false;
    if (filterDate) {
      const leadDate = new Date(lead.createdAt).toISOString().split("T")[0];
      if (leadDate !== filterDate) return false;
    }
    return true;
  });

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white font-bold">
        Initializing Command Center...
      </div>
    );

  return (
  <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
    <div className="max-w-7xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-400">
            Property CRM Control Center
          </p>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}
          className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition"
        >
          Logout
        </button>
      </div>

      {/* ANALYTICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
          <p className="text-sm text-gray-400">Total Leads</p>
          <p className="text-3xl font-semibold mt-2">{leads.length}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
          <p className="text-sm text-gray-400">High Priority</p>
          <p className="text-3xl font-semibold text-red-400 mt-2">
            {analytics?.priorityDistribution?.find((p) => p._id === "High")?.count || 0}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
          <p className="text-sm text-gray-400">Closed Deals</p>
          <p className="text-3xl font-semibold text-green-400 mt-2">
            {analytics?.statusDistribution?.find((s) => s._id === "Closed")?.count || 0}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl">
          <p className="text-sm text-gray-400">Conversion</p>
          <p className="text-3xl font-semibold mt-2">
            {leads.length > 0
              ? (((analytics?.statusDistribution?.find((s) => s._id === "Closed")?.count || 0) / leads.length) * 100).toFixed(0)
              : 0}%
          </p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-sm p-2 rounded-md"
        >
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Negotiating">Negotiating</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-sm p-2 rounded-md"
        >
          <option value="">All Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-sm p-2 rounded-md"
        />

        <span className="ml-auto text-sm text-gray-400">
          {filteredLeads.length} / {leads.length} leads
        </span>
      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-800 text-gray-400 text-sm">
            <tr>
              <th className="p-4">Lead</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4">Agent</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">
            {filteredLeads.map((lead) => (
              <tr key={lead._id} className="hover:bg-gray-800/40 transition">
                
                {/* Lead */}
                <td className="p-4">
                  <p className="font-semibold">{lead.name}</p>
                  <p className="text-xs text-gray-400">{lead.email}</p>
                  <p className="text-xs text-gray-500">
                    PKR {lead.budget?.toLocaleString()}
                  </p>
                </td>

                {/* Priority */}
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs rounded-md ${
                    lead.score === "High"
                      ? "bg-red-500/10 text-red-400"
                      : lead.score === "Medium"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-green-500/10 text-green-400"
                  }`}>
                    {lead.score}
                  </span>
                </td>

                {/* Status */}
                <td className="p-4 text-sm text-gray-300">
                  {lead.status}
                </td>

                {/* Assign */}
                <td className="p-4">
                  <select
                    value={lead.assignedTo?._id || ""}
                    onChange={(e) => handleAssign(lead._id, e.target.value)}
                    className="bg-gray-800 border border-gray-700 text-xs p-2 rounded-md w-full"
                  >
                    <option value="">Unassigned</option>
                    {agents.map((a) => (
                      <option key={a._id} value={a._id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Actions */}
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => fetchTimeline(lead)}
                    className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-md text-xs hover:bg-blue-500 hover:text-white transition"
                  >
                    History
                  </button>

                  <button
                    onClick={() => handleDelete(lead._id)}
                    className="bg-red-500/10 text-red-400 px-3 py-1 rounded-md text-xs hover:bg-red-500 hover:text-white transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>

    {/* MODAL (cleaned) */}
    {showModal && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg">
          
          <div className="p-4 border-b border-gray-800 flex justify-between">
            <div>
              <h2 className="font-bold text-blue-400">Activity Timeline</h2>
              <p className="text-xs text-gray-500">{selectedLead?.name}</p>
            </div>

            <button onClick={() => setShowModal(false)}>
              ✕
            </button>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto space-y-4">
            {timeline.map((log) => (
              <div key={log._id} className="border-l border-blue-500 pl-3">
                <p className="text-sm font-semibold text-blue-400">
                  {log.action}
                </p>
                <p className="text-xs text-gray-300">{log.details}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    )}
  </div>
);

}
