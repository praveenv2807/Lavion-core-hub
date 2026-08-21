# Lavion Core Hub — Backend Setup (MongoDB + Node.js)

This replaces the browser-only "demo" version (localStorage, hardcoded passwords) with a real backend: your data now lives in an actual MongoDB database, and passwords are hashed, never stored in plain text or shipped in the JavaScript.

## What changed vs. before
| Before | Now |
|---|---|
| Bookings/members saved in browser localStorage | Saved in a real MongoDB database |
| Admin/MD passwords hardcoded in `login.html`'s JavaScript (visible to anyone) | Passwords hashed with bcrypt, stored in the database, checked server-side |
| Anyone could open DevTools and see `1234` / `Praveen@2804` in the page source | Passwords never appear in any file sent to the browser |
| Worked by opening the file with Live Server | Now requires running the Node server (`npm start`) |

## Step 1 — Create your free MongoDB Atlas database
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and sign up (free).
2. Click **Build a Database** → choose the **Free (M0)** tier → pick any cloud provider/region close to you → **Create**.
3. When prompted, create a **database user** (a username + password — this is different from your Atlas login). Save this password somewhere.
4. Under **Network Access**, click **Add IP Address** → **Allow Access From Anywhere** (`0.0.0.0/0`) — fine for development; for production later you'd restrict this.
5. Go to your cluster → **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://yourusername:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual database user password. Add a database name before the `?`, e.g. `.../lavion?retryWrites=...`

## Step 2 — Configure the backend
1. Open a terminal in the `backend/` folder.
2. Copy `.env.example` to a new file named `.env`.
3. Paste your real connection string into `MONGO_URI`.
4. Set `JWT_SECRET` to any long random string (this signs login sessions — treat it like a password).
5. `ADMIN_PASSWORD` and `MD_PASSWORD` are already set to what you asked for (`1234` and `Praveen@2804`) — change them here if you ever want different ones. **This `.env` file is the only place these passwords will exist in plain text — it's excluded from git via `.gitignore`.**

## Step 3 — Install and seed
```bash
cd backend
npm install
npm run seed
```
The seed script creates the Admin and MD accounts in your database with properly hashed passwords. You only need to run this once (running it again just updates the passwords if you change your `.env`).

## Step 4 — Run it
```bash
npm start
```
Then open **http://localhost:3000** in your browser. This single server now serves the entire website *and* the API — you no longer need Live Server.

## Login credentials (after seeding)
| Role | Email | Password |
|---|---|---|
| Admin | admin@lavioncorehub.demo | 1234 (or whatever you set in `.env`) |
| MD | md@lavioncorehub.demo | Praveen@2804 (or whatever you set in `.env`) |
| Member | any email, self-registered | whatever password they choose at signup |

## API reference
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Member self-registration |
| POST | `/api/auth/login` | Public | Login for all 3 roles |
| GET | `/api/members` | Admin/MD only | List all members |
| POST | `/api/members` | Admin/MD only | Add a member |
| DELETE | `/api/members/:id` | Admin/MD only | Remove a member |
| GET | `/api/members/count` | Public | Live count for homepage stat |
| POST | `/api/bookings` | Public | Book a class (schedule page) |
| GET | `/api/bookings` | Admin/MD only | List all bookings |
| GET | `/api/health` | Public | Check server + DB connection status |

## Important — this backend is not yet wired into the front-end
The HTML/JS files (`login.html`, `admin.html`, `schedule.html`) still use the old localStorage/hardcoded-password logic — I built the backend as a complete, working, tested piece first since that was the actual question asked ("how do I connect to a database"). The front-end needs to be rewired to call these API endpoints with `fetch()` instead. That's a separate, smaller follow-up step — ask and I'll wire it up next.

## Deploying this for real (beyond your own computer)
Running `npm start` only works on your machine. To make this reachable on the internet, you'd deploy the `backend/` folder to a host like **Render**, **Railway**, or **Fly.io** (all have free tiers), set the same environment variables there, and point your domain at it. Happy to walk through that when you're ready for it.
