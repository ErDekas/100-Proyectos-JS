import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { supabaseAdmin } from '../lib/supabase'
import { authenticate, requireAdmin } from '../middleware/auth'

const CreateUserSchema = z.object({
  name:     z.string().min(2),
  email:    z.string().email(),
  password: z.string().min(8),
  role:     z.enum(['admin', 'viewer']).default('viewer'),
})

const UpdateUserSchema = z.object({
  name:     z.string().min(2).optional(),
  role:     z.enum(['admin', 'viewer']).optional(),
  password: z.string().min(8).optional(),
})

export async function usersRoutes(app: FastifyInstance) {

  // GET /api/users — list all users (admin only)
  app.get('/api/users', { preHandler: requireAdmin }, async (req, reply) => {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers()
    if (error) return reply.status(500).send({ error: 'ListError', message: error.message, statusCode: 500 })

    const users = data.users.map(u => ({
      id:              u.id,
      email:           u.email,
      name:            u.user_metadata?.name ?? u.email,
      role:            u.user_metadata?.role ?? 'viewer',
      created_at:      u.created_at,
      last_sign_in_at: u.last_sign_in_at,
    }))

    reply.send(users)
  })

  // POST /api/users — create user (admin only)
  app.post('/api/users', { preHandler: requireAdmin }, async (req, reply) => {
    const body = CreateUserSchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'ValidationError', message: body.error.message, statusCode: 400 })

    const { email, password, name, role } = body.data
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email, password,
      user_metadata: { name, role },
      email_confirm: true,
    })

    if (error) return reply.status(400).send({ error: 'CreateError', message: error.message, statusCode: 400 })
    reply.status(201).send({ id: data.user.id, email: data.user.email, name, role })
  })

  // PATCH /api/users/:id — update user (admin only)
  app.patch('/api/users/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body   = UpdateUserSchema.safeParse(req.body)
    if (!body.success) return reply.status(400).send({ error: 'ValidationError', message: body.error.message, statusCode: 400 })

    const update: any = {}
    if (body.data.password) update.password = body.data.password
    if (body.data.name || body.data.role) {
      const { data: current } = await supabaseAdmin.auth.admin.getUserById(id)
      update.user_metadata = {
        ...current?.user?.user_metadata,
        ...(body.data.name ? { name: body.data.name } : {}),
        ...(body.data.role ? { role: body.data.role } : {}),
      }
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(id, update)
    if (error) return reply.status(400).send({ error: 'UpdateError', message: error.message, statusCode: 400 })

    reply.send({
      id:    data.user.id,
      email: data.user.email,
      name:  data.user.user_metadata?.name,
      role:  data.user.user_metadata?.role,
    })
  })

  // DELETE /api/users/:id — delete user (admin only)
  app.delete('/api/users/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
    if (error) return reply.status(400).send({ error: 'DeleteError', message: error.message, statusCode: 400 })
    reply.send({ success: true })
  })
}