const PeerConnection = require('./PeerConnection');
const SignalingClient = require('./SignalingClient');

let peerConn = null;

const connect = async ({ roomId, localVideoRef, remoteVideoRef }) => {
  const signaling = new SignalingClient();
  peerConn = new PeerConnection(signaling, localVideoRef, remoteVideoRef);

  await signaling.connect(roomId);
  peerConn.init();

  return peerConn;
};

const disconnect = () => {
  if (peerConn) {
    peerConn.close();
    peerConn = null;
  }
};

// 👇 Export using CommonJS
module.exports = {
  connect,
  disconnect,
};
