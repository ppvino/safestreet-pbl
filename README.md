# SafeStreet

SafeStreet is an academic React/Vite prototype for non-emergency neighborhood safety incident reporting and community-aware incident tracking.

## Problem statement

Residents may notice issues such as poor street lighting, unsafe crossings, damaged pedestrian infrastructure, harassment concerns, or suspicious activity, but these reports are often scattered and difficult for community coordinators to track. SafeStreet provides a structured reporting workflow, visibility into active concerns, simulated area-based alerts, and an authority triage view.

## Implemented features

- Incident reporting with title, category, severity, description, neighborhood area, and landmark
- Optional anonymous reporting
- Simulated reference-photo selection; selected filename is recorded locally
- Incident map-style visualization with category, status, severity, and search filters
- Community incident feed and area-based proximity-alert simulation
- Authority/moderator desk with a case-detail view
- Status workflow: Reported → Under Review → Verified → Resolved
- Incident analytics: open cases, resolution rate, high-priority cases, category distribution, and hotspot summary
- CSV export of incident records
- Browser Print / Save as PDF support
- Browser-local persistence with Reset Demo

## Technology

- React
- Vite
- JavaScript
- CSS
- Browser localStorage

## Run locally

```bash
npm install
npm run dev
```

Then open the local URL shown by Vite, normally `http://localhost:5173`.

## Quality checks

```bash
npm run lint
npm run build
```

## Prototype limitations

This is a front-end academic prototype. It uses browser-local demo data and does not include a production backend, real GPS/maps, real push/email/SMS alerts, user authentication, or emergency-service integration. Do not use it to report an emergency; contact local emergency services for immediate danger.

## PBL alignment

The prototype demonstrates core PBL concepts: structured incident reporting, category/location information, optional anonymous reporting, community visualization, proximity-alert simulation, authority review workflow, status tracking, analytics, and export.

## Author

Vinod — Full Stack Development PBL
