import { Request, Response } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import type {
  CreateProjectInput,
  ProjectAdminFilters,
  ProjectPublicFilters,
  ReorderProjectsInput,
  UpdateProjectInput,
} from './projects.schemas'
import * as projectsService from './projects.service'

function meta(req: Request) {
  return { requestId: req.requestId, timestamp: new Date().toISOString() }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export const createProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectsService.createProject(req.body as CreateProjectInput, req.user!.id)
  res.status(201).json({ data: project, meta: meta(req) })
})

export const getAdminProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectsService.getAdminProject(req.params.id)
  res.json({ data: project, meta: meta(req) })
})

export const updateProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectsService.updateProject(
    req.params.id,
    req.body as UpdateProjectInput,
    req.user!.id
  )
  res.json({ data: project, meta: meta(req) })
})

export const deleteProject = asyncHandler(async (req: Request, res: Response) => {
  await projectsService.deleteProject(req.params.id, req.user!.id)
  res.status(204).send()
})

export const restoreProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectsService.restoreProject(req.params.id, req.user!.id)
  res.json({ data: project, meta: meta(req) })
})

export const publishProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectsService.publishProject(req.params.id, req.user!.id)
  res.json({ data: project, meta: meta(req) })
})

export const unpublishProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectsService.unpublishProject(req.params.id, req.user!.id)
  res.json({ data: project, meta: meta(req) })
})

export const reorderProjects = asyncHandler(async (req: Request, res: Response) => {
  await projectsService.reorderProjects((req.body as ReorderProjectsInput).ids)
  res.status(204).send()
})

export const listAdminProjects = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectsService.listAdminProjects(
    req.query as unknown as ProjectAdminFilters
  )
  res.json({ data: result.items, pagination: result.pagination, meta: meta(req) })
})

// ─── Public ───────────────────────────────────────────────────────────────────

export const getPublicProject = asyncHandler(async (req: Request, res: Response) => {
  const project = await projectsService.getPublicProject(req.params.slug)
  res.json({ data: project, meta: meta(req) })
})

export const listPublicProjects = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectsService.listPublicProjects(
    req.query as unknown as ProjectPublicFilters
  )
  res.json({ data: result.items, pagination: result.pagination, meta: meta(req) })
})
