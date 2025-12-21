import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// Mock crypto.randomUUID
Object.defineProperty(globalThis, "crypto", {
  value: {
    randomUUID: vi.fn(() => "test-uuid-1234"),
  },
});

// Mock maplibre-gl Marker
export const mockMarkerElement = document.createElement("div");
mockMarkerElement.classList.add("maplibregl-marker");

export const mockMarkerInstance = {
  setLngLat: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
  remove: vi.fn(),
  getElement: vi.fn(() => mockMarkerElement),
  getLngLat: vi.fn(() => ({
    toArray: () => [10, 20],
  })),
  on: vi.fn(),
};

const MockMarker = vi.fn(function (this: typeof mockMarkerInstance) {
  Object.assign(this, mockMarkerInstance);
  return this;
});

const mockPopupInstance = {
  setLngLat: vi.fn().mockReturnThis(),
  setDOMContent: vi.fn().mockReturnThis(),
  addTo: vi.fn().mockReturnThis(),
  remove: vi.fn(),
  setMaxWidth: vi.fn(),
  setOffset: vi.fn(),
};

const MockPopup = vi.fn(function (this: object) {
  Object.assign(this, mockPopupInstance);
  return this;
});

vi.mock("maplibre-gl", () => ({
  Marker: MockMarker,
  Popup: MockPopup,
  Map: vi.fn(),
}));
