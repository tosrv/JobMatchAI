# Job Match AI

**Job Match AI** is an intelligent application that helps match candidates with suitable jobs using AI, featuring a fast backend, real-time updates, and efficient data management.

Built with **Next.js**, **Node.js**, **Supabase**, and **GROQ** for flexible data querying.

---

## 🔹 Features

- **Automatic job matching** using AI based on CVs and job descriptions.
- **Candidate & job management** through a modern dashboard.
- **Realtime updates** using Supabase Realtime.
- **Flexible search** with GROQ queries for filtering jobs & skills.
- **Easy deployment** on Vercel or other Next.js hosting platforms.

---

## 🛠 Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Frontend   | Next.js, TailwindCSS, ShadCN        |
| Backend    | Node.js, Next.js API Routes         |
| Database   | Supabase (PostgreSQL + Realtime)    |
| AI         | OpenAI API with GROQ for AI queries |
| Deployment | Vercel                              |

---

## ⚡ Local Setup

1. Clone the repository:

```bash
git clone https://github.com/username/job-match-ai.git
cd job-match-ai
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a .env.local file in the root directory and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=your_supabase_publishable_or_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role

NEXT_PUBLIC_BASE_URL=your_host

AI_API_KEY=your_model_api_key

ADZUNA_APP_ID=your_adzuna_id
ADZUNA_APP_KEY=your_adzuna_key

RESEND_API_KEY=your_resend_key
```

4. Run the development server:

```bash
npm run server
```

5. Open in your browser:

```bash
http://localhost:3000
```

## 🚀 Live Demo

You can try the app live here: [Job Match AI Demo](https://your-vercel-deploy-link.vercel.app)

## 🧠 How AI Matching Works

1. Candidate submits CV → stored in Supabase.

2. Job descriptions are retrieved from Supabase → GROQ queries filter data by skills & location.

3. AI processes CV vs Job → generates a match score for each candidate.

4. Results are displayed in the dashboard or via API response.

## License

MIT License
