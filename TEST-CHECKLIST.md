# Form Submission End-to-End Test Checklist

Use this checklist to verify the complete data flow from form submission through all lifecycle stages.

## Test Record Details

Fill in these values during testing:
- **Test Date**: _______________
- **Submission ID**: _______________
- **Customer ID**: _______________
- **Transaction ID**: _______________

---

## 1. Form Validation

Before submitting, verify these validation rules work:

- [ ] Required fields enforced (firstName, lastName, email, phone, location, serviceType)
- [ ] Email format validated (must contain @ and valid domain)
- [ ] Phone format accepted (10 digits with optional formatting)
- [ ] VIN format validated when provided (17 alphanumeric characters)
- [ ] At least one window/glass type must be selected
- [ ] Service type must be selected
- [ ] File uploads work (up to 5 images)

**Console Check:**
Look for `[FORM] Validation failed:` if any field fails validation.

---

## 2. API Request/Response

After clicking Submit, verify:

- [ ] POST `/api/quote/submit` returns status 200/201
- [ ] Response includes `submissionId` (number)
- [ ] Response includes `customerId` (number)
- [ ] Response includes `success: true`
- [ ] If VIN provided, response shows `vinDecoded: true/false`
- [ ] No console errors in browser DevTools

**Console Check (Browser):**
```
[FORM] Submitting quote request: { email, phone, vin, serviceType, windowCount }
[FORM] Success: { submissionId, customerId, vinDecoded }
```

**Console Check (Server - via Vercel logs or local terminal):**
```
[QUOTE API] Request received: { email, phone, vin }
[QUOTE API] Customer: { action: 'created'|'found', customerId }
[QUOTE API] Quote created: { submissionId, customerId, status: 'submitted' }
```

---

## 3. Database Write Confirmation

Verify records were created in the database:

### Quote Submission Record
```sql
SELECT * FROM quote_submissions
WHERE id = :submissionId;
```
Expected fields:
- [ ] `id` matches response submissionId
- [ ] `customer_id` populated
- [ ] `status` = 'submitted'
- [ ] `email`, `first_name`, `last_name` match form input
- [ ] `selected_windows` array populated
- [ ] `created_at` timestamp present

### Customer Record
```sql
SELECT * FROM customers
WHERE id = :customerId;
```
Expected fields:
- [ ] `id` matches response customerId
- [ ] `primary_email` matches form email
- [ ] `primary_phone` matches form phone
- [ ] `first_name`, `last_name` match form input

### Activity Log Entry
```sql
SELECT * FROM activity_logs
WHERE type = 'quote_submitted'
ORDER BY timestamp DESC LIMIT 1;
```
Expected:
- [ ] `message` contains customer name and email
- [ ] `details` JSON includes submissionId, customerId, serviceType

---

## 4. Async Processes

Check background processes completed:

### VIN Lookup (if VIN was provided)
```sql
SELECT * FROM vehicle_lookups
WHERE vin = :vinFromForm;
```
- [ ] Record exists if VIN was valid
- [ ] `year`, `make`, `model` populated
- [ ] `is_valid` = true

### Activity Log
- [ ] Entry exists for `quote_submitted` event
- [ ] Timestamp matches submission time
- [ ] No error-type entries

---

## 5. State Transitions

Track the lifecycle stages:

### Quote Submission Status
| Stage | Status | How to Trigger |
|-------|--------|----------------|
| Initial | `submitted` | Form submission |
| Admin Review | `processed` | Admin marks processed in CRM |
| Pricing Complete | `quoted` | Omega EDI pricing retrieved |
| Job Created | `converted` | Work order created |
| Done | `archived` | Job completed/closed |

Verify each status change:
- [ ] Submit form -> status = "submitted"
- [ ] Admin processes -> status = "processed"
- [ ] Quote sent -> status = "quoted"
- [ ] Convert to WO -> status = "converted"

---

## 6. UI Updates

After submission, verify UI reflects the new data:

- [ ] Success message displayed in form modal
- [ ] Loading spinner shown during submit
- [ ] Error message on API failure (if testing error path)
- [ ] Form clears after success
- [ ] Modal closes after success animation

### CRM Verification
Navigate to `/admin/crm/quotes`:
- [ ] New submission appears in Quotes tab
- [ ] Customer info displays correctly
- [ ] Vehicle info displays (VIN-decoded if applicable)
- [ ] Status shows "submitted"
- [ ] Timestamp shows correct submission time

---

## 7. Error Scenarios

Test error handling by simulating failures:

### Invalid Email
- [ ] Submit with malformed email (e.g., "notanemail")
- [ ] Form shows validation error
- [ ] API is NOT called
- [ ] Console shows `[FORM] Validation failed`

### Missing Required Fields
- [ ] Submit with empty first name
- [ ] Form shows validation error
- [ ] API is NOT called

### Network Error
- [ ] Disconnect network, submit form
- [ ] Error toast displayed
- [ ] Form stays open for retry
- [ ] Console shows `[FORM] Error:`

### VIN Lookup Failure
- [ ] Submit with malformed VIN (e.g., "INVALID123")
- [ ] Form still submits successfully
- [ ] Quote uses user-provided vehicle info
- [ ] Console shows VIN lookup warning

---

## API Verification Endpoints

Use these to manually verify data:

```bash
# List all quote submissions
curl http://localhost:5000/api/quote/submissions

# Get specific submission by ID
curl http://localhost:5000/api/quote/submissions/:submissionId

# Get submission statistics
curl http://localhost:5000/api/quote/stats

# Get customer history
curl http://localhost:5000/api/customers/:customerId/history
```

---

## Quick Reference: Log Prefixes

| Prefix | Location | Purpose |
|--------|----------|---------|
| `[FORM]` | Browser Console | Client-side form events |
| `[QUOTE API]` | Server Console | Quote submission route |
| `[STORAGE]` | Server Console | Database operations |
| `[VIN]` | Server Console | VIN lookup service |

---

## Production Deployment Checklist

Before deploying to production:

- [ ] All mock data removed (technicians, contacts, jobs, conversations)
- [ ] Empty state UI shows for all components
- [ ] Build completes without errors: `npm run build`
- [ ] All tests pass (if applicable)
- [ ] Environment variables configured in Vercel
- [ ] Deploy: `npx vercel --prod --yes`
- [ ] Verify live site shows empty states (no mock data)
- [ ] Test form submission on live site
- [ ] Check Vercel logs for `[QUOTE API]` entries
