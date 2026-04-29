import type { FastifyRequest, FastifyReply } from 'fastify'

export async function requestLogger(req: FastifyRequest, _reply: FastifyReply) {
  req.log.info({
    method: req.method,
    url:    req.url,
    ip:     req.ip,
    ua:     req.headers['user-agent']?.slice(0, 80),
  }, 'incoming request')
}
