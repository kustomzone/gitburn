/**
 * A tuple of name, email, and date for the author or commit
 * info in a commit.
 */
export class CommitIdentity {

  public readonly name: string
  public readonly email: string
  public readonly date: Date
  public readonly tzOffset: number

  /**
   * Parses a Git ident string (GIT_AUTHOR_IDENT or GIT_COMMITER_IDENT)
   * into a commit identity. Returns null if string could not be parsed.
   */
  public static parseIdentity(identity: string): CommitIdentity | null {
    const m = identity.match(/^(.*?) <(.*?)> (\d+) (\+|-)?(\d{2})(\d{2})/)
    if (!m) { return null }

    const name = m[1]
    const email = m[2]
    // The date is specified as seconds from the epoch,
    // Date() expects milliseconds since the epoch.
    const date = new Date(parseInt(m[3], 10) * 1000)

    // The RAW option never uses alphanumeric timezone identifiers and in my
    // testing I've never found it to omit the leading + for a positive offset
    // but the docs for strprintf seems to suggest it might on some system so
    // we're playing it safe.
    const tzSign = m[4] === '-' ? '-' : '+'
    const tzHH = m[5]
    const tzmm = m[6]

    const tzMinutes = parseInt(tzHH, 10) * 60 + parseInt(tzmm, 10)
    const tzOffset = tzMinutes * (tzSign === '-' ? -1 : 1)

    return new CommitIdentity(name, email, date, tzOffset)
  }

  public constructor(name: string, email: string, date: Date, tzOffset?: number) {
    this.name = name
    this.email = email
    this.date = date
    this.tzOffset = tzOffset || (new Date()).getTimezoneOffset()
  }
}
