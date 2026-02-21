export type ZeroContext = {
  userID: string
  email: string
}

declare module '@rocicorp/zero' {
  interface DefaultTypes {
    context: ZeroContext
  }
}
