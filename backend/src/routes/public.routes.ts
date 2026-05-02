import { Router } from 'express'
import { projectsPublicRouter } from '../modules/projects/projects.router'
import { siteContentPublicRouter } from '../modules/site-content/site-content.router'
import { teamPublicRouter } from '../modules/team/team.router'

export const publicRouter = Router()

publicRouter.use('/projects', projectsPublicRouter)
publicRouter.use('/team', teamPublicRouter)
publicRouter.use('/site', siteContentPublicRouter)
