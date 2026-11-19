import { Router } from 'express';
import {
  listEvents,
  getEvent,
  addEvent,
  editEvent,
  removeEvent,
} from '../controllers/event.controller';
import { authMiddleware } from '../middlewares/authMiddleware';
import { roleMiddleware } from '../middlewares/roleMiddleware';

const router = Router();

router.get('/',     listEvents);
router.get('/:id',  getEvent);
router.post('/',    authMiddleware, roleMiddleware, addEvent);
router.put('/:id',  authMiddleware, roleMiddleware, editEvent);
router.delete('/:id', authMiddleware, roleMiddleware, removeEvent);

export default router;
