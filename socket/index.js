const { socketEvents } = require('../constants');

const socketIo = io => {
  io.on(socketEvents.CONNENCTION, socket => {
    console.log(`socket ${socket.id} connected`);

    socket.on(socketEvents.JOIN_ROOM, noteId => {
      socket.join(noteId);
    });

    socket.on(socketEvents.LEAVE_ROOM, noteId => {
      socket.leave(noteId);
    });

    socket.on(socketEvents.SHARING_NOTE_TYPED, (...args) => {
      const [noteId, noteValue] = args;

      socket.to(noteId)
        .emit(socketEvents.SHARING_NOTE_TYPED, noteValue);
    });
  });
};

module.exports = socketIo;
