import { Server } from 'socket.io';

let io: Server | null = null;

export const setSocket = (instance: Server) => {
  io = instance;
};

export const getSocket = () => {
  if (!io) {
    throw new Error('Socket.IO is not initialized');
  }
  return io;
};

export const emitOrderUpdate = (orderId: string, payload: unknown) => {
  if (!io) return;
  io.emit(`order:${orderId}`, payload);
  io.emit('orders:all', payload);
};
