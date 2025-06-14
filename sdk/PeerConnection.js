class PeerConnection {
  constructor(signaling, localVideoRef, remoteVideoRef) {
    this.signaling = signaling;
    this.localVideoRef = localVideoRef;
    this.remoteVideoRef = remoteVideoRef;
    this.remoteUserId = null;

    this.peer = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });

    this.peer.onicecandidate = (e) => {
      if (e.candidate && this.remoteUserId) {
        console.log('📤 Sending ICE candidate');
        this.signaling.sendSignal(this.remoteUserId, { candidate: e.candidate });
      }
    };

    this.peer.ontrack = (event) => {
      if (this.remoteVideoRef.current) {
        this.remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Register signal listener
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
      this.signaling.sendSignal(null, offer); // null → server determines receiver
    }
  }

  async handleSignal(from, data) {
    // Store remote user ID for ICE
    console.log("📩 Received signal from:", from, data);
    this.remoteUserId = from;

    if (data.type === 'offer') {
      await this.peer.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
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
