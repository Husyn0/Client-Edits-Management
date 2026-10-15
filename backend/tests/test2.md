# 🧪 Client Edits API — cURL Tests (paste-one-at-a-time)

**Base URL:** `http://localhost:8000/api`
**Auth:** Bearer token (Sanctum)

> **Run everything in the same terminal.**
> After each `create` block, the last two lines `export` and `echo` the id — do not skip them.
> Before any step that uses `$CLIENT_ID` / `$EDIT_ID` / `$ATTACHMENT_ID`, run the **Check vars** block.

---

## 🔎 Check vars (paste this any time)

```bash
echo "TOKEN=${TOKEN:0:16}…"
echo "USER_ID=$USER_ID"
echo "CLIENT_ID=$CLIENT_ID"
echo "EDIT_ID=$EDIT_ID"
echo "ATTACHMENT_ID=$ATTACHMENT_ID"
```

If any of `CLIENT_ID`/`EDIT_ID`/`ATTACHMENT_ID` is blank, go back and re-run the corresponding `create` block.

---

## ⚙️ 0. Pre-flight

### 0.1 Server alive? (expect 401)

```bash
curl -s -o /dev/null -w "Server: %{http_code}\n" http://localhost:8000/api/stats
```

### 0.2 CORS (expect 204 + headers)

```bash
curl -i -X OPTIONS http://localhost:8000/api/clients \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: authorization,content-type"
```

### 0.3 Routes

```bash
php artisan route:list --path=api
```

---

## 🔐 1. AUTH

### 1.1 Register (expect 201) — sets TOKEN, USER_ID

```bash
RESP=$(curl -s -X POST http://localhost:8000/api/register \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"test_$(date +%s)@example.com\",\"password\":\"password123\",\"password_confirmation\":\"password123\"}")
echo "$RESP" | jq
export TOKEN=$(echo "$RESP" | jq -r '.token // empty')
export USER_ID=$(echo "$RESP" | jq -r '.user.id // empty')
echo "TOKEN=${TOKEN:0:16}…  USER_ID=$USER_ID"
```

If `TOKEN` is blank → register failed. Run `echo "$RESP"` and look for the error. If you see `Call to undefined method ... createToken()` → re-apply `User.php` above and re-run `composer dump-autoload`.

### 1.2 Login (expect 200) — sets TOKEN

```bash
RESP=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')
echo "$RESP" | jq
export TOKEN=$(echo "$RESP" | jq -r '.token // empty')
echo "TOKEN=${TOKEN:0:16}…"
```

### 1.3 Me (expect 200)

```bash
curl -i http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 1.4 Logout (expect 200, invalidates token — re-login after)

```bash
curl -i -X POST http://localhost:8000/api/logout \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 2. DASHBOARD

### 2.1 Stats (expect 200)

```bash
curl -i http://localhost:8000/api/stats \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 👥 3. CLIENTS

### 3.1 Create client (expect 201) — sets CLIENT_ID

```bash
RESP=$(curl -s -X POST http://localhost:8000/api/clients \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\":\"Acme Corp\",\"phone\":\"+1-555-0100\",\"email\":\"contact_$(date +%s)@acme.test\",\"company_name\":\"Acme Corporation\",\"service\":\"Web Development\",\"last_contact_followup\":\"$(date +%Y-%m-%d)\"}")
echo "$RESP" | jq
export CLIENT_ID=$(echo "$RESP" | jq -r '.id // empty')
echo "CLIENT_ID=$CLIENT_ID"
```

If `CLIENT_ID` is blank → 401 (token bad) or 422 (validation). `echo "$RESP"` to see why.

### 3.2 List (expect 200)

```bash
curl -i "http://localhost:8000/api/clients?per_page=15" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 3.3 Search (expect 200)

```bash
curl -i "http://localhost:8000/api/clients?search=Acme" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 3.4 Show (expect 200)

```bash
curl -i "http://localhost:8000/api/clients/$CLIENT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

If 404 → `$CLIENT_ID` is empty. Go back to 3.1.

### 3.5 Update (expect 200)

```bash
curl -i -X PUT "http://localhost:8000/api/clients/$CLIENT_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"service":"Full-Stack Development"}'
```

### 3.6 Delete (expect 200) — cascades, run last

```bash
curl -i -X DELETE "http://localhost:8000/api/clients/$CLIENT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 4. EDITS

### 4.1 Create edit (expect 201) — sets EDIT_ID

```bash
RESP=$(curl -s -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"title\":\"Homepage redesign\",\"description\":\"Update hero section, colors and CTAs\",\"due_date\":\"$(date -d '+7 days' +%Y-%m-%d)\",\"priority\":\"High\",\"payment\":250.00,\"is_paid\":false,\"status\":\"pending\"}")
echo "$RESP" | jq
export EDIT_ID=$(echo "$RESP" | jq -r '.id // empty')
echo "EDIT_ID=$EDIT_ID"
```

If `EDIT_ID` is blank: check `echo "CLIENT_ID=$CLIENT_ID"` first (must not be blank). If `client_id` is blank the JSON becomes `"client_id":,` and validation fails.

### 4.2 List (expect 200)

```bash
curl -i "http://localhost:8000/api/edits?per_page=15" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 4.3 Filter (expect 200)

```bash
curl -i "http://localhost:8000/api/edits?status=pending&priority=High" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 4.4 By client (expect 200)

```bash
curl -i "http://localhost:8000/api/edits?client_id=$CLIENT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 4.5 Show (expect 200)

```bash
curl -i "http://localhost:8000/api/edits/$EDIT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

If 404 → `$EDIT_ID` blank. Go back to 4.1.

### 4.6 Update (expect 200)

```bash
curl -i -X PUT "http://localhost:8000/api/edits/$EDIT_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"in_progress","is_paid":true}'
```

### 4.7 Mark done (expect 200)

```bash
curl -i -X PUT "http://localhost:8000/api/edits/$EDIT_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"done"}'
```

### 4.8 Delete (expect 200)

```bash
curl -i -X DELETE "http://localhost:8000/api/edits/$EDIT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📎 5. ATTACHMENTS

### 5.0 Make a test file

```bash
echo "Hello from cURL $(date)" > /tmp/sample.txt
ls -l /tmp/sample.txt
```

### 5.1 Upload (expect 201) — sets ATTACHMENT_ID

**Before pasting, run the check:**

```bash
echo "EDIT_ID=[$EDIT_ID]"
```

If it's blank, go back to 4.1. Then:

```bash
RESP=$(curl -s -X POST "http://localhost:8000/api/edits/$EDIT_ID/attachments" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/sample.txt")
echo "$RESP" | jq
export ATTACHMENT_ID=$(echo "$RESP" | jq -r '.id // empty')
echo "ATTACHMENT_ID=$ATTACHMENT_ID"
```

If `ATTACHMENT_ID` is blank: run `echo "$RESP"` to see the raw body. It'll be one of:
- `401 Unauthenticated` → re-login (1.2)
- `404 .../api/edits//attachments` → `$EDIT_ID` was empty
- `404 No query results for model [App\Models\Edit]` → edit was deleted; re-run 4.1
- `422 The file failed to upload` → file missing; re-run 5.0
- `500` → `php artisan storage:link` and check `storage/app/public` is writable

### 5.2 List all (expect 200)

```bash
curl -i http://localhost:8000/api/attachments \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 5.3 List by edit (expect 200)

```bash
curl -i "http://localhost:8000/api/attachments?edit_id=$EDIT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 5.4 Download (expect 200)

```bash
curl -L "http://localhost:8000/api/attachments/$ATTACHMENT_ID/download" \
  -H "Authorization: Bearer $TOKEN" \
  -o /tmp/downloaded.bin \
  -w "HTTP %{http_code} — %{size_download} bytes\n"
head -c 200 /tmp/downloaded.bin; echo
```

If 404 → `$ATTACHMENT_ID` blank. Go back to 5.1.

### 5.5 Delete (expect 200)

```bash
curl -i -X DELETE "http://localhost:8000/api/attachments/$ATTACHMENT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

If 404 → `$ATTACHMENT_ID` blank or already deleted.

---

## 🚫 6. NEGATIVE TESTS

### 6.1 No auth → 401

```bash
curl -i http://localhost:8000/api/clients -H "Accept: application/json"
```

### 6.2 Bad token → 401

```bash
curl -i http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer invalid_token_123"
```

### 6.3 Missing fields → 422

```bash
curl -i -X POST http://localhost:8000/api/clients \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}'
```

### 6.4 Duplicate email → 422

```bash
curl -i -X POST http://localhost:8000/api/clients \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Dup","phone":"123","email":"test@example.com","company_name":"Dup Co","service":"X"}'
```

### 6.5 Bad priority → 422

```bash
curl -i -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"title\":\"Bad priority\",\"description\":\"D\",\"priority\":\"URGENT\",\"status\":\"pending\"}"
```

### 6.6 Bad status → 422

```bash
curl -i -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"title\":\"Bad status\",\"description\":\"D\",\"priority\":\"High\",\"status\":\"flying\"}"
```

### 6.7 Ghost client_id → 422

```bash
curl -i -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"client_id":999999,"title":"Ghost","description":"D","priority":"Low","status":"pending"}'
```

### 6.8 Bad file type → 422

**First check `$EDIT_ID`:**

```bash
echo "EDIT_ID=[$EDIT_ID]"
```

Then:

```bash
set +H
echo '#!/bin/bash' > /tmp/bad.sh
curl -i -X POST "http://localhost:8000/api/edits/$EDIT_ID/attachments" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/bad.sh"
```

- If you get **422** → correct (bad file type).
- If you get **404** → `$EDIT_ID` is empty, not a file-type issue.

### 6.9 Unknown resource → 404

```bash
curl -i http://localhost:8000/api/clients/999999 \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🧹 7. CLEANUP

### 7.1 Delete attachment (expect 200)

```bash
echo "ATTACHMENT_ID=[$ATTACHMENT_ID]"
curl -i -X DELETE "http://localhost:8000/api/attachments/$ATTACHMENT_ID" \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
```

If 404 → `$ATTACHMENT_ID` blank or the attachment was already deleted (e.g. you ran 5.5 before). Re-run 5.1 to make a new one, or skip.

### 7.2 Delete edit (expect 200)

```bash
echo "EDIT_ID=[$EDIT_ID]"
curl -i -X DELETE "http://localhost:8000/api/edits/$EDIT_ID" \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
```

If 404 → `$EDIT_ID` blank or already deleted.

### 7.3 Delete client (expect 200)

```bash
echo "CLIENT_ID=[$CLIENT_ID]"
curl -i -X DELETE "http://localhost:8000/api/clients/$CLIENT_ID" \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
```

### 7.4 Logout (expect 200)

```bash
curl -i -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
```

### 7.5 Temp files

```bash
rm -f /tmp/sample.txt /tmp/downloaded.bin /tmp/bad.sh
```

### 7.6 Wipe DB (last resort)

```bash
php artisan migrate:fresh
```

---

## 🧭 If something returns 404 and you think it shouldn't

It's almost always a blank variable. Run:

```bash
echo "CLIENT_ID=[$CLIENT_ID]  EDIT_ID=[$EDIT_ID]  ATTACHMENT_ID=[$ATTACHMENT_ID]"
```

Blank → jump back to the create block. Not blank → tail the log:

```bash
tail -f storage/logs/laravel.log
```

and re-run the failing curl in another terminal.

---

## 📋 Expected results

| Test | HTTP |
|---|---|
| 0.1 | 401 |
| 1.1 register | 201 |
| 1.2 login | 200 |
| 1.3 me | 200 |
| 1.4 logout | 200 |
| 2.1 stats | 200 |
| 3.1 client create | 201 |
| 3.2–3.5 | 200 |
| 3.6 client delete | 200 |
| 4.1 edit create | 201 |
| 4.2–4.7 | 200 |
| 4.8 edit delete | 200 |
| 5.1 upload | 201 |
| 5.2–5.4 | 200 |
| 5.5 attach delete | 200 |
| 6.1–6.2 | 401 |
| 6.3–6.8 | 422 |
| 6.9 | 404 |
| 7.1–7.4 | 200 |