# SNAFU Looks Desk on Vercel

The gallery is already set up to read changes from the SNAFU Looks Desk. Complete these one-time Vercel project settings before using it.

1. In the Vercel project for `snafu.quest`, open **Storage** and create a **Blob** store. Make it public. Vercel adds `BLOB_READ_WRITE_TOKEN` to the project automatically.
2. Open **Settings → Environment Variables**. Add these two variables for the **Production** environment:
   - `LOOKS_EDITOR_PASSWORD` — the private password you will type on your phone.
   - `LOOKS_EDITOR_SESSION_SECRET` — a long, unique private value used to keep your sign-in secure. Do not reuse the password here.
3. Redeploy the newest `main` deployment (or push any harmless change). Environment-variable changes apply to new deployments.
4. On your phone, open `https://snafu.quest/looks-desk/`, sign in, choose a Look, write in the fields, and tap **Save live**.

The password and session secret stay in Vercel. They are never committed to this repository or sent to site visitors. Image selection remains in the gallery files; the Desk is intentionally for titles and writing only.
