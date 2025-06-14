const PeerConnection = require('./PeerConnection');
const SignalingClient = require('./SignalingClient');

let peerConn = null;
let signaling = null;

const connect = async ({ roomId, localVideoRef, remoteVideoRef }) => {
  // 1. Initialize signaling and connect to room
  signaling = new SignalingClient();
  await signaling.connect(roomId);

  // 2. Create PeerConnection with signaling and video refs
  peerConn = new PeerConnection(signaling, localVideoRef, remoteVideoRef);

  // 3. Initialize PeerConnection (create offer/handle offer/answer etc.)
  peerConn.init();

  return peerConn;
};

const disconnect = () => {
  if (peerConn) {
    peerConn.close();
    peerConn = null;
  }

  if (signaling) {
    signaling.disconnect();
    signaling = null;
  }
};

// 👇 Export using CommonJS
module.exports = {
  connect,
  disconnect,
};
