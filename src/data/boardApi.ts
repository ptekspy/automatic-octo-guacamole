import { SNAPSHOT_VERSION } from "../domain/constants";
import type { Note, RemoteBoard } from "../domain/model";
import { parseRemoteBoard } from "../domain/validation";

export interface BoardApi {
  load(signal: AbortSignal): Promise<RemoteBoard | null>;
  save(
    notes: Note[],
    revision: number,
    signal: AbortSignal,
  ): Promise<RemoteBoard>;
}
export type FetchPort = (request: Request) => Promise<Response>;
export class ConflictError extends Error {
  constructor() {
    super(
      "Another tab changed the remote board. Download a backup, then choose which board to keep.",
    );
  }
}
export function createBoardApi(transport: FetchPort, origin: string): BoardApi {
  const url = new URL("/api/notes", origin);
  const parse = async (response: Response): Promise<RemoteBoard> => {
    if (response.status === 409) throw new ConflictError();
    if (!response.ok)
      throw new Error(
        `Sync failed (${response.status}). Your current notes remain on the board.`,
      );
    let value: unknown;
    try {
      value = await response.json();
    } catch {
      throw new Error("The service returned an invalid board.");
    }
    const board = parseRemoteBoard(value);
    if (!board) throw new Error("The service returned an invalid board.");
    return board;
  };
  return {
    async load(signal) {
      const response = await transport(new Request(url, { signal }));
      return response.status === 404 ? null : parse(response);
    },
    async save(notes, revision, signal) {
      return parse(
        await transport(
          new Request(url, {
            method: "PUT",
            signal,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              version: SNAPSHOT_VERSION,
              notes,
              revision,
            }),
          }),
        ),
      );
    },
  };
}
