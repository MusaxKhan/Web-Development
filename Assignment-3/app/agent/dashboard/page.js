"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { io } from "socket.io-client";

export default function AgentDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const socketRef = useRef(null);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      const role = localStorage.getItem("role");
      const res = await fetch("/api/leads", {
        headers: {
          Authorization: `Bearer ${token}`,
          "x-user-id": userId,
          "x-user-role": role,
        },
      });
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch leads error:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    fetchLeads();

    const initSocket = async () => {
      await fetch("/api/socket");
      if (!socketRef.current) {
        socketRef.current = io();
        socketRef.current.on("connect", () =>
          console.log("Agent: Connected to Socket")
        );
        socketRef.current.on("update-ui", () => fetchLeads());
      }
    };

    initSocket();
    const interval = setInterval(fetchLeads, 30000);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      clearInterval(interval);
    };
  }, []);

  const handleUpdate = async (id, updatedData) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        if (socketRef.current) {
          socketRef.current.emit("lead-activity", {
            message: "Lead Updated by Agent",
            leadId: id,
          });
        }
        fetchLeads();
      }
    } catch (err) {
      console.error("Update lead error:", err);
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
      console.error("Timeline fetch error:", err);
    }
  };

  const handleWhatsApp = (phone) => {
    if (!phone) return alert("No phone number found for this lead.");
    const cleanNumber = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}`, "_blank");
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
  <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
    <div className="max-w-7xl mx-auto space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">My Pipeline</h1>
          <p className="text-sm text-gray-400">
            Personal lead tracking & client engagement
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/agent/add-lead"
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            + New Lead
          </Link>

          <button
            onClick={logout}
            className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm hover:bg-red-500 hover:text-white transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase">Overdue Follow-ups</p>
          <p className="text-3xl font-bold text-red-400 mt-2">
            {
              leads.filter(
                (l) =>
                  l.followUpDate &&
                  new Date(l.followUpDate) < new Date() &&
                  l.status !== "Closed"
              ).length
            }
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase">Stale Leads</p>
          <p className="text-3xl font-bold text-yellow-400 mt-2">
            {
              leads.filter(
                (l) =>
                  (new Date() - new Date(l.updatedAt)) /
                    (1000 * 60 * 60 * 24) > 7
              ).length
            }
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-xs text-gray-400 uppercase">Total Leads</p>
          <p className="text-3xl font-bold text-green-400 mt-2">
            {leads.length}
          </p>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

        <table className="w-full text-left">
          <thead className="bg-gray-800 text-gray-400 text-xs uppercase">
            <tr>
              <th className="p-4">Lead</th>
              <th className="p-4">Status</th>
              <th className="p-4">Follow-up</th>
              <th className="p-4">Actions</th>
              <th className="p-4">Notes</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-800">

            {!loading && leads.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-gray-500 italic">
                  No leads assigned yet
                </td>
              </tr>
            )}

            {!loading &&
              leads.map((lead) => {

                const isOverdue =
                  lead.followUpDate &&
                  new Date(lead.followUpDate) < new Date() &&
                  lead.status !== "Closed";

                const isStale =
                  (new Date() - new Date(lead.updatedAt)) /
                    (1000 * 60 * 60 * 24) > 7;

                return (
                  <tr
                    key={lead._id}
                    className={`transition hover:bg-gray-800/40 ${
                      isOverdue
                        ? "bg-red-500/5"
                        : isStale
                        ? "bg-yellow-500/5"
                        : ""
                    }`}
                  >

                    {/* LEAD */}
                    <td className="p-4">
                      <p className="font-semibold">{lead.name}</p>
                      <p className="text-xs text-gray-400">
                        PKR {lead.budget?.toLocaleString()}
                      </p>
                    </td>

                    {/* STATUS */}
                    <td className="p-4">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          handleUpdate(lead._id, { status: e.target.value })
                        }
                        className="bg-gray-800 border border-gray-700 text-xs p-2 rounded-md"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Negotiating">Negotiating</option>
                        <option value="Closed">Closed</option>
                      </select>

                      <div
                        className={`mt-2 text-xs font-bold ${
                          lead.score === "High"
                            ? "text-red-400"
                            : lead.score === "Medium"
                            ? "text-yellow-400"
                            : "text-green-400"
                        }`}
                      >
                        {lead.score} Priority
                      </div>
                    </td>

                    {/* FOLLOW-UP */}
                    <td className="p-4">
                      <input
                        type="date"
                        defaultValue={
                          lead.followUpDate
                            ? lead.followUpDate.split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handleUpdate(lead._id, {
                            followUpDate: e.target.value,
                          })
                        }
                        className={`bg-gray-800 border text-xs p-2 rounded-md w-full ${
                          isOverdue
                            ? "border-red-500 text-red-300"
                            : "border-gray-700"
                        }`}
                      />

                      {isOverdue && (
                        <p className="text-xs text-red-400 mt-1 font-bold">
                          ⚠ Overdue
                        </p>
                      )}
                    </td>

                    {/* ACTIONS */}
                    <td className="p-4 space-y-2">
                      <button
                        onClick={() => fetchTimeline(lead)}
                        className="w-full bg-blue-600/10 text-blue-400 px-3 py-1 rounded-md text-xs hover:bg-blue-600 hover:text-white transition"
                      >
                        History
                      </button>

                      <button
                        onClick={() => handleWhatsApp(lead.phone)}
                        className="w-full bg-green-600/10 text-green-400 px-3 py-1 rounded-md text-xs hover:bg-green-600 hover:text-white transition"
                      >
                        WhatsApp
                      </button>
                    </td>

                    {/* NOTES */}
                    <td className="p-4">
                      <textarea
                        defaultValue={lead.notes}
                        onBlur={(e) =>
                          handleUpdate(lead._id, { notes: e.target.value })
                        }
                        className="w-full bg-gray-800 border border-gray-700 text-xs p-2 rounded-md text-gray-200"
                      />
                    </td>

                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

    </div>

    {/* MODAL */}
    {showModal && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
        <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md">

          <div className="p-4 border-b border-gray-800 flex justify-between">
            <div>
              <h2 className="font-bold text-blue-400">Lead History</h2>
              <p className="text-xs text-gray-500">{selectedLead?.name}</p>
            </div>

            <button onClick={() => setShowModal(false)}>✕</button>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto space-y-4">
            {timeline.map((log) => (
              <div key={log._id} className="border-l border-blue-500 pl-3">
                <p className="text-xs text-blue-400 font-bold">
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
