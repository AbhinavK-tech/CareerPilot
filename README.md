# 🚀 CareerPilot AI – Multi-Agent Career Copilot

CareerPilot AI is a production-quality, multi-agent AI career mentoring platform designed to help students and professionals become job-ready.

Powered by a collaborative team of **10 specialized AI agents** orchestrated by a central dispatcher, the platform analyzes resumes, identifies skill gaps, recommends personalized learning roadmaps, conducts AI-powered mock interviews, generates DSA practice plans, reviews GitHub portfolios, and tracks overall Career Readiness through an interactive analytics dashboard.

This project was built as part of the **Kaggle AI Agents: Intensive Vibe Coding Capstone Project** using **Google Antigravity**.

---

# ✨ Features

- 📄 AI Resume Analysis with ATS scoring
- 🤖 Multi-Agent Architecture with 10 specialized AI agents
- 🎯 Personalized Career Roadmap Generation
- 📚 Learning Resource Recommendations
- 💻 GitHub Portfolio Review
- 🧩 DSA Practice Planner
- 🎤 AI Interview Coach
- 📈 Career Readiness Index (CRI)
- 📊 Interactive Analytics Dashboard
- ⚡ Judge Demo Mode with realistic simulated AI responses
- 🌙 Premium AI SaaS-inspired UI
- 📱 Responsive Design

---

# 🏗️ Multi-Agent Architecture

CareerPilot AI separates reasoning into independent AI agents coordinated by an **Orchestrator Agent**.

```
User
   │
   ▼
Orchestrator Agent
   │
   ├── Resume Analyzer Agent
   ├── Skill Gap Agent
   ├── Career Planner Agent
   ├── Learning Resource Agent
   ├── Project Recommender Agent
   ├── Interview Coach Agent
   ├── DSA Coach Agent
   ├── GitHub Reviewer Agent
   ├── Job Matching Agent
   └── Progress Tracker Agent
            │
            ▼
     Career Report
```

Each agent focuses on one responsibility and collaborates with the others to generate a comprehensive career analysis.

---

# 🤖 Specialized AI Agents

## 1. Orchestrator Agent
- Coordinates the execution of all agents
- Handles workflow sequencing
- Manages fallbacks and error recovery

## 2. Resume Analyzer Agent
- Parses resume content
- Calculates ATS Score
- Detects missing sections
- Evaluates formatting quality

## 3. Skill Gap Agent
- Compares user skills against target roles
- Identifies missing technologies
- Calculates Skill Match score

## 4. Career Planner Agent
- Builds personalized learning roadmaps
- Generates weekly milestones
- Suggests career progression

## 5. Learning Resource Agent
- Recommends high-quality learning resources
- Avoids duplicate content
- Curates documentation, YouTube and Kaggle resources

## 6. Project Recommender Agent
- Suggests portfolio-ready projects
- Generates project difficulty levels
- Recommends technology stacks

## 7. Interview Coach Agent
- Generates technical interview questions
- Evaluates responses
- Provides interview readiness score

## 8. DSA Coach Agent
- Creates structured coding practice plans
- Tracks problem-solving progress
- Suggests next topics

## 9. GitHub Reviewer Agent
- Reviews repository structure
- Evaluates documentation
- Scores portfolio quality

## 10. Progress Tracker Agent
- Aggregates all agent outputs
- Calculates Career Readiness Index (CRI)
- Tracks overall learning progress

---

# 📊 Dashboard Analytics

The analytics dashboard includes:

- Career Readiness Index
- ATS Score
- Skill Match
- Resume Quality
- GitHub Score
- DSA Progress
- Interview Readiness
- Learning Progress
- Weekly Productivity

Interactive visualizations include:

- Radar Chart
- Bar Chart
- Pie Chart
- Line Chart
- Career Roadmap Timeline
- Agent Activity Panel

---

# 🖥️ Technology Stack

## Frontend

- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion
- Recharts
- React Router v7
- Vite

---

## Backend

- FastAPI
- Google Gemini API
- SQLAlchemy
- SQLite
- JWT Authentication
- Bcrypt

---

# 🎨 UI Design

The interface follows modern AI SaaS design principles inspired by:

- Linear
- Vercel
- Cursor IDE
- Notion AI

Features include:

- Glassmorphism
- Dark Theme
- Animated Dashboards
- Responsive Layout
- Premium Typography
- Interactive Cards
- Smooth Page Transitions

---

# ⚡ Judge Demo Mode

CareerPilot AI automatically supports **Demo Mode**.

When a Gemini API key is unavailable, the application automatically loads realistic simulated AI responses, allowing judges to explore every feature without additional setup.

Demo Mode includes:

- Resume Analysis
- Career Dashboard
- Learning Roadmap
- GitHub Review
- DSA Progress
- Interview Feedback
- Analytics

---

# 🧠 Built with Google Antigravity

This project was designed and developed using **Google Antigravity**.

Google Antigravity accelerated:

- Multi-agent architecture development
- Frontend UI generation
- Dashboard design
- Component refinement
- Rapid prototyping
- Interactive analytics implementation

---

# 📂 Project Structure

```
CareerPilot-AI/
│
├── backend/
│   ├── app/
│   ├── agents/
│   ├── database/
│   ├── models/
│   ├── routers/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── assets/
│   └── package.json
│
└── README.md
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the backend directory.

```env
PORT=8000
HOST=0.0.0.0

DATABASE_URL=sqlite:///./careerpilot.db

SECRET_KEY=your_secret_key

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=1440

GEMINI_API_KEY=your_gemini_api_key
```

---

# 🚀 Installation

## Backend

```bash
cd backend

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Runs on:

```
http://localhost:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Runs on:

```
http://localhost:5173
```

---

# 📸 Screenshots

Add screenshots here.

- Dashboard
- Resume Analyzer
- Career Roadmap
- Interview Coach
- DSA Coach
- GitHub Review
- Multi-Agent Activity Panel

---

# 🌐 Production Deployment Guide

CareerPilot AI is ready for production hosting. Follow these instructions to deploy the backend to **Render** and the frontend to **Vercel**.

## 1. Backend Deployment (Render)
Render is ideal for hosting FastAPI ASGI apps.

1. Sign up on [Render](https://render.com) and link your GitHub repository.
2. Click **New +** and select **Web Service**.
3. Choose your repository and configure the following parameters:
   * **Language**: `Python`
   * **Root Directory**: `backend`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Click **Advanced** and add the following **Environment Variables**:
   * `DATABASE_URL`: `sqlite:///./careerpilot.db`
   * `SECRET_KEY`: `your_secure_jwt_key_here` (Generates JWT session tokens)
   * `ALGORITHM`: `HS256`
   * `ACCESS_TOKEN_EXPIRE_MINUTES`: `1440`
   * `GEMINI_API_KEY`: `your_gemini_api_key` *(If left blank, the app will run in fallback **Demo Mode**)*
5. Click **Deploy Web Service**. Once deployed, copy your Render web service URL (e.g., `https://careerpilot-backend.onrender.com`).

---

## 2. Frontend Deployment (Vercel)
Vercel is optimized for building and deploying static React/Vite web apps.

1. Sign up on [Vercel](https://vercel.com) and import your GitHub repository.
2. Configure the following project parameters:
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
   * **Install Command**: `npm install`
3. Expand the **Environment Variables** section and add:
   * **Key**: `VITE_API_URL`
   * **Value**: Paste your Render backend service URL (e.g., `https://careerpilot-backend.onrender.com`)
4. Click **Deploy**. Vercel will build the React bundle and host it on a secure `https://` domain.

---

# 🎓 Kaggle AI Agents Concepts Demonstrated

This project demonstrates multiple concepts from the Kaggle AI Agents course:

- ✅ Multi-Agent System
- ✅ Agent Orchestration
- ✅ Structured Reasoning
- ✅ Google Gemini Integration
- ✅ Google Antigravity
- ✅ Secure API Management
- ✅ Modular AI Architecture
- ✅ Deployable FastAPI Backend

---

# 📈 Future Improvements

- Live job matching APIs
- LinkedIn profile analysis
- Voice interview coaching
- AI resume rewriting
- Company-specific interview preparation
- Real-time coding assessments
- Cloud deployment
- Team collaboration support

---

# 📜 License

This project is licensed under the MIT License.

---

⭐ If you found this project useful, consider giving it a star!
