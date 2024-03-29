// See https://www.kernel.org/pub/software/scm/git/docs/git-check-ref-format.html
// ASCII Control chars and space, DEL, ~ ^ : ? * [ \
// | " < and > is technically a valid refname but not on Windows
// the magic sequence @{, consecutive dots, leading and trailing dot, ref ending in .lock
const invalidCharacterRegex = /[\x00-\x20\x7F~^:?*\[\\|""<>]|@{|\.\.+|^\.|\.$|\.lock$|\/$/g

/** Sanitize a proposed branch name by replacing illegal characters. */
export function sanitizedBranchNmae(name: string): string {
  return name.replace(invalidCharacterRegex, '-')
    .replace(/--+/g, '-')
    .replace(/^-/g, '')
}

/** Validate a branch does not contain any invalid characters */
export function testForInvalidChars(name: string): boolean {
  return invalidCharacterRegex.test(name)
}
