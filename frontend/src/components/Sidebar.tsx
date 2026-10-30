import {
  Activity,
  UsersRound,
  LayoutDashboard,
  Settings,
  LifeBuoy,
  Sparkles,
} from "lucide-react";
export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Sparkles size={19} />
        </div>
        <div>
          <strong>
            people<span>flow</span>
          </strong>
          <small>WORKSPACE</small>
        </div>
      </div>
      <div className="workspace">
        <div className="workspace-icon">N</div>
        <div>
          <b>Northstar Studio</b>
          <small>Workspace</small>
        </div>
        <span className="chevron">⌄</span>
      </div>
      <div className="nav-label">WORKSPACE</div>
      <nav>
        <a>
          <LayoutDashboard size={18} /> Overview
        </a>
        <a className="active">
          <UsersRound size={18} /> My profile
        </a>
        <a>
          <Activity size={18} /> Activity
        </a>
        <a>
          <Settings size={18} /> Settings
        </a>
      </nav>
      <div className="sidebar-bottom">
        <div className="help">
          <div className="help-icon">
            <LifeBuoy size={17} />
          </div>
          <b>Need a hand?</b>
          <p>Visit our help center to get started.</p>
          <button>
            Visit help center <span>↗</span>
          </button>
        </div>
        <div className="sidebar-user">
          <div className="mini-avatar">PP</div>
          <div>
            <b>Puripong Puhual</b>
            <small>Product designer</small>
          </div>
          <span className="dots">•••</span>
        </div>
      </div>
    </aside>
  );
}
