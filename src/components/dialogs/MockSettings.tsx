import { useSyncExternalStore } from "react";
import type { MockService } from "../../data/mockService";
import { Button } from "../ui/Button";

export function MockSettings({ service }: { service: MockService }) {
  const settings = useSyncExternalStore(service.subscribe, service.getSnapshot);
  return (
    <div className="mt-2.5 border-t border-[#dfe5d7] pt-3">
      <h3 className="mt-[9px] mb-1.5 text-[13px] font-[650]">
        Try the demo service
      </h3>
      <p className="text-xs leading-[1.8] text-[#7a8573]">
        This is a simulated API, not cloud storage. Both copies live in this
        browser. Clearing site data removes them.
      </p>
      <label
        htmlFor="latency"
        className="mt-[22px] mb-1.5 flex justify-between text-[11px] text-[#7b8773]"
      >
        Response delay <strong>{settings.latency} ms</strong>
      </label>
      <input
        id="latency"
        type="range"
        min="200"
        max="3000"
        step="100"
        value={settings.latency}
        onChange={(event) => service.setLatency(Number(event.target.value))}
        className="mt-2 mb-[22px] w-full accent-[#53734e]"
      />
      <Button onClick={service.failNextRequest}>
        {settings.failNext
          ? "Failure armed — make an edit to try it"
          : "Fail the next API request"}
      </Button>
      <p className="mt-[15px] text-[10px] leading-[1.8] text-[#7a8573]">
        A failed request keeps your local work. Retry sync here to recover.
        Separate tabs can cause a revision conflict; you choose which board to
        keep.
      </p>
    </div>
  );
}
