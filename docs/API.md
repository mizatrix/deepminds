# API & Library Documentation

## Settings Store (`lib/settings-store.ts`)

### Types

```typescript
interface AcademicTerm {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    createdAt: string;
}

interface SystemSettings {
    portalName: string;
    terms: AcademicTerm[];
    maintenanceMode: boolean;
    allowRegistrations: boolean;
    emailNotifications: boolean;
    autoApproveScientific: boolean;
}
```

### Functions

| Function | Description |
|----------|-------------|
| `getSettings()` | Returns current system settings |
| `saveSettings(settings)` | Persists settings to localStorage |
| `getActiveTerm()` | Returns the currently active term |
| `setActiveTerm(termId)` | Sets a term as active |
| `addTerm(name, startDate?, endDate?)` | Creates a new term |
| `updateTerm(termId, updates)` | Updates an existing term |
| `deleteTerm(termId)` | Removes a term (except active) |
| `isMaintenanceMode()` | Returns maintenance mode status |
| `isRegistrationAllowed()` | Returns registration status |

---

## Audit Service (`lib/audit-service.ts`)

### Creating Audit Logs

```typescript
import { createEnhancedAuditLog } from '@/lib/audit-service';

await createEnhancedAuditLog({
    userEmail: 'user@example.com',
    userName: 'John Doe',
    userRole: 'ADMIN', // or 'STUDENT'
    action: 'approve', // login, logout, submit, approve, reject, delete
    targetType: 'submission', // submission, user, system
    targetId: 'sub_123',
    targetTitle: 'Scientific Paper',
    details: 'Optional description'
});
```

### Utility Functions

| Function | Description |
|----------|-------------|
| `getAllAuditLogs()` | Returns all audit logs sorted by date |
| `formatAuditAction(action)` | Returns human-readable action name |
| `getActionColor(action)` | Returns Tailwind color class for action |

---

## Submissions (`lib/submissions.ts`)

### Types

```typescript
interface Submission {
    id: string;
    studentName: string;
    studentEmail: string;
    title: string;
    description: string;
    category: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    adminFeedback?: string;
    points?: number;
    attachments?: string[];
}
```

### Functions

| Function | Description |
|----------|-------------|
| `getSubmissions()` | Returns all submissions |
| `getSubmissionById(id)` | Returns a single submission |
| `createSubmission(data)` | Creates a new submission |
| `updateSubmission(id, updates)` | Updates a submission |
| `deleteSubmission(id)` | Removes a submission |
| `getSubmissionsByStudent(email)` | Filter by student |

---

## Animation Utilities (`lib/animations.tsx`)

### Components

```tsx
import { 
    AnimatedButton,
    AnimatedCard,
    PageTransition,
    StaggerContainer,
    StaggerItem,
    FadeInDiv
} from '@/lib/animations';

// Animated button
<AnimatedButton className="btn">Click Me</AnimatedButton>

// Card with hover effect
<AnimatedCard className="card">Content</AnimatedCard>

// Page wrapper
<PageTransition>
    <YourPage />
</PageTransition>

// Staggered list
<StaggerContainer className="grid">
    {items.map(item => (
        <StaggerItem key={item.id}>
            <Card>{item.name}</Card>
        </StaggerItem>
    ))}
</StaggerContainer>
```

### Animation Variants

| Variant | Use Case |
|---------|----------|
| `fadeIn` | Fade with slight Y movement |
| `scaleIn` | Scale up from 95% |
| `slideInLeft/Right/Up` | Directional slides |
| `staggerContainer` | Parent for staggered children |
| `staggerItem` | Child of stagger container |
| `buttonHover/buttonPress` | Button interactions |
| `cardHover` | Card lift on hover |
| `pulse` | Repeating attention effect |
| `shake` | Error feedback |

---

## Device Utils (`lib/device-utils.ts`)

### Functions

```typescript
import { parseUserAgent, getDeviceType } from '@/lib/device-utils';

const info = parseUserAgent(navigator.userAgent);
// Returns: { browser, browserVersion, os, deviceType }

const type = getDeviceType(navigator.userAgent);
// Returns: 'desktop' | 'mobile' | 'tablet'
```

---

## API Endpoints

### POST `/api/audit`

Captures client IP and performs geolocation lookup.

**Request Body:**

```json
{
    "userAgent": "Mozilla/5.0..."
}
```

**Response:**

```json
{
    "ip": "192.168.1.1",
    "city": "Cairo",
    "country": "Egypt",
    "userAgent": "Mozilla/5.0...",
    "deviceType": "desktop",
    "browser": "Chrome",
    "browserVersion": "120",
    "os": "Windows"
}
```
