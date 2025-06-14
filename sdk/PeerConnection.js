class PeerConnection {
  constructor(signaling, localVideoRef, remoteVideoRef) {
    this.signaling = signaling;
    this.localVideoRef = localVideoRef;
    this.remoteVideoRef = remoteVideoRef;

    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // ✅ Register signal handler
    this.signaling.onSignal((from, data) => this.handleSignal(from, data));

    // ✅ ICE candidate handler
    this.peer.onicecandidate = (e) => {
      if (e.candidate) {
        console.log('📤 Sending ICE candidate');
        this.signaling.sendSignal(from, { candidate: e.candidate });
      }
    };

    // ✅ Remote track handler
    this.peer.ontrack = (event) => {
      console.log('🎥 Received remote track', event.streams[0]);
      if (this.remoteVideoRef.current) {
        this.remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
  }

  async init(isCaller) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localVideoRef.current.srcObject = stream;

    // ✅ Add local stream tracks to peer connection
    stream.getTracks().forEach((track) => {
      this.peer.addTrack(track, stream);
    });

    if (isCaller) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      console.log('📤 Sending offer');
      this.signaling.sendSignal(null, offer); // or provide target ID if needed
    }
  }

  async handleSignal(from, data) {
    if (data.type === 'offer') {
      console.log('📥 Received offer');
      await this.peer.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      console.log('📤 Sending answer');
      this.signaling.sendSignal(from, answer);
    } else if (data.type === 'answer') {
      console.log('📥 Received answer');
      await this.peer.setRemoteDescription(new RTCSessionDescription(data));
    } else if (data.candidate) {
      console.log('📥 Received ICE candidate');
      await this.peer.addIceCandidate(new RTCIceCandidate(data));
    }
  }

  close() {
    if (this.peer) {
      this.peer.close();
      console.log('❌ Connection closed');
    }
  }
}

module.exports = PeerConnection;
