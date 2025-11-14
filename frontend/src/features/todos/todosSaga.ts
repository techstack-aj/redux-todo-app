// Todos Saga - Redux Saga für Todo CRUD Operations
import { fetchTodosStart, fetchTodosSuccess, fetchTodosFailure, addTodo, toggleTodoLocal, removeTodo, updateTodo } from './todosSlice';
import * as todoService from '../../services/todoService';
import { call, put, takeLatest, all, CallEffect, PutEffect, SelectEffect, select } from 'redux-saga/effects';
import { fetchTodosRequest, createTodoRequest, toggleTodoRequest, deleteTodoRequest, toggleTodoOptimisticRequest, updateTodoRequest } from './todosSagaActions';

// Worker Saga für Fetch Todos
function* fetchTodosSaga(): Generator<CallEffect | PutEffect, void, any> {
    try {
        console.log('🟢 SAGA: Lade Todos...');
        yield put(fetchTodosStart());
        const todos: Awaited<ReturnType<typeof todoService.fetchTodos>> = yield call(todoService.fetchTodos);
        yield put(fetchTodosSuccess(todos));
        console.log('✅ SAGA: Todos geladen:', todos.length);
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Fehler beim Laden der Todos';
        yield put(fetchTodosFailure(errorMessage));
        console.error('❌ SAGA: Fehler beim Laden', error);
    }
}

// Worker Saga für Create Todo
function* createTodoSaga(action: ReturnType<typeof createTodoRequest>): Generator<CallEffect | PutEffect, void, any> {
    try {
        console.log('🟢 SAGA: Erstelle Todo:', action.payload.text);
        const newTodo: Awaited<ReturnType<typeof todoService.createTodo>> = yield call(todoService.createTodo, action.payload.text);
        yield put(addTodo(newTodo));
        console.log('✅ SAGA: Todo erstellt:', newTodo);
    } catch (error: any) {
        console.error('❌ SAGA: Fehler beim Erstellen des Todos:', error);
    }
}

// Worker Saga für Toggle Todo
function* toggleTodoSaga(action: ReturnType<typeof toggleTodoRequest>): Generator<CallEffect | PutEffect, void, any> {
    try {
        console.log('🟢 SAGA: Toggle Todo:', action.payload.id);
        yield call(todoService.toggleTodo, action.payload.id);
        yield put(toggleTodoLocal(action.payload.id));
        console.log('✅ SAGA: Todo getoggled:', action.payload.id);
    } catch (error: any) {
        console.error('❌ SAGA: Fehler beim Umschalten des Todos:', error);
    }
}

// Worker Saga für Delete Todo
function* deleteTodoSaga(action: ReturnType<typeof deleteTodoRequest>): Generator<CallEffect | PutEffect, void, any> {
    try {
        console.log('🟢 SAGA: Lösche Todo:', action.payload.id);
        yield call(todoService.deleteTodo, action.payload.id);
        yield put(removeTodo(action.payload.id));
        console.log('✅ SAGA: Todo gelöscht:', action.payload.id);
    } catch (error: any) {
        console.error('❌ SAGA: Fehler beim Löschen des Todos:', error);
    }
}

// Worker Saga für Update Todo
function* updateTodoSaga(action: ReturnType<typeof updateTodoRequest>): Generator<CallEffect | PutEffect, void, any> {
    try {
        console.log('🟢 SAGA: Aktualisiere Todo:', action.payload.id, action.payload.updates);
        const updatedTodo: Awaited<ReturnType<typeof todoService.updateTodo>> = yield call(todoService.updateTodo, action.payload.id, action.payload.updates);
        yield put(updateTodo(updatedTodo));
        console.log('✅ SAGA: Todo aktualisiert:', updatedTodo);
    } catch (error: any) {
        console.error('❌ SAGA: Fehler beim Aktualisieren des Todos:', error);
    }
}

// Worker Saga für Optimistic Toggle (UI-Update vor API-Call mit Rollback bei Fehler)
function* toggleTodoOptimisticSaga(action: ReturnType<typeof toggleTodoOptimisticRequest>): Generator<SelectEffect | CallEffect | PutEffect, void, any> {
    console.log('🟢 SAGA: toggleTodoOptimisticSaga läuft für ID:', action.payload.id);
    const todos: Awaited<ReturnType<typeof todoService.fetchTodos>> = yield select((state: any) => state.todos.items);
    const todo = todos.find(t => t.id === action.payload.id);
    yield put(toggleTodoLocal(action.payload.id));
    try {
        yield call(todoService.toggleTodo, action.payload.id);
        console.log('✅ SAGA: Todo umgeschaltet (optimistic)');
    } catch (error: any) {
        console.error('❌ SAGA: Fehler beim Umschalten des Todos, Rollback wird durchgeführt:', error);
        yield put(toggleTodoLocal(action.payload.id));
    }
}

// Watcher Sagas
function* watchFetchTodos() {
    yield takeLatest('todos/fetchTodosRequest', fetchTodosSaga);
}

function* watchCreateTodo() {
    yield takeLatest('todos/createTodoRequest', createTodoSaga);
}

function* watchToggleTodo() {
    yield takeLatest('todos/toggleTodoRequest', toggleTodoSaga);
}

function* watchDeleteTodo() {
    yield takeLatest('todos/deleteTodoRequest', deleteTodoSaga);
}

function* watchUpdateTodo() {
    yield takeLatest('todos/updateTodoRequest', updateTodoSaga);
}
// TODO: Erstelle watchToggleTodoOptimistic
// - yield takeLatest('todos/toggleTodoOptimisticRequest', toggleTodoOptimisticSaga)
export function* watchToggleTodoOptimistic() {
    yield takeLatest('todos/toggleTodoOptimisticRequest', toggleTodoOptimisticSaga);
}

// ===== ROOT SAGA =====
export function* todosRootSaga() {
    yield all([
        watchFetchTodos(),
        watchCreateTodo(),
        watchToggleTodo(),
        watchDeleteTodo(),
        watchUpdateTodo(),
        watchToggleTodoOptimistic()
    ]);
}
