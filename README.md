# kzlocal-stats

A local leaderboard site for **Kreedz Climbing (KZ)** servers. It reads directly from the
MySQL/MariaDB databases used by the **GOKZ** and/or **KZTimer** SourceMod plugins and renders
player ranks, map records, and jumpstats &mdash; no data entry, no syncing, just a read-only view
on top of the database your server already writes to.

You only need one of the two plugins' databases for this to work. If you only run GOKZ, ignore
the KZTimer setup below (and vice versa).

## Prerequisites

- [Node.js](https://nodejs.org/) 20+ and npm
- An existing **GOKZ** and/or **KZTimer** MySQL/MariaDB database &mdash; either:
  - a database your SRCDS server is already writing to (on this machine or reachable over the
    network), or

## Hosting

Install dependencies:

```bash
npm install
```

Copy the example env file and point it at your database:

```bash
cp .env.example .env
```

```ini
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_GOKZ_DATABASE=gokz
DB_KZTIMER_DATABASE=kztimer
```

- `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASSWORD` &mdash; credentials for the MySQL/MariaDB
  server hosting your KZ data. This is the same server your GOKZ/KZTimer plugin is configured to
  write to (check your SourceMod plugin's database config, usually `addons/sourcemod/configs/databases.cfg`).
- `DB_GOKZ_DATABASE` / `DB_KZTIMER_DATABASE` &mdash; the schema/database names. These default to
  `gokz` and `kztimer`, which match the plugins' defaults, so you likely won't need to change them.

You only need one of the two databases for this to work. If you only run GOKZ, leave the
KZTimer settings as-is (and vice versa).

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You should see the GOKZ and/or KZTimer
leaderboards populated with your server's data.

## Deployment

```bash
npm run build
npm run preview
```

See the [Nuxt deployment docs](https://nuxt.com/docs/getting-started/deployment) for deploying
the build output to your platform of choice.
