/**
 * Browser-side tournament recording controller.
 * The caller supplies a MediaStream (for example, a game canvas captureStream).
 * This module does not request screen/camera permissions by itself.
 */
export function createTournamentRecorder({
  stream,
  MediaRecorderClass = globalThis.MediaRecorder,
  mimeType,
  onChunk = () => {},
  onStateChange = () => {}
} = {}) {
  if (!stream || typeof stream.getTracks !== "function") {
    throw new TypeError("A valid MediaStream is required.");
  }
  if (typeof MediaRecorderClass !== "function") {
    throw new Error("MediaRecorder is not supported in this browser.");
  }

  const supported = [
    mimeType,
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm"
  ].filter(Boolean);
  const selectedType = supported.find((type) =>
    typeof MediaRecorderClass.isTypeSupported !== "function" ||
    MediaRecorderClass.isTypeSupported(type)
  );
  if (!selectedType) throw new Error("No supported WebM recording format was found.");

  const recorder = new MediaRecorderClass(stream, { mimeType: selectedType });
  const chunks = [];
  let startedAt = null;
  let stoppedAt = null;

  recorder.addEventListener("dataavailable", (event) => {
    if (event.data && event.data.size > 0) {
      chunks.push(event.data);
      onChunk(event.data);
    }
  });

  recorder.addEventListener("start", () => onStateChange("recording"));
  recorder.addEventListener("stop", () => onStateChange("stopped"));
  recorder.addEventListener("error", (event) => onStateChange("error", event.error ?? event));

  return {
    get state() { return recorder.state; },
    get chunks() { return [...chunks]; },
    get startedAt() { return startedAt; },
    get stoppedAt() { return stoppedAt; },
    start(timesliceMs = 1000) {
      if (recorder.state !== "inactive") throw new Error("Recording has already started.");
      if (!Number.isInteger(timesliceMs) || timesliceMs < 250) {
        throw new RangeError("Recording timeslice must be an integer of at least 250ms.");
      }
      startedAt = new Date().toISOString();
      recorder.start(timesliceMs);
      return startedAt;
    },
    stop() {
      if (recorder.state === "inactive") throw new Error("Recording is not active.");
      return new Promise((resolve, reject) => {
        const handleError = (event) => {
          recorder.removeEventListener("error", handleError);
          reject(event.error ?? new Error("Recording failed."));
        };
        const handleStop = () => {
          recorder.removeEventListener("error", handleError);
          stoppedAt = new Date().toISOString();
          const blob = new Blob(chunks, { type: recorder.mimeType || selectedType });
          resolve({
            blob,
            mimeType: recorder.mimeType || selectedType,
            startedAt,
            stoppedAt,
            durationMs: Math.max(0, Date.parse(stoppedAt) - Date.parse(startedAt)),
            chunkCount: chunks.length
          });
        };
        recorder.addEventListener("error", handleError, { once: true });
        recorder.addEventListener("stop", handleStop, { once: true });
        recorder.stop();
      });
    }
  };
}

export function createRecordingFilename({ tournamentId, stageId, extension = "webm" }) {
  const safe = (value) => String(value || "unknown").replace(/[^a-zA-Z0-9_-]/g, "-");
  return `dwa-${safe(tournamentId)}-${safe(stageId)}.${safe(extension)}`;
}
