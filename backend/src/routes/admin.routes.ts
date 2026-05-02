import { Router } from 'express'
import { authenticate } from '../middlewares/authenticate.middleware'
import { requireRole } from '../middlewares/require-role.middleware'
import { mediaAdminRouter } from '../modules/media/media.router'
import { projectImagesRouter } from '../modules/project-images/project-images.router'
import { projectsAdminRouter } from '../modules/projects/projects.router'
import { siteContentAdminRouter } from '../modules/site-content/site-content.router'
import { teamAdminRouter } from '../modules/team/team.router'
import { usersAdminRouter } from '../modules/users/users.router'

export const adminRouter = Router()

adminRouter.use(authenticate)
adminRouter.use(requireRole('ADMIN', 'ARCHITECT', 'EDITOR'))

adminRouter.use('/projects', projectsAdminRouter)
adminRouter.use('/project-images', projectImagesRouter)
adminRouter.use('/team', teamAdminRouter)
adminRouter.use('/site-content', siteContentAdminRouter)
adminRouter.use('/media', mediaAdminRouter)
adminRouter.use('/users', usersAdminRouter)
