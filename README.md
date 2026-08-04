# SkillSwap Frontend

React single-page app for **SkillSwap** — a skill-exchange platform where users find each other by skill and chat in real time. This is the web client for the [skillswap-backend](https://github.com/Sertyg-a11/skillswap-backend) microservices and is deployed via [skillswap-infra](https://github.com/Sertyg-a11/skillswap-infra).

## Tech stack

| Area | Choice |
|------|--------|
| Framework | React 19 + Vite 7 |
| Routing | React Router 7 |
| Styling | Tailwind CSS 4 |
| Auth | Keycloak (OIDC) via `keycloak-js` |
| Real-time | WebSocket over STOMP (`@stomp/stompjs` + SockJS) |
| Tooling | ESLint 9 |

## Features

- **Keycloak-based auth** — OIDC login, silent token refresh, and a bearer-token provider injected into every API and WebSocket call.
- **Real-time messaging** — STOMP-over-WebSocket conversations with live delivery and read receipts.
- **Skill search & matching** — find users by the skills they offer.
- **Profile & skills management** — edit your profile and maintain your skill list.

## Project structure

```
src/
├── app/            # App shell, router, providers
├── features/
│   ├── auth/         # Keycloak AuthProvider + token handling
│   ├── conversations/# Chat UI
│   ├── search/       # Skill/user search
│   ├── users/        # Profiles & skills
│   └── homepage/
├── services/       # API client + WebSocket service
└── shared/         # Layout and reusable UI
```

## Getting started

```bash
npm install
cp .env.example .env    # set VITE_API_BASE_URL and Keycloak config
npm run dev             # start Vite dev server
```

| Script | Description |
|--------|-------------|
| `npm run dev` | Start the dev server with HMR |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |

## Configuration

Environment variables (see `.env.example`):

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Base URL of the API gateway |
| `VITE_KEYCLOAK_URL` | Keycloak server URL |
| `VITE_KEYCLOAK_REALM` | Keycloak realm |
| `VITE_KEYCLOAK_CLIENT_ID` | Public client ID |

## Related repositories

- [skillswap-backend](https://github.com/Sertyg-a11/skillswap-backend) — Spring Boot microservices
- [skillswap-infra](https://github.com/Sertyg-a11/skillswap-infra) — Kubernetes/GitOps + Docker Compose deployment
