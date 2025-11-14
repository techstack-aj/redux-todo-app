// Saga Actions für Todo CRUD Operations
export const fetchTodosRequest = () => ({
    type: 'todos/fetchTodosRequest' as const
});

export const createTodoRequest = (text: string) => ({
    type: 'todos/createTodoRequest' as const,
    payload: { text }
});

export const toggleTodoRequest = (id: string) => ({
    type: 'todos/toggleTodoRequest' as const,
    payload: { id }
});

export const deleteTodoRequest = (id: string) => ({
    type: 'todos/deleteTodoRequest' as const,
    payload: { id }
});

// Action für Update Todo
export const updateTodoRequest = (id: string, updates: { text?: string; completed?: boolean }) => ({
    type: 'todos/updateTodoRequest' as const,
    payload: { id, updates }
});

// Action für Optimistic Toggle (UI-Update vor API-Call)
export const toggleTodoOptimisticRequest = (id: string) => ({
    type: 'todos/toggleTodoOptimisticRequest' as const,
    payload: { id }
});