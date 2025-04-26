// Function to generate a unique fingerprint for the current browser/client
export async function getClientFingerprint(): Promise<string> {
  // First, check if we already have a fingerprint stored in localStorage
  const storedFingerprint = localStorage.getItem('todo_app_fingerprint');
  if (storedFingerprint) {
    return storedFingerprint;
  }

  // If not, generate a new fingerprint
  // Collect various browser properties that are stable across sessions
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio,
    // Add any browser features detection that makes sense
    hasTouch: 'ontouchstart' in window,
    hasSessionStorage: (() => {
      try {
        return !!window.sessionStorage;
      } catch (e) {
        return false;
      }
    })(),
    hasLocalStorage: (() => {
      try {
        return !!window.localStorage;
      } catch (e) {
        return false;
      }
    })(),
    // Add a random component that persists for this installation
    // This helps differentiate between browsers with identical configurations
    randomId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
  };

  // Convert the fingerprint object to a string and hash it
  const fingerprintStr = JSON.stringify(fingerprint);

  // Use SubtleCrypto to create a hash
  const msgBuffer = new TextEncoder().encode(fingerprintStr);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // Create final fingerprint with app-specific prefix
  const finalFingerprint = `todo-app-${hashHex}`;

  // Store the fingerprint in localStorage for future use
  try {
    localStorage.setItem('todo_app_fingerprint', finalFingerprint);
  } catch (e) {
    console.error('Failed to store fingerprint in localStorage:', e);
  }

  return finalFingerprint;
}
