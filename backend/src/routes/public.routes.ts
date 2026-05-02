import { Router } from 'express'
import { projectsPublicRouter } from '../modules/projects/projects.router'
import { teamPublicRouter } from '../modules/team/team.router'

export const publicRouter = Router()

publicRouter.use('/projects', projectsPublicRouter)
publicRouter.use('/team', teamPublicRouter)
