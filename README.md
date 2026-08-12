# csgo-kzstats

[![CI](https://github.com/DevRuto/csgo-kzstats/actions/workflows/ci.yml/badge.svg)](https://github.com/DevRuto/csgo-kzstats/actions/workflows/ci.yml)

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
KZTimer settings as-is (and vice versa) &mdash; or, to hide that section entirely instead of
just leaving it empty of data, set its database variable to nothing:

```ini
DB_KZTIMER_DATABASE=
```

An empty `DB_GOKZ_DATABASE` or `DB_KZTIMER_DATABASE` removes that plugin's nav link, homepage
card, and routes from the site rather than showing an empty section.

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

### Docker

A `Dockerfile` is included for running the app in a container. It expects your GOKZ/KZTimer
database to already be running somewhere reachable (this image only builds and serves the app).

```bash
docker build -t csgo-kzstats .
docker run -d -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 \
  -e DB_USER=your_db_user \
  -e DB_PASSWORD=your_db_password \
  -e DB_GOKZ_DATABASE=gokz \
  -e DB_KZTIMER_DATABASE=kztimer \
  csgo-kzstats
```

Open [http://localhost:3000](http://localhost:3000). Use `host.docker.internal` for `DB_HOST` if
your database runs on the Docker host itself (Docker Desktop on Mac/Windows), or point it at the
DB's actual host/IP otherwise.

## Offline demo

GitHub Pages can't run a database or server, so `.github/workflows/demo.yml` builds a static
version of the site with `DEMO=true`, which swaps the GOKZ/KZTimer database for generated
fixture data (see `app/mocks/`) instead of a real one. It runs on every push to `main` and
publishes to GitHub Pages (enable it once under **Settings &rarr; Pages &rarr; Source: GitHub
Actions**).

To build it locally:

```bash
DEMO=true npm run generate
npx serve .output/public
```
