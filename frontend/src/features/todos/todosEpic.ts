// ============================================
// TODOS EPIC - Redux Observable
// ============================================

import { Epic } from 'redux-observable';
import { filter, map, catchError, switchMap, mergeMap, debounceTime, retry } from 'rxjs/operators';
import { of, from } from 'rxjs';
import { fetchTodosSuccess, fetchTodosFailure, addTodo, removeTodo, updateTodo, addTodoStart, toggleTodoStart, deleteTodoStart, updateTodoStart } from './todosSlice';
import { createTodo, deleteTodo, fetchTodos, toggleTodo, updateTodo as updateTodoService } from '../../services/todoService';
import { combineEpics } from 'redux-observable';

// Lädt alle Todos vom Server (nur bei Observable-Login)
export const fetchTodosEpic: Epic = (action$, state$) => {
    return action$.pipe(
        filter((action: any) => {
            const currentState: any = state$.value;
            return action.type === 'todos/fetchTodosStart' && currentState.auth.middlewareType === 'observable';
        }),
        switchMap(() => {
            console.log('🟣 OBSERVABLE: Lade Todos...');
            return from(fetchTodos()).pipe(
                map(todos => {
                    console.log('✅ OBSERVABLE: Todos geladen:', todos.length);
                    return fetchTodosSuccess(todos);
                }),
                catchError(error => of(fetchTodosFailure(error.message)))
            );
        })
    );
}

// Erstellt neues Todo mit 500ms Debouncing
export const addTodoEpic: Epic = (action$) => {
    return action$.pipe(
        filter((action: any) => action.type === addTodoStart.type),
        debounceTime(500),
        switchMap((action: any) => {
            const { text } = action.payload;
            console.log('🟣 OBSERVABLE: Erstelle Todo (nach 500ms debounce):', text);
            return from(createTodo(text)).pipe(
                map(newTodo => {
                    console.log('✅ OBSERVABLE: Todo erstellt:', newTodo);
                    return addTodo(newTodo);
                }),
                catchError(error => of(fetchTodosFailure(error.message)))
            )
        }),
    );
}

// Toggled Todo completed-Status mit parallelen Requests
export const toggleTodoEpic: Epic = (action$) => {
    return action$.pipe(
        filter((action: any) => action.type === toggleTodoStart.type),
        mergeMap((action: any) => {
            const { id } = action.payload;
            console.log('🟣 OBSERVABLE: Toggle Todo (parallel mit mergeMap):', id);
            return from(toggleTodo(id)).pipe(
                map(updatedTodo => {
                    console.log('✅ OBSERVABLE: Todo getoggled:', updatedTodo);
                    return updateTodo(updatedTodo);
                }),
                catchError((error) => of(fetchTodosFailure(error.message)))
            );
        })
    );
}

// Löscht Todo mit automatischem Retry (3x)
export const deleteTodoEpic: Epic = (action$) => {
    return action$.pipe(
        filter((action: any) => action.type === deleteTodoStart.type),
        switchMap((action: any) => {
            const { id } = action.payload;
            console.log('🟣 OBSERVABLE: Lösche Todo (mit retry 3x):', id);
            return from(deleteTodo(id)).pipe(
                retry(3),
                map(() => {
                    console.log('✅ OBSERVABLE: Todo gelöscht:', id);
                    return removeTodo(id);
                }),
                catchError((error) => of(fetchTodosFailure(error.message)))
            );
        }),
    );
}

// Aktualisiert Todo-Text
export const updateTodoEpic: Epic = (action$) => {
    return action$.pipe(
        filter((action: any) => action.type === updateTodoStart.type),
        switchMap((action: any) => {
            const { id, updates } = action.payload;
            console.log('🟣 OBSERVABLE: Aktualisiere Todo:', id, updates);
            return from(updateTodoService(id, updates)).pipe(
                map((updatedTodo: any) => {
                    console.log('✅ OBSERVABLE: Todo aktualisiert:', updatedTodo);
                    return updateTodo(updatedTodo);
                }),
                catchError((error) => of(fetchTodosFailure(error.message)))
            );
        }),
    );
}

// Kombiniert alle Todo-Epics für den Store
export const rootTodosEpic = combineEpics(
    fetchTodosEpic,
    addTodoEpic,
    toggleTodoEpic,
    deleteTodoEpic,
    updateTodoEpic
);
