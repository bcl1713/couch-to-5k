# Implementation Tasks

## 1. Session Cookie Behavior

- [x] 1.1 Update session cookie setter to derive `secure` from request protocol and `x-forwarded-proto`
- [x] 1.2 Add/adjust unit tests for protocol-aware secure flag logic

## 2. Specs

- [x] 2.1 Update `user-auth` spec to describe protocol-aware secure cookie behavior
- [x] 2.2 Validate OpenSpec change
