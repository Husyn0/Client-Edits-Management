# 🧪 Client Edits API — cURL Tests

**Base URL:** `http://localhost:8000/api`
**Auth:** Bearer token (Sanctum)

---

## ⚙️ 0. Pre-flight

### 0.1 Server is running?
```bash
curl -s -o /dev/null -w "Server: %{http_code}\n" http://localhost:8000/api/stats
```
Expected: `Server: 401` (means server is alive, just unauthenticated).

### 0.2 CORS is configured?
```bash
curl -i -X OPTIONS http://localhost:8000/api/clients \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```
Expected headers in response:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: *
Access-Control-Allow-Headers: *
```
If missing → run `php artisan config:publish cors`, edit `config/cors.php`, then `php artisan config:clear`.

### 0.3 List all API routes
```bash
cd backend && php artisan route:list --path=api
```

---

## 📌 Variables — fill these in as you go

Keep these two lines handy. **After each "create" test**, copy the returned `id` / `token` into the corresponding variable and re-run the tests that need it.

```bash
TOKEN=""
USER_ID=""
CLIENT_ID=""
EDIT_ID=""
ATTACHMENT_ID=""
```

**How to reload them in a new terminal session:**
```bash
source ./vars.sh   # optional helper (see bottom of file)
```

---

## 🔐 1. AUTH

### 1.1 Register a new user  → `201`
```bash
curl -i -X POST http://localhost:8000/api/register \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test_'$(date +%s)'@example.com",
    "password": "password123",
    "password_confirmation": "password123"
  }'
```
**📥 Expected response body:**
```json
{
  "user": { "id": 1, "name": "Test User", "email": "test_xxx@example.com" },
  "token": "1|abcdef..."
}
```
**✏️ Action:** copy `token` → `TOKEN`

---

### 1.2 Login with existing user  → `200`
```bash
curl -i -X POST http://localhost:8000/api/login \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "REPLACE_WITH_EMAIL",
    "password": "password123"
  }'
```
**✏️ Action:** copy new `token` → `TOKEN`

---

### 1.3 Get current user  → `200`  *(requires TOKEN)*
```bash
curl -i http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
Expected: `{ "id": 1, "name": "Test User", "email": "..." }`

---

### 1.4 Logout  → `200`  *(requires TOKEN — invalidates it!)*
```bash
curl -i -X POST http://localhost:8000/api/logout \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
After running, `$TOKEN` is dead. Re-login (1.2) before running any protected test.

---

## 📊 2. DASHBOARD

### 2.1 Stats  → `200`  *(requires TOKEN)*
```bash
curl -i http://localhost:8000/api/stats \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
**📥 Expected:**
```json
{ "total_clients": 0, "total_edits": 0, "pending": 0,
  "in_progress": 0, "done": 0, "unpaid_total": 0, "paid_total": 0 }
```

---

## 👥 3. CLIENTS

### 3.1 Create client  → `201`  *(requires TOKEN)*
```bash
curl -i -X POST http://localhost:8000/api/clients \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Acme Corp",
    "phone": "+1-555-0100",
    "email": "contact_'$(date +%s)'@acme.test",
    "company_name": "Acme Corporation",
    "service": "Web Development",
    "last_contact_followup": "'$(date +%Y-%m-%d)'"
  }'
```
**✏️ Action:** copy returned `id` → `CLIENT_ID`  
**⚠️ Must run before any other CLIENTS/EDITS/ATTACHMENTS test.**

---

### 3.2 List clients  → `200`  *(requires TOKEN)*
```bash
curl -i "http://localhost:8000/api/clients?per_page=15" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 3.3 Search clients  → `200`
```bash
curl -i "http://localhost:8000/api/clients?search=Acme" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 3.4 Show client  → `200`  *(requires TOKEN + CLIENT_ID)*
```bash
curl -i http://localhost:8000/api/clients/$CLIENT_ID \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
Expected: client object with `edits: []` (empty until 4.1 runs).

### 3.5 Update client  → `200`  *(requires TOKEN + CLIENT_ID)*
```bash
curl -i -X PUT http://localhost:8000/api/clients/$CLIENT_ID \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "service": "Full-Stack Development" }'
```

### 3.6 Delete client  → `200`  *(requires TOKEN + CLIENT_ID)*
> ⚠️ **Do NOT run until you're done with all edit/attachment tests** — deleting the client cascades and destroys related edits + attachments.
```bash
curl -i -X DELETE http://localhost:8000/api/clients/$CLIENT_ID \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 4. EDITS

### 4.1 Create edit  → `201`  *(requires TOKEN + CLIENT_ID)*
> ⚠️ **CLIENT_ID must exist first** (run 3.1).
```bash
curl -i -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "client_id": '"$CLIENT_ID"',
    "title": "Homepage redesign",
    "description": "Update hero section, colors and CTAs",
    "due_date": "'$(date -d '+7 days' +%Y-%m-%d 2>/dev/null || date -v+7d +%Y-%m-%d)'",
    "priority": "High",
    "payment": 250.00,
    "is_paid": false,
    "status": "pending"
  }'
```
**✏️ Action:** copy returned `id` → `EDIT_ID`

### 4.2 List edits  → `200`  *(requires TOKEN)*
```bash
curl -i "http://localhost:8000/api/edits?per_page=15" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 4.3 Filter edits by status + priority  → `200`
```bash
curl -i "http://localhost:8000/api/edits?status=pending&priority=High" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 4.4 Filter edits by client  → `200`  *(requires CLIENT_ID)*
```bash
curl -i "http://localhost:8000/api/edits?client_id=$CLIENT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 4.5 Show edit  → `200`  *(requires TOKEN + EDIT_ID)*
```bash
curl -i http://localhost:8000/api/edits/$EDIT_ID \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```
Expected: `attachments: []` until 5.1 runs.

### 4.6 Update edit status  → `200`  *(requires TOKEN + EDIT_ID)*
```bash
curl -i -X PUT http://localhost:8000/api/edits/$EDIT_ID \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "status": "in_progress", "is_paid": true }'
```

### 4.7 Mark edit done  → `200`
```bash
curl -i -X PUT http://localhost:8000/api/edits/$EDIT_ID \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{ "status": "done" }'
```

### 4.8 Delete edit  → `200`  *(requires TOKEN + EDIT_ID)*
> ⚠️ **Run last — cascades attachments.** Needs ATTACHMENT tests done first.
```bash
curl -i -X DELETE http://localhost:8000/api/edits/$EDIT_ID \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📎 5. ATTACHMENTS

### 5.0 Prepare a test file
```bash
echo "Hello from cURL — $(date)" > /tmp/sample.txt
```
> If you want to test PDF/image upload, drop a real file in `/tmp/` and change `@/tmp/sample.txt` below.

### 5.1 Upload attachment  → `201`  *(requires TOKEN + EDIT_ID)*
> ⚠️ **EDIT_ID must exist first** (run 4.1).
```bash
curl -i -X POST http://localhost:8000/api/edits/$EDIT_ID/attachments \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/sample.txt"
```
**✏️ Action:** copy returned `id` → `ATTACHMENT_ID`

### 5.2 List all attachments  → `200`  *(requires TOKEN)*
```bash
curl -i http://localhost:8000/api/attachments \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 5.3 List attachments for a specific edit  → `200`  *(requires EDIT_ID)*
```bash
curl -i "http://localhost:8000/api/attachments?edit_id=$EDIT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 5.4 Download attachment  → `200`  *(requires TOKEN + ATTACHMENT_ID)*
```bash
curl -L http://localhost:8000/api/attachments/$ATTACHMENT_ID/download \
  -H "Authorization: Bearer $TOKEN" \
  -o /tmp/downloaded.bin \
  -w "HTTP %{http_code} — %{size_download} bytes → /tmp/downloaded.bin\n"

# Verify content
head -c 200 /tmp/downloaded.bin; echo
```

### 5.5 Delete attachment  → `200`  *(requires TOKEN + ATTACHMENT_ID)*
```bash
curl -i -X DELETE http://localhost:8000/api/attachments/$ATTACHMENT_ID \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚫 6. NEGATIVE / VALIDATION TESTS

### 6.1 Unauthenticated request  → `401`
```bash
curl -i http://localhost:8000/api/clients \
  -H "Accept: application/json"
```

### 6.2 Bad token  → `401`
```bash
curl -i http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer invalid_token_123"
```

### 6.3 Missing required fields on client  → `422`
```bash
curl -i -X POST http://localhost:8000/api/clients \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}'
```
Expected:
```json
{ "message": "The name field is required. (and 5 more errors)",
  "errors": { "name": [...], "phone": [...], "email": [...], ... } }
```

### 6.4 Duplicate email on client create  → `422`
```bash
curl -i -X POST http://localhost:8000/api/clients \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Dup",
    "phone": "123",
    "email": "REPLACE_WITH_EXISTING_EMAIL",
    "company_name": "Dup Co",
    "service": "X"
  }'
```

### 6.5 Invalid priority enum on edit  → `422`
```bash
curl -i -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "client_id": '"$CLIENT_ID"',
    "title": "Bad priority",
    "description": "Should fail",
    "priority": "URGENT",
    "status": "pending"
  }'
```

### 6.6 Invalid status enum on edit  → `422`
```bash
curl -i -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "client_id": '"$CLIENT_ID"',
    "title": "Bad status",
    "description": "Should fail",
    "priority": "High",
    "status": "flying"
  }'
```

### 6.7 Non-existent client_id on edit  → `422`
```bash
curl -i -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "client_id": 999999,
    "title": "Ghost",
    "description": "No client",
    "priority": "Low",
    "status": "pending"
  }'
```

### 6.8 Upload disallowed file type  → `422`
```bash
echo "#!/bin/bash" > /tmp/bad.sh
curl -i -X POST http://localhost:8000/api/edits/$EDIT_ID/attachments \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/bad.sh"
```

### 6.9 404 on non-existent resource  → `404`
```bash
curl -i http://localhost:8000/api/clients/999999 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧹 7. CLEANUP (run in this exact order)

### 7.1 Delete attachment
```bash
curl -i -X DELETE http://localhost:8000/api/attachments/$ATTACHMENT_ID \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
```

### 7.2 Delete edit
```bash
curl -i -X DELETE http://localhost:8000/api/edits/$EDIT_ID \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
```

### 7.3 Delete client
```bash
curl -i -X DELETE http://localhost:8000/api/clients/$CLIENT_ID \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
```

### 7.4 Logout (invalidates token)
```bash
curl -i -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
```

### 7.5 Remove temp files
```bash
rm -f /tmp/sample.txt /tmp/downloaded.bin /tmp/bad.sh
```

### 7.6 Wipe DB (last resort)
```bash
cd backend && php artisan migrate:fresh
```

---

## ✅ Dependency Graph — read before running

```
1.1 register ──▶ TOKEN
                │
                ├──▶ 1.3 me
                ├──▶ 2.1 stats
                │
                └──▶ 3.1 create client ──▶ CLIENT_ID
                                          │
                                          ├──▶ 3.4 / 3.5 / 4.4
                                          │
                                          └──▶ 4.1 create edit ──▶ EDIT_ID
                                                                  │
                                                                  ├──▶ 4.5 / 4.6 / 4.7
                                                                  │
                                                                  └──▶ 5.1 upload ──▶ ATTACHMENT_ID
                                                                                     │
                                                                                     ├──▶ 5.4 download
                                                                                     └──▶ 5.5 delete
```

**If a test returns `404` for `$EDIT_ID` / `$CLIENT_ID` / `$ATTACHMENT_ID`:**  
→ the parent resource was never created or was already deleted. Go back and run the create step (3.1, 4.1, or 5.1).

**If a test returns `401`:**  
→ token expired or you ran 1.4 (logout). Run 1.2 (login) again.

---

## 🔎 Quick Debug Helpers

### Show current values
```bash
echo "TOKEN=$TOKEN"
echo "USER_ID=$USER_ID"
echo "CLIENT_ID=$CLIENT_ID"
echo "EDIT_ID=$EDIT_ID"
echo "ATTACHMENT_ID=$ATTACHMENT_ID"
```

### Check a resource exists before using it
```bash
curl -s -o /dev/null -w "client %{http_code}\n" \
  http://localhost:8000/api/clients/$CLIENT_ID \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
```

### Save values to a sourceable file
```bash
cat > /tmp/vars.sh <<EOF
export TOKEN="$TOKEN"
export USER_ID="$USER_ID"
export CLIENT_ID="$CLIENT_ID"
export EDIT_ID="$EDIT_ID"
export ATTACHMENT_ID="$ATTACHMENT_ID"
EOF
# In a new terminal:
source /tmp/vars.sh
```

### Tail Laravel log while testing
```bash
tail -f backend/storage/logs/laravel.log
```

---

## 📋 Expected Result Summary

| Section | Test | HTTP | Notes |
|---|---|---|---|
| 1.1 | register | 201 | copy token |
| 1.2 | login | 200 | copy token |
| 1.3 | me | 200 | needs token |
| 1.4 | logout | 200 | invalidates token |
| 2.1 | stats | 200 | needs token |
| 3.1 | clients.create | 201 | copy id |
| 3.2 | clients.list | 200 | — |
| 3.3 | clients.search | 200 | — |
| 3.4 | clients.show | 200 | needs CLIENT_ID |
| 3.5 | clients.update | 200 | needs CLIENT_ID |
| 3.6 | clients.delete | 200 | ⚠️ cascades |
| 4.1 | edits.create | 201 | needs CLIENT_ID, copy id |
| 4.2 | edits.list | 200 | — |
| 4.3 | edits.filter | 200 | — |
| 4.4 | edits.by client | 200 | needs CLIENT_ID |
| 4.5 | edits.show | 200 | needs EDIT_ID |
| 4.6 | edits.update | 200 | needs EDIT_ID |
| 4.7 | edits.done | 200 | needs EDIT_ID |
| 4.8 | edits.delete | 200 | ⚠️ cascades |
| 5.1 | attach.upload | 201 | needs EDIT_ID, copy id |
| 5.2 | attach.list | 200 | — |
| 5.3 | attach.by edit | 200 | needs EDIT_ID |
| 5.4 | attach.download | 200 | needs ATTACHMENT_ID |
| 5.5 | attach.delete | 200 | needs ATTACHMENT_ID |
| 6.1 | no auth | 401 | — |
| 6.2 | bad token | 401 | — |
| 6.3 | missing fields | 422 | — |
| 6.4 | dup email | 422 | — |
| 6.5 | bad priority | 422 | — |
| 6.6 | bad status | 422 | — |
| 6.7 | ghost client_id | 422 | — |
| 6.8 | bad file type | 422 | needs EDIT_ID |
| 6.9 | 404 unknown | 404 | — |