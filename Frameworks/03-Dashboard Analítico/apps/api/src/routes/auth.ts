import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabase, supabaseAdmin } from '../lib/supabase'
import { authenticate } from '../middleware/auth'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const SignupSchema = LoginSchema.extend({
  name: z.string().min(2),
})

export async function authRoutes(app: FastifyInstance) {

  // POST /api/auth/signup
  app.post('/api/auth/signup', {
    config: { rateLimit: { max: 3, timeWindow: '1 minute' } },
  }, async (req, reply) => {
    const body = SignupSchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'ValidationError', message: body.error.message, statusCode: 400 })

    const { email, password, name } = body.data
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email, password,
      user_metadata: { name, role: 'viewer' },
      email_confirm: true,
    })

    if (error) return reply.status(400).send({ error: 'SignupError', message: error.message, statusCode: 400 })
    reply.status(201).send({ id: data.user.id, email: data.user.email, name })
  })

  // POST /api/auth/login
  app.post('/api/auth/login', {
    config: { rateLimit: { max: 5, timeWindow: '1 minute' } },
  }, async (req, reply) => {
    const body = LoginSchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'ValidationError', message: body.error.message, statusCode: 400 })

    const res = await fetch(`${process.env.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({ email: body.data.email, password: body.data.password }),
    })

    const json = await res.json() as any

    if (!res.ok) return reply.status(401).send({ error: 'AuthError', message: 'Invalid credentials', statusCode: 401 })

    // Get user metadata
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(json.user.id)

    reply.send({
      accessToken: json.access_token,
      refreshToken: json.refresh_token,
      expiresAt: json.expires_at,
      user: {
        id: json.user.id,
        email: json.user.email,
        name: userData?.user?.user_metadata?.name ?? json.user.email,
        role: userData?.user?.user_metadata?.role ?? 'viewer',
      },
    })
  })

  // POST /api/auth/refresh
  app.post<{ Body: { refreshToken: string } }>('/api/auth/refresh', async (req, reply) => {
    const { refreshToken } = req.body
    if (!refreshToken) return reply.status(400).send({ error: 'BadRequest', message: 'refreshToken required', statusCode: 400 })

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
    if (error) return reply.status(401).send({ error: 'AuthError', message: error.message, statusCode: 401 })

    reply.send({
      accessToken: data.session!.access_token,
      refreshToken: data.session!.refresh_token,
      expiresAt: data.session!.expires_at,
    })
  })

  // GET /api/auth/me
  app.get('/api/auth/me', { preHandler: authenticate }, async (req, reply) => {
    reply.send(req.user)
  })

  // POST /api/auth/logout
  app.post('/api/auth/logout', { preHandler: authenticate }, async (req, reply) => {
    const token = req.headers.authorization!.slice(7)
    await supabase.auth.admin.signOut(token)
    reply.send({ success: true })
  })
}
