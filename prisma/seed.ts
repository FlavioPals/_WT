import 'dotenv/config'

import bcrypt from 'bcrypt'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '../src/generated/prisma/client'
import { Role } from '../src/generated/prisma/enums'

const DEFAULT_ADMIN_EMAIL = 'admin@studiowt.com.br'
const DEFAULT_ADMIN_NAME = 'Studio WT Admin'
const SALT_ROUNDS = 12

async function main() {
  const password = process.env.ADMIN_PASSWORD

  if (!password) {
    throw new Error('ADMIN_PASSWORD não configurada.')
  }

  const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  const email = (process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL).toLowerCase()
  const name = process.env.ADMIN_NAME ?? DEFAULT_ADMIN_NAME
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role: Role.ADMIN,
    },
    create: {
      email,
      name,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  })

  await prisma.$disconnect()

  console.log(`Usuário admin pronto: ${email}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
