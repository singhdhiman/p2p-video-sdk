import { io } from 'socket.io-client';

class SignalingClient {
  constructor() {
    this.socket = io('https://9078-180-188-247-192.ngrok-free.app', { transports: ["websocket"] });
    this.signalCallback = () => {};
    this.isInitiator = false;
    this.peerId = null;
    this.roomJoined = false;
  }

  connect(roomId) {
    return new Promise((resolve) => {
      this.socket.on('joined', ({ peers }) => {
        console.log("✅ Joined room. Peers:", peers);
        if (peers.length > 0) {
          this.peerId = peers[0]; // First peer in room
          this.isInitiator = true;
        }
        this.roomJoined = true;
        resolve();
      });

      this.socket.on('new-peer', ({ id }) => {
        console.log("👤 New peer joined:", id);
        this.peerId = id; // Store peer ID when new peer joins
      });

      this.socket.on('signal', ({ from, data }) => {
        console.log('📩 Received signal:', from, data);
        this.peerId = from; // Always update sender
        this.signalCallback(from, data);
      });

      this.socket.emit('join', roomId);
    });
  }

  onSignal(callback) {
    this.signalCallback = callback;
  }

  sendSignal(to, data) {
    const receiverId = to || this.peerId;
    if (!receiverId) {
      console.warn("⚠️ Cannot send signal. Peer ID not set.");
      return;
    }

    console.log("📤 Sending signal to:", receiverId, data);
    this.socket.emit('signal', { to: receiverId, data });
  }
}

module.exports = SignalingClient;
