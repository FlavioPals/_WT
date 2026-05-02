import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.middleware'
import { requireRole } from '../middlewares/require-role.middleware'
import { projectImagesRouter } from '../modules/project-images/project-images.router'
import { projectsAdminRouter } from '../modules/projects/projects.router'

export const adminRouter = Router()

adminRouter.use(authenticate)
adminRouter.use(requireRole('ADMIN', 'ARCHITECT', 'EDITOR'))

adminRouter.use('/projects', projectsAdminRouter)
adminRouter.use('/project-images', projectImagesRouter)
