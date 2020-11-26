const socketIo = io => {
  io.on('connection', socket => {
    console.log(`socket ${socket.id} connected`);

    socket.on('join-room', noteId => {
      socket.join(noteId);
    });

    socket.on('leave-room', noteId => {
      socket.leave(noteId);
    });

    socket.on('sharing-note-typed', (...args) => {
      const [noteId, noteValue] = args;

      socket.to(noteId).emit('sharing-note-typed', noteValue);
    });
  });
};

module.exports = socketIo;
