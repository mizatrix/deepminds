import bcrypt from 'bcryptjs';

export interface User {
    id: string;
    email: string;
    password?: string; // hashed, optional for OAuth users
    name: string;
    role: 'STUDENT' | 'ADMIN';
    image?: string; // from OAuth providers
    createdAt: string;
    emailVerified?: boolean;
    provider?: 'credentials' | 'google' | 'github' | 'microsoft' | 'facebook';
}

// In-memory storage for demo purposes (works on server-side)
// Note: Data will reset when the server restarts
declare global {
    var mockUsers: User[] | undefined;
}

const SALT_ROUNDS = 10;

/**
 * Get all users from memory
 */
export function getUsers(): User[] {
    if (!globalThis.mockUsers) {
        globalThis.mockUsers = [];
        // Auto-seed default users if empty
        seedDefaultUsers();
    }
    return globalThis.mockUsers;
}

/**
 * Save users to memory
 */
function saveUsers(users: User[]): void {
    globalThis.mockUsers = users;
}

/**
 * Seed default users synchronously to ensure they exist for login
 */
function seedDefaultUsers() {
    // Pre-computed hashes to avoid blocking main thread with bcrypt.hashSync
    // Admin Password: Admin@123456!
    const adminHash = '$2b$10$xVYGGLawurGkOgJ4NXRdJummm1OTUQLpoP/N3BHrU6UYEXBEoR.T2';
    // Student Password: Student@123456!
    const studentHash = '$2b$10$BVqPHcdhYSYcO1CxAtK2.usTcmV6JOxFrMokHj6Dd3ZIAF5EFS92m';

    const defaultUsers: User[] = [
        {
            id: 'admin-id',
            email: 'admin@example.com',
            password: adminHash,
            name: 'Admin User',
            role: 'ADMIN',
            createdAt: new Date().toISOString(),
            provider: 'credentials',
            emailVerified: true
        },
        {
            id: 'student-id',
            email: 'student@example.com',
            password: studentHash,
            name: 'Student User',
            role: 'STUDENT',
            createdAt: new Date().toISOString(),
            provider: 'credentials',
            emailVerified: true
        }
    ];

    saveUsers(defaultUsers);
}

/**
 * Find user by email
 */
export function findUserByEmail(email: string): User | null {
    const users = getUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Find user by ID
 */
export function findUserById(id: string): User | null {
    const users = getUsers();
    return users.find(user => user.id === id) || null;
}

/**
 * Create a new user
 */
export async function createUser(data: {
    email: string;
    password?: string;
    name: string;
    role?: 'STUDENT' | 'ADMIN';
    image?: string;
    provider?: User['provider'];
}): Promise<User> {
    const users = getUsers();

    // Check if user already exists
    if (findUserByEmail(data.email)) {
        throw new Error('User with this email already exists');
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (data.password) {
        hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    const newUser: User = {
        id: crypto.randomUUID(),
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role || 'STUDENT',
        image: data.image,
        createdAt: new Date().toISOString(),
        emailVerified: data.provider !== 'credentials', // Auto-verify OAuth users
        provider: data.provider || 'credentials',
    };

    users.push(newUser);
    saveUsers(users);

    return newUser;
}

/**
 * Verify user password
 */
export async function verifyPassword(
    email: string,
    password: string
): Promise<User | null> {
    const user = findUserByEmail(email);

    if (!user || !user.password) {
        return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
}

/**
 * Update user
 */
export function updateUser(id: string, updates: Partial<User>): User | null {
    const users = getUsers();
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
        return null;
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    saveUsers(users);

    return users[userIndex];
}

/**
 * Change user password
 */
export async function changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
): Promise<boolean> {
    const user = findUserById(userId);

    if (!user || !user.password) {
        return false;
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
        return false;
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    updateUser(userId, { password: hashedPassword });

    return true;
}

/**
 * Delete user
 */
export function deleteUser(id: string): boolean {
    const users = getUsers();
    const filteredUsers = users.filter(user => user.id !== id);

    if (filteredUsers.length === users.length) {
        return false; // User not found
    }

    saveUsers(filteredUsers);
    return true;
}

/**
 * Initialize with a default admin user (for demo purposes)
 * No longer needed to be called externally as getUsers seeds automatically
 */
export async function initializeDefaultUsers(): Promise<void> {
    // Calling getUsers() triggers the seeding check
    getUsers();
}
