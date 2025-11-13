
// TODO: Importiere die benötigten Actions aus todosSlice:
// - fetchTodosStart, fetchTodosSuccess, fetchTodosFailure (bereits vorhanden)
// - addTodo (für Create)
// - toggleTodoLocal (für Toggle)
// - removeTodo (für Delete)
import { fetchTodosStart, fetchTodosSuccess, fetchTodosFailure, addTodo, toggleTodoLocal, removeTodo } from './todosSlice';
import * as todoService from '../../services/todoService';
// TODO EXERCISE 5: Importiere auch SelectEffect und select von 'redux-saga/effects'
import { call, put, takeLatest, all, CallEffect, PutEffect, SelectEffect, select } from 'redux-saga/effects';

// TODO: Importiere die Saga Actions:
// - fetchTodosRequest (bereits vorhanden)
// - createTodoRequest
// - toggleTodoRequest
// - deleteTodoRequest
// - toggleTodoOptimisticRequest (NEU für Exercise 5)
import { fetchTodosRequest, createTodoRequest, toggleTodoRequest, deleteTodoRequest, toggleTodoOptimisticRequest } from './todosSagaActions';

// ===== WORKER SAGAS =====

// Fetch Todos Saga (bereits fertig)
function* fetchTodosSaga(): Generator<CallEffect | PutEffect, void, any> {
    console.log('🔵 SAGA: fetchTodosSaga läuft');
    try {
        yield put(fetchTodosStart());
        const todos: Awaited<ReturnType<typeof todoService.fetchTodos>> = yield call(todoService.fetchTodos);
        yield put(fetchTodosSuccess(todos));
        console.log('✅ SAGA: Todos erfolgreich geladen');
    } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'Fehler beim Laden der Todos';
        yield put(fetchTodosFailure(errorMessage));
        console.error('❌ SAGA: Fehler beim Laden', error);
    }
}

// TODO: Erstelle createTodoSaga
// - Parameter: action mit Type von createTodoRequest
// - Generator Return Type: Generator<CallEffect | PutEffect, void, any>
// - try/catch Block:
//   - try: 
//     * yield call(todoService.createTodo, action.payload.text)
//     * Ergebnis in Variable 'newTodo' speichern
//     * yield put(addTodo(newTodo))
//   - catch:
//     * Fehlermeldung mit console.error loggen
function* createTodoSaga(action: ReturnType<typeof createTodoRequest>): Generator<CallEffect | PutEffect, void, any> {
    console.log('🔵 SAGA: createTodoSaga läuft für:', action.payload.text);
    try {
        const newTodo: Awaited<ReturnType<typeof todoService.createTodo>> = yield call(todoService.createTodo, action.payload.text);
        yield put(addTodo(newTodo));
        console.log('✅ SAGA: Todo erstellt');
    } catch (error: any) {
        console.error('❌ SAGA: Fehler beim Erstellen des Todos:', error);
    }
}

// TODO: Erstelle toggleTodoSaga
// - Parameter: action mit Type von toggleTodoRequest
// - Generator Return Type: Generator<CallEffect | PutEffect, void, any>
// - try/catch Block:
//   - try:
//     * yield call(todoService.toggleTodo, action.payload.id)
//     * yield put(toggleTodoLocal(action.payload.id))
//   - catch:
//     * Fehlermeldung mit console.error loggen
function* toggleTodoSaga(action: ReturnType<typeof toggleTodoRequest>): Generator<CallEffect | PutEffect, void, any> {
    console.log('🔵 SAGA: toggleTodoSaga läuft für ID:', action.payload.id);
    try {
        yield call(todoService.toggleTodo, action.payload.id);
        yield put(toggleTodoLocal(action.payload.id));
        console.log('✅ SAGA: Todo umgeschaltet');
    } catch (error: any) {
        console.error('❌ SAGA: Fehler beim Umschalten des Todos:', error);
    }
}

// TODO: Erstelle deleteTodoSaga
// - Parameter: action mit Type von deleteTodoRequest
// - Generator Return Type: Generator<CallEffect | PutEffect, void, any>
// - try/catch Block:
//   - try:
//     * yield call(todoService.deleteTodo, action.payload.id)
//     * yield put(removeTodo(action.payload.id))
//   - catch:
//     * Fehlermeldung mit console.error loggen
function* deleteTodoSaga(action: ReturnType<typeof deleteTodoRequest>): Generator<CallEffect | PutEffect, void, any> {
    console.log('🔵 SAGA: deleteTodoSaga läuft für ID:', action.payload.id);
    try {
        yield call(todoService.deleteTodo, action.payload.id);
        yield put(removeTodo(action.payload.id));
        console.log('✅ SAGA: Todo gelöscht');
    } catch (error: any) {
        console.error('❌ SAGA: Fehler beim Löschen des Todos:', error);
    }
}

// ===== EXERCISE 5: OPTIMISTIC UPDATE =====

// TODO: Erstelle toggleTodoOptimisticSaga
// - Parameter: action mit Type von toggleTodoOptimisticRequest
// - Generator Return Type: Generator<SelectEffect | CallEffect | PutEffect, void, any>
// - WICHTIG: Optimistic Update Pattern!
// - Schritte:
//   1. yield select((state: any) => state.todos.items) -> aktuelle Todos holen
//   2. Das betroffene Todo finden: todos.find(t => t.id === action.payload.id)
//   3. yield put(toggleTodoLocal(action.payload.id)) -> SOFORT im UI umschalten
//   4. try/catch Block:
//      - try: yield call(todoService.toggleTodo, action.payload.id)
//      - catch: 
//        * console.error('Rollback wegen Fehler')
//        * yield put(toggleTodoLocal(action.payload.id)) -> ZURÜCKROLLEN (nochmal togglen)
// - Denke dran: Generator Type muss SelectEffect enthalten!
function* toggleTodoOptimisticSaga(action: ReturnType<typeof toggleTodoOptimisticRequest>): Generator<SelectEffect | CallEffect | PutEffect, void, any> {
    console.log('🔵 SAGA: toggleTodoOptimisticSaga läuft für ID:', action.payload.id);
    // 1. Aktuelle Todos holen
    const todos: Awaited<ReturnType<typeof todoService.fetchTodos>> = yield select((state: any) => state.todos.items);
    // 2. Betroffenes Todo finden
    const todo = todos.find(t => t.id === action.payload.id);
    // 3. Sofort im UI umschalten
    yield put(toggleTodoLocal(action.payload.id));
    try {
        // 4. API Call
        yield call(todoService.toggleTodo, action.payload.id);
        console.log('✅ SAGA: Todo umgeschaltet (optimistic)');
    } catch (error: any) {
        // Rollback
        console.error('❌ SAGA: Fehler beim Umschalten des Todos, Rollback wird durchgeführt:', error);
        yield put(toggleTodoLocal(action.payload.id));
    }
}

// ===== WATCHER SAGAS =====

function* watchFetchTodos() {
    yield takeLatest('todos/fetchTodosRequest', fetchTodosSaga);
}

// TODO: Erstelle watchCreateTodo
// - yield takeLatest('todos/createTodoRequest', createTodoSaga)
function* watchCreateTodo() {
    yield takeLatest('todos/createTodoRequest', createTodoSaga);
}

// TODO: Erstelle watchToggleTodo
// - yield takeLatest('todos/toggleTodoRequest', toggleTodoSaga)
function* watchToggleTodo() {
    yield takeLatest('todos/toggleTodoRequest', toggleTodoSaga);
}

// TODO: Erstelle watchDeleteTodo
// - yield takeLatest('todos/deleteTodoRequest', deleteTodoSaga)
function* watchDeleteTodo() {
    yield takeLatest('todos/deleteTodoRequest', deleteTodoSaga);
}


// ===== EXERCISE 5: OPTIMISTIC UPDATE =====
// TODO: Erstelle watchToggleTodoOptimistic
// - yield takeLatest('todos/toggleTodoOptimisticRequest', toggleTodoOptimisticSaga)
export function* watchToggleTodoOptimistic() {
    yield takeLatest('todos/toggleTodoOptimisticRequest', toggleTodoOptimisticSaga);
}

// ===== ROOT SAGA =====

// TODO: Erweitere todosRootSaga
// - Füge zu all([]) hinzu:
//   * watchCreateTodo()
//   * watchToggleTodo()
//   * watchDeleteTodo()
//   * watchToggleTodoOptimistic() <- NEU!
export function* todosRootSaga() {
    yield all([
        watchFetchTodos(),
        watchCreateTodo(),
        watchToggleTodo(),
        watchDeleteTodo(),
        watchToggleTodoOptimistic()
    ]);
}
