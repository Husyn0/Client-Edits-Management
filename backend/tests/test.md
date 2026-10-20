# 🧪 Client Edits API — cURL Tests (updated for **Companies & Services**)

Same rules as before: paste one block at a time in the **same terminal**. Every `create` block exports its id — don't skip the `export`/`echo` lines. Run the **Check vars** block any time something 404s.

New hierarchy: **Client → Companies → Services → Edits → Attachments**

---

## 🔎 Check vars

```bash
echo "TOKEN=${TOKEN:0:16}…"
echo "USER_ID=$USER_ID"
echo "CLIENT_ID=$CLIENT_ID"
echo "COMPANY_ID=$COMPANY_ID"
echo "SERVICE_ID=$SERVICE_ID"
echo "SERVICE2_ID=$SERVICE2_ID"
echo "EDIT_ID=$EDIT_ID"
echo "ATTACHMENT_ID=$ATTACHMENT_ID"
```

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

### 0.3 Routes (expect companies + services lines)

```bash
php artisan route:list --path=api
```

You should see:

```
GET|POST        api/companies
GET|PUT|DELETE  api/companies/{company}
...
GET|POST        api/services
GET|PUT|DELETE  api/services/{service}
```

If not → re-apply `api.php` changes and `php artisan route:clear`.

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

### 1.4 Logout (expect 200)

```bash
curl -i -X POST http://localhost:8000/api/logout \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 2. DASHBOARD

### 2.1 Stats (expect 200) — **now includes `total_companies` and `total_services`**

```bash
curl -i http://localhost:8000/api/stats \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

Expect a JSON body shaped like:

```json
{
  "total_clients": 3,
  "total_companies": 4,
  "total_services": 5,
  "total_edits": 6,
  "pending": 1,
  "in_progress": 1,
  "done": 2,
  "unpaid_total": 15,
  "paid_total": 56
}
```

If `total_companies` / `total_services` are missing → you're running the old `EditController@stats`. Re-apply the controller change.

---

## 👥 3. CLIENTS

The client payload **no longer has `company_name` or `service`** — those live on `companies`/`services` now.

### 3.1 Create client (expect 201) — sets CLIENT_ID

```bash
RESP=$(curl -s -X POST http://localhost:8000/api/clients \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\":\"Acme Corp\",\"phone\":\"+1-555-0100\",\"email\":\"contact_$(date +%s)@acme.test\",\"last_contact_followup\":\"$(date +%Y-%m-%d)\"}")
echo "$RESP" | jq
export CLIENT_ID=$(echo "$RESP" | jq -r '.id // empty')
echo "CLIENT_ID=$CLIENT_ID"
```

If you still get 422 mentioning `company_name` / `service`, your `ClientController` wasn't updated.

### 3.2 List (expect 200)

```bash
curl -i "http://localhost:8000/api/clients?per_page=15" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

Each client should now have `edits_count` **and** (after 4.1) a `companies` array when fetched by id.

### 3.3 Search (expect 200)

```bash
curl -i "http://localhost:8000/api/clients?search=Acme" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 3.4 Show (expect 200) — includes nested `companies[].services[]`

```bash
curl -i "http://localhost:8000/api/clients/$CLIENT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

Right now `companies` should be `[]` (client has none yet). After section 4 it will be populated.

### 3.5 Update (expect 200)

```bash
curl -i -X PUT "http://localhost:8000/api/clients/$CLIENT_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"phone":"+1-555-0199"}'
```

### 3.6 Delete (expect 200) — cascades companies + services + edits + attachments

```bash
curl -i -X DELETE "http://localhost:8000/api/clients/$CLIENT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

> ⚠️ If you run this now, sections 4–5 will 404. Skip 3.6 until cleanup (7.4).

---

## 🏢 4. COMPANIES  *(new)*

### 4.1 Create company under CLIENT_ID (expect 201) — sets COMPANY_ID

```bash
RESP=$(curl -s -X POST http://localhost:8000/api/companies \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"name\":\"Acme Corporation\",\"phone\":\"+1-555-0101\",\"email\":\"corp_$(date +%s)@acme.test\",\"address\":\"1 Acme Way\"}")
echo "$RESP" | jq
export COMPANY_ID=$(echo "$RESP" | jq -r '.id // empty')
echo "COMPANY_ID=$COMPANY_ID"
```

If `COMPANY_ID` blank → `CLIENT_ID` blank or 422. `echo "$RESP" | jq` will show why.

### 4.2 Create a **second** company under the same client (expect 201) — sets COMPANY2_ID

This is the key test: **one client, many companies**.

```bash
RESP=$(curl -s -X POST http://localhost:8000/api/companies \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"name\":\"Acme Labs\",\"email\":\"labs_$(date +%s)@acme.test\"}")
echo "$RESP" | jq
export COMPANY2_ID=$(echo "$RESP" | jq -r '.id // empty')
echo "COMPANY2_ID=$COMPANY2_ID"
```

### 4.3 List companies (expect 200)

```bash
curl -i "http://localhost:8000/api/companies?per_page=15" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

Each item should include `services_count` and a `client` object.

### 4.4 Filter by client (expect 200, exactly 2 rows)

```bash
curl -i "http://localhost:8000/api/companies?client_id=$CLIENT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

This is the "client has many companies" check — you should see **Acme Corporation** and **Acme Labs**.

### 4.5 Search (expect 200)

```bash
curl -i "http://localhost:8000/api/companies?search=Labs" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 4.6 Show (expect 200) — includes `services[]`

```bash
curl -i "http://localhost:8000/api/companies/$COMPANY_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 4.7 Update (expect 200)

```bash
curl -i -X PUT "http://localhost:8000/api/companies/$COMPANY_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"address":"2 Acme Way, Suite 400"}'
```

### 4.8 Duplicate name under same client → 422 (unique constraint)

```bash
curl -i -X POST http://localhost:8000/api/companies \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"name\":\"Acme Corporation\"}"
```

Expect `422` with a `name` error (unique on `client_id, name`).

### 4.9 Client show now includes companies (expect 200, 2 companies)

```bash
curl -i "http://localhost:8000/api/clients/$CLIENT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.companies | length'
```

Expect `2`.

---

## 🛠️ 5. SERVICES  *(new)*

### 5.1 Create service under COMPANY_ID (expect 201) — sets SERVICE_ID

```bash
RESP=$(curl -s -X POST http://localhost:8000/api/services \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"company_id\":$COMPANY_ID,\"name\":\"Web Development\",\"description\":\"Frontend + backend\",\"base_price\":1500.00}")
echo "$RESP" | jq
export SERVICE_ID=$(echo "$RESP" | jq -r '.id // empty')
echo "SERVICE_ID=$SERVICE_ID"
```

### 5.2 Create a **second** service on the same company (expect 201) — sets SERVICE2_ID

This is the key test: **one company, many services**.

```bash
RESP=$(curl -s -X POST http://localhost:8000/api/services \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"company_id\":$COMPANY_ID,\"name\":\"SEO\",\"base_price\":400.00}")
echo "$RESP" | jq
export SERVICE2_ID=$(echo "$RESP" | jq -r '.id // empty')
echo "SERVICE2_ID=$SERVICE2_ID"
```

### 5.3 Create a service under the *second* company (expect 201) — sets SERVICE3_ID

Proves services are scoped per-company.

```bash
RESP=$(curl -s -X POST http://localhost:8000/api/services \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"company_id\":$COMPANY2_ID,\"name\":\"Mobile App\",\"base_price\":2000.00}")
echo "$RESP" | jq
export SERVICE3_ID=$(echo "$RESP" | jq -r '.id // empty')
echo "SERVICE3_ID=$SERVICE3_ID"
```

### 5.4 List services (expect 200) — 3 total

```bash
curl -i "http://localhost:8000/api/services?per_page=15" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

Each item should include `edits_count` and `company.client`.

### 5.5 Filter by company (expect 200, exactly 2)

```bash
curl -i "http://localhost:8000/api/services?company_id=$COMPANY_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

Should return Web Development + SEO only.

### 5.6 Search (expect 200)

```bash
curl -i "http://localhost:8000/api/services?search=SEO" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 5.7 Show (expect 200) — includes `company.client`

```bash
curl -i "http://localhost:8000/api/services/$SERVICE_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 5.8 Update (expect 200)

```bash
curl -i -X PUT "http://localhost:8000/api/services/$SERVICE_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"base_price":1750.00}'
```

### 5.9 Company show now lists services (expect 2)

```bash
curl -i "http://localhost:8000/api/companies/$COMPANY_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.services | length'
```

Expect `2` (Web Development, SEO).

---

## 📝 6. EDITS

`edits` now requires **both** `client_id` and `service_id`.

### 6.1 Create edit on SERVICE_ID (expect 201) — sets EDIT_ID

```bash
RESP=$(curl -s -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"service_id\":$SERVICE_ID,\"title\":\"Homepage redesign\",\"description\":\"Update hero section\",\"due_date\":\"$(date -d '+7 days' +%Y-%m-%d)\",\"priority\":\"High\",\"payment\":250.00,\"is_paid\":false,\"status\":\"pending\"}")
echo "$RESP" | jq
export EDIT_ID=$(echo "$RESP" | jq -r '.id // empty')
echo "EDIT_ID=$EDIT_ID"
```

If 422 mentioning `service_id` → you didn't apply the `EditController@store` change.

### 6.2 Create a second edit on SERVICE2_ID (expect 201) — sets EDIT2_ID

Proves edits can be split across services of the same company.

```bash
RESP=$(curl -s -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"service_id\":$SERVICE2_ID,\"title\":\"SEO audit\",\"description\":\"Technical crawl + fixes\",\"priority\":\"Medium\",\"payment\":150.00,\"is_paid\":false,\"status\":\"pending\"}")
echo "$RESP" | jq
export EDIT2_ID=$(echo "$RESP" | jq -r '.id // empty')
echo "EDIT2_ID=$EDIT2_ID"
```

### 6.3 Create an edit on the *other* company's service (expect 201) — sets EDIT3_ID

Shows the client spans multiple companies.

```bash
RESP=$(curl -s -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"service_id\":$SERVICE3_ID,\"title\":\"Mobile splash screen\",\"description\":\"Design + build\",\"priority\":\"Low\",\"payment\":0,\"status\":\"approved\"}")
echo "$RESP" | jq
export EDIT3_ID=$(echo "$RESP" | jq -r '.id // empty')
echo "EDIT3_ID=$EDIT3_ID"
```

### 6.4 List (expect 200) — each edit includes `service.company`

```bash
curl -i "http://localhost:8000/api/edits?per_page=15" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 6.5 Filter by status (expect 200)

```bash
curl -i "http://localhost:8000/api/edits?status=pending&priority=High" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 6.6 **Filter by service_id** (expect 200, exactly 1 — the SEO audit)

New filter.

```bash
curl -i "http://localhost:8000/api/edits?service_id=$SERVICE2_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 6.7 Filter by client (expect 200, 3 rows)

```bash
curl -i "http://localhost:8000/api/edits?client_id=$CLIENT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 6.8 Show (expect 200, includes `service.company` and `attachments`)

```bash
curl -i "http://localhost:8000/api/edits/$EDIT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 6.9 Move an edit to a different service (expect 200)

```bash
curl -i -X PUT "http://localhost:8000/api/edits/$EDIT_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"service_id\":$SERVICE2_ID}"
```

Verify it moved:

```bash
curl -s "http://localhost:8000/api/edits?service_id=$SERVICE2_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" | jq '.total'
```

Expect `2` (SEO audit + moved homepage). Move it back:

```bash
curl -s -X PUT "http://localhost:8000/api/edits/$EDIT_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"service_id\":$SERVICE_ID}" > /dev/null
```

### 6.10 Update status/payment (expect 200)

```bash
curl -i -X PUT "http://localhost:8000/api/edits/$EDIT_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"in_progress","is_paid":true}'
```

### 6.11 Mark done (expect 200)

```bash
curl -i -X PUT "http://localhost:8000/api/edits/$EDIT_ID" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"status":"done"}'
```

### 6.12 Delete (expect 200)

```bash
curl -i -X DELETE "http://localhost:8000/api/edits/$EDIT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

> If you delete `EDIT_ID` here, section 7.1 (attachment upload) needs a fresh edit. Either skip 6.12 or re-create it — see cleanup 7.4.

---

## 📎 7. ATTACHMENTS

(Structure unchanged — still hangs off `edit_id`.)

### 7.0 Make a test file

```bash
echo "Hello from cURL $(date)" > /tmp/sample.txt
ls -l /tmp/sample.txt
```

### 7.1 Upload (expect 201) — sets ATTACHMENT_ID

**Before pasting:**

```bash
echo "EDIT_ID=[$EDIT_ID]"
```

If blank, re-run 6.1. Then:

```bash
RESP=$(curl -s -X POST "http://localhost:8000/api/edits/$EDIT_ID/attachments" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/sample.txt")
echo "$RESP" | jq
export ATTACHMENT_ID=$(echo "$RESP" | jq -r '.id // empty')
echo "ATTACHMENT_ID=$ATTACHMENT_ID"
```

### 7.2 List all (expect 200)

```bash
curl -i http://localhost:8000/api/attachments \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 7.3 List by edit (expect 200)

```bash
curl -i "http://localhost:8000/api/attachments?edit_id=$EDIT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

### 7.4 Download (expect 200)

```bash
curl -L "http://localhost:8000/api/attachments/$ATTACHMENT_ID/download" \
  -H "Authorization: Bearer $TOKEN" \
  -o /tmp/downloaded.bin \
  -w "HTTP %{http_code} — %{size_download} bytes\n"
head -c 200 /tmp/downloaded.bin; echo
```

### 7.5 Delete (expect 200)

```bash
curl -i -X DELETE "http://localhost:8000/api/attachments/$ATTACHMENT_ID" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🚫 8. NEGATIVE TESTS

### 8.1 No auth → 401

```bash
curl -i http://localhost:8000/api/clients -H "Accept: application/json"
```

### 8.2 Bad token → 401

```bash
curl -i http://localhost:8000/api/me \
  -H "Accept: application/json" \
  -H "Authorization: Bearer invalid_token_123"
```

### 8.3 Client missing fields → 422

```bash
curl -i -X POST http://localhost:8000/api/clients \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{}'
```

### 8.4 Duplicate client email → 422

```bash
curl -i -X POST http://localhost:8000/api/clients \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Dup","phone":"123","email":"test@example.com"}'
```

### 8.5 Company missing client_id → 422

```bash
curl -i -X POST http://localhost:8000/api/companies \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Ghost Co"}'
```

### 8.6 Company with ghost client_id → 422

```bash
curl -i -X POST http://localhost:8000/api/companies \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"client_id":999999,"name":"Ghost Co"}'
```

### 8.7 Duplicate company name under same client → 422

```bash
curl -i -X POST http://localhost:8000/api/companies \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"name\":\"Acme Corporation\"}"
```

### 8.8 Service missing company_id → 422

```bash
curl -i -X POST http://localhost:8000/api/services \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"No Parent"}'
```

### 8.9 Service with ghost company_id → 422

```bash
curl -i -X POST http://localhost:8000/api/services \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"company_id":999999,"name":"Ghost Service"}'
```

### 8.10 Duplicate service name under same company → 422

```bash
curl -i -X POST http://localhost:8000/api/services \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"company_id\":$COMPANY_ID,\"name\":\"SEO\"}"
```

### 8.11 Edit **missing service_id** → 422 (new required field)

```bash
curl -i -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"title\":\"No service\",\"description\":\"D\",\"priority\":\"High\",\"status\":\"pending\"}"
```

Expect `422` with `service_id: ["The service id field is required."]`.

### 8.12 Edit with ghost service_id → 422

```bash
curl -i -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"service_id\":999999,\"title\":\"Ghost service\",\"description\":\"D\",\"priority\":\"Low\",\"status\":\"pending\"}"
```

### 8.13 Bad priority → 422

```bash
curl -i -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"service_id\":$SERVICE_ID,\"title\":\"Bad priority\",\"description\":\"D\",\"priority\":\"URGENT\",\"status\":\"pending\"}"
```

### 8.14 Bad status → 422

```bash
curl -i -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":$CLIENT_ID,\"service_id\":$SERVICE_ID,\"title\":\"Bad status\",\"description\":\"D\",\"priority\":\"High\",\"status\":\"flying\"}"
```

### 8.15 Ghost client_id on edit → 422

```bash
curl -i -X POST http://localhost:8000/api/edits \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"client_id\":999999,\"service_id\":$SERVICE_ID,\"title\":\"Ghost\",\"description\":\"D\",\"priority\":\"Low\",\"status\":\"pending\"}"
```

### 8.16 Bad file type → 422

```bash
echo "EDIT_ID=[$EDIT_ID]"
set +H
echo '#!/bin/bash' > /tmp/bad.sh
curl -i -X POST "http://localhost:8000/api/edits/$EDIT_ID/attachments" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/bad.sh"
```

### 8.17 Unknown company / service / client → 404

```bash
curl -i http://localhost:8000/api/companies/999999 \
  -H "Accept: application/json" -H "Authorization: Bearer $TOKEN"

curl -i http://localhost:8000/api/services/999999 \
  -H "Accept: application/json" -H "Authorization: Bearer $TOKEN"

curl -i http://localhost:8000/api/clients/999999 \
  -H "Accept: application/json" -H "Authorization: Bearer $TOKEN"
```

---

## 🧹 9. CLEANUP

### 9.1 Delete attachment (expect 200)

```bash
echo "ATTACHMENT_ID=[$ATTACHMENT_ID]"
curl -i -X DELETE "http://localhost:8000/api/attachments/$ATTACHMENT_ID" \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
```

### 9.2 Delete all edits created in section 6

```bash
for ID in "$EDIT_ID" "$EDIT2_ID" "$EDIT3_ID"; do
  [ -n "$ID" ] && curl -s -o /dev/null -w "edit $ID → %{http_code}\n" \
    -X DELETE "http://localhost:8000/api/edits/$ID" \
    -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
done
```

### 9.3 Delete services

```bash
for ID in "$SERVICE_ID" "$SERVICE2_ID" "$SERVICE3_ID"; do
  [ -n "$ID" ] && curl -s -o /dev/null -w "service $ID → %{http_code}\n" \
    -X DELETE "http://localhost:8000/api/services/$ID" \
    -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
done
```

### 9.4 Delete companies

```bash
for ID in "$COMPANY_ID" "$COMPANY2_ID"; do
  [ -n "$ID" ] && curl -s -o /dev/null -w "company $ID → %{http_code}\n" \
    -X DELETE "http://localhost:8000/api/companies/$ID" \
    -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
done
```

### 9.5 Delete client (expect 200, cascades anything left)

```bash
echo "CLIENT_ID=[$CLIENT_ID]"
curl -i -X DELETE "http://localhost:8000/api/clients/$CLIENT_ID" \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
```

### 9.6 Logout

```bash
curl -i -X POST http://localhost:8000/api/logout \
  -H "Authorization: Bearer $TOKEN" -H "Accept: application/json"
```

### 9.7 Temp files

```bash
rm -f /tmp/sample.txt /tmp/downloaded.bin /tmp/bad.sh
```

### 9.8 Wipe DB (last resort)

```bash
php artisan migrate:fresh
```

---

## ✅ Expected results (updated)

| Test | HTTP |
|---|---|
| 0.1 | 401 |
| 1.1 register | 201 |
| 1.2 login | 200 |
| 1.3 me | 200 |
| 1.4 logout | 200 |
| 2.1 stats (now includes `total_companies`, `total_services`) | 200 |
| 3.1 client create (no `company_name`/`service`) | 201 |
| 3.2–3.5 | 200 |
| 3.6 client delete | 200 |
| 4.1 company create | 201 |
| 4.2 second company on same client | 201 |
| 4.3–4.7 | 200 |
| 4.8 duplicate company under client | 422 |
| 4.9 client show → 2 companies | 200 |
| 5.1 service create | 201 |
| 5.2 second service same company | 201 |
| 5.3 service under second company | 201 |
| 5.4–5.8 | 200 |
| 5.9 company show → 2 services | 200 |
| 6.1 edit create (needs `service_id`) | 201 |
| 6.2–6.3 edits on other services | 201 |
| 6.4–6.5 | 200 |
| 6.6 filter by `service_id` | 200 |
| 6.7 filter by client | 200 |
| 6.8–6.11 | 200 |
| 6.12 edit delete | 200 |
| 7.1 upload | 201 |
| 7.2–7.4 | 200 |
| 7.5 attach delete | 200 |
| 8.1–8.2 | 401 |
| 8.3–8.16 | 422 |
| 8.17 | 404 |
| 9.1–9.6 | 200 |

---

## 🧭 Common 404/422s after the refactor

| Symptom | Cause | Fix |
|---|---|---|
| `POST /api/clients` returns `422 company_name required` | Old `ClientController` still running | Re-apply updated `ClientController` and `php artisan optimize:clear` |
| `POST /api/companies` returns `404` | `api.php` missing the `apiResource('companies', …)` line | Add it, then `php artisan route:clear` |
| `POST /api/edits` returns `422 service_id required` | `EditController@store` still on old validation | Re-apply `EditController` |
| `GET /api/stats` missing `total_companies` | Old `EditController@stats` cached | Re-apply + `php artisan optimize:clear` |
| `GET /api/clients/{id}` shows no `companies` | `ClientController@show` still uses old eager-load | Re-apply `load('companies.services', …)` |
| Everything 401 | `$TOKEN` empty | Re-run 1.1 or 1.2 |

When in doubt:

```bash
echo "TOKEN=${TOKEN:0:16}… CLIENT_ID=[$CLIENT_ID] COMPANY_ID=[$COMPANY_ID] SERVICE_ID=[$SERVICE_ID] EDIT_ID=[$EDIT_ID]"
tail -f storage/logs/laravel.log
```