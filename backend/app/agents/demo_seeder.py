import logging
from sqlalchemy.orm import Session
from app import models
from app.auth import get_password_hash

logger = logging.getLogger(__name__)

def seed_demo_data(db: Session, user: models.User):
    logger.info(f"Seeding full demo data for user: {user.email}")
    
    # Clean previous data to allow re-seeding
    db.query(models.Resume).filter(models.Resume.user_id == user.id).delete()
    db.query(models.SkillGap).filter(models.SkillGap.user_id == user.id).delete()
    db.query(models.Roadmap).filter(models.Roadmap.user_id == user.id).delete()
    db.query(models.LearningResource).filter(models.LearningResource.user_id == user.id).delete()
    db.query(models.Project).filter(models.Project.user_id == user.id).delete()
    db.query(models.InterviewSession).filter(models.InterviewSession.user_id == user.id).delete()
    db.query(models.DSAPlan).filter(models.DSAPlan.user_id == user.id).delete()
    db.query(models.GitHubReview).filter(models.GitHubReview.user_id == user.id).delete()
    db.query(models.Progress).filter(models.Progress.user_id == user.id).delete()
    db.commit()

    # 1. Resume
    resume = models.Resume(
        user_id=user.id,
        file_name="John_Doe_CV.pdf",
        ats_score=84,
        text_content="John Doe CV: Python, Django, SQL developer. Fast learner, passion for AI and LLMs.",
        strengths=[
            "Strong software foundations in Python and SQL",
            "3 years of building backend API architectures with Django",
            "Familiarity with container tools like Docker"
        ],
        weaknesses=[
            "No direct production deployment using Kubernetes or Serverless clouds",
            "Lacks deep neural networks training or LLM engineering exposure",
            "No CI/CD pipelines specified in past projects"
        ],
        sections_found={
            "Education": True,
            "Experience": True,
            "Projects": True,
            "Skills": True,
            "Certifications": False
        },
        suggestions=[
            "Elaborate on how Docker containers are orchestrated in production.",
            "List specific machine learning concepts utilized (e.g. prompt engineering, embeddings).",
            "Incorporate automated unit testing coverage figures into project bullet points."
        ]
    )
    db.add(resume)

    # 2. Skill Gap
    skill_gap = models.SkillGap(
        user_id=user.id,
        current_skills=["Python", "Django", "SQL", "Docker", "Git"],
        missing_skills=["FastAPI", "PyTorch", "GCP Cloud Run", "GitHub Actions CI/CD", "Vector Databases", "System Design"],
        target_skills=["Python", "Django", "SQL", "Docker", "Git", "FastAPI", "PyTorch", "GCP Cloud Run", "GitHub Actions CI/CD", "Vector Databases", "System Design"],
        priorities={
            "FastAPI": "High",
            "Vector Databases": "High",
            "System Design": "High",
            "GCP Cloud Run": "Medium",
            "GitHub Actions CI/CD": "Medium",
            "PyTorch": "Low"
        },
        match_percentage=68.0
    )
    db.add(skill_gap)

    # 3. Roadmaps (30-day and 90-day)
    roadmap_30 = models.Roadmap(
        user_id=user.id,
        term_type="30-day",
        tasks=[
            {
                "title": "Build REST APIs using FastAPI",
                "description": "Learn path operations, dependency injection, and Pydantic validation. Rewrite a small Django app in FastAPI.",
                "status": "completed",
                "week": 1,
                "resources": ["FastAPI Official Tutorial", "FastAPI Crash Course on YouTube"]
            },
            {
                "title": "Master Vector Databases & Embeddings",
                "description": "Understand vector embeddings, similarity search (cosine distance), and connect FastAPI to Qdrant or Pinecone.",
                "status": "in_progress",
                "week": 2,
                "resources": ["Pinecone Vector Academy", "Qdrant Getting Started Guides"]
            },
            {
                "title": "Implement GitHub Actions CI/CD",
                "description": "Setup linting, formatting, and unit tests checking via Pytest on every pull request to repository.",
                "status": "pending",
                "week": 3,
                "resources": ["GitHub Actions Documentation"]
            },
            {
                "title": "Deploy FastAPI to GCP Cloud Run",
                "description": "Write a multi-stage Dockerfile, push image to Google Artifact Registry, and deploy container to serverless Cloud Run.",
                "status": "pending",
                "week": 4,
                "resources": ["GCP Cloud Run serverless quickstarts"]
            }
        ]
    )
    db.add(roadmap_30)

    roadmap_90 = models.Roadmap(
        user_id=user.id,
        term_type="90-day",
        tasks=[
            {
                "title": "Deep Dive in PyTorch & Neural Nets",
                "description": "Learn tensors, neural net structures, and train a basic feed-forward model on MNIST datasets.",
                "status": "pending",
                "week": 1,
                "resources": ["PyTorch 60min Blitz", "Deep Learning with PyTorch Book"]
            },
            {
                "title": "System Design: Microservices & Caching",
                "description": "Study horizontal scaling, load balancers, caching strategies using Redis, and database partitioning patterns.",
                "status": "pending",
                "week": 5,
                "resources": ["ByteByteGo Systems Architecture", "System Design Primer Repo"]
            }
        ]
    )
    db.add(roadmap_90)

    # 4. Learning Resources
    resources = [
        models.LearningResource(
            user_id=user.id, skill="FastAPI", title="FastAPI Complete Developer Course",
            url="https://fastapi.tiangolo.com/tutorial/", source="Documentation", difficulty="Beginner", completed=True
        ),
        models.LearningResource(
            user_id=user.id, skill="Vector Databases", title="Vector Search and LLM RAG Pipelines",
            url="https://www.pinecone.io/learn/", source="Kaggle", difficulty="Intermediate", completed=False
        ),
        models.LearningResource(
            user_id=user.id, skill="GCP Cloud Run", title="Serverless Deployment on GCP Cloud Run",
            url="https://cloud.google.com/run/docs/quickstarts", source="Documentation", difficulty="Intermediate", completed=False
        ),
        models.LearningResource(
            user_id=user.id, skill="GitHub Actions CI/CD", title="CI/CD Pipelines using GitHub Workflows",
            url="https://github.com/features/actions", source="GitHub", difficulty="Beginner", completed=False
        )
    ]
    for r in resources:
        db.add(r)

    # 5. Projects
    projects = [
        models.Project(
            user_id=user.id,
            title="Semantic Search Document Engine",
            description="Build a FastAPI server that ingests PDFs, generates vector embeddings using OpenAI/Gemini, stores them in SQLite vector registry, and searches them semantically.",
            difficulty="Medium",
            duration="2 weeks",
            skills_learned=["FastAPI", "SQLite", "OpenAI API", "PyPDF"],
            folder_structure=".\n├── app/\n│   ├── main.py\n│   ├── embed.py\n│   └── index.py\n├── Dockerfile\n└── README.md",
            portfolio_impact="High",
            completed=True
        ),
        models.Project(
            user_id=user.id,
            title="Autonomous Code Auditor",
            description="An agentic pipeline that checks repository styles, outputs code feedback, and automatically formats Python files using black/flake8 inside Docker containers.",
            difficulty="Hard",
            duration="3 weeks",
            skills_learned=["Python subprocess", "Docker CLI", "Gemini API", "FastAPI"],
            folder_structure=".\n├── agent/\n│   ├── auditor.py\n│   └── sandbox.py\n├── tests/\n└── docker-compose.yml",
            portfolio_impact="High",
            completed=False
        )
    ]
    for p in projects:
        db.add(p)

    # 6. Interview Sessions
    interview = models.InterviewSession(
        user_id=user.id,
        questions=[
            {"id": 1, "question": "Explain the difference between a process and a thread in Python. How does the Global Interpreter Lock (GIL) affect them?", "type": "technical", "company": "Netflix"},
            {"id": 2, "question": "Describe a time you faced a challenging technical block. How did you diagnose and overcome it?", "type": "behavioral", "company": "Google"},
            {"id": 3, "question": "Design a rate limiter for a public API. What database or data structure would you use, and why?", "type": "coding", "company": "Meta"}
        ],
        answers=[
            {
                "question_id": 1,
                "question": "Explain the difference between a process and a thread in Python...",
                "user_answer": "Processes run in separate memory spaces and don't share memory. Threads run in the same process and share memory. In Python, the GIL prevents multiple threads from running bytecode at once, so CPU bound threads aren't truly parallel.",
                "score": 88,
                "feedback": "Excellent response detailing GIL constraints and process boundaries.",
                "exemplar": "Ideal answer would highlight the multiprocessing module for bypass."
            },
            {
                "question_id": 2,
                "question": "Describe a time you faced a challenging technical block...",
                "user_answer": "I had a database query timeout on a staging deploy. I used EXPLAIN ANALYZE, found a missing index on the user foreign key, added it, and query time dropped from 3s to 2ms.",
                "score": 92,
                "feedback": "Great debugging narrative using metrics and analysis.",
                "exemplar": "Elaborate more on testing scale configurations."
            },
            {
                "question_id": 3,
                "question": "Design a rate limiter for a public API...",
                "user_answer": "I would use a Redis sliding window counter or token bucket filter. Redis sorted sets are great for sliding windows by ranking timestamps.",
                "score": 85,
                "feedback": "Good choice of data structures. Be sure to describe concurrency race conditions.",
                "exemplar": "Suggest Lua scripting for atomic execution."
            }
        ],
        score=88,
        feedback={
            "overall_summary": "The candidate demonstrates solid backend knowledge, clear logical debugging, and familiarity with scaling caches."
        },
        is_completed=True
    )
    db.add(interview)

    # 7. DSA Coach Seeding
    dsa = models.DSAPlan(
        user_id=user.id,
        topic_roadmap=[
            {
                "topic": "Arrays & Hashing",
                "questions": [
                    {"title": "Two Sum", "difficulty": "Easy", "completed": True, "solved_date": "2026-07-01"},
                    {"title": "Group Anagrams", "difficulty": "Medium", "completed": False}
                ]
            },
            {
                "topic": "Two Pointers & Sliding Window",
                "questions": [
                    {"title": "Valid Palindrome", "difficulty": "Easy", "completed": True, "solved_date": "2026-07-02"},
                    {"title": "Container With Most Water", "difficulty": "Medium", "completed": False}
                ]
            },
            {
                "topic": "Trees",
                "questions": [
                    {"title": "Invert Binary Tree", "difficulty": "Easy", "completed": False},
                    {"title": "Binary Tree Maximum Path Sum", "difficulty": "Hard", "completed": False}
                ]
            }
        ],
        daily_schedule=[
            {"day": 1, "topic": "Arrays & Hashing", "task": "Study Hashmap insertions and collision rates. Solve 'Two Sum'."},
            {"day": 2, "topic": "Arrays & Hashing", "task": "Solve 'Group Anagrams' and practice bucket sort approaches."},
            {"day": 3, "topic": "Two Pointers", "task": "Read about two pointer iterations. Solve 'Valid Palindrome'."},
            {"day": 4, "topic": "Sliding Window", "task": "Solve 'Container With Most Water' and analyze dynamic window resizing."},
            {"day": 5, "topic": "Trees", "task": "Revise recursion and DFS traversals. Solve 'Invert Binary Tree'."}
        ],
        practice_progress={
            "completed_questions": ["Two Sum", "Valid Palindrome"],
            "completed_topics": ["Arrays & Hashing", "Two Pointers"]
        }
    )
    db.add(dsa)

    # 8. GitHub Review
    github = models.GitHubReview(
        user_id=user.id,
        repo_name="fastapi-django-hybrid",
        readme_score=85,
        documentation_score=75,
        structure_score=90,
        commits_score=80,
        complexity_score=85,
        overall_score=83,
        comments="The repository is well structured with clean separations of code logic. However, the README lacks setup command specifications, and API documentation for endpoint usage is sparse.",
        folder_structure=".\n├── app/\n│   ├── main.py\n│   ├── models.py\n│   └── utils.py\n├── tests/\n│   └── test_main.py\n├── Dockerfile\n├── README.md\n└── requirements.txt",
        improvements=[
            "Expand the README.md with detailed API requests and responses examples.",
            "Include a Swagger/OpenAPI doc link and setup guide.",
            "Add badges and pre-commit linting to ensure documentation builds successfully."
        ]
    )
    db.add(github)

    # 9. Progress
    progress = models.Progress(
        user_id=user.id,
        completed_skills=["Python", "Django", "SQL", "Docker", "Git", "FastAPI"],
        completed_projects=1,
        average_interview_score=88,
        dsa_completed=2,
        job_readiness_score=82,
        learning_streak=5,
        weekly_progress=[
            {"name": "Week 1", "value": 30},
            {"name": "Week 2", "value": 45},
            {"name": "Week 3", "value": 65},
            {"name": "Week 4", "value": 82}
        ]
    )
    db.add(progress)

    db.commit()
    logger.info("Demo data seeding completed successfully.")
