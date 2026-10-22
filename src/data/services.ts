import { NotesStore } from "../store/NotesStore";
import { createBoardApi } from "./boardApi";
import { MockService } from "./mockService";

export function createServices() {
  const storage = {
    getItem: (key: string) => localStorage.getItem(key),
    setItem: (key: string, value: string) => localStorage.setItem(key, value),
  };
  const mock = new MockService(storage);
  return {
    store: new NotesStore(
      storage,
      createBoardApi(mock.transport, window.location.origin),
    ),
    mock,
  };
}
