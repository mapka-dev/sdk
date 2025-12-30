import { describe, it, expect, vi, beforeEach } from "vitest";
import { removePopups } from "../popup.js";
import type { MapkaMap, MapMapkaPopup } from "../../map.js";

function createMockPopup(): MapMapkaPopup {
  return {
    id: `popup-${Math.random().toString(36).slice(2)}`,
    container: {
      remove: vi.fn(),
    } as unknown as HTMLElement,
    options: {
      lngLat: [0, 0],
      content: { title: "Test" },
    },
    popup: {
      remove: vi.fn(),
    },
  } as unknown as MapMapkaPopup;
}

function createMockMap(overrides: Partial<MapkaMap> = {}): MapkaMap {
  return {
    popups: [] as MapMapkaPopup[],
    ...overrides,
  } as unknown as MapkaMap;
}

describe("popup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("removePopups", () => {
    it("should remove all popups from the map", () => {
      const mockPopup1 = createMockPopup();
      const mockPopup2 = createMockPopup();
      const map = createMockMap({
        popups: [mockPopup1, mockPopup2],
      });

      removePopups(map);

      expect(mockPopup1.popup.remove).toHaveBeenCalled();
      expect(mockPopup1.container.remove).toHaveBeenCalled();
      expect(mockPopup2.popup.remove).toHaveBeenCalled();
      expect(mockPopup2.container.remove).toHaveBeenCalled();
      expect(map.popups).toEqual([]);
    });

    it("should handle empty popups array", () => {
      const map = createMockMap({ popups: [] });

      expect(() => removePopups(map)).not.toThrow();
      expect(map.popups).toEqual([]);
    });

    it("should remove a single popup correctly", () => {
      const mockPopup = createMockPopup();
      const map = createMockMap({
        popups: [mockPopup],
      });

      removePopups(map);

      expect(mockPopup.popup.remove).toHaveBeenCalledTimes(1);
      expect(mockPopup.container.remove).toHaveBeenCalledTimes(1);
      expect(map.popups).toEqual([]);
    });
  });
});
