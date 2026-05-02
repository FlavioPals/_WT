import { Request, Response } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import type {
  CreateTeamMemberInput,
  ReorderTeamInput,
  TeamAdminFilters,
  TeamPublicFilters,
  UpdateTeamMemberInput,
} from './team.schemas'
import * as teamService from './team.service'

function meta(req: Request) {
  return { requestId: req.requestId, timestamp: new Date().toISOString() }
}

export const createTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await teamService.createTeamMember(req.body as CreateTeamMemberInput, req.user!.id)
  res.status(201).json({ data: member, meta: meta(req) })
})

export const getAdminTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await teamService.getAdminTeamMember(req.params.id)
  res.json({ data: member, meta: meta(req) })
})

export const updateTeamMember = asyncHandler(async (req: Request, res: Response) => {
  const member = await teamService.updateTeamMember(
    req.params.id,
    req.body as UpdateTeamMemberInput,
    req.user!.id
  )
  res.json({ data: member, meta: meta(req) })
})

export const deleteTeamMember = asyncHandler(async (req: Request, res: Response) => {
  await teamService.deleteTeamMember(req.params.id, req.user!.id)
  res.status(204).send()
})

export const reorderTeam = asyncHandler(async (req: Request, res: Response) => {
  await teamService.reorderTeam(req.body as ReorderTeamInput, req.user!.id)
  res.status(204).send()
})

export const uploadPhoto = asyncHandler(async (req: Request, res: Response) => {
  const member = await teamService.uploadTeamMemberPhoto(
    req.params.id,
    req.file as Express.Multer.File | undefined,
    req.user!.id
  )
  res.json({ data: member, meta: meta(req) })
})

export const listAdminTeamMembers = asyncHandler(async (req: Request, res: Response) => {
  const result = await teamService.listAdminTeamMembers(req.query as unknown as TeamAdminFilters)
  res.json({ data: result.items, pagination: result.pagination, meta: meta(req) })
})

export const listPublicTeamMembers = asyncHandler(async (req: Request, res: Response) => {
  const result = await teamService.listPublicTeamMembers(req.query as unknown as TeamPublicFilters)
  res.json({ data: result.items, pagination: result.pagination, meta: meta(req) })
})
