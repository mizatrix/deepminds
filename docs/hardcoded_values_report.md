# Hardcoded Values Report

Generated: January 26, 2026

## Summary

A comprehensive scan of the codebase identified **32 instances** of hardcoded values across 15 files that should be moved to environment variables or configuration files.

---

## Critical (Should Fix Immediately)

### 1. Email Fallbacks in Production Code

| File | Line | Value | Impact |
|------|------|-------|--------|
| `app/admin/submissions/page.tsx` | 53, 83, 113, 190, 225, 259 | `'admin@example.com'` | Incorrect audit trail if session fails |
| `components/AchievementSubmissionForm.tsx` | 151 | `'student@example.com'` | Submission attributed to wrong user |

**Fix:** Remove fallbacks, require valid session, or use `throw new Error()`.

### 2. Hardcoded URLs

| File | Line | Value | Recommendation |
|------|------|-------|----------------|
| `lib/email/service.ts` | 150 | `'https://yourapp.com'` | Use `NEXT_PUBLIC_APP_URL` env |
| `lib/certificates/template-generator.ts` | 131 | `'https://msa-grad.edu'` | Use `NEXT_PUBLIC_APP_URL` env |
| `lib/supabase.ts` | 4 | `'https://placeholder.supabase.co'` | Require `NEXT_PUBLIC_SUPABASE_URL` |

### 3. Seed File Credentials

| File | Line | Value | Note |
|------|------|-------|------|
| `prisma/seed.ts` | 10 | `'SuperAdmin@123456!'` | Dev only - OK, but consider env variable |
| `prisma/seed.ts` | 40 | `'Admin@123456!'` (hashed) | Dev only - OK |
| `prisma/seed.ts` | 57 | `'Student@123456!'` (hashed) | Dev only - OK |

---

## Medium Priority

### 4. Hardcoded Contact Email

| File | Line | Value |
|------|------|-------|
| `components/Footer.tsx` | 88 | `csexcellence@msa.edu.eg` |

**Fix:** Move to `NEXT_PUBLIC_CONTACT_EMAIL` or site config.

### 5. Avatar Fallback URL

| File | Line | Value |
|------|------|-------|
| `lib/leaderboard/service.ts` | 60 | `https://api.dicebear.com/7.x/avataaars/svg` |
| `app/profile/page.tsx` | 145 | `https://api.dicebear.com/7.x/avataaars/svg` |
| `app/categories/[category]/page.tsx` | 79 | `https://api.dicebear.com/7.x/avataaars/svg` |

**Fix:** Create `lib/constants.ts` with `DEFAULT_AVATAR_BASE_URL`.

### 6. External API URL

| File | Line | Value |
|------|------|-------|
| `app/api/audit/route.ts` | 19 | `http://ip-api.com/json/${ip}` |

**Fix:** Move to configuration or allow disabling via env.

---

## Low Priority (Placeholders/Dev Data)

### 7. Mock Data File

| File | Type | Count |
|------|------|-------|
| `lib/data.ts` | Example emails, names | 5 entries |
| `lib/auth/users.ts` | Fallback users | 2 entries |
| `lib/auth/admins.ts` | Admin whitelist | 1 entry |

**Note:** These are development/fallback data - acceptable if not used in production.

### 8. UI Placeholders

| File | Line | Value |
|------|------|-------|
| `components/auth/LoginForm.tsx` | 131 | `placeholder="student@example.com"` |
| `app/(auth)/register/page.tsx` | 133 | `placeholder="you@example.com"` |
| `app/admin/users/page.tsx` | 472 | `placeholder="user@example.com"` |

**Note:** UI placeholders are acceptable.

---

## Recommended Actions

1. **Create `/lib/constants.ts`** for all configurable values
2. **Add environment variables** to `.env.example`:

   ```env
   NEXT_PUBLIC_APP_URL=https://portal.msa.edu.eg
   NEXT_PUBLIC_CONTACT_EMAIL=csexcellence@msa.edu.eg
   NEXT_PUBLIC_AVATAR_SERVICE_URL=https://api.dicebear.com/7.x/avataaars/svg
   ```

3. **Remove email fallbacks** in production code - require valid authentication
