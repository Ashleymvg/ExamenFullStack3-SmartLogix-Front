import { loginRequest, registerRequest } from "../api/authApi"

// Registra el inicio de sesión enviando los datos limpios al API
export async function login({ credential, password }) {
    const cleanCredential = credential.trim()
    const cleanPassword = password.trim()

    if(!cleanCredential || !cleanPassword){
        throw new Error("Ingrese usuario y password")
    }

    return loginRequest({
        credential: cleanCredential,
        password: cleanPassword
    })
}

// Función para registrar usuarios en el backend
export async function registerUser({ username, email, password }) {
    const cleanUsername = username?.trim()
    const cleanEmail = email?.trim()
    const cleanPassword = password?.trim()

    if(!cleanUsername || !cleanEmail || !cleanPassword) {
        throw new Error("Todos los campos son obligatorios para el registro")
    }
    
    return registerRequest({ 
        username: cleanUsername, 
        email: cleanEmail, 
        password: cleanPassword 
    })
}

// Guarda los datos devueltos por el backend en el almacenamiento local
export function saveLoginSession(loginResponse){
    if(!loginResponse?.token){
        throw new Error("El backend no entrego token")
    }

    localStorage.setItem("token", loginResponse.token)

    localStorage.setItem("user",
        JSON.stringify({
            tokenType: loginResponse.tokenType,
            expiresInMs: loginResponse.expiresInMs
        })
    )
}

export function getSaveToken() {
    return localStorage.getItem("token")
}

/**
 * Decodifica el payload de un JWT (la parte central, separada por puntos).
 * OJO: esto NO verifica la firma (eso solo lo puede hacer el backend, que
 * es quien tiene la clave secreta) — solo lee el contenido. Se usa
 * únicamente para reflejar en la UI lo que el token realmente dice, en vez
 * de confiar en un campo aparte que cualquiera podría editar a mano en
 * localStorage sin tocar el token.
 */
function decodeJwtPayload(token) {
    try {
        const payloadBase64Url = token.split(".")[1]
        const payloadBase64 = payloadBase64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
            atob(payloadBase64)
                .split("")
                .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
                .join("")
        )
        return JSON.parse(jsonPayload)
    } catch {
        return null
    }
}

/**
 * Devuelve los datos del usuario en sesión. El username y el role SIEMPRE
 * se leen directamente del JWT (nunca de un campo suelto en localStorage),
 * para que editar ese campo a mano no tenga ningún efecto: el token es lo
 * único que manda, y el backend igual lo vuelve a validar en cada petición.
 */
export function getSaveUser() {
    const token = getSaveToken()
    if (!token) return null

    const payload = decodeJwtPayload(token)
    if (!payload) return null

    let extra = {}
    try {
        extra = JSON.parse(localStorage.getItem("user")) || {}
    } catch {
        extra = {}
    }

    return {
        username: payload.sub,
        role: payload.role,
        tokenType: extra.tokenType,
        expiresInMs: extra.expiresInMs
    }
}

export function getAuthorizationHeader() {
    const token = getSaveToken()
    const user = getSaveUser()

    if(!token){
        return null
    }

    const tokenType = user?.tokenType || "Bearer"
    return `${tokenType} ${token}`
}

export function getRequiredAuthorizationHeader() {
    const authorizationHeader = getAuthorizationHeader()

    if(!authorizationHeader){
        throw new Error("No hay token guardado")
    }

    return authorizationHeader
}

export function clearLogin() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
}