import type { BoardState } from "../domain/board";
export type SyncStatus =
  "loading" | "pending" | "syncing" | "synced" | "error" | "conflict";
export interface StoreView extends BoardState {
  status: SyncStatus;
  localError: string | null;
  syncError: string | null;
}
export const SYNC_LABELS: Record<SyncStatus, string> = {
  loading: "Connecting…",
  pending: "Changes waiting",
  syncing: "Syncing…",
  synced: "All changes saved",
  error: "Sync needs attention",
  conflict: "Two boards need a choice",
};
