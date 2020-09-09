/* eslint-disable no-unused-vars */
/* eslint-disable no-path-concat */
const { usersFind, usersJoin } = require('./Users')
const express = require('express')
const port = process.env.PORT || 8080
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
// let lastPos;
app.use(express.static(__dirname + '/game/dist/'))

// what does this do? - no matter what route after url (localhost:8080) is added i.e. ( /game),  it'll always load file from /dist
app.get(/.*/, function (req, res) {
  res.sendFile(__dirname + '/game/dist/index.html')
})

io.on('connection', socket => {
  socket.on('userInput', ({ name, room }) => {

    io.of('/').in(room).clients((error, clients) => { // checking how many players are connected to this room
      if (error) {
        console.error('Error when checking clients')
        return
      }
      const maxJoinedClients = 1 // joined clients before connecting current client
      const clientsCount = clients.length

      if (clientsCount <= maxJoinedClients) {
        const user = usersJoin(socket.id, name, room)
        socket.join(room)

        console.log({ clientsCount, user })
        io.sockets.to(room).emit('roomJoined', { name, room, clientsCount: clientsCount + 1 }) // adding one because .join()  doesn't include client immediately
      } else console.error('Room is full')
    })
  })
})
io.on('connect', socket => {
  socket.on('keydown', ({ room, code, playerNum, position }) => {
    console.error('server is recieving: keydown', { room, code, playerNum, position }) // add additional security check for which key code is send from player
    socket.broadcast.to(room).emit('keydown', { code, playerNum, position }) // emitting to all clients in room except the sender
  })
  //  asd
  // asd

  socket.on('keyup', ({ room, code, playerNum, position }) => {
    console.error('server is recieving: keyup', { room, code, playerNum, position }) // add additional security check for which key code is send from player
    socket.broadcast.to(room).emit('keyup', { code, playerNum, position }) // emitting to all clients in room except the sender
  })
})

http.listen(port, () => {
  console.warn('listening on port:', port)
})
