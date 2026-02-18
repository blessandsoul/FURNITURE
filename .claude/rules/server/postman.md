> **SCOPE**: These rules apply specifically to the **server** directory.

# Postman Collection

**Location**: `server/postman/furniture-api.postman_collection.json`

---

## When to update

Update the Postman collection **every time** you:
- Add a new endpoint
- Remove an endpoint
- Change a route path, method, or request/response shape
- Add or modify authentication requirements on a route

---

## Collection structure

```
Furniture API (collection)
├── Health/
│   └── Health Check          GET /health
├── Auth/                     (future — group auth endpoints here)
├── Products/                 (future — group product endpoints here)
└── ...per domain module
```

Each domain module (`src/modules/<domain>/`) gets its own **folder** in the collection.

---

## Adding a new endpoint

1. Find or create the **folder** matching the module name
2. Add a **request** with:
   - **Name**: Human-readable (e.g. "Create Product", "Get User Profile")
   - **Method + URL**: Use variables — `{{baseUrl}}{{apiPrefix}}/<path>`
   - **Auth**: Inherit from collection (Bearer `{{accessToken}}`). Set `"auth": { "type": "noauth" }` only for public endpoints
   - **Body**: For POST/PUT/PATCH, include a JSON body with realistic example values
   - **Tests**: At minimum:
     - Assert expected status code
     - Assert `success` is `true` (or `false` for error test cases)
     - For auth endpoints that return tokens: auto-set `accessToken` / `refreshToken` collection variables

3. **Token auto-capture** — for login/register/refresh responses:
```javascript
if (pm.response.code === 200 || pm.response.code === 201) {
    const json = pm.response.json();
    if (json.data.accessToken) {
        pm.collectionVariables.set('accessToken', json.data.accessToken);
    }
    if (json.data.refreshToken) {
        pm.collectionVariables.set('refreshToken', json.data.refreshToken);
    }
}
```

---

## Collection variables

| Variable | Purpose | Example |
|---|---|---|
| `baseUrl` | Server origin | `http://localhost:3001` |
| `apiPrefix` | API version prefix | `/api/v1` |
| `accessToken` | JWT access token (auto-set by login) | `eyJ...` |
| `refreshToken` | JWT refresh token (auto-set by login) | `eyJ...` |

Add new variables as needed (e.g. `userId`, `productId`) when endpoints require dynamic IDs.

---

## Environment file

`server/postman/furniture-local.postman_environment.json` contains local dev overrides. Keep it in sync with collection variables.

---

## Rules

- **Never hardcode** URLs, tokens, or IDs in requests — always use `{{variables}}`
- **Keep the collection file valid JSON** — do not add comments inside the JSON
- **Order requests** within folders by typical usage flow (e.g. Register → Login → Get Profile)
- **Include realistic example bodies** — not empty objects
