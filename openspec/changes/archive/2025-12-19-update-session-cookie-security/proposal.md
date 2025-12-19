# Change: Align session cookie security with protocol

## Why

Browsers reject `secure` cookies on HTTP during local development, causing login failures when the app is served without TLS. The session cookie policy needs to adapt based on the request protocol.

## What Changes

- Detect request protocol (including `x-forwarded-proto`) and only set the `secure` flag when served over HTTPS
- Document protocol-aware session cookie behavior in the user auth spec

## Impact

- Affected specs: `user-auth`
- Affected code: `lib/auth.ts` session cookie setter
