/**
 * Utilitaires de stockage LocalStorage avec typage et gestion d'erreurs
 */

/**
 * Récupère un item typé depuis le LocalStorage.
 *
 * @param key - Clé de stockage
 * @returns La valeur parsée ou null si inexistante/erreur
 */
export function getItem<T>(key: string): T | null {
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return null;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`[LocalStorage] Erreur lecture clé "${key}":`, error);
    return null;
  }
}

/**
 * Stocke un item typé dans le LocalStorage.
 *
 * @param key - Clé de stockage
 * @param value - Valeur à stocker (sérialisable en JSON)
 * @returns true si succès, false si échec (quota dépassé par exemple)
 */
export function setItem<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`[LocalStorage] Erreur écriture clé "${key}":`, error);
    return false;
  }
}

/**
 * Supprime un item du LocalStorage.
 *
 * @param key - Clé de stockage
 * @returns true si succès, false si échec
 */
export function removeItem(key: string): boolean {
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[LocalStorage] Erreur suppression clé "${key}":`, error);
    return false;
  }
}

/**
 * Vide tout le stockage LocalStorage pour le préfixe ZVC_.
 *
 * @returns true si succès
 */
export function clearZVCStorage(): boolean {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key?.startsWith('ZVC_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('[LocalStorage] Erreur vidage stockage ZVC:', error);
    return false;
  }
}

/**
 * Vérifie si le LocalStorage est disponible (certains navigateurs le désactivent en mode privé).
 *
 * @returns true si disponible
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__zvc_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}
