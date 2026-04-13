import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getPopupId,
  closePopups,
  closePopupsByIds,
  closeOnMapClickPopups,
  enforceMaxPopups,
} from "../popup.js";
import type { MapkaMap, MapMapkaPopup } from "../../map.js";
import type { MapkaPopupOptionsResolved } from "../../types/popup.js";

function createMockPopup(
  overrides: Partial<{
    id: string;
    lngLat: [number, number];
    content: object | HTMLElement;
    closeOnClick: boolean;
  }> = {},
): MapMapkaPopup {
  const id = overrides.id ?? `popup-${Math.random().toString(36).slice(2)}`;
  const lngLat = overrides.lngLat ?? [0, 0];
  const content = overrides.content ?? { title: "Test" };

  const options: MapkaPopupOptionsResolved[] = [
    {
      id,
      lngLat,
      content,
      ...(overrides.closeOnClick !== undefined && { closeOnClick: overrides.closeOnClick }),
    } as MapkaPopupOptionsResolved,
  ];

  return {
    ids: [id],
    container: {
      remove: vi.fn(),
    } as unknown as HTMLElement,
    options,
    popup: {
      remove: vi.fn(),
    },
  } as unknown as MapMapkaPopup;
}

function createMockPopupGroup(count: number): MapMapkaPopup {
  const ids: string[] = [];
  const options: MapkaPopupOptionsResolved[] = [];

  for (let i = 0; i < count; i++) {
    const id = `group-${i}-${Math.random().toString(36).slice(2)}`;
    ids.push(id);
    options.push({
      id,
      lngLat: [i, i],
      content: { title: `Item ${i}` },
    } as MapkaPopupOptionsResolved);
  }

  return {
    ids,
    container: {
      remove: vi.fn(),
    } as unknown as HTMLElement,
    options,
    popup: {
      remove: vi.fn(),
    },
  } as unknown as MapMapkaPopup;
}

function createMockMap(overrides: Partial<MapkaMap> = {}): MapkaMap {
  return {
    popups: [] as MapMapkaPopup[],
    maxPopups: 1,
    ...overrides,
  } as unknown as MapkaMap;
}

describe("popup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getPopupId", () => {
    it("should return the provided id", () => {
      expect(getPopupId({ id: "my-popup" })).toBe("my-popup");
    });

    it("should generate a UUID-based id when absent", () => {
      const id = getPopupId({});
      expect(id).toBe("popup-test-uuid-1234");
    });
  });

  describe("closePopups", () => {
    it("should remove all popups from the map", () => {
      const mockPopup1 = createMockPopup();
      const mockPopup2 = createMockPopup();
      const map = createMockMap({
        popups: [mockPopup1, mockPopup2],
      });

      closePopups(map);

      expect(mockPopup1.popup.remove).toHaveBeenCalled();
      expect(mockPopup1.container.remove).toHaveBeenCalled();
      expect(mockPopup2.popup.remove).toHaveBeenCalled();
      expect(mockPopup2.container.remove).toHaveBeenCalled();
      expect(map.popups).toEqual([]);
    });

    it("should handle empty popups array", () => {
      const map = createMockMap({ popups: [] });

      expect(() => closePopups(map)).not.toThrow();
      expect(map.popups).toEqual([]);
    });

    it("should remove a single popup correctly", () => {
      const mockPopup = createMockPopup();
      const map = createMockMap({
        popups: [mockPopup],
      });

      closePopups(map);

      expect(mockPopup.popup.remove).toHaveBeenCalledTimes(1);
      expect(mockPopup.container.remove).toHaveBeenCalledTimes(1);
      expect(map.popups).toEqual([]);
    });
  });

  describe("closePopupsByIds", () => {
    it("should close a single-item popup by id", () => {
      const popup = createMockPopup({ id: "target" });
      const map = createMockMap({ popups: [popup] });

      closePopupsByIds(map, ["target"]);

      expect(popup.popup.remove).toHaveBeenCalled();
      expect(popup.container.remove).toHaveBeenCalled();
      expect(map.popups).toHaveLength(0);
    });

    it("should leave unmatched popups untouched", () => {
      const keep = createMockPopup({ id: "keep" });
      const remove = createMockPopup({ id: "remove" });
      const map = createMockMap({ popups: [keep, remove] });

      closePopupsByIds(map, ["remove"]);

      expect(keep.popup.remove).not.toHaveBeenCalled();
      expect(remove.popup.remove).toHaveBeenCalled();
      expect(map.popups).toEqual([keep]);
    });

    it("should handle multiple ids in one call", () => {
      const a = createMockPopup({ id: "a" });
      const b = createMockPopup({ id: "b" });
      const c = createMockPopup({ id: "c" });
      const map = createMockMap({ popups: [a, b, c] });

      closePopupsByIds(map, ["a", "c"]);

      expect(a.popup.remove).toHaveBeenCalled();
      expect(c.popup.remove).toHaveBeenCalled();
      expect(b.popup.remove).not.toHaveBeenCalled();
      expect(map.popups).toEqual([b]);
    });

    it("should no-op when ids match nothing", () => {
      const popup = createMockPopup({ id: "existing" });
      const map = createMockMap({ popups: [popup] });

      closePopupsByIds(map, ["nonexistent"]);

      expect(popup.popup.remove).not.toHaveBeenCalled();
      expect(map.popups).toEqual([popup]);
    });

    it("should remove one item from a multi-item group and re-render", () => {
      const group = createMockPopupGroup(3);
      const targetId = group.ids[1];
      const map = createMockMap({ popups: [group] });

      closePopupsByIds(map, [targetId]);

      expect(group.popup.remove).toHaveBeenCalled();
      expect(group.container.remove).toHaveBeenCalled();
      // createNewPopup pushes a new entry with the remaining options
      expect(map.popups).toHaveLength(1);
      expect(map.popups[0].ids).not.toContain(targetId);
    });
  });

  describe("closeOnMapClickPopups", () => {
    it("should remove popups with closeOnClick: true", () => {
      const popup = createMockPopup({ id: "clickable", closeOnClick: true });
      const map = createMockMap({ popups: [popup] });

      closeOnMapClickPopups(map);

      expect(popup.popup.remove).toHaveBeenCalled();
      expect(map.popups).toHaveLength(0);
    });

    it("should remove popups with closeOnClick defaulting to undefined", () => {
      const popup = createMockPopup({ id: "default" });
      const map = createMockMap({ popups: [popup] });

      closeOnMapClickPopups(map);

      expect(popup.popup.remove).toHaveBeenCalled();
      expect(map.popups).toHaveLength(0);
    });

    it("should keep popups with closeOnClick: false", () => {
      const popup = createMockPopup({ id: "sticky", closeOnClick: false });
      const map = createMockMap({ popups: [popup] });

      closeOnMapClickPopups(map);

      expect(popup.popup.remove).not.toHaveBeenCalled();
      expect(map.popups).toEqual([popup]);
    });

    it("should remove multi-item groups regardless of closeOnClick", () => {
      const group = createMockPopupGroup(2);
      const map = createMockMap({ popups: [group] });

      closeOnMapClickPopups(map);

      expect(group.popup.remove).toHaveBeenCalled();
      expect(map.popups).toHaveLength(0);
    });

    it("should only remove matching popups and keep the rest", () => {
      const removable = createMockPopup({ id: "removable", closeOnClick: true });
      const sticky = createMockPopup({ id: "sticky", closeOnClick: false });
      const map = createMockMap({ popups: [removable, sticky] });

      closeOnMapClickPopups(map);

      expect(removable.popup.remove).toHaveBeenCalled();
      expect(sticky.popup.remove).not.toHaveBeenCalled();
      expect(map.popups).toEqual([sticky]);
    });
  });

  describe("enforceMaxPopups", () => {
    it("should remove oldest popup when over limit", () => {
      const oldest = createMockPopup({ id: "oldest" });
      const newest = createMockPopup({ id: "newest" });
      const map = createMockMap({
        popups: [oldest, newest],
        maxPopups: 1,
      });

      enforceMaxPopups(map);

      expect(oldest.popup.remove).toHaveBeenCalled();
      expect(oldest.container.remove).toHaveBeenCalled();
      expect(map.popups).toEqual([newest]);
    });

    it("should no-op when at the limit", () => {
      const popup = createMockPopup();
      const map = createMockMap({
        popups: [popup],
        maxPopups: 1,
      });

      enforceMaxPopups(map);

      expect(popup.popup.remove).not.toHaveBeenCalled();
      expect(map.popups).toEqual([popup]);
    });

    it("should no-op when below the limit", () => {
      const map = createMockMap({
        popups: [],
        maxPopups: 3,
      });

      enforceMaxPopups(map);

      expect(map.popups).toEqual([]);
    });

    it("should evict from front (FIFO)", () => {
      const first = createMockPopup({ id: "first" });
      const second = createMockPopup({ id: "second" });
      const third = createMockPopup({ id: "third" });
      const map = createMockMap({
        popups: [first, second, third],
        maxPopups: 2,
      });

      enforceMaxPopups(map);

      expect(first.popup.remove).toHaveBeenCalled();
      expect(second.popup.remove).not.toHaveBeenCalled();
      expect(third.popup.remove).not.toHaveBeenCalled();
      expect(map.popups).toEqual([second, third]);
    });
  });
});
