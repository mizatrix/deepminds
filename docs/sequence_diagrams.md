# System Sequence Diagrams

This document contains Mermaid sequence diagrams for all user roles and functions.

---

## Student Role

### 1. Registration & Login Flow

```mermaid
sequenceDiagram
    actor S as Student
    participant LP as Login Page
    participant API as /api/auth
    participant DB as Database
    participant Auth as NextAuth

    Note over S,Auth: Registration Flow
    S->>LP: Click "Create Account"
    S->>LP: Fill registration form
    LP->>API: POST /api/auth/register
    API->>DB: Check email exists
    alt Email exists
        DB-->>API: User found
        API-->>LP: Error: Email in use
    else New user
        DB-->>API: No user
        API->>DB: Create user (hashed password)
        DB-->>API: User created
        API-->>LP: Success
        LP-->>S: Redirect to login
    end

    Note over S,Auth: Login Flow
    S->>LP: Enter credentials
    LP->>Auth: signIn("credentials")
    Auth->>DB: Validate credentials
    alt Valid
        DB-->>Auth: User data
        Auth-->>LP: Session created
        LP-->>S: Redirect to /student/dashboard
    else Invalid
        Auth-->>LP: Error
        LP-->>S: Show error message
    end
```

### 2. Submit Achievement Flow

```mermaid
sequenceDiagram
    actor S as Student
    participant UI as Dashboard
    participant R2 as Cloudflare R2
    participant SA as Server Action
    participant DB as Database
    participant NS as Notification Service

    S->>UI: Fill achievement form
    S->>UI: Attach evidence file
    UI->>R2: Upload file
    R2-->>UI: File URL
    UI->>SA: createSubmission(data)
    SA->>DB: Check autoApproveScientific setting
    
    alt Scientific + AutoApprove ON
        SA->>DB: Create submission (APPROVED)
        SA->>NS: notifySubmissionApproved()
        SA->>SA: checkAndAwardBadges()
        SA-->>UI: Submission approved
        UI-->>S: "Achievement auto-approved!"
    else Normal flow
        SA->>DB: Create submission (PENDING)
        SA->>NS: notifyNewSubmission(admins)
        SA-->>UI: Submission created
        UI-->>S: "Submitted for review"
    end
```

### 3. Edit Pending Submission Flow

```mermaid
sequenceDiagram
    actor S as Student
    participant UI as Dashboard
    participant SA as Server Action
    participant DB as Database

    S->>UI: Click Edit on pending submission
    UI-->>S: Confirm dialog
    S->>UI: Confirm edit
    UI->>SA: getSubmissionById(id)
    SA->>DB: Fetch submission
    DB-->>SA: Submission data
    SA-->>UI: Submission details
    UI-->>S: Edit modal with form

    S->>UI: Modify fields
    S->>UI: Click Save
    UI-->>S: Confirm dialog
    S->>UI: Confirm save
    UI->>SA: updateSubmission(id, updates)
    SA->>DB: Check status === PENDING
    alt Status is PENDING
        SA->>DB: Update submission
        DB-->>SA: Updated
        SA-->>UI: Success
        UI-->>S: "Changes saved"
    else Not PENDING
        SA-->>UI: Error
        UI-->>S: "Cannot edit reviewed submission"
    end
```

### 4. View Notifications Flow

```mermaid
sequenceDiagram
    actor S as Student
    participant NB as Notification Bell
    participant SA as Server Action
    participant DB as Database

    Note over S,DB: On page load (polling every 10s)
    NB->>SA: getUnreadNotifications(email)
    SA->>DB: SELECT unread notifications
    DB-->>SA: Notifications[]
    SA-->>NB: Count + list
    NB-->>S: Show badge count

    S->>NB: Click notification
    NB->>SA: markAsRead(id)
    SA->>DB: UPDATE isRead = true
    DB-->>SA: Updated
    SA-->>NB: Success
    NB-->>S: Navigate to submission
```

---

## Admin Role

### 5. Review Submission Flow

```mermaid
sequenceDiagram
    actor A as Admin
    participant UI as Admin Panel
    participant SA as Server Action
    participant DB as Database
    participant NS as Notification Service
    participant ES as Email Service
    participant AL as Audit Log

    A->>UI: Navigate to /admin/submissions
    UI->>SA: getSubmissions()
    SA->>DB: SELECT pending submissions
    DB-->>SA: Submissions[]
    SA-->>UI: List submissions
    UI-->>A: Display table

    A->>UI: Click submission
    UI-->>A: Show details modal

    alt Approve
        A->>UI: Click Approve + set points
        UI->>SA: updateSubmission(id, {status:'approved', points})
        SA->>DB: UPDATE submission
        SA->>NS: notifySubmissionApproved()
        SA->>ES: Send approval email
        SA->>SA: checkAndAwardBadges()
        SA->>AL: Log action
        SA-->>UI: Success
        UI-->>A: Refresh list
    else Reject
        A->>UI: Click Reject + add feedback
        UI->>SA: updateSubmission(id, {status:'rejected', feedback})
        SA->>DB: UPDATE submission
        SA->>NS: notifySubmissionRejected()
        SA->>ES: Send rejection email
        SA->>AL: Log action
        SA-->>UI: Success
        UI-->>A: Refresh list
    end
```

### 6. Manage Users Flow

```mermaid
sequenceDiagram
    actor A as Admin
    participant UI as /admin/users
    participant SA as Server Action
    participant DB as Database

    A->>UI: Navigate to users page
    UI->>SA: getAllUsers()
    SA->>DB: SELECT users
    DB-->>SA: Users[]
    SA-->>UI: User list
    UI-->>A: Display table with stats

    A->>UI: Search/filter users
    UI-->>A: Filtered results

    alt Deactivate User
        A->>UI: Click Deactivate
        UI->>SA: deactivateUser(id)
        SA->>DB: UPDATE isActive = false
        SA-->>UI: Success
        UI-->>A: User deactivated
    else Create New User
        A->>UI: Click Add User
        A->>UI: Fill form
        UI->>SA: createUser(data)
        SA->>DB: INSERT user
        SA-->>UI: Success
        UI-->>A: User created
    end
```

### 7. System Settings Flow

```mermaid
sequenceDiagram
    actor A as Admin
    participant UI as /admin/settings
    participant SA as Server Action
    participant DB as Database

    A->>UI: Open settings page
    UI->>SA: getSystemSettings()
    SA->>DB: SELECT settings
    DB-->>SA: Settings data
    SA-->>UI: Current settings
    UI-->>A: Display settings form

    A->>UI: Toggle setting (e.g., autoApproveScientific)
    UI->>SA: saveSystemSettings(newSettings)
    SA->>DB: UPSERT settings
    DB-->>SA: Saved
    SA-->>UI: Success
    UI-->>A: "Settings saved"
```

---

## Super Admin Role

### 8. Promote/Demote User Flow

```mermaid
sequenceDiagram
    actor SA as Super Admin
    participant UI as /admin/users
    participant Act as Server Action
    participant DB as Database
    participant NS as Notification Service

    SA->>UI: View user list
    SA->>UI: Click Promote on STUDENT

    UI->>Act: promoteUserRole(userId)
    Act->>DB: Get current user (verify SUPER_ADMIN)
    Act->>DB: Get target user
    
    alt Target is STUDENT
        Act->>DB: UPDATE role = 'ADMIN'
        Act->>NS: notifyRolePromotion()
        Act-->>UI: Success (newRole: ADMIN)
        UI-->>SA: User is now Admin
    else Target is ADMIN
        Act->>DB: Check no existing SUPER_ADMIN
        alt Can promote
            Act->>DB: UPDATE role = 'SUPER_ADMIN'
            Act-->>UI: Success
            UI-->>SA: User is now Super Admin
        else Already exists
            Act-->>UI: Error: Only 1 Super Admin allowed
        end
    end

    Note over SA,NS: Demote Flow
    SA->>UI: Click Demote on ADMIN
    UI->>Act: demoteUserRole(userId)
    Act->>DB: Verify caller is SUPER_ADMIN
    Act->>DB: Check target is not SUPER_ADMIN
    Act->>DB: UPDATE role = 'STUDENT'
    Act-->>UI: Success
    UI-->>SA: User demoted to Student
```

### 9. View Audit Logs Flow

```mermaid
sequenceDiagram
    actor SA as Super Admin
    participant UI as /admin/audit-logs
    participant API as /api/audit
    participant DB as Database

    SA->>UI: Navigate to audit logs
    UI->>API: GET /api/audit
    API->>DB: SELECT audit_logs (paginated)
    DB-->>API: Logs[]
    API-->>UI: Audit entries

    UI-->>SA: Display logs table

    SA->>UI: Apply filters (date, action, device)
    UI->>API: GET /api/audit?filters
    API->>DB: SELECT with filters
    DB-->>API: Filtered logs
    API-->>UI: Results
    UI-->>SA: Updated table
```

---

## Cross-Role: Authentication Flow

### 10. OAuth Login Flow

```mermaid
sequenceDiagram
    actor U as User
    participant LP as Login Page
    participant Auth as NextAuth
    participant OAuth as Google/GitHub
    participant DB as Database
    participant CB as Callbacks

    U->>LP: Click "Continue with Google"
    LP->>Auth: signIn("google")
    Auth->>OAuth: Redirect to OAuth provider
    OAuth-->>U: Consent screen
    U->>OAuth: Approve
    OAuth-->>Auth: Authorization code
    Auth->>OAuth: Exchange for tokens
    OAuth-->>Auth: User profile

    Auth->>CB: signIn callback
    CB->>DB: Check user exists
    alt New user
        CB->>DB: Create user
        CB->>DB: Set role = STUDENT
    else Existing user
        CB->>DB: Update lastLogin
    end
    CB-->>Auth: Allow sign in

    Auth->>CB: jwt callback
    CB->>DB: Get user role
    CB-->>Auth: Token with role

    Auth-->>LP: Session created
    LP-->>U: Redirect based on role
```

---

## Legend

| Symbol | Meaning |
|--------|---------|
| `actor` | User/Role |
| `participant` | System component |
| `->>`  | Request/Action |
| `-->>` | Response |
| `alt/else` | Conditional branch |
| `Note over` | Explanation |
