const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no O/0/I/1
const CODE_LENGTH = 6

/** How many times to retry an insert whose generated code collided with an existing one. */
export const MAX_CODE_ATTEMPTS = 5

/**
 * Shared by table codes and club join codes. Both are 6 chars from the same ambiguity-free alphabet;
 * they live in separate tables, so a table code and a club code may coincide without conflicting —
 * which box a code goes in is unambiguous from context.
 */
export function generateJoinCode(): string {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return code
}
