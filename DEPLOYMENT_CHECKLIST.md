# Wheels and Glass - Production Deployment Checklist

## Pre-Deployment Verification

### 1. Environment Variables
Verify all required environment variables are set in Vercel:

**Required:**
- [ ] `DATABASE_URL` or `POSTGRES_URL` - PostgreSQL connection string
- [ ] `JWT_SECRET` - At least 32 characters for token signing
- [ ] `CLIENT_URL` - Production frontend URL (e.g., `https://wheels-and-glass.vercel.app`)
- [ ] `NODE_ENV` - Set to `production`

**Payments (Square):**
- [ ] `SQUARE_ACCESS_TOKEN` - Square API access token
- [ ] `SQUARE_LOCATION_ID` - Square location ID
- [ ] `SQUARE_ENVIRONMENT` - Set to `production`
- [ ] `SQUARE_WEBHOOK_SECRET` - For webhook signature verification

**SMS (Quo/OpenPhone):**
- [ ] `QUO_API_KEY` - Quo API key
- [ ] `QUO_PHONE_NUMBER_ID` - Phone number ID for sending
- [ ] `QUO_WEBHOOK_SECRET` - For webhook signature verification

**Glass Ordering (Omega EDI):**
- [ ] `OMEGA_API_KEY` - Omega EDI API key
- [ ] `OMEGA_API_BASE_URL` - Omega EDI API URL
- [ ] `OMEGA_SHOP_ID` - Shop identifier

### 2. Database Preparation
- [ ] Run database migrations: `npm run db:migrate`
- [ ] Verify database connection works
- [ ] Check for pending migrations
- [ ] Create default admin user if needed

### 3. Code Quality Checks
- [ ] Run build: `npm run build`
- [ ] Fix any TypeScript errors
- [ ] No console errors in browser
- [ ] All API endpoints return proper responses

### 4. Security Verification
- [ ] HTTPS enabled on production domain
- [ ] CORS configured for production domain only
- [ ] Rate limiting enabled (100 req/15min default)
- [ ] Helmet security headers enabled
- [ ] No sensitive data in git history
- [ ] No hardcoded credentials in code
- [ ] Webhook signatures being verified

### 5. Integration Testing

**Authentication:**
- [ ] Admin login works with production credentials
- [ ] JWT tokens are properly signed and validated
- [ ] Session cookies are secure and HTTP-only
- [ ] Logout properly clears session

**Quote Form:**
- [ ] Form submission creates database record
- [ ] Email validation works
- [ ] Phone validation works
- [ ] File uploads work (if enabled)
- [ ] Success/error messages display correctly

**CRM Dashboard:**
- [ ] Dashboard loads with real data
- [ ] All tabs navigate correctly (Quotes, Jobs, Team, etc.)
- [ ] Search and filters work
- [ ] Pagination works for large datasets

**Payments (if Square configured):**
- [ ] Payment links generate correctly
- [ ] Webhook receives payment confirmations
- [ ] Payment status updates in database

**SMS (if Quo configured):**
- [ ] Outbound SMS sends successfully
- [ ] Inbound SMS webhook receives messages
- [ ] Auto-replies work (YES, NO, RESCHEDULE)

### 6. Performance Verification
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms for common endpoints
- [ ] No memory leaks (monitor over time)
- [ ] Database queries are optimized (check for N+1 queries)

### 7. Monitoring Setup
- [ ] Vercel deployment logs accessible
- [ ] Error tracking configured (if using external service)
- [ ] Database monitoring enabled
- [ ] Uptime monitoring configured

---

## Deployment Steps

### 1. Deploy to Vercel
```bash
# Build and deploy
npx vercel --prod --yes

# Verify deployment URL
https://wheels-and-glass.vercel.app
```

### 2. Post-Deployment Verification
- [ ] Home page loads correctly
- [ ] Quote form accessible at `/`
- [ ] Admin login at `/admin/login`
- [ ] Dashboard at `/admin/dashboard`
- [ ] All API endpoints respond

### 3. Webhook Configuration
Configure webhooks in external services:

**Square (if using payments):**
- Webhook URL: `https://wheels-and-glass.vercel.app/api/webhooks/square-payment`
- Events: `payment.completed`, `payment.failed`

**Quo/OpenPhone (if using SMS):**
- Webhook URL: `https://wheels-and-glass.vercel.app/api/webhooks/quo-sms`
- Events: `message.received`, `message.delivered`

**Squarespace (if using forms):**
- Webhook URL: `https://wheels-and-glass.vercel.app/api/webhooks/squarespace-form`

### 4. DNS Configuration (if custom domain)
- [ ] Add custom domain in Vercel
- [ ] Update DNS records as instructed
- [ ] Verify SSL certificate issued
- [ ] Update `CLIENT_URL` environment variable

---

## Rollback Procedure

If deployment fails:

1. **Quick Rollback:**
   ```bash
   vercel rollback
   ```

2. **Specific Version:**
   ```bash
   vercel ls  # List deployments
   vercel rollback <deployment-url>
   ```

3. **Database Issues:**
   - If migration failed, review migration logs
   - Consider restoring from backup if data corrupted

---

## Maintenance Mode

To enable maintenance mode:
1. Create `client/src/pages/maintenance.tsx` with maintenance message
2. Update routes to redirect to maintenance page
3. Deploy with maintenance flag

---

## Emergency Contacts

- **Vercel Support:** https://vercel.com/support
- **Square Support:** https://squareup.com/help
- **OpenPhone Support:** https://support.openphone.com

---

## Post-Launch Monitoring

### First 24 Hours
- [ ] Monitor error rates in logs
- [ ] Check database performance
- [ ] Verify all integrations working
- [ ] Test critical user flows

### First Week
- [ ] Review performance metrics
- [ ] Check for any memory leaks
- [ ] Monitor API response times
- [ ] Review user feedback

### Ongoing
- [ ] Weekly backup verification
- [ ] Monthly security review
- [ ] Quarterly dependency updates
- [ ] Regular performance audits
