Product Requirements Document: NotePR
Version: 1.0
Status: Draft
Date: October 26, 2023
1. Executive Summary
NotePR is an advanced AI-powered note-taking web application designed to function as a "cognitive copilot" for students and productivity-focused individuals. Unlike traditional static note-taking tools, NotePR leverages Generative AI to automate the lifecycle of information—from capture (voice/text) to synthesis (summarization/tagging) and retrieval (smart search/chat).

The product aims to solve the friction of organizing thoughts by making the system intelligent enough to structure data automatically, allowing users to focus on high-level thinking rather than administrative organization.
1.1 Target Audience
Students: Need efficient ways to transcribe lectures, summarize research papers, and organize complex academic projects.
Productivity Users: Professionals who need to process meeting minutes, maintain searchable personal knowledge bases, and manage daily tasks efficiently.
1.2 Strategic Goals
AI-First Architecture: Move beyond simple storage to active intelligence (RAG, Semantic Search).
Seamless UX: A design system that feels professional yet modern, inspired by industry leaders in data visualization and minimalism.
Scalable Tech Stack: Utilizing Next.js, Supabase, and OpenAI to ensure performance without over-engineering initial infrastructure.
2. Design System & User Experience
Inspiration Sources: mParticle.com (Data-driven hierarchy) & reflexai.com (Modern minimalism).
2.1 Visual Hierarchy & Layout Principles
The design prioritizes clarity and content density over decorative elements. The interface must feel like a high-performance tool.
Grid System: Strict adherence to a modular grid for dashboard layouts (similar to mParticle’s card-based data views).
Typography: High contrast between headers and body text. Use of bold, confident sans-serif fonts for headings to establish authority.
Whitespace: Generous use of negative space to prevent cognitive overload, ensuring the user focuses solely on the note content.
Color Palette: Professional, muted tones with specific accent colors used strictly for interactive states (buttons, links) and data visualization (tags, status indicators).
2.2 Component Behavior
Micro-interactions: Subtle hover effects and smooth transitions (inspired by reflexai) to provide feedback without distraction.
Data Visualization: When displaying tags or summaries, use pill-shaped badges or clean list views rather than cluttered clouds.
Responsiveness: The layout must adapt fluidly from desktop (multi-column dashboards) to tablet/mobile (single-column focus mode).
3. Functional Requirements
3.1 Core Feature Set (MVP)
3.1.1 Voice-to-Text Transcription (Live & Async)
Description: Convert spoken audio into editable text.
Modes:
Live Dictation: Real-time transcription as the user speaks.
File Upload: Asynchronous processing of uploaded audio files (MP3, WAV).
Tech Spec: OpenAI Whisper API.
Performance: Target latency < 3 seconds for live streaming; background processing for file uploads with email/in-app notification upon completion.

3.1.2 AI Summarization
Description: Automatically generate concise summaries of long-form notes or transcripts.
Output Format: Structured output including "Key Points," "Action Items," and "Open Questions."
Tech Spec: OpenAI Chat Completions API with RAG context to ensure accuracy.

3.1.3 Smart Tagging
Description: Automated metadata generation. The AI analyzes note content to suggest relevant tags (entities, topics, sentiment).
User Control: Users can accept, reject, or edit suggested tags. The system learns from these overrides.

3.1.4 Smart Search (Semantic)
Description: Natural language search that understands intent, not just keywords.
Example Query: "Show me notes about the marketing strategy meeting last week."
Tech Spec: Vector Embeddings (OpenAI) + pgvector (Supabase).

3.2 Advanced Features (Post-MVP)
3.2.1 Chat-with-Notes
Description: A conversational interface allowing users to query their entire knowledge base.
Capability: Multi-hop reasoning (e.g., "Compare the budget notes from Q1 with the goals set in Q4").
Requirement: Must cite sources (link back to specific notes) for every claim made.

3.2.2 Personalized Organization
Description: Adaptive UI that surfaces frequently accessed notes or suggests folder structures based on user behavior patterns.

4. Technical Architecture
4.1 Technology Stack
Layer
Technology
Purpose
Frontend
Next.js (App Router)
React framework for SSR/ISR, routing, and server actions.
Language
TypeScript
Type safety across the full stack.
Backend / DB
Supabase
PostgreSQL database, Authentication, Row Level Security (RLS), Storage.
AI Engine
OpenAI API
Whisper (Transcription), Embeddings (Search), GPT-4 (Summarization/Chat).
4.2 Data Model (Supabase Schema)
Users: id, email, created_at
Notes: id, user_id, title, content, summary, created_at, updated_at
Tags: id, name, color
Note_Tags: Junction table for many-to-many relationship.
Vectors: note_id, embedding (stored via pgvector extension).
4.3 Security & Privacy
Authentication: Supabase Auth (Email/Password + Google OAuth).
Data Isolation: Row Level Security (RLS) is mandatory. Policies must ensure a user can only SELECT, INSERT, UPDATE, or DELETE rows where auth.uid() == user_id.
Storage: Audio files stored in private Supabase Storage buckets with signed URLs.
5. Non-Functional Requirements
5.1 Performance
Latency: Text-based AI responses (summaries) should render within 2 seconds.
Availability: Target 99.5% uptime for core services.
Scalability: Database queries must be optimized with indexing on foreign keys and vector similarity searches.
5.2 Ethical AI & Reliability
Hallucination Mitigation: All AI-generated answers must include citations linking to the source note.
Transparency: Clear UI indicators distinguishing between "User Written" content and "AI Generated" content.
Feedback Loop: Mechanism for users to flag incorrect summaries or tags to improve future model prompts.
6. Roadmap & Phasing
Phase 1: Foundation (Weeks 1-6)
Setup Next.js repo and Supabase project.
Implement Authentication and basic CRUD for Notes.
Integrate OpenAI Whisper for Audio Transcription.
Phase 2: Intelligence (Weeks 7-10)
Implement AI Summarization pipeline.
Build Smart Tagging logic.
Develop the Vector Embedding pipeline for search preparation.
Phase 3: Discovery (Weeks 11-12)
Launch Semantic Search interface.
Polish UI/UX based on design system guidelines.
Beta launch to closed user group.
7. Actionable Recommendations for Development Team
Define RLS Early: Do not start building features until Supabase Row Level Security policies are written and tested. This is critical for user trust.
Streaming Responses: For the "Chat" and "Summarization" features, implement streaming text responses in Next.js to reduce perceived latency.
Cost Management: Implement usage tracking per user early on to monitor OpenAI API costs, especially for token-heavy operations like summarization and embeddings.
Design Tokenization: Create a strict design token file (colors, spacing, typography) in the codebase immediately to enforce the mParticle/reflexai aesthetic consistency.

