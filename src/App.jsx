import { useEffect, useMemo, useState } from 'react';
import './index.css';

const STORAGE_KEY = 'safestreet-demo-v1';

const neighborhoods = [
  'Financial District',
  'Riverside Walk',
  'Central Metro',
  'University Quarter',
  'Market Square',
];

const categories = [
  { id: 'Lighting', icon: '◌', color: 'yellow' },
  { id: 'Harassment', icon: '!', color: 'red' },
  { id: 'Suspicious activity', icon: '◉', color: 'purple' },
  { id: 'Traffic hazard', icon: '▲', color: 'orange' },
  { id: 'Infrastructure', icon: '▣', color: 'blue' },
];

const statuses = ['Reported', 'Under Review', 'Verified', 'Resolved'];

const seedIncidents = [
  {
    id: 'SS-1042',
    title: 'Streetlight outage near bus stop',
    category: 'Lighting',
    area: 'University Quarter',
    landmark: 'North Gate bus stop',
    severity: 'Medium',
    status: 'Under Review',
    anonymous: true,
    description:
      'The pedestrian path is poorly lit after 7 PM and visibility is very low.',
    reportedAt: 'Today, 08:35 AM',
    updatedAt: 'Today, 09:10 AM',
    distance: '0.4 km away',
  },
  {
    id: 'SS-1041',
    title: 'Unsafe pedestrian crossing',
    category: 'Traffic hazard',
    area: 'Central Metro',
    landmark: 'Station Road junction',
    severity: 'High',
    status: 'Verified',
    anonymous: false,
    description:
      'Vehicles are speeding through the crossing while students are walking.',
    reportedAt: 'Today, 07:50 AM',
    updatedAt: 'Today, 10:05 AM',
    distance: '0.8 km away',
  },
  {
    id: 'SS-1040',
    title: 'Damaged footpath surface',
    category: 'Infrastructure',
    area: 'Market Square',
    landmark: 'Community library lane',
    severity: 'Low',
    status: 'Reported',
    anonymous: true,
    description:
      'Broken paving creates a trip hazard near the library entrance.',
    reportedAt: 'Yesterday, 06:20 PM',
    updatedAt: 'Yesterday, 06:20 PM',
    distance: '1.6 km away',
  },
  {
    id: 'SS-1039',
    title: 'Suspicious activity reported',
    category: 'Suspicious activity',
    area: 'Riverside Walk',
    landmark: 'Riverside parking area',
    severity: 'High',
    status: 'Verified',
    anonymous: true,
    description:
      'A person was repeatedly checking parked vehicles late at night.',
    reportedAt: 'Yesterday, 09:15 PM',
    updatedAt: 'Today, 08:20 AM',
    distance: '2.1 km away',
  },
  {
    id: 'SS-1038',
    title: 'Harassment concern near café row',
    category: 'Harassment',
    area: 'Financial District',
    landmark: 'Café Row',
    severity: 'High',
    status: 'Resolved',
    anonymous: true,
    description:
      'Concern was reported near the evening crowd at the café row.',
    reportedAt: '12 Oct, 05:40 PM',
    updatedAt: 'Today, 08:30 AM',
    distance: '3.2 km away',
  },
];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved?.incidents)) return saved;
  } catch {
    return { incidents: seedIncidents };
  }
  return { incidents: seedIncidents };
}

function categoryMeta(category) {
  return categories.find((item) => item.id === category) ?? categories[4];
}

function csvValue(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export default function App() {
  const saved = loadState();
  const [incidents, setIncidents] = useState(saved.incidents);
  const [activeTab, setActiveTab] = useState('map');
  const [notice, setNotice] = useState('');
  const [selectedArea, setSelectedArea] = useState('University Quarter');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportCategory, setReportCategory] = useState('Lighting');
  const [reportArea, setReportArea] = useState('University Quarter');
  const [reportLandmark, setReportLandmark] = useState('');
  const [reportSeverity, setReportSeverity] = useState('Medium');
  const [reportDescription, setReportDescription] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [photoName, setPhotoName] = useState('');
  const [selectedIncidentId, setSelectedIncidentId] = useState('SS-1042');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ incidents }));
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchesCategory =
        categoryFilter === 'All' || incident.category === categoryFilter;
      const matchesStatus =
        statusFilter === 'All' || incident.status === statusFilter;
      const matchesSeverity =
        severityFilter === 'All' || incident.severity === severityFilter;
      const text =
        `${incident.id} ${incident.title} ${incident.area} ${incident.landmark} ${incident.category}`
          .toLowerCase();
      const matchesSearch = !query || text.includes(query);

      return (
        matchesCategory &&
        matchesStatus &&
        matchesSeverity &&
        matchesSearch
      );
    });
  }, [incidents, categoryFilter, statusFilter, severityFilter, search]);

  const nearbyAlerts = incidents.filter(
    (incident) =>
      incident.area === selectedArea &&
      incident.status !== 'Resolved' &&
      incident.severity !== 'Low',
  );

  const openIncidents = incidents.filter(
    (incident) => incident.status !== 'Resolved',
  ).length;
  const verifiedIncidents = incidents.filter(
    (incident) =>
      incident.status === 'Verified' || incident.status === 'Resolved',
  ).length;
  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === 'Resolved',
  ).length;
  const resolutionRate =
    incidents.length === 0
      ? 0
      : Math.round((resolvedIncidents / incidents.length) * 100);

  const categoryCounts = categories.map((category) => ({
    ...category,
    value: incidents.filter((incident) => incident.category === category.id)
      .length,
  }));

  const areaCounts = neighborhoods
    .map((area) => ({
      area,
      value: incidents.filter((incident) => incident.area === area).length,
    }))
    .sort((a, b) => b.value - a.value);

  const selectedIncident =
    incidents.find((incident) => incident.id === selectedIncidentId) ??
    incidents[0];

  function submitReport(event) {
    event.preventDefault();

    if (
      !reportTitle.trim() ||
      !reportLandmark.trim() ||
      !reportDescription.trim()
    ) {
      setNotice('Add an incident title, landmark and description before submitting.');
      return;
    }

    const nextNumber =
      Math.max(
        1042,
        ...incidents.map((incident) => Number(incident.id.split('-')[1]) || 0),
      ) + 1;

    const newIncident = {
      id: `SS-${nextNumber}`,
      title: reportTitle.trim(),
      category: reportCategory,
      area: reportArea,
      landmark: reportLandmark.trim(),
      severity: reportSeverity,
      status: 'Reported',
      anonymous,
      description: reportDescription.trim(),
      reportedAt: 'Just now',
      updatedAt: 'Just now',
      distance: reportArea === selectedArea ? '0.2 km away' : '4.7 km away',
      photoName: photoName || undefined,
    };

    setIncidents((current) => [newIncident, ...current]);
    setSelectedIncidentId(newIncident.id);
    setActiveTab('map');
    setNotice(
      `${newIncident.id} submitted successfully. The authority queue has been updated.`,
    );

    setReportTitle('');
    setReportCategory('Lighting');
    setReportArea(selectedArea);
    setReportLandmark('');
    setReportSeverity('Medium');
    setReportDescription('');
    setAnonymous(true);
    setPhotoName('');
  }

  function advanceStatus(incidentId) {
    const incident = incidents.find((item) => item.id === incidentId);
    if (!incident) return;

    const currentIndex = statuses.indexOf(incident.status);
    const nextStatus = statuses[Math.min(currentIndex + 1, statuses.length - 1)];

    if (nextStatus === incident.status) {
      setNotice(`${incident.id} is already marked as Resolved.`);
      return;
    }

    setIncidents((current) =>
      current.map((item) =>
        item.id === incidentId
          ? {
              ...item,
              status: nextStatus,
              updatedAt: 'Just now — authority action recorded',
            }
          : item,
      ),
    );
    setNotice(`${incident.id} moved to ${nextStatus}.`);
  }

  function exportCsv() {
    const header = [
      'Case ID',
      'Incident title',
      'Category',
      'Area',
      'Landmark',
      'Severity',
      'Status',
      'Anonymous',
      'Reported at',
      'Last updated',
      'Description',
      'Photo attachment',
    ];

    const rows = incidents.map((incident) => [
      incident.id,
      incident.title,
      incident.category,
      incident.area,
      incident.landmark,
      incident.severity,
      incident.status,
      incident.anonymous ? 'Yes' : 'No',
      incident.reportedAt,
      incident.updatedAt,
      incident.description,
      incident.photoName || 'No attachment',
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(csvValue).join(','))
      .join('\n');

    const blob = new Blob([`\uFEFF${csv}`], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'SafeStreet_Incident_Report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setNotice(`CSV exported with ${incidents.length} incident record(s).`);
  }

  function resetDemo() {
    if (!window.confirm('Reset all SafeStreet browser-local demo data?')) {
      return;
    }

    setIncidents(seedIncidents);
    setActiveTab('map');
    setSelectedIncidentId('SS-1042');
    setNotice('SafeStreet demo data reset successfully.');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setActiveTab('map')}>
          <span className="brand-mark">S</span>
          <span>
            <b>SafeStreet</b>
            <small>COMMUNITY SAFETY NETWORK</small>
          </span>
        </button>

        <nav>
          <button
            className={activeTab === 'map' ? 'active' : ''}
            onClick={() => setActiveTab('map')}
          >
            Safety map
          </button>
          <button
            className={activeTab === 'report' ? 'active' : ''}
            onClick={() => setActiveTab('report')}
          >
            Report incident
          </button>
          <button
            className={activeTab === 'alerts' ? 'active' : ''}
            onClick={() => setActiveTab('alerts')}
          >
            Alerts
            {nearbyAlerts.length > 0 && <i>{nearbyAlerts.length}</i>}
          </button>
          <button
            className={activeTab === 'authority' ? 'active' : ''}
            onClick={() => setActiveTab('authority')}
          >
            Authority desk
          </button>
          <button
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </nav>

        <button className="reset-button" onClick={resetDemo}>
          ↻ Reset demo
        </button>
      </header>

      {notice && (
        <div className="toast">
          <span>✓ {notice}</span>
          <button onClick={() => setNotice('')}>×</button>
        </div>
      )}

      <main>
        {activeTab === 'map' && (
          <section className="page">
            <div className="hero-grid">
              <div className="hero-copy">
                <span className="eyebrow">A SAFER NEIGHBORHOOD, TOGETHER</span>
                <h1>
                  See what needs attention.
                  <em> Report it safely.</em>
                </h1>
                <p>
                  SafeStreet helps residents report non-emergency safety concerns,
                  view verified community trends and receive simulated local alerts.
                </p>
                <div className="hero-actions">
                  <button
                    className="button primary"
                    onClick={() => setActiveTab('report')}
                  >
                    Report a concern →
                  </button>
                  <button
                    className="button secondary"
                    onClick={() => setActiveTab('alerts')}
                  >
                    View nearby alerts
                  </button>
                </div>
                <small className="disclaimer">
                  Prototype only — do not use this application for emergencies.
                  Contact local emergency services for immediate danger.
                </small>
              </div>

              <div className="safety-score">
                <span>COMMUNITY SAFETY PULSE</span>
                <b>{openIncidents}</b>
                <strong>active reports</strong>
                <div className="score-line">
                  <i style={{ width: `${Math.min(100, openIncidents * 15)}%` }} />
                </div>
                <small>{verifiedIncidents} verified / resolved cases in the demo</small>
              </div>
            </div>

            <div className="filter-bar">
              <div>
                <label>Your selected area</label>
                <select
                  value={selectedArea}
                  onChange={(event) => setSelectedArea(event.target.value)}
                >
                  {neighborhoods.map((area) => (
                    <option key={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Category</label>
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                >
                  <option>All</option>
                  {categories.map((category) => (
                    <option key={category.id}>{category.id}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Status</label>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  <option>All</option>
                  {statuses.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label>Severity</label>
                <select
                  value={severityFilter}
                  onChange={(event) => setSeverityFilter(event.target.value)}
                >
                  <option>All</option>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </div>

              <div className="filter-search">
                <label>Search reports</label>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Case, area, landmark..."
                />
              </div>
            </div>

            <div className="map-layout">
              <article className="map-card">
                <div className="map-header">
                  <div>
                    <span className="eyebrow">COMMUNITY INCIDENT VIEW</span>
                    <h2>Safety map</h2>
                  </div>
                  <span className="live-pill">● LIVE DEMO DATA</span>
                </div>

                <div className="map-visual">
                  <div className="road road-one" />
                  <div className="road road-two" />
                  <div className="road road-three" />
                  <span className="map-label label-one">University Quarter</span>
                  <span className="map-label label-two">Central Metro</span>
                  <span className="map-label label-three">Market Square</span>

                  {filteredIncidents.map((incident, index) => {
                    const meta = categoryMeta(incident.category);
                    return (
                      <button
                        className={`map-pin ${meta.color} pin-${(index % 5) + 1}`}
                        key={incident.id}
                        title={`${incident.id}: ${incident.title}`}
                        onClick={() => {
                          setSelectedIncidentId(incident.id);
                          setActiveTab('authority');
                        }}
                      >
                        {meta.icon}
                      </button>
                    );
                  })}

                  <div className="map-legend">
                    {categories.slice(0, 4).map((category) => (
                      <span key={category.id}>
                        <i className={category.color} />
                        {category.id}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="map-caption">
                  <span>{filteredIncidents.length} visible report(s)</span>
                  <span>Click a pin to inspect the authority record</span>
                </div>
              </article>

              <aside className="incident-list">
                <div className="side-head">
                  <div>
                    <span className="eyebrow">RECENT REPORTS</span>
                    <h2>Community feed</h2>
                  </div>
                  <button onClick={() => setSearch('')}>Clear filters</button>
                </div>

                <div className="feed-scroll">
                  {filteredIncidents.map((incident) => {
                    const meta = categoryMeta(incident.category);
                    return (
                      <button
                        className="incident-item"
                        key={incident.id}
                        onClick={() => {
                          setSelectedIncidentId(incident.id);
                          setActiveTab('authority');
                        }}
                      >
                        <span className={`incident-icon ${meta.color}`}>
                          {meta.icon}
                        </span>
                        <span className="incident-copy">
                          <b>{incident.title}</b>
                          <small>
                            {incident.area} · {incident.reportedAt}
                          </small>
                          <em className={`severity ${incident.severity.toLowerCase()}`}>
                            {incident.severity}
                          </em>
                        </span>
                        <span className={`status status-${incident.status.replaceAll(' ', '-').toLowerCase()}`}>
                          {incident.status}
                        </span>
                      </button>
                    );
                  })}

                  {filteredIncidents.length === 0 && (
                    <div className="empty-state">
                      No reports match the selected filters.
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </section>
        )}

        {activeTab === 'report' && (
          <section className="page report-page">
            <div className="section-intro">
              <span className="eyebrow">PRIVATE COMMUNITY REPORTING</span>
              <h1>Report a safety concern</h1>
              <p>
                Share enough detail to help the authority desk review the issue.
                You can submit anonymously in this prototype.
              </p>
            </div>

            <form className="report-layout" onSubmit={submitReport}>
              <div className="report-card">
                <div className="form-heading">
                  <span className="step">01</span>
                  <div>
                    <h2>What happened?</h2>
                    <p>Describe the concern without including sensitive personal data.</p>
                  </div>
                </div>

                <label>
                  Incident title
                  <input
                    value={reportTitle}
                    onChange={(event) => setReportTitle(event.target.value)}
                    placeholder="Example: Streetlight not working near bus stop"
                  />
                </label>

                <div className="form-row">
                  <label>
                    Category
                    <select
                      value={reportCategory}
                      onChange={(event) => setReportCategory(event.target.value)}
                    >
                      {categories.map((category) => (
                        <option key={category.id}>{category.id}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Severity
                    <select
                      value={reportSeverity}
                      onChange={(event) => setReportSeverity(event.target.value)}
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </label>
                </div>

                <label>
                  Description
                  <textarea
                    value={reportDescription}
                    onChange={(event) => setReportDescription(event.target.value)}
                    placeholder="What did you observe? When is it most likely to affect people?"
                    rows="5"
                  />
                </label>
              </div>

              <div className="report-card">
                <div className="form-heading">
                  <span className="step">02</span>
                  <div>
                    <h2>Where is it?</h2>
                    <p>Location selection is simulated for the academic prototype.</p>
                  </div>
                </div>

                <div className="form-row">
                  <label>
                    Neighborhood area
                    <select
                      value={reportArea}
                      onChange={(event) => setReportArea(event.target.value)}
                    >
                      {neighborhoods.map((area) => (
                        <option key={area}>{area}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Landmark / nearest point
                    <input
                      value={reportLandmark}
                      onChange={(event) => setReportLandmark(event.target.value)}
                      placeholder="Example: Gate 2, bus stop"
                    />
                  </label>
                </div>

                <label className="file-label">
                  Add a reference photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      setPhotoName(event.target.files?.[0]?.name || '')
                    }
                  />
                  <span>
                    {photoName
                      ? `Selected: ${photoName}`
                      : 'Photo selection is recorded locally; no image is uploaded.'}
                  </span>
                </label>

                <label className="anonymous-option">
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(event) => setAnonymous(event.target.checked)}
                  />
                  <span>
                    <b>Submit anonymously</b>
                    <small>
                      Your identity is hidden in the public community feed. The
                      prototype stores no account data.
                    </small>
                  </span>
                </label>
              </div>

              <div className="report-submit">
                <div>
                  <b>Before you submit</b>
                  <p>
                    SafeStreet is for non-emergency community concerns. For
                    immediate danger, contact emergency services.
                  </p>
                </div>
                <button className="button primary" type="submit">
                  Submit safety report →
                </button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'alerts' && (
          <section className="page">
            <div className="section-intro split">
              <div>
                <span className="eyebrow">PROXIMITY ALERT SIMULATION</span>
                <h1>Alerts near your area</h1>
                <p>
                  This prototype shows reports in your selected neighborhood.
                  It does not send real device push notifications.
                </p>
              </div>
              <label className="area-picker">
                Viewing alerts for
                <select
                  value={selectedArea}
                  onChange={(event) => setSelectedArea(event.target.value)}
                >
                  {neighborhoods.map((area) => (
                    <option key={area}>{area}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="alert-summary">
              <span className="pulse-dot" />
              <div>
                <b>{nearbyAlerts.length} active alert(s) near {selectedArea}</b>
                <small>
                  Only medium/high reports that are not resolved are shown.
                </small>
              </div>
            </div>

            <div className="alert-grid">
              {nearbyAlerts.map((incident) => {
                const meta = categoryMeta(incident.category);
                return (
                  <article className="alert-card" key={incident.id}>
                    <div className="alert-card-top">
                      <span className={`incident-icon ${meta.color}`}>
                        {meta.icon}
                      </span>
                      <span className={`severity ${incident.severity.toLowerCase()}`}>
                        {incident.severity} priority
                      </span>
                    </div>
                    <span className="eyebrow">{incident.category}</span>
                    <h2>{incident.title}</h2>
                    <p>{incident.description}</p>
                    <div className="alert-meta">
                      <span>⌖ {incident.landmark}</span>
                      <span>◷ {incident.reportedAt}</span>
                    </div>
                    <button
                      className="link-button"
                      onClick={() => {
                        setSelectedIncidentId(incident.id);
                        setActiveTab('authority');
                      }}
                    >
                      View case status →
                    </button>
                  </article>
                );
              })}

              {nearbyAlerts.length === 0 && (
                <div className="empty-state wide">
                  No active medium/high alerts are currently shown for this area.
                </div>
              )}
            </div>

            <div className="notification-card">
              <div>
                <span className="eyebrow">NOTIFICATION SETTINGS</span>
                <h2>Simulated preference controls</h2>
                <p>
                  In a production MERN version, these settings would control
                  opt-in push or email alerts after location consent.
                </p>
              </div>
              <div className="preference-list">
                <label><input type="checkbox" defaultChecked /> High-priority reports</label>
                <label><input type="checkbox" defaultChecked /> Verified safety updates</label>
                <label><input type="checkbox" /> Weekly neighborhood digest</label>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'authority' && (
          <section className="page">
            <div className="section-intro split">
              <div>
                <span className="eyebrow">AUTHORITY / MODERATOR VIEW</span>
                <h1>Incident triage desk</h1>
                <p>
                  Review reports, update their workflow status and maintain a
                  transparent community-facing case record.
                </p>
              </div>
              <div className="desk-metrics">
                <span><b>{openIncidents}</b> open</span>
                <span><b>{verifiedIncidents}</b> verified/resolved</span>
              </div>
            </div>

            <div className="authority-layout">
              <div className="authority-queue">
                <div className="queue-title">
                  <h2>Report queue</h2>
                  <small>Click a case to inspect it</small>
                </div>

                {incidents.map((incident) => (
                  <button
                    className={`queue-row ${
                      selectedIncident?.id === incident.id ? 'selected' : ''
                    }`}
                    key={incident.id}
                    onClick={() => setSelectedIncidentId(incident.id)}
                  >
                    <span className={`incident-icon ${categoryMeta(incident.category).color}`}>
                      {categoryMeta(incident.category).icon}
                    </span>
                    <span>
                      <b>{incident.id} · {incident.title}</b>
                      <small>{incident.area} · {incident.severity} priority</small>
                    </span>
                    <em className={`status status-${incident.status.replaceAll(' ', '-').toLowerCase()}`}>
                      {incident.status}
                    </em>
                  </button>
                ))}
              </div>

              {selectedIncident && (
                <article className="case-detail">
                  <div className="case-top">
                    <div>
                      <span className="eyebrow">{selectedIncident.id} · CASE DETAIL</span>
                      <h2>{selectedIncident.title}</h2>
                    </div>
                    <span className={`severity ${selectedIncident.severity.toLowerCase()}`}>
                      {selectedIncident.severity}
                    </span>
                  </div>

                  <div className="case-facts">
                    <span><b>Category</b>{selectedIncident.category}</span>
                    <span><b>Area</b>{selectedIncident.area}</span>
                    <span><b>Landmark</b>{selectedIncident.landmark}</span>
                    <span><b>Submitted</b>{selectedIncident.reportedAt}</span>
                    <span><b>Reporter</b>{selectedIncident.anonymous ? 'Anonymous' : 'Identified demo user'}</span>
                    <span><b>Attachment</b>{selectedIncident.photoName || 'No reference photo'}</span>
                  </div>

                  <div className="case-description">
                    <b>Report description</b>
                    <p>{selectedIncident.description}</p>
                  </div>

                  <div className="workflow">
                    <span className="eyebrow">STATUS WORKFLOW</span>
                    <div className="workflow-steps">
                      {statuses.map((status) => (
                        <span
                          key={status}
                          className={
                            statuses.indexOf(status) <=
                            statuses.indexOf(selectedIncident.status)
                              ? 'complete'
                              : ''
                          }
                        >
                          {status}
                        </span>
                      ))}
                    </div>
                    <small>Last updated: {selectedIncident.updatedAt}</small>
                  </div>

                  <div className="case-actions">
                    <button
                      className="button secondary"
                      onClick={() => setActiveTab('map')}
                    >
                      View on map
                    </button>
                    <button
                      className="button primary"
                      onClick={() => advanceStatus(selectedIncident.id)}
                    >
                      Advance to next status →
                    </button>
                  </div>
                </article>
              )}
            </div>
          </section>
        )}

        {activeTab === 'analytics' && (
          <section className="page">
            <div className="section-intro split">
              <div>
                <span className="eyebrow">COMMUNITY SAFETY ANALYTICS</span>
                <h1>Incident trends and readiness</h1>
                <p>
                  These metrics update from the browser-local prototype data,
                  including reports added during this demo.
                </p>
              </div>
              <div className="export-actions">
                <button className="button secondary" onClick={exportCsv}>
                  Download CSV ↓
                </button>
                <button className="button primary" onClick={() => window.print()}>
                  Print / Save PDF →
                </button>
              </div>
            </div>

            <div className="metric-grid">
              <article className="metric-card">
                <span>All reported cases</span>
                <b>{incidents.length}</b>
                <small>Browser-local incident records</small>
              </article>
              <article className="metric-card red">
                <span>Open cases</span>
                <b>{openIncidents}</b>
                <small>Reported, under review or verified</small>
              </article>
              <article className="metric-card green">
                <span>Resolution rate</span>
                <b>{resolutionRate}%</b>
                <small>{resolvedIncidents} completed resolution(s)</small>
              </article>
              <article className="metric-card purple">
                <span>High-priority reports</span>
                <b>{incidents.filter((incident) => incident.severity === 'High').length}</b>
                <small>Needs rapid authority review</small>
              </article>
            </div>

            <div className="analytics-grid">
              <article className="chart-card">
                <div className="chart-title">
                  <div>
                    <span className="eyebrow">CATEGORY DISTRIBUTION</span>
                    <h2>Reported concerns</h2>
                  </div>
                  <small>LIVE DATA</small>
                </div>
                <div className="bar-chart">
                  {categoryCounts.map((category) => (
                    <div className="bar-column" key={category.id}>
                      <b>{category.value}</b>
                      <span className="bar-track">
                        <i
                          className={category.color}
                          style={{
                            height: `${Math.max(
                              10,
                              (category.value /
                                Math.max(...categoryCounts.map((item) => item.value), 1)) *
                                100,
                            )}%`,
                          }}
                        />
                      </span>
                      <small>{category.id}</small>
                    </div>
                  ))}
                </div>
              </article>

              <article className="hotspot-card">
                <span className="eyebrow">HOTSPOT SUMMARY</span>
                <h2>Areas needing attention</h2>
                <div className="hotspot-list">
                  {areaCounts.map((area, index) => (
                    <div key={area.area}>
                      <span className="rank">0{index + 1}</span>
                      <b>{area.area}</b>
                      <em>{area.value} report{area.value === 1 ? '' : 's'}</em>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <article className="digest-card">
              <div>
                <span className="eyebrow">WEEKLY SAFETY DIGEST — DEMO</span>
                <h2>What changed in your community</h2>
                <p>
                  {areaCounts[0]?.area || 'No area'} currently has the highest
                  number of reports. The most common category is{' '}
                  {categoryCounts
                    .filter((category) => category.value > 0)
                    .sort((a, b) => b.value - a.value)[0]?.id || 'not available'}.
                  {' '}Authority workflow data shows {resolvedIncidents} resolved
                  case(s) out of {incidents.length}.
                </p>
              </div>
              <button className="button secondary" onClick={() => setActiveTab('alerts')}>
                Open alert feed →
              </button>
            </article>
          </section>
        )}
      </main>

      <footer>
        <span>SafeStreet academic prototype · Browser-local demo data</span>
        <span>For immediate danger, contact emergency services.</span>
      </footer>
    </div>
  );
}
