# 📚 Data Engineering Roadmap Tracker

A personalized learning roadmap tracker built with Next.js, designed specifically for tracking your data engineering journey. Unlike generic productivity tools like Notion, this tracker is tailored for structured learning paths with phases, sections, topics, and progress visualization.

![Home Page](./images/1-Home%20Page.png)

## 🎯 Why This Project?

As someone learning data engineering, I wanted a tool that truly understood my learning workflow—not a generic note-taking app adapted for learning. I needed:

- **Structured Learning Paths**: Organized by phases and sections
- **Granular Progress Tracking**: Track topics, tasks, and resources at multiple levels
- **Visual Progress**: Charts and statistics to see my learning journey
- **Rich Note-Taking**: With TipTap editor for technical documentation
- **Resource Management**: Link courses, YouTube videos, books, and documentation
- **Project Showcase**: Document your data engineering projects with images

## ✨ Features

### 📊 Dashboard
Track your overall progress with visual charts and statistics.

![Dashboard](./images/2-%20Dashboard.png)

### 🗺️ Interactive Roadmap
Navigate through your learning phases and sections with a clear, organized structure.

![Roadmap](./images/3-%20Roadmap.png)

### 📝 Rich Note Editor
Create detailed notes with syntax highlighting, code blocks, and formatting.

![Note Creation](./images/4-%20Création%20de%20Notes.png)

### 🔗 Resource Management
Organize all your learning resources in one place.

![Resources](./images/5-%20Ressources.png)

### 💼 Projects Section
Showcase your data engineering projects with descriptions and images.

![Projects Section](./images/6-%20Pojects%20Section.png)

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Rich Text Editor**: TipTap
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Storage**: Local JSON files (easily adaptable to database)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd de-roadmap-tracker
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:4002](http://localhost:4002) with your browser

### Project Structure

```
├── src/
│   ├── app/                 # Next.js app router pages
│   │   ├── api/            # API routes for data management
│   │   ├── dashboard/      # Dashboard page
│   │   ├── roadmap/        # Roadmap pages
│   │   ├── notes/          # Notes management
│   │   ├── projects/       # Projects showcase
│   │   └── resources/      # Learning resources
│   ├── components/         # React components
│   │   ├── dashboard/      # Dashboard charts
│   │   ├── roadmap/        # Roadmap components
│   │   ├── notes/          # Note editor and list
│   │   └── ui/             # UI components
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   └── lib/                # Utility functions
├── data/                   # JSON data storage
│   ├── roadmap.json       # Learning roadmap structure
│   ├── progress.json      # Progress tracking
│   ├── notes.json         # Learning notes
│   ├── projects.json      # Project portfolio
│   └── resources.json     # Learning resources
└── public/                 # Static assets
```

## 📦 Key Features in Detail

### Roadmap Structure
- **Phases**: High-level learning stages (e.g., Fundamentals, Advanced)
- **Sections**: Specific topics within phases (e.g., Python, SQL)
- **Topics**: Granular learning items within sections
- **Tasks**: Action items for each topic
- **Notes**: Detailed documentation with rich text
- **Attachments**: Links and files for reference

### Progress Tracking
- Section-level completion tracking
- Topic-level task management
- Overall progress visualization
- Activity timeline
- Phase-based progress charts

### Note Management
- Rich text editor with TipTap
- Syntax highlighting for code
- Markdown support
- Tag-based organization
- Search functionality

### Resource Library
- Categorize by type (YouTube, Course, Book, Documentation)
- Track completion status
- Store metadata (author, platform, URL)
- Link resources to specific sections

### Project Showcase
- Document your completed projects
- Add project images
- Link to GitHub repositories
- Track technologies used

## 🎨 Customization

The tracker is built to be easily customizable:

1. **Data Structure**: Modify types in `src/types/index.ts`
2. **Roadmap Content**: Edit `data/roadmap.json` to match your learning path
3. **Styling**: Customize Tailwind classes in components
4. **API Routes**: Extend functionality in `src/app/api/`

## 📄 License

This project is open source and available for anyone to use and modify for their learning journey.

## 🤝 Contributing

While this was built as a personal tool, contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Share how you're using it for your learning

## 💡 Inspiration

This project was born from the frustration of trying to adapt generic productivity tools for learning. Sometimes the best tool is one you build yourself, tailored exactly to your needs.

---

**Happy Learning! 🚀**
