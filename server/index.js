const express = require('express')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
})

// sessions: Map<code, { hostId, guestId|null, swipes: Map<socketId, Set<mealId>> }>
const sessions = new Map()

function makeCode() {
  return Math.random().toString(36).slice(2, 7).toUpperCase()
}

function checkMatch(session, mealId) {
  const votes = [...session.swipes.values()]
  return votes.length === 2 && votes.every(s => s.has(mealId))
}

// Health check
app.get('/health', (_, res) => res.json({ ok: true }))

io.on('connection', (socket) => {
  let currentCode = null

  // HOST creates a session
  socket.on('create-session', (_, cb) => {
    let code
    do { code = makeCode() } while (sessions.has(code))

    sessions.set(code, {
      hostId: socket.id,
      guestId: null,
      swipes: new Map([[socket.id, new Set()]]),
    })
    currentCode = code
    socket.join(code)
    cb?.({ ok: true, code })
  })

  // GUEST joins by code
  socket.on('join-session', ({ code }, cb) => {
    const session = sessions.get(code)
    if (!session) return cb?.({ ok: false, error: 'Session not found' })
    if (session.guestId) return cb?.({ ok: false, error: 'Session is full' })

    session.guestId = socket.id
    session.swipes.set(socket.id, new Set())
    currentCode = code
    socket.join(code)

    // Tell both players that the session is ready
    io.to(code).emit('session-ready', { code })
    cb?.({ ok: true, code })
  })

  // Either player swipes
  socket.on('swipe', ({ mealId, direction }) => {
    if (!currentCode) return
    const session = sessions.get(currentCode)
    if (!session) return

    if (direction === 'right') {
      session.swipes.get(socket.id)?.add(mealId)

      // Tell the partner someone swiped right (without revealing which meal)
      socket.to(currentCode).emit('partner-swiped-right')

      if (checkMatch(session, mealId)) {
        io.to(currentCode).emit('match', { mealId })
      }
    }
  })

  // Confirmed meal (both lands in history)
  socket.on('confirm-meal', ({ mealId }) => {
    if (!currentCode) return
    io.to(currentCode).emit('meal-confirmed', { mealId })
  })

  socket.on('disconnect', () => {
    if (!currentCode) return
    const session = sessions.get(currentCode)
    if (!session) return

    // Notify partner
    socket.to(currentCode).emit('partner-left')

    // Clean up if host left and no guest, or both gone
    if (session.hostId === socket.id && !session.guestId) {
      sessions.delete(currentCode)
    } else if (session.guestId === socket.id) {
      session.guestId = null
      session.swipes.delete(socket.id)
    } else if (session.hostId === socket.id) {
      // Promote guest to host
      session.hostId = session.guestId
      session.guestId = null
    }
  })
})

// Cleanup stale sessions every 30 minutes
setInterval(() => {
  const cutoff = Date.now() - 30 * 60 * 1000
  for (const [code, session] of sessions) {
    if (!io.sockets.adapter.rooms.has(code)) {
      sessions.delete(code)
    }
  }
}, 30 * 60 * 1000)

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => console.log(`Lessit server running on :${PORT}`))
