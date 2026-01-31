# [1.3.0](https://github.com/bcl1713/couch-to-5k/compare/v1.2.0...v1.3.0) (2026-01-31)

### Features

- add screen wake lock to keep screen awake during workouts ([d0e6cb4](https://github.com/bcl1713/couch-to-5k/commit/d0e6cb4beb11c720d0ada6438318635ab703c8b0))

# [1.2.0](https://github.com/bcl1713/couch-to-5k/compare/v1.1.1...v1.2.0) (2025-12-23)

### Bug Fixes

- add comprehensive error handling to service worker cache cleanup ([7ff4fa3](https://github.com/bcl1713/couch-to-5k/commit/7ff4fa3c6307c46f3993d8a8c8a7e99ddd72fe7a))
- add missing AppRouterInstance methods to router mock in dashboard test ([d9c73d2](https://github.com/bcl1713/couch-to-5k/commit/d9c73d24a3f61a49d05767a05788feeb6b6d571c))
- ensure service worker registers even after load event fires ([6f3fdf3](https://github.com/bcl1713/couch-to-5k/commit/6f3fdf302961e92d9028d77c7930dbefc725994d))
- improve offline queue error handling with per-request retry logic ([5c4129d](https://github.com/bcl1713/couch-to-5k/commit/5c4129d33c677d1b4a5fa1625bf5e2b29717a1c7))
- prevent memory leaks and redundant updates in service worker registration ([bd78356](https://github.com/bcl1713/couch-to-5k/commit/bd78356832d81b91753263afb4e655fedc108a14)), closes [#6](https://github.com/bcl1713/couch-to-5k/issues/6)
- resolve race condition in service worker activation ([d47db26](https://github.com/bcl1713/couch-to-5k/commit/d47db26149d102af1da4f38093378643bd1f9858))

### Features

- add Progressive Web App (PWA) support with offline capabilities ([a329d76](https://github.com/bcl1713/couch-to-5k/commit/a329d76f2b4b0a9b659edff702d9781a2cf458a9))

## [1.1.1](https://github.com/bcl1713/couch-to-5k/compare/v1.1.0...v1.1.1) (2025-12-19)

### Bug Fixes

- added dry_run: false ([972735a](https://github.com/bcl1713/couch-to-5k/commit/972735abfc09c8197239b0ca742270a55bbd8493))
- default branch for Semantic Release ([33e421f](https://github.com/bcl1713/couch-to-5k/commit/33e421fda98680ca9968c3db203c8199a685e482))
- use semantic-release action to properly set outputs ([4f120cd](https://github.com/bcl1713/couch-to-5k/commit/4f120cd55453c7d9d44a729e772c6f22922cbb4a))

# [1.1.0](https://github.com/bcl1713/couch-to-5k/compare/v1.0.0...v1.1.0) (2025-12-19)

### Bug Fixes

- update workflow ([837d710](https://github.com/bcl1713/couch-to-5k/commit/837d71006d210c0cd2066d8d71b99e6e25b5e19f))

### Features

- document automated release process ([a7fd65d](https://github.com/bcl1713/couch-to-5k/commit/a7fd65df723688b2788e61c0cdcf8cdea5f207a8))

# 1.0.0 (2025-12-19)

### Bug Fixes

- remove unused authModule import in auth.test.ts ([de8a89d](https://github.com/bcl1713/couch-to-5k/commit/de8a89d922c4e4a7b9f759a5e8bb7b6a0238143d))

### Features

- add branch-based workflow with semantic versioning and automated releases ([e916d31](https://github.com/bcl1713/couch-to-5k/commit/e916d31135f484c2048eb9f565d0c21a4b3b80b3))
- add project framework and development tooling ([7cbec55](https://github.com/bcl1713/couch-to-5k/commit/7cbec55266b3e8a3b0e3cd805e7bc3d1a873a077))
- MVP ([09c85c0](https://github.com/bcl1713/couch-to-5k/commit/09c85c0b387406d965f7620502f29842d2bdea0c))
