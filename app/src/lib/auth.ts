import { Account } from '../models/account'

/** Get the auth key for the user. */
export function getKeyForAccount(account: Account): string {
  return getKeyForAccount(account.endpoint)
}

/** Get the auth key for the endpoint. */
export function getKeyForEndpoint(endpoint: string): string {
  const appName = __DEV__
    ? 'GitBurn Dev'
    : 'GitBurn'

  return `${appName} - ${endpoint}`
}
