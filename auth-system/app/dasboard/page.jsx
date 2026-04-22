import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { logoutAction } from '../../lib/actions';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userEmail = cookieStore.get('session_user')?.value;

  if (!userEmail) {
    redirect('/login');
  }

  const joinDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="dashboard-page">
      {/* ── NAVBAR ── */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="dot"></span>
          AuthSystem
        </div>
        <form action={logoutAction}>
          <button type="submit" className="btn-logout">
            Sign Out
          </button>
        </form>
      </nav>

      {/* ── MAIN ── */}
      <main className="dashboard-main">
        <section className="welcome-section">
          <div className="greeting">
            Welcome back 👋
          </div>
          <div className="email-badge">
            <span className="badge-dot"></span>
            {userEmail}
          </div>
        </section>

        <div className="cards-grid">
          <div className="stat-card">
            <div className="card-icon">🛡️</div>
            <div className="card-label">Auth Status</div>
            <div className="card-value" style={{ color: 'var(--success)' }}>Verified</div>
          </div>
          <div className="stat-card">
            <div className="card-icon">🍪</div>
            <div className="card-label">Session</div>
            <div className="card-value">Active</div>
          </div>
          <div className="stat-card">
            <div className="card-icon">📅</div>
            <div className="card-label">Date</div>
            <div className="card-value" style={{ fontSize: '1rem' }}>{joinDate}</div>
          </div>
          <div className="stat-card">
            <div className="card-icon">🔒</div>
            <div className="card-label">Password</div>
            <div className="card-value">bcrypt hashed</div>
          </div>
        </div>

        <div className="session-card">
          <h3>Session Details</h3>
          <div className="session-row">
            <span className="key">Logged in as</span>
            <span className="val">{userEmail}</span>
          </div>
          <div className="session-row">
            <span className="key">Session type</span>
            <span className="val">HTTP-only cookie</span>
          </div>
          <div className="session-row">
            <span className="key">Expires</span>
            <span className="val">7 days</span>
          </div>
          <div className="session-row">
            <span className="key">Status</span>
            <span className="val active">● Active</span>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="site-footer">
        <span className="footer-logo">
          <span className="fl-mark">AS</span>
          AuthSystem
        </span>
        <span>·</span>
        <span>© {new Date().getFullYear()} AuthSystem. All rights reserved.</span>
      </footer>
    </div>
  );
}