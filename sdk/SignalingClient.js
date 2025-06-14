import { io } from 'socket.io-client';

class SignalingClient {
  constructor() {
    this.socket = io('http://192.168.1.139:5000');
    this.signalCallback = () => {};
    this.isInitiator = false;
    this.peerId = null;
    this.roomJoined = false;
  }

  connect(roomId) {
    return new Promise((resolve) => {
      this.socket.on('joined', ({ peers }) => {
        if (peers.length > 0) {
          this.peerId = peers[0]; // Set peerId if another peer is already in room
          this.isInitiator = true;
        }
        this.roomJoined = true;
        resolve();
      });

      this.socket.on('signal', (data) => {
        console.log('📩 Received signal:', data);
        this.signalCallback(data.from, data.data);
      });

      this.socket.emit('join', roomId);
    });
  }

  onSignal(callback) {
    this.signalCallback = callback;
  }

  isReadyToSend() {
    return this.peerId != null;
  }

  sendSignal(data) {
    if (!this.isReadyToSend()) {
      console.warn("⚠️ Peer ID not set. Cannot send signal.");
      return;
    }

    console.log("📤 Sending signal to:", this.peerId, data);
    this.socket.emit('signal', { to: this.peerId, data });
  }
}

module.exports = SignalingClient;
