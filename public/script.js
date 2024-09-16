let vidScaleClient = null;
const peers = new Map(); // Map to store peer details

document
  .getElementById("joinButton")
  .addEventListener("click", async (event) => {
    event.preventDefault();

    const roomId = document.getElementById("roomId").value;
    const peerId = document.getElementById("peerId").value;

    if (!roomId || !peerId) {
      alert("Please provide both Room ID and Peer ID to join.");
      return;
    }

    // Fetch session token
    const response = await fetch("/api/create-session-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomId }),
    });

    const data = await response.json();
    const sessionToken = data.sessionToken;

    if (sessionToken) {
      const params = {
        sessionToken,
        roomId,
        peerId,
        produce: true,
        consume: true,
      };

      try {
        vidScaleClient = await VidScale.JsSdk.joinRoom(params);
        console.log("Successfully joined the room:", vidScaleClient);

        // Set up event listeners
        vidScaleClient.on("newPeer", ({ peerId, peerName, type }) => {
          console.log(`New peer joined: ${peerName} (ID: ${peerId})`);
          addPeer(peerId, peerName, type);
        });

        // vidScaleClient.on("videoStart", ({ peerId, videoTrack, type }) => {
        //   console.log(`Video started for peer: ${peerId}`);
        //   updatePeerVideo(peerId, videoTrack, type);
        // });

        // vidScaleClient.on("videoEnd", ({ peerId, type }) => {
        //   console.log(`Video ended for peer: ${peerId}`);
        //   removePeerVideo(peerId, type);
        // });

        vidScaleClient.on("micStart", ({ peerId, audioTrack, type }) => {
          console.log(`Mic started for peer: ${peerId}`);
          updatePeerAudio(peerId, audioTrack, type);
        });

        vidScaleClient.on("micEnd", ({ peerId }) => {
          console.log(`Mic ended for peer: ${peerId}`);
          removePeerAudio(peerId);
        });

        vidScaleClient.on("peerMuted", ({ peerId, type }) => {
          console.log(`Peer muted: ${peerId}`);
          const peer = peers.get(peerId);
          if (peer && type === "remote") {
            peer.muteStatusMessage.textContent = "Muted";
            peer.muteStatusMessage.style.display = "block"; // Show the message
          }
        });

        vidScaleClient.on("peerUnMuted", ({ peerId, type }) => {
          console.log(`Peer unmuted: ${peerId}`);
          const peer = peers.get(peerId);
          if (peer && type === "remote") {
            peer.muteStatusMessage.textContent = "Unmuted";
            peer.muteStatusMessage.style.display = "block"; // Show the message
          }
        });

        vidScaleClient.on("videoStart", ({ peerId, videoTrack, type }) => {
          console.log(`Video started for peer: ${peerId}`);
          updatePeerVideo(peerId, videoTrack, type);
          const peer = peers.get(peerId);
          if (peer && type === "remote") {
            peer.camStatusMessage.textContent = "Camera turned on"; // Update status message
            peer.camStatusMessage.style.display = "block"; // Show the message
          }
        });

        vidScaleClient.on("videoEnd", ({ peerId, type }) => {
          console.log(`Video ended for peer: ${peerId}`);
          const peer = peers.get(peerId);
          if (peer) {
            peer.camStatusMessage.textContent = "Camera turned off"; // Update status message
            peer.camStatusMessage.style.display = "block"; // Show the message
          }
          removePeerVideo(peerId, type);
        });

        vidScaleClient.on("peerLeft", ({ peerId }) => {
          console.log(`Peer left: ${peerId}`);
          removePeer(peerId);
        });

        vidScaleClient.on("error", ({ code, text }) => {
          console.error("Error code:", code, "Error text:", text);
        });

        document.getElementById("leaveButton").disabled = false;
        document.getElementById("joinButton").disabled = true;
      } catch (error) {
        console.error("Error joining room:", error);
      }
    } else {
      alert("Failed to fetch session token.");
    }
  });

document.getElementById("leaveButton").addEventListener("click", async () => {
  if (vidScaleClient) {
    await vidScaleClient.leaveRoom();
    console.log("Left the room");
    document.getElementById("leaveButton").disabled = true;
    document.getElementById("joinButton").disabled = false;
    showThankYouMessage();
  }
});

function addPeer(peerId, peerName, type) {
  if (!peers.has(peerId)) {
    const peerCard = document.createElement("div");
    peerCard.className = "peer-card";
    peerCard.id = `peer-${peerId}`;

    const peerNameElement = document.createElement("div");
    peerNameElement.textContent = peerId;

    const peerVideo = document.createElement("video");
    peerVideo.autoplay = true;
    peerVideo.playsinline = true;

    const peerAudio = document.createElement("audio");
    peerAudio.autoplay = true;
    peerAudio.playsinline = true;

    const muteStatusMessage =
      type === "remote" ? document.createElement("div") : null;
    if (muteStatusMessage) {
      muteStatusMessage.className = "mute-status";
      muteStatusMessage.style.display = "none";
    }

    const camStatusMessage =
      type === "remote" ? document.createElement("div") : null;
    if (camStatusMessage) {
      camStatusMessage.className = "cam-status";
      camStatusMessage.style.display = "none";
    }

    peerCard.appendChild(peerNameElement);
    peerCard.appendChild(peerVideo);
    peerCard.appendChild(peerAudio);
    if (muteStatusMessage) peerCard.appendChild(muteStatusMessage);
    if (camStatusMessage) peerCard.appendChild(camStatusMessage);

    const peerMedia = document.createElement("div");
    peerMedia.className = "peer-media";

    if (type === "local") {
      const peerMuteButton = document.createElement("button");
      peerMuteButton.textContent = "Mute";
      peerMuteButton.id = "mute-button";

      const camToggleButton = document.createElement("button");
      camToggleButton.textContent = "Camera Off";
      camToggleButton.id = "cam-toggle-button";

      peerMedia.appendChild(peerMuteButton);
      peerMedia.appendChild(camToggleButton);
      peerCard.appendChild(peerMedia);

      peerMuteButton.addEventListener("click", async () => {
        if (peerMuteButton.textContent === "Mute") {
          await vidScaleClient.muteMic();
          peerMuteButton.textContent = "Unmute";
        } else {
          await vidScaleClient.unmuteMic();
          peerMuteButton.textContent = "Mute";
        }
      });

      camToggleButton.addEventListener("click", async () => {
        if (camToggleButton.textContent === "Camera Off") {
          await vidScaleClient.disableCam();
          camToggleButton.textContent = "Camera On";
        } else {
          await vidScaleClient.enableCam();
          camToggleButton.textContent = "Camera Off";
        }
      });
    }

    document.getElementById("peerList").appendChild(peerCard);
    peers.set(peerId, {
      peerName,
      videoElement: peerVideo,
      audioElement: peerAudio,
      muted: false,
      cameraOn: true,
      muteStatusMessage,
      camStatusMessage,
    });
  }
}

function updatePeerVideo(peerId, videoTrack, type) {
  const peer = peers.get(peerId);
  if (peer) {
    const videoStream = new MediaStream();
    videoStream.addTrack(videoTrack);
    peer.videoElement.srcObject = videoStream;
    peer.videoElement
      .play()
      .catch((error) =>
        console.warn(`Error playing video for peer ${peerId}:`, error)
      );
  }
}

function removePeerVideo(peerId, type) {
  const peer = peers.get(peerId);
  if (peer) {
    peer.videoElement.srcObject = null;
  }
}

function updatePeerAudio(peerId, audioTrack, type) {
  const peer = peers.get(peerId);
  if (peer && type === "remote") {
    const audioStream = new MediaStream();
    audioStream.addTrack(audioTrack);
    peer.audioElement.srcObject = audioStream;
    peer.audioElement
      .play()
      .catch((error) =>
        console.warn(`Error playing video for peer ${peerId}:`, error)
      );
  }
}

function removePeerAudio(peerId) {
  const peer = peers.get(peerId);
  if (peer) {
    console.log(`Removing audio for peer: ${peerId}`);
    peer.audioElement.srcObject = null;
  }
}

function removePeer(peerId) {
  const peerCard = document.getElementById(`peer-${peerId}`);
  if (peerCard) {
    peerCard.remove();
  }
  peers.delete(peerId);
}

function showThankYouMessage() {
  const thankYouMessage = document.createElement("div");
  thankYouMessage.textContent = "Thanks for trying our demo";

  document.body.appendChild(thankYouMessage);

  setTimeout(() => {
    thankYouMessage.remove();
  }, 5000);
}
