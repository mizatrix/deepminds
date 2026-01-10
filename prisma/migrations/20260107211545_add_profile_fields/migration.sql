-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "image" TEXT,
    "provider" TEXT DEFAULT 'credentials',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "avatar" TEXT,
    "faculty" TEXT,
    "year" TEXT,
    "studentId" TEXT,
    "department" TEXT,
    "position" TEXT,
    "phone" TEXT,
    "bio" TEXT,
    "linkedIn" TEXT,
    "github" TEXT,
    "twitter" TEXT,
    "website" TEXT,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completionPercentage" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_users" ("createdAt", "email", "emailVerified", "id", "image", "name", "password", "provider", "role", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "password", "provider", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
