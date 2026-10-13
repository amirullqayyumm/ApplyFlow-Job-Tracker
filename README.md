# ApplyFlow — Your career, organized

A polished, responsive **job application tracker** built with React, Vite, and Lucide icons. A separate portfolio project with an interactive Kanban workflow and a live GitHub Pages-ready demo.

## Features

- **Dashboard** with pipeline totals, reminders, and recent applications
- **Drag-and-drop pipeline** across Wishlist, Applied, Interview, Offer, and Closed stages
- **Mobile-friendly stage switching** through each card's menu
- **Add, edit and delete applications** with company, role, dates, location, recruiter, link and notes
- **Search, filter, sort** and quick stage changes in the applications table
- **Interviews & follow-ups** with upcoming/overdue labels and completion controls
- **Insights** showing a 7-day chart, stage breakdown and response rate
- **CSV export** for application backups
- **Light/dark mode**
- **LocalStorage persistence** — no database, login, external services or API keys required
- **Sample/demo applications** provided to show the UI; clear them in Insights for personal use

## Run locally

Requires Node.js 18+ (Node.js 20 or 22 recommended).

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite (usually http://localhost:5173).

## Build and publish using GitHub Pages (no hosting service required)

```bash
npm run build
```

Vite creates the **docs/** folder. The repository is configured with `base: './'` so that it also works under `username.github.io/repository-name/`.

1. Create a **new public GitHub repository** for ApplyFlow. Do not put this project inside the HRMS or portfolio project.
2. From this folder, run:

   ```bash
   git init
   git branch -M main
   git add .
   git commit -m "Initial ApplyFlow portfolio project"
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
   git push -u origin main
   ```

3. In GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch** and select **main** and **/docs**, then save.
5. Wait for publishing. GitHub displays the exact live site URL on the Pages settings screen.

When you update the site, run:

```bash
npm run build
git add .
git commit -m "Update ApplyFlow"
git push
```

> If you run Git commands from a parent folder by accident, your `docs/` folder will be nested and Pages won't be able to select it. Open the actual ApplyFlow folder before `git init`.

## Demo data and privacy

The initial application entries are **fictional demonstration data** and are not a claim that any real job application was submitted. Click **Insights → Clear all** to start with an empty workspace. Entries are saved only in your current browser's LocalStorage; they do not sync between devices. Export a CSV before clearing your data or switching browsers. Do not use this tool to store confidential recruiter information unless you are comfortable with browser-local storage.

This is a frontend-only portfolio application, not a multi-user backend service.
