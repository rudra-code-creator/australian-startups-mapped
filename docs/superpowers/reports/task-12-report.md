## Task 12 – Admin auth + Approve/Reject

- Added password-based admin auth using `iron-session` with cookie name `asm_admin` in `src/lib/auth.ts` (env: `ADMIN_PASSWORD`, `SESSION_SECRET`).
- Implemented admin API routes:
  - `POST /api/admin/login`
  - `POST /api/admin/logout`
  - `GET /api/admin/suggestions` (pending queue; `401` when not authed)
  - `POST /api/admin/suggestions/[id]` with `{ action: "approve", lat, lng, ... }` or `{ action: "reject" }`
- Built `/admin` UI with `LoginForm` + `PendingQueue` (lat/lng inputs + Approve/Reject).

### Smoke evidence (dev server)

```json
{
  "wrongPasswordStatus": 401,
  "hasApprovedInCityApi": true,
  "hasRejectedInCityApi": false
}
```

```json
{
  "missingLatLngApproveStatus": 400
}
```

