export const authPageTranslations = {
  login: {
    title: 'Sign in to Polity',
    description: "Enter your email address and we'll send you a secure magic code",
    emailLabel: 'Email address',
    emailPlaceholder: 'your.email@example.com',
    sendCode: 'Send magic code',
    sending: 'Sending...',
    footer: {
      noPassword: "No password required - we'll send you a secure code instead.",
      checkEmail: 'Check your email for the verification code.',
    },
  },
  verify: {
    title: 'Enter verification code',
    description: 'We sent a 6-digit code to',
    codeLabel: 'Verification code',
    submit: 'Verify and sign in',
    verifying: 'Verifying...',
    back: 'Back',
    resend: 'Resend',
    footer: {
      checkSpam: "Didn't receive an email? Check your spam folder.",
      devNote: 'Development mode: Use code',
    },
  },
  codeSent: {
    title: 'Code sent!',
    description: 'We sent a verification code to {{email}}',
    instructions: 'Check your email and enter the 6-digit code on the next page.',
    backToEmail: 'Change email address',
  },
  logout: {
    button: 'Sign out',
    confirm: 'Are you sure you want to sign out?',
    success: 'You have been signed out successfully.',
  },
} as const;
