import { Router } from 'express';
import { buyTicket, myTickets } from '../controllers/ticket.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.post('/',           authMiddleware, buyTicket);
router.get('/my-tickets',  authMiddleware, myTickets);

export default router;
