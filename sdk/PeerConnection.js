class PeerConnection {
  constructor(signaling, localVideoRef, remoteVideoRef) {
    this.signaling = signaling;
    this.localVideoRef = localVideoRef;
    this.remoteVideoRef = remoteVideoRef;
    this.remoteUserId = null;

    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
    });

    this.peer.onicecandidate = (e) => {
      if (e.candidate) {
        console.log('📤 Sending ICE candidate');
        this.signaling.sendSignal(this.remoteUserId, { candidate: e.candidate });
      }
    };

  this.peer.ontrack = (event) => {
  const [stream] = event.streams;
  if (stream && this.remoteVideoRef.current) {
    console.log("🎥 Setting remote stream");
    this.remoteVideoRef.current.srcObject = stream;
  } else {
    console.warn("⚠️ No remote stream available or video ref not ready.");
  }
};

    // Listen to signal messages
    this.signaling.onSignal((from, data) => this.handleSignal(from, data));
  }

  async init(isCaller) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localVideoRef.current.srcObject = stream;

    stream.getTracks().forEach((track) => {
      this.peer.addTrack(track, stream);
    });

    if (isCaller) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      console.log('📤 Sending offer');
      this.signaling.sendSignal(null, offer); // null means: use `peerId`
    }
  }

  async handleSignal(from, data) {
    this.remoteUserId = from;

    if (data.type === 'offer') {
      await this.peer.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      console.log("📤 Sending answer");
      this.signaling.sendSignal(from, answer);
    } else if (data.type === 'answer') {
      await this.peer.setRemoteDescription(new RTCSessionDescription(data));
    } else if (data.candidate) {
      await this.peer.addIceCandidate(new RTCIceCandidate(data));
    }
  }

  close() {
    this.peer?.close();
  }
}

module.exports = PeerConnection;
