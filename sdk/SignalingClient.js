import { io } from 'socket.io-client';

class SignalingClient {
  constructor() {
    this.socket = io('http://192.168.1.139:5000');
    this.signalCallback = () => {};
    this.isInitiator = false;
    this.peerId = null;
  }

  connect(roomId) {
    return new Promise((resolve) => {
      this.socket.on('joined', ({ peers }) => {
        if (peers.length > 0) {
          this.peerId = peers[0]; // Only one peer in 1-to-1
          this.isInitiator = true;
        }
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

  sendSignal(data) {
    if (!this.peerId) {
      console.warn("⚠️ Peer ID not set. Cannot send signal.");
      return;
    }
    console.log("📤 Sending signal to:", this.peerId, data);
    this.socket.emit('signal', { to: this.peerId, data });
  }
}


module.exports = SignalingClient;

