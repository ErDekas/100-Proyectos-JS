import type { User } from '@analytiq/shared'

declare module 'fastify' {
  interface FastifyRequest {
    user: User
  }
}
