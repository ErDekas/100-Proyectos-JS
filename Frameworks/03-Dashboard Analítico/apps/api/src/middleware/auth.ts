import type { FastifyRequest, FastifyReply } from 'fastify'

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Missing Bearer token', statusCode: 401 })
  }

  const token = auth.slice(7)

  // Validate token directly via Supabase REST API (same method as login route)
  const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      'apikey': process.env.SUPABASE_ANON_KEY!,
      'Authorization': `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token', statusCode: 401 })
  }

  const user = await res.json() as any

  req.user = {
    id:    user.id,
    email: user.email,
    role:  user.user_metadata?.role ?? 'viewer',
    name:  user.user_metadata?.name ?? user.email,
  }
}

export async function requireAdmin(req: FastifyRequest, reply: FastifyReply) {
  await authenticate(req, reply)
  if (req.user?.role !== 'admin') {
    return reply.status(403).send({ error: 'Forbidden', message: 'Admin access required', statusCode: 403 })
  }
}
