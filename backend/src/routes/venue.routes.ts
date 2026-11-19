import { Router } from 'express';
import { listVenues, addVenue } from '../controllers/venue.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

router.get('/',  listVenues);
router.post('/', authMiddleware, roleMiddleware, addVenue);

export default router;
