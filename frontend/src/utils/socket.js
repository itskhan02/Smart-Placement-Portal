import { io } from "socket.io-client";
import { SOCKET_URL } from "./config";

export const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});

let joinedUserId = null;
let pendingJoinUserId = null;

const joinUserRoom = (userId) => {
  socket.emit("join", userId);
  joinedUserId = userId;
  pendingJoinUserId = null;
};

export const connectSocket = (userId) => {
  if (!userId) {
    return;
  }

  if (socket.connected) {
    if (joinedUserId !== userId) {
      joinUserRoom(userId);
    }

    return;
  }

  if (pendingJoinUserId !== userId) {
    socket.off("connect", joinPendingUserRoom);
    pendingJoinUserId = userId;
    socket.once("connect", joinPendingUserRoom);
  }

  if (!socket.active) {
    socket.connect();
  }
};

function joinPendingUserRoom() {
  if (pendingJoinUserId) {
    joinUserRoom(pendingJoinUserId);
  }
}

export const disconnectSocket = () => {
  joinedUserId = null;
  pendingJoinUserId = null;
  socket.off("connect", joinPendingUserRoom);

  if (socket.connected) {
    socket.disconnect();
  }
};
