# 🏛️ Polity - Democracy Reimagined

> **Empowering communities, organizations, and governments with collaborative decision-making tools for the digital age.**

[![Open Source](https://img.shields.io/badge/Open%20Source-%E2%9D%A4%EF%B8%8F-green)](https://github.com/Donnerstagnacht/polity-instant)
[![Early Alpha](https://img.shields.io/badge/Status-Early%20Alpha-orange)](#)

## 🚀 What is Polity?

Polity is a modern platform for democratic processes, enabling:

- 📝 **Collaborative Document Editing** - Work together on amendments and proposals
- 🗳️ **Democratic Voting** - Conduct transparent and secure voting processes
- 👥 **Group Management** - Organize parties, NGOs, and communities
- 📅 **Event Planning** - Schedule meetings and democratic assemblies
- 💬 **AI-Powered Assistant** - Get help from Aria & Kai, your democratic companions
- 🔐 **Secure & Transparent** - Open source with privacy-first approach

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Donnerstagnacht/polity-instant.git
cd polity-instant

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser 🎉

## 🛠️ Development

### Building for Production

```bash
npm run build
```

### 🧪 Testing

Run tests with [Vitest](https://vitest.dev/) and [Playwright](https://playwright.dev/):

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

### 🎨 Code Quality

```bash
# Format code with Prettier
npm run format
npm run format:check

# Lint with ESLint
npm run lint
npm run lint:fix
```

### 🎭 UI Components

Add components using [Shadcn UI](https://ui.shadcn.com/):

```bash
pnpx shadcn@latest add button
```

## 🏗️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Database**: [InstantDB](https://instantdb.com/) - Realtime database with permissions
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Editor**: [Plate.js](https://platejs.org/) - Rich text collaborative editor
- **AI**: Custom AI assistants (Aria & Kai) for democratic guidance
- **Auth**: Magic link authentication via InstantDB
- **Testing**: Vitest + Playwright

## 🤝 Contributing

We welcome contributions! There are multiple ways to help:

- 💻 **Code**: Fix bugs, add features, improve tests
- 🎨 **Design**: Improve UX/UI, create flows ([Figma](https://www.figma.com/proto/cAT8Aonu8P7ojwgnKcVlkz/Polity))
- 📝 **Documentation**: Write guides, tutorials, API docs
- 🐛 **Testing**: Report bugs, write test cases
- 💰 **Support**: Help sustain the project ([Support Page](/support))

Check out our [GitHub repository](https://github.com/Donnerstagnacht/polity-instant) to get started!

## 🎨 Timeline Feature

Polity features a **Pinterest/Instagram-style discovery timeline** with three distinct modes:

### Timeline Modes

- **📌 Following** - Content from groups, events, and amendments you subscribe to
- **🔭 Explore** - Discover trending content, popular topics, and new groups to join
- **🖥️ Decisions** - Bloomberg-style terminal for active votes and elections

### Content Cards

The timeline displays rich content cards for:

- 👥 Groups - Community cards with member counts and topics
- 📅 Events - Event cards with dates and participation status
- 📝 Amendments - Amendment cards with workflow status and voting
- 🗳️ Votes - Live vote cards with progress bars and countdowns
- 🏛️ Elections - Election cards with candidate info and phases
- ✅ Todos - Task cards with completion status
- 📰 Blogs - Blog post cards with previews
- 💬 Statements - Statement cards with discussion counts

### Discovery Features

- **Topic Filtering** - Filter by topics like Climate, Transport, Budget, Education
- **Gradient Cards** - Beautiful gradient headers for visual variety
- **Reactions** - Support, Oppose, or show Interest in content
- **Real-time Updates** - Live updates via InstantDB subscriptions
- **Infinite Scroll** - Smooth loading of more content
- **Responsive Design** - Masonry grid adapts from 1-4 columns

## 📄 Project Structure

```
app/              # Next.js App Router pages
src/
  components/     # Reusable UI components
  features/       # Feature-specific code
  hooks/          # Custom React hooks
  utils/          # Utility functions
e2e/              # End-to-end tests
scripts/          # Database seeding scripts
instant.*.ts      # InstantDB configuration
```

## 📜 License

Open Source - Building tools for democracy, together.

## 💬 Community

- **Email**: tobias.hassebrock@gmail.com
- **GitHub**: [Donnerstagnacht/polity-instant](https://github.com/Donnerstagnacht/polity-instant)

---

**⚠️ Note**: This is an early alpha version. Database overwrites can happen. Use with caution!
