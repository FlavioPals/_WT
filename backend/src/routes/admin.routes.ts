import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.middleware'
import { requireRole } from '../middlewares/require-role.middleware'
import { projectsAdminRouter } from '../modules/projects/projects.router'

export const adminRouter = Router()

adminRouter.use(authenticate)
adminRouter.use(requireRole('ADMIN', 'ARCHITECT', 'EDITOR'))

adminRouter.use('/projects', projectsAdminRouter)
