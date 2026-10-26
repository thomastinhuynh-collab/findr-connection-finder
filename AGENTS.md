# Architecture rules

- Use `needsStripeOnboarding` for payment setup visibility and its action badge so both follow the same eligibility rule.

- Role-conviction pages share `RoleLandingPage`; keep their structure synchronized while content remains locale-driven.- The `app_settings.beta_open` switch disables the account-to-waitlist invitation flow; any future signup restriction must also respect it, and normal sign-in/sign-up must never depend on that flow.
