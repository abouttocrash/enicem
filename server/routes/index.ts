import { Router } from 'express';
import projectRouter from './projectRoutes.js';
import catalogRouter from './catalogRoutes.js';
import logRouter from './logRoutes.js';
import userRouter from './userRoutes.js';
import providerRouter from './ProviderRoutes.js';
import orderRouter from './orderRoutes.js';

const apiRouter = Router();

apiRouter.use('/projects', projectRouter);
apiRouter.use('/catalog', catalogRouter);
apiRouter.use('/logs', logRouter);
apiRouter.use('/user', userRouter);
apiRouter.use('/proveedor', providerRouter);
apiRouter.use('/order', orderRouter);

export default apiRouter;

