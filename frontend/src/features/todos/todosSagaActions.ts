
// TODO: Fetch Todos Action (bereits vorhanden)
export const fetchTodosRequest = () => ({
    type: 'todos/fetchTodosRequest' as const
});

// TODO: Erstelle createTodoRequest Action
// - Parameter: text (string)
// - Type: 'todos/createTodoRequest'
// - Payload: { text }
export const createTodoRequest = (text: string) => ({
    type: 'todos/createTodoRequest' as const,
    payload: { text }
});

// TODO: Erstelle toggleTodoRequest Action
// - Parameter: id (string)
// - Type: 'todos/toggleTodoRequest'
// - Payload: { id }
export const toggleTodoRequest = (id: string) => ({
    type: 'todos/toggleTodoRequest' as const,
    payload: { id }
});

// TODO: Erstelle deleteTodoRequest Action
// - Parameter: id (string)
// - Type: 'todos/deleteTodoRequest'
// - Payload: { id }
export const deleteTodoRequest = (id: string) => ({
    type: 'todos/deleteTodoRequest' as const,
    payload: { id }
});

// ===== EXERCISE 5: OPTIMISTIC UPDATE =====

// TODO: Erstelle toggleTodoOptimisticRequest Action
// - Parameter: id (string)
// - Type: 'todos/toggleTodoOptimisticRequest'
// - Payload: { id }
// - Dies ist die NEUE Action für optimistic toggle
// - Pattern: { type: '...', payload: { id } } as const
export const toggleTodoOptimisticRequest = (id: string) => ({
    type: 'todos/toggleTodoOptimisticRequest' as const,
    payload: { id }
});