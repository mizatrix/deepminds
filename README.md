# CS Excellence Portal

A comprehensive academic achievement tracking platform built with Next.js 15, designed for managing student submissions, admin reviews, and academic excellence recognition.

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | <admin@example.com> | Admin@123456! |
| Student | <student@example.com> | Student@123456! |

---

## ✨ Features

### 📝 Submission Management

- Students submit achievements across 12 categories (Scientific, Sports, Artistic, Competitions, etc.)
- File attachments with base64 storage
- Status tracking (pending, approved, rejected)
- Points awarded on approval

### 👨‍💼 Admin Panel

- **Dashboard** - Overview of platform activity
- **Submissions** - Review, approve, reject with filters
- **Users** - Manage users, roles, and permissions
- **Analytics** - Charts and statistics
- **Audit Logs** - Track all system activity
- **Settings** - Configure platform behavior

### 🔐 Authentication & Security

- NextAuth.js authentication
- Role-based access (Admin/Student)
- Maintenance mode for scheduled downtime
- Registration control toggle

### 📊 Analytics & Reporting

- Submission velocity charts
- Category distribution pie charts
- Monthly target tracking
- Real-time KPI cards
- Export to CSV/PDF

### 📋 Audit Logging

- Complete activity tracking
- Device and browser detection
- IP and location logging
- Filterable audit log viewer

### ⚙️ System Settings

- **Flexible Term Management** - Add/edit/delete academic terms
- **Maintenance Mode** - Block student access when enabled
- **Registration Control** - Enable/disable new sign-ups
- **Email Notifications** - Toggle for status updates
- All settings persist to localStorage

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15.1 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Auth | NextAuth.js |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Storage | localStorage (client-side) |

---

## 📁 Project Structure

```
app/
├── admin/
│   ├── analytics/     # Platform analytics
│   ├── audit-logs/    # Activity logging
│   ├── dashboard/     # Admin overview
│   ├── settings/      # System configuration
│   ├── submissions/   # Review submissions
│   └── users/         # User management
├── api/
│   ├── auth/          # NextAuth endpoints
│   └── audit/         # Audit log API
├── login/             # Authentication page
├── register/          # User registration
└── student/           # Student dashboard

components/
├── admin/             # Admin-specific components
├── auth/              # Authentication forms
├── providers/         # Context providers
├── search/            # Global search
├── ui/                # Reusable UI components
├── pwa/               # PWA components
└── a11y/              # Accessibility components

lib/
├── submissions.ts     # Submission management
├── settings-store.ts  # Settings persistence
├── audit-service.ts   # Audit logging
├── device-utils.ts    # Device detection
├── animations.tsx     # Animation utilities
└── RoleContext.tsx    # Role management
```

---

## 🔧 Key Files

### Settings & Configuration

- `lib/settings-store.ts` - System settings with localStorage persistence
- `app/admin/settings/page.tsx` - Settings UI with term management

### Audit System

- `lib/audit-service.ts` - Enhanced audit log creation
- `lib/device-utils.ts` - Device/browser detection
- `app/api/audit/route.ts` - IP/location lookup API
- `app/admin/audit-logs/page.tsx` - Audit log viewer

### User Management

- `app/admin/users/page.tsx` - Full user CRUD with role management
- `lib/RoleContext.tsx` - Role-based access control

### Submissions

- `lib/submissions.ts` - Submission CRUD operations
- `app/admin/submissions/page.tsx` - Review with filters

---

## 🎨 UI Features

### Animations (`lib/animations.tsx`)

```tsx
import { AnimatedButton, AnimatedCard, PageTransition } from '@/lib/animations';

// Button with press/hover effects
<AnimatedButton>Click Me</AnimatedButton>

// Card with hover lift
<AnimatedCard>Content</AnimatedCard>

// Page transition wrapper
<PageTransition>{children}</PageTransition>
```

### CSS Utilities (`globals.css`)

- `.glass` - Glassmorphism effect
- `.card-hover` - Card lift on hover
- `.btn-press` - Button press animation
- `.shimmer` - Loading shimmer effect
- `.animate-in` - Page entry animation

---

## 📱 Mobile Support

- 44px minimum touch targets
- iOS zoom prevention
- Responsive tables with horizontal scroll
- Smooth page scrolling
- Reduced motion preference support

---

## 🔒 Admin Settings

Access via `/admin/settings`:

| Setting | Description |
|---------|-------------|
| Portal Name | Customize the platform name |
| Academic Terms | Add/edit/delete semesters with dates |
| Maintenance Mode | Block all student access |
| Allow Registrations | Show/hide registration option |
| Email Notifications | Enable status update emails |
| Auto-Approve Scientific | Auto-approve journal papers |

---

## 📝 License

This project is for educational purposes as part of MSA University academic requirements.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request
