import type { FastifyRequest, FastifyReply } from 'fastify'
import { supabase } from '../lib/supabase'

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Missing Bearer token', statusCode: 401 })
  }

  const token = auth.slice(7)
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token', statusCode: 401 })
  }

  // Attach user to request
  ;(req as any).user = {
    id:    data.user.id,
    email: data.user.email,
    role:  data.user.user_metadata?.role ?? 'viewer',
    name:  data.user.user_metadata?.name ?? data.user.email,
  }
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  await authenticate(req, reply)
  if ((req as any).user?.role !== 'admin') {
    return reply.status(403).send({ error: 'Forbidden', message: 'Admin access required', statusCode: 403 })
  }
}
