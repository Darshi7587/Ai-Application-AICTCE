# 🎓 AICTCE Course Outcome Mapper
## Intelligent AI-Driven Learning Outcome Management Platform

### 🚀 Built With
```
☕ Java 25  |  🌿 Spring Boot  |  🤖 Spring AI  |  ⚛️ React  |  ⚡ Vite  |  🐘 PostgreSQL  |  🧠 LLM  |  📚 RAG  |  📝 NLP
```

> **Intelligent AI-driven platform for mapping course outcomes to Bloom's taxonomy levels using Retrieval-Augmented Generation (RAG) and course outcome comparison analytics**

---

## 🌟 About AICTCE CO Mapper

AICTCE CO Mapper is an **AI-powered educational intelligence platform** built specifically for **AI & Cloud Technologies for Education (AICTCE)** universities. It empowers educators to:

- 📊 **Map Course Outcomes** to Bloom's Taxonomy levels (4-part framework)
- 🤖 **Leverage AI & RAG** for intelligent course outcome comparison and validation
- 📈 **Analyze Learning Objectives** with semantic understanding
- 🎯 **Align POs with COs** (Program Outcomes with Course Outcomes)
- 💡 **Generate Recommendations** for curriculum improvement
- 📋 **Generate Detailed Reports** for accreditation and assessment

---

## 🛠️ Tech Stack & Frameworks

### 🎨 Frontend Stack
| Framework | Icon | Purpose |
|-----------|------|---------|
| **React 18** | ⚛️ | Modern UI library with hooks & composition |
| **Vite** | ⚡ | Next-generation lightning-fast build tool |
| **JavaScript/ES6+** | 🟨 | Core programming language |
| **CSS3** | 🎨 | Responsive & modern styling |
| **Node.js** | 🟩 | Runtime environment |

### ⚙️ Backend Stack
| Framework | Icon | Purpose |
|-----------|------|---------|
| **Java 25** | ☕ | Latest JDK for cutting-edge features |
| **Spring Boot 3.x** | 🌿 | Enterprise-grade application framework |
| **Spring AI** | 🤖 | Generative AI & LLM integration |
| **Spring Data JPA** | 💾 | Data persistence layer |
| **Maven** | 🔨 | Build automation & dependency management |
| **PostgreSQL/MySQL** | 🐘 | Enterprise database |

### 🧠 AI & ML Stack
| Component | Icon | Purpose |
|-----------|------|---------|
| **LLM (GPT-4/Claude)** | 🧠 | Large Language Models |
| **RAG Engine** | 📚 | Retrieval-Augmented Generation |
| **NLP Processing** | 📝 | Natural Language Understanding |
| **Embeddings** | 🔗 | Semantic similarity & vector store |

---

## 📁 Project Architecture

```
AICTCE-CO-Mapper/
│
├── 🎨 Frontend/ (⚛️ React + ⚡ Vite)
│   ├── src/
│   │   ├── App.jsx              # Main application component
│   │   ├── main.jsx             # React entry point
│   │   ├── App.css              # Global styles 🎨
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── public/                  # Static assets
│
├── ⚙️ BackEnd/ (☕ Java + 🌿 Spring Boot)
│   ├── src/main/java/com/example/edumap/
│   │   ├── 🏛️  Entity/           # Domain models
│   │   │   ├── Course.java
│   │   │   ├── CourseOutcomes.java
│   │   │   ├── ProgramOutcomes.java
│   │   │   └── Enum/
│   │   │       └── ProgramOutcome_Constants.java
│   │   ├── 🔌 Repository/        # Data access layer (💾 Spring Data JPA)
│   │   │   ├── CourseRepo.java
│   │   │   └── CourseOutcomesRepo.java
│   │   ├── ⚡ Service/           # Business logic
│   │   │   ├── AiTools.java       # 🤖 AI integration
│   │   │   └── NlpService.java    # 🧠 NLP & RAG engine
│   │   ├── ⚙️  Configuration/     # Spring configurations
│   │   │   └── AIConfig.java      # 🤖 Spring AI setup
│   │   ├── 🎯 Controller/        # REST endpoints
│   │   └── BackEndApplication.java
│   ├── pom.xml                  # Maven dependencies (🔨)
│   ├── mvnw
│   └── src/main/resources/
│       └── application.properties
│
└── 📊 Reports/                   # Generated analytics & reports

🔗 Frameworks Used:
  Frontend:  ⚛️  React 18 + ⚡ Vite
  Backend:   ☕ Java 25 + 🌿 Spring Boot + 🤖 Spring AI
  Database:  🐘 PostgreSQL/MySQL
  Build:     🔨 Maven
  AI/ML:     🧠 LLM + 📚 RAG + 📝 NLP
```

---

## 🚀 Quick Start Guide

### ✅ Prerequisites
```bash
# Check Java version (must be 25+) ☕
java -version

# Maven version check 🔨
mvn -v

# Node.js & npm check 🟩
node --version
npm --version
```

**Required:**
- ✅ **Java 25+** ☕
- ✅ **Maven 3.8+** 🔨
- ✅ **Node.js 18+** 🟩
- ✅ **npm 9+** 📦

---

### 🎨 Frontend Setup (⚛️ React + ⚡ Vite)

```bash
# Navigate to frontend
cd Frontend

# Install dependencies 📦
npm install

# Start development server ⚡
npm run dev

# Built-in: Hot module reloading, instant feedback
# Access: http://localhost:5173
```

**Available Scripts (⚛️ React):**
```bash
npm run dev      # 🔄 Development server with HMR
npm run build    # 📦 Production build (optimized)
npm run preview  # 👁️  Preview production build
npm run lint     # ✓ ESLint validation
```

---

### ⚙️ Backend Setup (☕ Java + 🌿 Spring Boot)

```bash
# Navigate to backend
cd BackEnd

# Verify Java 25+ ☕
./mvnw -v

# Build project with Spring AI dependencies 🤖
./mvnw clean install

# Run Spring Boot application 🌿
./mvnw spring-boot:run

# Alternative: Package and run JAR
./mvnw clean package
java -jar target/aictce-co-mapper-1.0.0.jar

# Run tests ✓
./mvnw test
```

**Default Endpoints:**
- 🌐 API Base: `http://localhost:8080/api`
- 📚 Swagger UI: `http://localhost:8080/swagger-ui.html`
- 🔍 H2 Console: `http://localhost:8080/h2-console`

---

## 🎯 Core Features

### 1️⃣ **4-Part Course Outcome Comparison Framework**
```
📝 Sub-Part 1: Extract course descriptions via RAG (📚)
    ↓
🔍 Sub-Part 2: Identify learning objectives using AI (🤖)
    ↓
📊 Sub-Part 3: Map to Bloom's Taxonomy levels (4 cognitive levels)
    ↓
✓ Sub-Part 4: Compare & validate with program outcomes
```

### 2️⃣ **AI-Powered Features** (🤖 Spring AI)
- 🤖 **LLM Integration** - Generative AI for outcome analysis
- 📚 **RAG System** - Retrieval-Augmented Generation for accurate mapping
- 🧠 **NLP Engine** - Semantic understanding of course content
- 💬 **Bloom's Classification** - Automatic taxonomy level assignment

### 3️⃣ **University Management**
- 📚 **Course Catalog** - Comprehensive course management (💾 JPA)
- 🎯 **Outcome Mapping** - CO to PO alignment
- 📊 **Analytics Dashboard** - Real-time insights (⚛️ React)
- 📄 **Report Generation** - Accreditation-ready documentation
- 👥 **Multi-User Support** - Faculty & admin roles (🌿 Spring Security)

### 4️⃣ **Data & Insights**
- 📈 Learning outcome trends
- 🎓 Bloom's taxonomy distribution
- ✓ Compliance tracking
- 📉 Performance analytics

---

## ⚡ Configuration

### Backend Configuration (`application.properties`) 🌿
```properties
# Spring Boot 🌿
spring.application.name=aictce-co-mapper
server.port=8080

# Spring AI 🤖 (LLM Integration)
spring.ai.openai.api-key=${OPENAI_API_KEY}
spring.ai.openai.chat.options.model=gpt-4
spring.ai.vectorstore.qdrant.host=localhost

# Database 🐘 (PostgreSQL/MySQL)
spring.datasource.url=jdbc:mysql://localhost:3306/aictce_co_mapper
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# JPA Configuration 💾
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# Logging
logging.level.root=INFO
logging.level.com.example.edumap=DEBUG
logging.level.org.springframework.ai=DEBUG
```

---

## 📊 Database Schema (🐘 PostgreSQL/MySQL)

### Key Entities

#### Course (via Spring Data JPA)
```
┌─────────────────────┐
│ Course              │
├─────────────────────┤
│ id (PK)             │
│ courseCode          │
│ courseName          │
│ description         │
│ credits             │
│ semester            │
└─────────────────────┘
```

#### CourseOutcomes (CO Mapping)
```
┌──────────────────────────────┐
│ CourseOutcomes               │
├──────────────────────────────┤
│ id (PK)                      │
│ courseId (FK)                │
│ outcome (description)         │
│ bloomLevel (1-4)             │
│ cognitiveLevel               │
│ createdAt                    │
└──────────────────────────────┘
```

#### ProgramOutcomes (PO Framework)
```
┌─────────────────────────┐
│ ProgramOutcomes         │
├─────────────────────────┤
│ id (PK)                 │
│ poCode                  │
│ description             │
│ bloomLevel              │
│ department              │
└─────────────────────────┘
```

---

## 🔗 API Endpoints (🌿 Spring Boot)

### Courses (🔌 REST Controller)
- `GET /api/courses` - List all courses
- `POST /api/courses` - Create course
- `GET /api/courses/{id}` - Get course details
- `PUT /api/courses/{id}` - Update course
- `DELETE /api/courses/{id}` - Delete course

### AI Tools (🤖 Spring AI Service)
- `POST /api/ai/analyze-outcomes` - Analyze course outcomes with LLM
- `POST /api/ai/map-to-bloom` - Map outcomes to Bloom's levels
- `POST /api/ai/compare-outcomes` - Compare CO with PO using RAG
- `GET /api/ai/suggestions` - Get AI recommendations

### Course Outcomes (💾 JPA Repository)
- `GET /api/courses/{id}/outcomes` - Get all outcomes for a course
- `POST /api/courses/{id}/outcomes` - Add new outcome
- `PUT /api/outcomes/{id}` - Update outcome
- `DELETE /api/outcomes/{id}` - Delete outcome

---

## 🤖 AI & RAG Implementation (Spring AI)

### Spring AI Configuration (⚙️)
```java
@Configuration
public class AIConfig {
    
    // 🤖 LLM Chat Client
    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        return builder
            .defaultSystem("You are an expert AICTCE curriculum specialist...")
            .build();
    }
    
    // 📚 Embedding Client for RAG
    @Bean
    public EmbeddingClient embeddingClient() {
        return new OpenAiEmbeddingClient(apiKey);
    }
    
    // 🔄 Vector Store for Semantic Search
    @Bean
    public VectorStore vectorStore(EmbeddingClient embeddingClient) {
        return new QdrantVectorStore(embeddingClient);
    }
}
```

### NLP Service (🧠 RAG Engine)
```java
@Service
public class NlpService {
    
    // 4-Part Comparison Framework
    private List<String> extractDescriptions(String courseData);      // 📝 RAG
    private List<String> identifyObjectives(String courseData);       // 🔍 LLM
    private List<BloomLevel> mapToBloom(List<String> objectives);     // 📊 AI
    private List<ComparisonResult> compareWithPO(List<COutcome> cos); // ✓ Validation
}
```

---

## 📋 Development Workflow

### Run Full Stack
```bash
# Terminal 1: Backend (☕ Java + 🌿 Spring Boot) 🚀
cd BackEnd
./mvnw spring-boot:run

# Terminal 2: Frontend (⚛️ React + ⚡ Vite) ⚡
cd Frontend
npm run dev

---

## 🧪 Testing

```bash
# Backend tests (Maven) 🔨
cd BackEnd
./mvnw test

# Frontend tests (Vite) ⚡
cd Frontend
npm run test
```

---

## 📚 Bloom's Taxonomy Levels

| Level | Identifier | Icon | Examples |
|-------|-----------|------|----------|
| 📍 **1** | Remember | 🎯 | Define, List, State |
| 📍 **2** | Understand | 💡 | Explain, Classify, Discuss |
| 📍 **3** | Apply | ⚙️ | Solve, Prepare, Exam |
| 📍 **4** | Analyze+ | 🚀 | Evaluate, Create, Design |

---

## 🎓 AICTCE University Integration

This platform is specifically designed for **AICTCE (AI & Cloud Technologies for Education)** institutions to:

✅ Streamline curriculum mapping  
✅ Ensure PO-CO alignment  
✅ Generate accreditation reports  
✅ Track learning effectiveness  
✅ Support continuous improvement  

---

## 🤝 Contributing

We welcome contributions from educators, developers, and AI enthusiasts!

```bash
# Fork the repo
# Create feature branch: git checkout -b feature/amazing-feature
# Commit changes: git commit -m 'Add amazing feature'
# Push to branch: git push origin feature/amazing-feature
# Open Pull Request
```



## 🚀 Technology Stack Overview

```
┌─────────────────────────────────────────────────────┐
│        🎓 AICTCE Course Outcome Mapper             │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend Layer (⚛️ React + ⚡ Vite)               │
│  └─ Component-based UI with hot reloading         │
│                                                     │
│  API Layer (🌿 Spring Boot REST)                  │
│  └─ RESTful endpoints with OpenAPI docs           │
│                                                     │
│  Business Logic (🤖 Spring AI + 📚 RAG)           │
│  └─ AI-driven outcome analysis & mapping          │
│                                                     │
│  Data Layer (💾 Spring Data JPA + 🐘 DB)          │
│  └─ Persistent storage with ORM mapping           │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

