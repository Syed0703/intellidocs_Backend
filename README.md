# IntelliDocs

> **AI-powered multi-tenant document knowledge platform built with Spring Boot, React, PostgreSQL, pgvector, and Gemini.**

IntelliDocs helps organizations turn internal PDF documents into a secure, searchable AI knowledge base. Users can upload documents, organize them into knowledge bases, and ask natural-language questions. IntelliDocs retrieves the most relevant document chunks using vector similarity search and generates grounded answers with source citations.

---

## Overview

Organizations often store policies, procedures, handbooks, onboarding material, and internal documentation in large PDF files. Finding a specific answer usually requires opening multiple documents and searching manually.

IntelliDocs solves this using **Retrieval-Augmented Generation (RAG)**:

```text
Upload PDF
   ↓
Validate document
   ↓
Extract text
   ↓
Split into overlapping chunks
   ↓
Generate embeddings
   ↓
Store vectors in PostgreSQL + pgvector
   ↓
User asks a question
   ↓
Generate question embedding
   ↓
Semantic similarity search
   ↓
Retrieve relevant chunks
   ↓
Generate grounded answer with Gemini
   ↓
Return answer + source citations
```

---

## Core Features

### AI & RAG

- PDF document ingestion
- Text extraction with Apache PDFBox
- Chunk-based document processing
- Gemini embeddings
- PostgreSQL vector storage using pgvector
- Semantic similarity search
- Retrieval-Augmented Generation
- Grounded answers based on uploaded documents
- Source citations
- Similarity-threshold filtering
- Safe fallback when relevant information is not found

### Multi-Tenant Architecture

- Organization-based tenant isolation
- Organization → Knowledge Base → Document → Chunk hierarchy
- Users can belong to organizations through memberships
- Tenant-scoped repository queries
- Organization-specific document search
- Role-based access control

### Authentication & Security

- JWT authentication
- JWT stored in `HttpOnly` cookies
- 30-minute JWT/session lifetime
- BCrypt password hashing
- CSRF protection for state-changing requests
- Environment-aware cookie security
- Configurable `SameSite` behavior
- CORS restricted to the configured frontend origin
- Stateless Spring Security configuration
- Secrets supplied through environment variables
- Backend authorization independent of frontend UI
- Request rate limiting
- PDF MIME-type validation
- PDF signature validation
- File-size limits

---

## Role-Based Access Control

| Capability | ADMIN | MEMBER |
|---|:---:|:---:|
| View organization | ✅ | ✅ |
| View knowledge bases | ✅ | ✅ |
| View documents | ✅ | ✅ |
| Ask AI questions | ✅ | ✅ |
| Create knowledge bases | ✅ | ❌ |
| Edit knowledge bases | ✅ | ❌ |
| Delete knowledge bases | ✅ | ❌ |
| Upload documents | ✅ | ❌ |
| Delete documents | ✅ | ❌ |
| Add members | ✅ | ❌ |
| Change member roles | ✅ | ❌ |
| Remove members | ✅ | ❌ |

Additional safeguards protect destructive operations, including last-admin protection, processing-document deletion protection, and knowledge-base deletion protection when documents still exist.

---

## Frontend Experience

The frontend is designed as a responsive B2B SaaS dashboard.

### Main Screens

- Login
- Signup
- Ask AI
- Organization Overview
- Knowledge Bases
- Documents
- Members

### UI Features

- Responsive desktop, tablet, and mobile layouts
- Mobile navigation drawer
- Organization/workspace selector
- Role-aware UI controls
- Loading skeletons
- Empty states
- Error states
- Confirmation modals
- Member search
- Document processing status
- Admin-only upload and delete controls
- Keyboard-friendly Ask AI interaction
- Clean forest/graphite visual theme with warm neutral backgrounds

---

## Tech Stack

### Backend

- Java 21
- Spring Boot 3
- Spring Security
- Spring Data JPA
- Hibernate
- Jakarta Validation
- Spring AI
- Apache PDFBox
- JJWT
- Bucket4j
- Flyway
- Maven

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide Icons
- Native Fetch API

### Database & AI

- PostgreSQL
- pgvector
- Gemini Embeddings
- Gemini Chat Model

### Testing

- JUnit 5
- Mockito

### DevOps / Deployment Target

- Docker
- Docker Compose
- Git / GitHub
- GitHub Actions
- Vercel
- Render
- Supabase PostgreSQL + pgvector
- Supabase Storage

---

## High-Level Architecture

```text
┌──────────────────────────────┐
│          React SPA           │
│      Vite + TypeScript       │
└──────────────┬───────────────┘
               │ HTTPS / REST
               ▼
┌──────────────────────────────┐
│      Spring Boot API         │
│                              │
│  JWT + CSRF + CORS           │
│  Organizations              │
│  Memberships / RBAC          │
│  Knowledge Bases             │
│  Documents                   │
│  RAG Pipeline                │
└───────┬───────────┬──────────┘
        │           │
        │           └──────────────► Gemini API
        │                              ├─ Embeddings
        │                              └─ Answer generation
        │
        ▼
┌──────────────────────────────┐
│ PostgreSQL + pgvector        │
│                              │
│ Users                        │
│ Organizations                │
│ Memberships                  │
│ Knowledge Bases              │
│ Documents                    │
│ Document Chunks + Vectors    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      Document Storage        │
│    Local in development      │
│ Object storage in production │
└──────────────────────────────┘
```

---

## Domain Model

```text
User
  │
  └── Membership
          │
          ▼
     Organization
          │
          ▼
    Knowledge Base
          │
          ▼
       Document
          │
          ▼
    Document Chunk
          │
          ▼
       Embedding
```

A user can belong to multiple organizations. Each membership stores the user's role within that organization.

---

## Document Processing Pipeline

When an administrator uploads a PDF:

1. Organization access is verified.
2. The file is checked for size, MIME type, and PDF signature.
3. Document metadata is stored.
4. The document status becomes `PROCESSING`.
5. Processing runs asynchronously.
6. Text is extracted using PDFBox.
7. Text is split into overlapping chunks.
8. Gemini generates an embedding for each chunk.
9. Chunk content and vectors are stored in PostgreSQL/pgvector.
10. The document becomes `READY`.
11. Processing failures are marked as `FAILED`.

Documents cannot be deleted while they are still processing.

---

## RAG Query Flow

When a user asks a question:

1. The user's organization membership is verified.
2. The question is converted to an embedding.
3. pgvector performs semantic similarity search.
4. Only chunks belonging to the selected organization are considered.
5. The most relevant chunks are selected.
6. Low-relevance matches are filtered.
7. Retrieved context is sent to Gemini.
8. Gemini generates an answer using the retrieved context.
9. IntelliDocs returns the answer together with source citations.

If relevant information cannot be found, IntelliDocs returns a safe fallback instead of inventing an answer.

---

## Security Design

IntelliDocs uses layered application security.

### JWT Authentication

JWTs are stored in `HttpOnly` cookies, so frontend JavaScript does not directly access the authentication token.

### CSRF Protection

State-changing requests such as `POST`, `PUT`, `PATCH`, and `DELETE` require a CSRF token.

The React application first obtains a CSRF token from the backend and sends it in the:

```text
X-XSRF-TOKEN
```

request header.

### Tenant Isolation

Repository queries are scoped using organization identifiers to reduce the risk of cross-tenant data access.

### Backend Authorization

Sensitive operations use backend role checks such as admin authorization. Hiding controls in React is treated as a UX concern, not a security boundary.

### Cookie Configuration

Development:

```text
Secure   = false
SameSite = Strict
```

Production target:

```text
Secure   = true
SameSite = None
```

Production traffic is expected to run over HTTPS.

---

## API Overview

### Authentication

```text
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
GET  /api/auth/csrf
```

### Users

```text
POST /api/users
```

### Organizations

```text
GET /api/organizations
```

### Knowledge Bases

```text
GET    /api/organizations/{organizationId}/knowledge-bases
POST   /api/organizations/{organizationId}/knowledge-bases
PUT    /api/organizations/{organizationId}/knowledge-bases/{knowledgeBaseId}
DELETE /api/organizations/{organizationId}/knowledge-bases/{knowledgeBaseId}
```

### Documents

```text
GET    /api/organizations/{organizationId}/knowledge-bases/{knowledgeBaseId}/documents
POST   /api/organizations/{organizationId}/knowledge-bases/{knowledgeBaseId}/documents
DELETE /api/organizations/{organizationId}/knowledge-bases/{knowledgeBaseId}/documents/{documentId}
```

### Memberships

```text
POST   /api/memberships
GET    /api/memberships/organization/{organizationId}
PATCH  /api/memberships/organization/{organizationId}/{membershipId}/role
DELETE /api/memberships/organization/{organizationId}/{membershipId}
```

### RAG

```text
POST /api/organizations/{organizationId}/ask
```

---

## Project Structure

```text
intellidocs/
├── src/
│   ├── main/
│   │   ├── java/com/syed/intellidocs/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── entity/
│   │   │   ├── enums/
│   │   │   ├── exception/
│   │   │   ├── repository/
│   │   │   ├── security/
│   │   │   └── service/
│   │   └── resources/
│   └── test/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   └── pages/
│   └── package.json
│
├── .env.example
├── pom.xml
├── mvnw
├── mvnw.cmd
└── README.md
```

---

## Environment Variables

Use `.env.example` as a reference.

### Backend

```env
DB_URL=
DB_USERNAME=
DB_PASSWORD=
JWT_SECRET=
GEMINI_API_KEY=

FRONTEND_URL=http://localhost:5173
COOKIE_SECURE=false
COOKIE_SAME_SITE=Strict
```

### Frontend

See `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:8080
```

Never commit real API keys, database passwords, or JWT secrets.

---

## Local Development

### Prerequisites

- Java 21
- Node.js
- Docker
- PostgreSQL with pgvector
- Gemini API key

### Run the Backend

Provide the required environment variables through IntelliJ, your operating system, or another secure local configuration mechanism.

Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

macOS/Linux:

```bash
./mvnw spring-boot:run
```

Default backend URL:

```text
http://localhost:8080
```

### Run the Frontend

```bash
cd frontend
npm install
npm run dev
```

Default frontend URL:

```text
http://localhost:5173
```

---

## Build

### Frontend

```bash
cd frontend
npm run build
```

### Backend

Windows:

```powershell
.\mvnw.cmd package
```

macOS/Linux:

```bash
./mvnw package
```

---

## Database Migrations

IntelliDocs uses Flyway for controlled database schema migrations.

Hibernate is configured with:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

This keeps schema creation/migration separate from ORM validation.

---

## Production Configuration

The project is structured so production values are supplied through environment variables instead of hardcoded configuration.

Production configuration includes:

- HTTPS-only authentication cookies
- environment-specific `SameSite` behavior
- restricted CORS origin
- CSRF protection
- stateless Spring Security
- disabled SQL logging
- reverse-proxy forwarded-header support
- environment-based secrets

---

## Final Deployment Target

The final portfolio deployment is planned as:

```text
React Frontend
    │
    └── Vercel
          │
          ▼
Spring Boot API
    │
    └── Render + Docker
          │
          ├── Supabase PostgreSQL + pgvector
          ├── Supabase Storage
          └── Gemini API
```

This keeps the public portfolio deployment low-cost while still demonstrating a production-style architecture.

---

## CI/CD Target

The final delivery workflow is planned around GitHub Actions and deployment-platform integrations.

```text
Push / Pull Request
       ↓
Frontend Build
       ↓
Backend Build + Tests
       ↓
Deployment
       ↓
Production Smoke Test
```

---

## Reliability & Operational Safeguards

- Document processing status tracking
- Processing failure handling
- Duplicate membership protection
- Duplicate knowledge-base protection
- Duplicate document protection
- Last-admin protection
- Knowledge-base deletion protection when documents exist
- Document deletion protection during processing
- Global exception handling
- Rate limiting
- File validation
- Flyway-controlled database migrations
- Environment-specific configuration

---

## Current Project Status

The core IntelliDocs product is implemented, including:

- authentication
- organizations
- membership roles
- knowledge-base management
- document management
- PDF validation and processing
- chunking and embeddings
- pgvector semantic search
- RAG question answering
- source citations
- responsive frontend
- admin/member permissions
- CSRF protection
- production-oriented application configuration

Before the final public release, the remaining work is focused on:

- production object storage
- cloud PostgreSQL/pgvector setup
- backend deployment
- frontend deployment
- CI/CD workflow
- final automated test cleanup/coverage
- screenshots and live-demo links
- final end-to-end production verification

---

## Final Completion Scope

The intended finished IntelliDocs portfolio project will include:

- Full Spring Boot backend
- Responsive React frontend
- Secure JWT + CSRF authentication flow
- Multi-tenant organization model
- Admin/member authorization
- Knowledge-base management
- Document upload and processing
- RAG pipeline
- pgvector semantic search
- Gemini integration
- Source-grounded answers
- Production cloud database
- Cloud object storage
- Dockerized backend
- CI/CD
- Public deployment
- Automated tests
- Architecture documentation
- Final production smoke testing

---

## Future Enhancements

The following are intentionally outside the core portfolio scope:

- OCR for scanned PDFs
- Additional document formats
- Streaming AI responses
- Conversation history
- Hybrid keyword + vector search
- Re-ranking models
- Refresh tokens
- Enterprise SSO
- Audit-log dashboard
- Durable queue-based document processing
- Usage analytics
- Billing/subscription support

---

## Why IntelliDocs?

IntelliDocs was built to demonstrate more than CRUD development.

The project combines:

- backend architecture
- secure authentication
- multi-tenancy
- role-based authorization
- AI integration
- vector databases
- asynchronous document processing
- responsive frontend development
- production configuration
- Docker and cloud deployment

It demonstrates practical experience designing and building a modern full-stack AI application from the database layer through the user interface and deployment architecture.

---

## Author

**Syed Siddiq**  
Software Developer

---

## License

This project is currently maintained as a portfolio and learning project. Add a formal open-source license before external distribution or community contributions.
