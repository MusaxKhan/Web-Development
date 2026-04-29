// This endpoint exists so the client can "wake up" socket on the server.
// The actual socket server is attached in server.js.
export default function handler(req, res) {
  res.status(200).json({ ok: true });
}
