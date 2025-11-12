// ============================================
// REDUX HOOKS - Typed für TypeScript
// ============================================
// Custom Hooks mit korrekten TypeScript Types

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// useDispatch mit AppDispatch Type (inkl. Thunks)
export const useAppDispatch = () => useDispatch<AppDispatch>();

// useSelector mit RootState Type
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

/**
 * VERWENDUNG IN COMPONENTS:
 * 
 * const dispatch = useAppDispatch();
 * const todos = useAppSelector((state) => state.todos.items);
 * 
 * dispatch(fetchTodosThunk()); // TypeScript weiß dass Thunks erlaubt sind
 */
