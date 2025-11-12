// ============================================
// USER MODEL (In-Memory Database)
// ============================================
// In einer echten App würde hier MongoDB/PostgreSQL stehen
// Für das Abschlussprojekt reicht In-Memory

import { User } from '../types';

// Simpler In-Memory Store für User
class UserModel {
  private users: User[] = [];

  // User erstellen
  create(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  // User per Email finden
  findByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }

  // User per ID finden
  findById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  // Alle User holen (nur für Debugging)
  getAll(): User[] {
    return this.users;
  }

  // Simple ID-Generierung
  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton Export
export default new UserModel();
