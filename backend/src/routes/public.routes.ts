import { Router } from 'express'
import { projectsPublicRouter } from '../modules/projects/projects.router'

export const publicRouter = Router()

publicRouter.use('/projects', projectsPublicRouter)
