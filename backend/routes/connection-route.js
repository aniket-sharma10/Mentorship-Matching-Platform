import express from 'express';
import {sendRequest,acceptRequest,declineRequest,getConnections,getPending,deleteConnection} from '../controllers/connection-controller.js';
import auth from '../middlewares/authentication.js';

const router = express.Router();

router.post('/send', auth, sendRequest);
router.patch('/accept', auth, acceptRequest);
router.patch('/decline', auth, declineRequest);
router.get('/connections', auth, getConnections);
router.get('/pending', auth, getPending);
router.delete('/:connectionId', auth, deleteConnection);

export default router;
