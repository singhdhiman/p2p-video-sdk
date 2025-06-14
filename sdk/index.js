const PeerConnection = require('./PeerConnection');
const SignalingClient = require('./SignalingClient');

let peerConn = null;

const connect = async (params) => {
  if (!params || typeof params !== 'object' || !params.roomId) {
    console.error("🚫 Invalid connect() params:", params);
    return;
  }

  const { roomId, localVideoRef, remoteVideoRef, isCaller } = params;
  console.log("✅ connect() received:", roomId, localVideoRef, remoteVideoRef, isCaller);

  const signaling = new SignalingClient();

  // 🔑 Wait for signaling to connect BEFORE creating PeerConnection
  await signaling.connect(roomId);

  peerConn = new PeerConnection(signaling, localVideoRef, remoteVideoRef);

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
