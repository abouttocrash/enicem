import { Router } from 'express';
import projectRouter from './projectRoutes.js';
import catalogRouter from './catalogRoutes.js';
import logRouter from './logRoutes.js';
import userRouter from './userRoutes.js';
import providerRouter from './ProviderRoutes.js';
import orderRouter from './orderRoutes.js';
import salidaRouter from './salidasRoutes.js';
import rechazoRouter from './RechazoRoutes.js';

const apiRouter = Router();

apiRouter.use('/api/projects', projectRouter);
apiRouter.use('/api/catalog', catalogRouter);
apiRouter.use('/api/logs', logRouter);
apiRouter.use('/api/user', userRouter);
apiRouter.use('/api/proveedor', providerRouter);
apiRouter.use('/api/order', orderRouter);
apiRouter.use('/api/out', salidaRouter);
apiRouter.use('/api/rechazo', rechazoRouter);

export default apiRouter;

