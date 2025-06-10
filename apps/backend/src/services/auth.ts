import invariant from "invariant"
import { GoogleUserInfo } from "./user.js"

export const validateGoogleUserData = (userData: unknown): GoogleUserInfo => {
    invariant(userData && typeof userData === 'object', 'Réponse Google invalide')
    
    const data = userData as Record<string, unknown>
    
    invariant(typeof data.id === 'string' && data.id, 'ID Google manquant')
    invariant(typeof data.email === 'string' && data.email, 'Email Google manquant')
    invariant(typeof data.given_name === 'string' && data.given_name, 'Prénom Google manquant')
    invariant(typeof data.family_name === 'string' && data.family_name, 'Nom de famille Google manquant')
    
    return {
      id: data.id,
      email: data.email,
      name: data.name as string || `${data.given_name} ${data.family_name}`,
      given_name: data.given_name,
      family_name: data.family_name,
      picture: (data.picture as string) || ''
    }
}