/**
 * Stream chunk buffering — splits streamed text into display-sized chunks.
 */

const CHUNK_MIN = 40;
const CHUNK_MAX = 70;
const DISPLAY_MAX = 58;

/**
 * Buffers streamed text and emits display-ready chunks.
 */
export class StreamBuffer {
  constructor() {
    this.buffer = '';
    this.nextId = 0;
  }

  /** Clear buffered text state. */
  reset() {
    this.buffer = '';
    this.nextId = 0;
  }

  /**
   * @param {string} piece
   * @param {number} atMs elapsed ms since stream start
   * @returns {{ id: number, atMs: number, text: string }[]}
   */
  ingest(piece, atMs) {
    this.buffer += piece.replace(/\r/g, '').replace(/\n/g, ' ');
    const emitted = [];

    while (this.buffer.length >= CHUNK_MIN) {
      const take = this.pickChunkLength();
      const text = this.buffer.slice(0, take).trimEnd();
      this.buffer = this.buffer.slice(take).trimStart();
      if (text.length >= CHUNK_MIN) {
        emitted.push(this.createEntry(text, atMs));
      }
    }

    return emitted;
  }

  /**
   * Flush remaining buffer as a final chunk.
   * @param {number} atMs
   * @returns {{ id: number, atMs: number, text: string }[]}
   */
  flush(atMs) {
    const text = this.buffer.trim();
    this.buffer = '';
    if (!text) return [];
    return [this.createEntry(text, atMs)];
  }

  /**
   * @returns {number}
   */
  pickChunkLength() {
    if (this.buffer.length <= CHUNK_MAX) return this.buffer.length;

    const target = Math.min(CHUNK_MAX, Math.max(CHUNK_MIN, 55));
    const space = this.buffer.lastIndexOf(' ', target);
    if (space >= CHUNK_MIN) return space;
    return target;
  }

  /**
   * @param {string} text
   * @param {number} atMs
   */
  createEntry(text, atMs) {
    let clipped = text;
    if (clipped.length > DISPLAY_MAX) {
      clipped = `${clipped.slice(0, DISPLAY_MAX - 3)}...`;
    }
    this.nextId += 1;
    return { id: this.nextId, atMs, text: clipped };
  }
}
