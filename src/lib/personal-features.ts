/**
 * Personal (logged-in) finance features were removed from the public product.
 * Leftover server modules call this so they cannot run without a session layer.
 */
export function personalFeaturesDisabled(): never {
  throw new Error("Recursos pessoais foram descontinuados. Use as ferramentas públicas.");
}
