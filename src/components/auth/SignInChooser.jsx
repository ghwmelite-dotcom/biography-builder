import { useState } from 'react'
import GoogleLoginButton from './GoogleLoginButton.jsx'
import { PhonePinLoginDialog } from './PhonePinLoginDialog.jsx'
import { PhonePinSignupDialog } from './PhonePinSignupDialog.jsx'
import { ForgotPinDialog } from './ForgotPinDialog.jsx'

export function SignInChooser() {
  const [loginOpen, setLoginOpen] = useState(false)
  const [signupOpen, setSignupOpen] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <GoogleLoginButton />
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          className="w-full border border-input bg-card text-foreground font-medium py-3 rounded-lg hover:bg-muted transition-colors"
        >
          Continue with phone
        </button>
        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{' '}
          <button
            type="button"
            onClick={() => setSignupOpen(true)}
            className="underline text-foreground"
          >
            Sign up
          </button>
        </p>
      </div>

      <PhonePinLoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onForgotPin={() => setForgotOpen(true)}
        onSwitchToSignup={() => setSignupOpen(true)}
      />
      <PhonePinSignupDialog
        open={signupOpen}
        onOpenChange={setSignupOpen}
        onSwitchToLogin={() => setLoginOpen(true)}
      />
      <ForgotPinDialog open={forgotOpen} onOpenChange={setForgotOpen} />
    </>
  )
}

export default SignInChooser
