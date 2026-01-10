# Changelog

All notable changes to the CS Excellence Portal are documented in this file.

---

## [2.0.0] - 2026-01-09

### Added

#### Audit Log System

- **Enhanced Audit Logging** - Tracks user email, name, role, action, target, device info, location
- **Device Detection** (`lib/device-utils.ts`) - Extracts browser, OS, and device type from user agent
- **IP/Location API** (`app/api/audit/route.ts`) - Geolocation lookup using ip-api.com
- **Audit Service** (`lib/audit-service.ts`) - Client-side service for creating comprehensive audit logs
- **Audit Logs Viewer** (`app/admin/audit-logs/page.tsx`) - Admin page with filters, search, and export

#### System Settings

- **Settings Store** (`lib/settings-store.ts`) - Persistent settings with localStorage
- **Flexible Term Management** - Add, edit, delete academic terms with optional dates
- **Functional Maintenance Mode** - Actually blocks student access when enabled
- **Registration Control** - Login form respects "Allow Registrations" setting
- **Settings Persistence** - All toggles save and persist across sessions

#### Admin Features

- **Enhanced User Management** (`app/admin/users/page.tsx`)
  - Stats cards (total, admins, students, active)
  - Search by name, email, faculty
  - Filter by role and status
  - Promote/demote users (Admin ↔ Student)
  - Activate/deactivate users
  - Add new users with modal
  - Activity tracking from submissions

#### Historical Filters

- **Submissions Page Filters** (`app/admin/submissions/page.tsx`)
  - Date range picker
  - Category dropdown filter
  - Status filter
  - Enhanced search (name, email, title)
  - Export respects filters

#### UI/UX Improvements

- **Animation Utilities** (`lib/animations.tsx`)
  - Fade, scale, slide animation variants
  - Stagger container/item for lists
  - Animated button and card components
  - Page transition wrapper
- **Mobile Responsiveness** (`app/globals.css`)
  - 44px minimum touch targets
  - iOS zoom prevention
  - Responsive table scrolling
  - Shimmer loading animation
  - Reduced motion support

### Changed

- Login form now checks registration setting before showing "Create Account" link
- Submissions page uses enhanced audit logging for all actions
- User management page completely redesigned

### Fixed

- Fixed hydration mismatch warnings with `suppressHydrationWarning`
- Fixed duplicate term keys in settings

---

## [1.0.0] - 2026-01-07

### Added

- Initial release
- Student submission form
- Admin review panel
- Basic authentication with NextAuth
- Category browsing
- Dashboard for students and admins
- Analytics page with charts
- Toast notification system
- Global search functionality
- PWA support
- Theme toggling (light/dark)
