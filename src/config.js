// Configuración centralizada del proyecto
// Las credenciales sensibles se cargan desde .env (nunca commitear)

export const APPS_SCRIPT_URL = import.meta.env.VITE_APP_SCRIPT_URL || null
export const IS_DEMO = !import.meta.env.VITE_SUPABASE_URL
