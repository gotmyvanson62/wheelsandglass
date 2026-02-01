import { Router } from 'express';
import jobsRouter from './jobs.js';
import appointmentsRouter from './appointments.js';
import paymentsRouter from './payments.js';
import webhooksRouter from './webhooks.js';
import communicationsRouter from './communications.js';
import dashboardRouter from './dashboard.js';
import quoteRouter from './quote.js';
import customersRouter from './customers.js';
import techniciansRouter from './technicians.js';
import messagesRouter from './messages.js';
import contactsRouter from './contacts.js';
import adminRouter from './admin.js';
import invoicesRouter from './invoices.js';
import subcontractorsRouter from './subcontractors.js';
import omegaRouter from './omega.js';

const router = Router();

// Mount routes
router.use('/jobs', jobsRouter);
router.use('/appointments', appointmentsRouter);
router.use('/payments', paymentsRouter);
router.use('/webhooks', webhooksRouter);
router.use('/communications', communicationsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/quote', quoteRouter);
router.use('/customers', customersRouter);
router.use('/technicians', techniciansRouter);
router.use('/messages', messagesRouter);
router.use('/contacts', contactsRouter);
router.use('/admin', adminRouter);
router.use('/invoices', invoicesRouter);
router.use('/subcontractors', subcontractorsRouter);
router.use('/omega', omegaRouter);

export default router;
