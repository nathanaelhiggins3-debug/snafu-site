# SNAFU Desk on Vercel (Gallery feed posting)

The Gallery feed reads posts from the SNAFU Desk at /desk/. Photos and posts are stored in Vercel Blob. Complete these one-time Vercel project settings before using it.

1. In the Vercel project for `snafu.quest`, open **Storage** and create a **Blob** store. Make it public. Vercel adds `BLOB_READ_WRITE_TOKEN` to the project automatically.
2. Open **Settings → Environment Variables**. Add these two variables for the **Production** environment:
   - `LOOKS_EDITOR_PASSWORD` — the private password you will type on your phone.
   - `LOOKS_EDITOR_SESSION_SECRET` — a long, unique private value used to keep your sign-in secure. Do not reuse the password here.
3. Redeploy the newest `main` deployment (or push any harmless change). Environment-variable changes apply to new deployments.
4. On your phone, open `https://snafu.quest/desk/`, sign in, add photos, write a caption, tap **Post**. Add it to your home screen for one-tap posting.

The password and session secret stay in Vercel. They are never committed to this repository or sent to site visitors. Photos are shrunk on the phone (long edge 1600px) before upload.
