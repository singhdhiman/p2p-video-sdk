const PeerConnection = require('./PeerConnection');
const SignalingClient = require('./SignalingClient');

let peerConn = null;
let signaling = null;

const connect = async ({ roomId, localVideoRef, remoteVideoRef, isCaller }) => {
  // 1. Initialize signaling and connect to room
  signaling = new SignalingClient();
  await signaling.connect(roomId);

  // 2. Create PeerConnection with signaling and video refs
  peerConn = new PeerConnection(signaling, localVideoRef, remoteVideoRef);

  // 3. Initialize PeerConnection (pass isCaller!)
  peerConn.init(isCaller); // 👈 Pass role here

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

module.exports = {
  connect,
  disconnect,
};
