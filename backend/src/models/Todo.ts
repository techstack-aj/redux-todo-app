// ============================================
// TODO MODEL (In-Memory Database)
// ============================================

import { Todo } from '../types';

class TodoModel {
  private todos: Todo[] = [];

  // Alle Todos für einen User holen
  findByUserId(userId: string): Todo[] {
    return this.todos.filter(todo => todo.userId === userId);
  }

  // Einzelnes Todo finden
  findById(id: string): Todo | undefined {
    return this.todos.find(todo => todo.id === id);
  }

  // Todo erstellen
  create(text: string, userId: string): Todo {
    const newTodo: Todo = {
      id: this.generateId(),
      text,
      completed: false,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.todos.push(newTodo);
    return newTodo;
  }

  // Todo aktualisieren
  update(id: string, updates: Partial<Pick<Todo, 'text' | 'completed'>>): Todo | null {
    const todo = this.findById(id);
    if (!todo) return null;

    Object.assign(todo, updates, { updatedAt: new Date() });
    return todo;
  }

  // Todo löschen
  delete(id: string): boolean {
    const index = this.todos.findIndex(todo => todo.id === id);
    if (index === -1) return false;
    
    this.todos.splice(index, 1);
    return true;
  }

  // Prüfen ob Todo dem User gehört
  belongsToUser(id: string, userId: string): boolean {
    const todo = this.findById(id);
    return todo?.userId === userId || false;
  }

  // Simple ID-Generierung
  private generateId(): string {
    return `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton Export
export default new TodoModel();
