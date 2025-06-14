const PeerConnection = require('./PeerConnection');
const SignalingClient = require('./SignalingClient');

let peerConn = null;

const connect = async (params) => {
  // Defensive check: prevent incorrect usage
  if (!params || typeof params !== 'object' || !params.roomId) {
    console.error("🚫 Invalid connect() params:", params);
    return;
  }

  const { roomId, localVideoRef, remoteVideoRef, isCaller } = params;
  console.log("✅ connect() received:", roomId, localVideoRef, remoteVideoRef, isCaller);

  const signaling = new SignalingClient();
  peerConn = new PeerConnection(signaling, localVideoRef, remoteVideoRef);

  await signaling.connect(roomId);
  await peerConn.init(isCaller);
};


const disconnect = () => {
  if (peerConn) {
    peerConn.close();
    peerConn = null;
  }
};

module.exports = {
  connect,
  disconnect
};
