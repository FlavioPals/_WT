import { Request, Response } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import type {
  CreateUserInput,
  ResetPasswordInput,
  UpdateUserInput,
  UsersAdminFilters,
} from './users.schemas'
import * as usersService from './users.service'

function meta(req: Request) {
  return { requestId: req.requestId, timestamp: new Date().toISOString() }
}

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await usersService.listUsers(req.query as unknown as UsersAdminFilters)
  res.json({ data: result.items, pagination: result.pagination, meta: meta(req) })
})

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const result = await usersService.createUser(req.body as CreateUserInput, req.user!.id)
  res.status(201).json({ data: result, meta: meta(req) })
})

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.getUser(req.params.id)
  res.json({ data: user, meta: meta(req) })
})

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await usersService.updateUser(
    req.params.id,
    req.body as UpdateUserInput,
    req.user!.id
  )
  res.json({ data: user, meta: meta(req) })
})

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await usersService.deleteUser(req.params.id, req.user!.id)
  res.status(204).send()
})

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await usersService.resetUserPassword(
    req.params.id,
    req.body as ResetPasswordInput,
    req.user!.id
  )
  res.json({ data: result, meta: meta(req) })
})

export const revokeSessions = asyncHandler(async (req: Request, res: Response) => {
  const result = await usersService.revokeUserSessions(req.params.id, req.user!.id)
  res.json({ data: result, meta: meta(req) })
})
