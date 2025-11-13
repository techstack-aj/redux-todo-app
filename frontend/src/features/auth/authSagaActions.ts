import { LoginCredentials, RegisterCredentials } from "../../types";

// Action Creator für Login Request
export const loginRequest = (credentials: LoginCredentials) => ({
    type: 'auth/loginRequest' as const,
    payload: credentials
})

// Action Creator für Register Request (später für Exercise 2)
export const registerRequest = (credentials: RegisterCredentials) => ({
    type: 'auth/registerRequest' as const,
    payload: credentials
})

