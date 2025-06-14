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
    // When successfully joined the room
    this.socket.on('joined', ({ peers }) => {
      console.log("✅ Joined room. Peers:", peers);

      // If other peers are already in the room, pick the first one to connect
      if (peers.length > 0) {
        this.peerId = peers[0]; // Connect to the first peer
        this.isInitiator = true;
      }

      this.roomJoined = true;
      resolve();
    });

    // When a new peer joins after you
    this.socket.on('new-peer', ({ id }) => {
      console.log("👤 New peer joined:", id);

      // If I'm the initiator, and no peerId is set, set it to new peer
      if (!this.peerId) {
        this.peerId = id;
      }
    });

    // When receiving a signal (offer/answer/ICE)
    this.socket.on('signal', ({ from, data }) => {
      console.log('📩 Received signal:', from, data);

      // Always store who sent this signal
      this.peerId = from;

      // Trigger the callback in PeerConnection
      this.signalCallback(from, data);
    });

    // Join the room
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
