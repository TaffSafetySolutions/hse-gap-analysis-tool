# HSE Gap Analysis Register

A free, browser-based multi-framework HSE gap analysis tool — no server, no installation for end users, just a link.

Covers:
- **ISO 45001:2018** (OH&S Management System, clauses 4–10)
- **OSHAD-SF** (Abu Dhabi OSH System Framework, 14 Elements)
- **Saudi MOL / GOSI / Civil Defence** site practice requirements

Features: compliance dashboard with per-framework gauges, gap register per framework, consolidated action plan tracker (owner/target date/status/priority, with overdue flags), JSON export/import for backup or handover, CSV export for the gap register and action plan, and a print-friendly report view.

Data is stored only in the visitor's own browser (`localStorage`) — nothing is sent to a server. Use **Export data (JSON)** to back up or share a completed assessment; the recipient uses **Import data (JSON)** to load it.

## Publish it yourself (GitHub Pages)

1. **Create a repository** on GitHub, e.g. `hse-gap-analysis-tool`.
2. **Add these three files** to the repo root: `index.html`, `style.css`, `script.js` (open them in VS Code to review or edit first).
3. Commit and push:
   ```bash
   git init
   git add .
   git commit -m "Initial HSE gap analysis tool"
   git branch -M main
   git remote add origin https://github.com/<your-username>/hse-gap-analysis-tool.git
   git push -u origin main
   ```
4. On GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: main / (root)** → Save.
5. After a minute or two, your live tool will be at:
   `https://<your-username>.github.io/hse-gap-analysis-tool/`
6. Share that link with anyone — it works on desktop, tablet, or phone.

## Customizing

- **Edit the requirement lists**: open `script.js` and look for the `FRAMEWORKS` object near the top — each framework is a plain array of `[reference, title, description]` rows. Add, remove, or reword rows freely; the tool renders whatever is there.
- **Add another framework** (e.g. NEBOSH-based internal audit checklist, Aramco SAEP requirements): copy one of the existing framework blocks in `FRAMEWORKS`, give it a new key, then add a matching tab button in `index.html` and a matching `<section class="panel">` block.
- **Colors/branding**: all colors are CSS variables at the top of `style.css` (`:root { ... }`) — change them there and the whole tool updates.

## Important note on the Saudi MOL/GOSI content

The Saudi requirements in this tool are framed as **topic areas** (workforce documentation, PPE, permits, heat stress controls, etc.) rather than exact article citations, since specific article numbers and thresholds are periodically updated by the Ministry. Before using this for a formal compliance sign-off, verify current wording against the latest official Saudi Labor Law, HRSD/MOL circulars, GOSI regulations, and Civil Defence code in force at the time of assessment.
