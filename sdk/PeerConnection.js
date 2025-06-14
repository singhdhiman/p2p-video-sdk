class PeerConnection {
  constructor(signaling, localVideoRef, remoteVideoRef) {
    this.signaling = signaling;
    this.localVideoRef = localVideoRef;
    this.remoteVideoRef = remoteVideoRef;

    this.peer = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // Handle incoming signals from signaling server
    this.signaling.onSignal((from, data) => this.handleSignal(from, data));
  }

  async init(isCaller) {
    // 1. Get user media
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.localVideoRef.current.srcObject = stream;

    // 2. Add tracks to peer connection
    stream.getTracks().forEach(track => this.peer.addTrack(track, stream));

    // 3. Handle ICE candidates
    this.peer.onicecandidate = e => {
      if (e.candidate) {
        console.log('📤 Sending ICE candidate');
        this.signaling.sendSignal(e.candidate);
      }
    };

    // 4. Handle remote stream
    this.peer.ontrack = event => {
      console.log('🎥 Received remote track');
      this.remoteVideoRef.current.srcObject = event.streams[0];
    };

    // 5. If this is the caller, create and send offer
    if (isCaller) {
      const offer = await this.peer.createOffer();
      await this.peer.setLocalDescription(offer);
      console.log('📤 Sending offer');
      this.signaling.sendSignal(offer);
    }
  }

  async handleSignal(from, data) {
    if (data.type === 'offer') {
      console.log('📥 Received offer');
      await this.peer.setRemoteDescription(new RTCSessionDescription(data));
      const answer = await this.peer.createAnswer();
      await this.peer.setLocalDescription(answer);
      console.log('📤 Sending answer');
      this.signaling.sendSignal(answer);

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
