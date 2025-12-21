import { describe, it, expect, vi, beforeEach } from "vitest";
import { Marker } from "maplibre-gl";
import type { StyleSpecification, Offset } from "maplibre-gl";
import {
	getMarkerId,
	addMarkers,
	clearMarkers,
	addStyleMarkers,
	addStyleDiffMarkers,
	updateMarkers,
} from "./markers.js";
import type { MapkaMap, MapMapkaMarker } from "../map.js";
import type { MapkaMarkerOptions } from "../types/marker.js";

// Get the mock marker element from the mocked Marker instance
function getMockMarkerElement(): HTMLElement {
	const instance = new Marker();
	return instance.getElement();
}

// Get the mock marker instance to access mock functions
function getMockMarkerInstance() {
	return new Marker();
}

function createMockMap(overrides: Partial<MapkaMap> = {}): MapkaMap {
	return {
		markers: [] as MapMapkaMarker[],
		popups: [],
		maxPopups: 1,
		openPopup: vi.fn(),
		closePopup: vi.fn(),
		updatePopup: vi.fn(),
		getStyle: vi.fn(() => ({}) as StyleSpecification),
		...overrides,
	} as unknown as MapkaMap;
}

describe("markers", () => {
	let mockMarkerElement: HTMLElement;
	let mockMarkerInstance: ReturnType<typeof getMockMarkerInstance>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockMarkerElement = getMockMarkerElement();
		mockMarkerInstance = getMockMarkerInstance();
		mockMarkerElement.style.cursor = "";
		// Clear mocks again after getting instances for assertions
		vi.clearAllMocks();
	});

	describe("getMarkerId", () => {
		it("should return the provided id if present", () => {
			const result = getMarkerId({ id: "my-marker" });
			expect(result).toBe("my-marker");
		});

		it("should generate an id with crypto.randomUUID if no id provided", () => {
			const result = getMarkerId({});
			expect(result).toBe("marker-test-uuid-1234");
		});
	});

	describe("addMarkers", () => {
		it("should create markers and add them to the map", () => {
			const map = createMockMap();
			const markersOptions: MapkaMarkerOptions[] = [
				{ lngLat: [10, 20], id: "marker-1" },
				{ lngLat: [30, 40], id: "marker-2" },
			];

			addMarkers(map, markersOptions);

			expect(Marker).toHaveBeenCalledTimes(2);
			expect(mockMarkerInstance.setLngLat).toHaveBeenCalledWith([10, 20]);
			expect(mockMarkerInstance.setLngLat).toHaveBeenCalledWith([30, 40]);
			expect(mockMarkerInstance.addTo).toHaveBeenCalledWith(map);
			expect(map.markers).toHaveLength(2);
			expect(map.markers[0].id).toBe("marker-1");
			expect(map.markers[1].id).toBe("marker-2");
		});

		it("should handle markers without popup", () => {
			const map = createMockMap();
			const markersOptions: MapkaMarkerOptions[] = [{ lngLat: [10, 20], id: "marker-no-popup" }];

			addMarkers(map, markersOptions);

			expect(map.markers).toHaveLength(1);
			expect(map.openPopup).not.toHaveBeenCalled();
		});

		it("should open popup immediately for trigger=always", () => {
			const map = createMockMap();
			const markersOptions: MapkaMarkerOptions[] = [
				{
					lngLat: [10, 20],
					id: "marker-always",
					popup: {
						id: "popup-always",
						trigger: "always",
						content: { title: "Always visible" },
					},
				},
			];

			addMarkers(map, markersOptions);

			expect(map.openPopup).toHaveBeenCalledWith(
				expect.objectContaining({
					lngLat: [10, 20],
					trigger: "always",
				}),
				"popup-always",
			);
		});

		it("should set pointer cursor for click trigger", () => {
			const map = createMockMap();
			const markersOptions: MapkaMarkerOptions[] = [
				{
					lngLat: [10, 20],
					id: "marker-click",
					popup: {
						id: "popup-click",
						trigger: "click",
						content: { title: "Click me" },
					},
				},
			];

			addMarkers(map, markersOptions);

			expect(mockMarkerElement.style.cursor).toBe("pointer");
		});

		it("should add click listener for click trigger popup", () => {
			const map = createMockMap();
			const addEventListenerSpy = vi.spyOn(mockMarkerElement, "addEventListener");
			const markersOptions: MapkaMarkerOptions[] = [
				{
					lngLat: [10, 20],
					id: "marker-click",
					popup: {
						id: "popup-click",
						trigger: "click",
						content: { title: "Click me" },
					},
				},
			];

			addMarkers(map, markersOptions);

			expect(addEventListenerSpy).toHaveBeenCalledWith("click", expect.any(Function));
		});

		it("should add mouseenter/mouseleave listeners for hover trigger", () => {
			const map = createMockMap();
			const addEventListenerSpy = vi.spyOn(mockMarkerElement, "addEventListener");
			const markersOptions: MapkaMarkerOptions[] = [
				{
					lngLat: [10, 20],
					id: "marker-hover",
					popup: {
						id: "popup-hover",
						trigger: "hover",
						content: { title: "Hover me" },
					},
				},
			];

			addMarkers(map, markersOptions);

			expect(addEventListenerSpy).toHaveBeenCalledWith("mouseenter", expect.any(Function));
			expect(addEventListenerSpy).toHaveBeenCalledWith("mouseleave", expect.any(Function));
		});

		it("should add drag listeners for draggable markers with popup", () => {
			const map = createMockMap();
			const markersOptions: MapkaMarkerOptions[] = [
				{
					lngLat: [10, 20],
					id: "marker-draggable",
					draggable: true,
					popup: {
						id: "popup-draggable",
						trigger: "click",
						content: { title: "Draggable" },
					},
				},
			];

			addMarkers(map, markersOptions);

			expect(mockMarkerInstance.on).toHaveBeenCalledWith("dragend", expect.any(Function));
			expect(mockMarkerInstance.on).toHaveBeenCalledWith("drag", expect.any(Function));
		});

		it("should apply default offset when popup has no offset", () => {
			const map = createMockMap();
			const markersOptions: MapkaMarkerOptions[] = [
				{
					lngLat: [10, 20],
					id: "marker-default-offset",
					popup: {
						id: "popup-default-offset",
						trigger: "always",
						content: { title: "Default offset" },
					},
				},
			];

			addMarkers(map, markersOptions);

			expect(map.openPopup).toHaveBeenCalledWith(
				expect.objectContaining({
					offset: expect.objectContaining({
						bottom: [0, -38.1],
					}),
				}),
				"popup-default-offset",
			);
		});

		it("should use custom offset when provided in popup options", () => {
			const map = createMockMap();
			const customOffset = { bottom: [0, -50] } as unknown as Offset;
			const markersOptions: MapkaMarkerOptions[] = [
				{
					lngLat: [10, 20],
					id: "marker-custom-offset",
					popup: {
						id: "popup-custom-offset",
						trigger: "always",
						content: { title: "Custom offset" },
						offset: customOffset,
					},
				},
			];

			addMarkers(map, markersOptions);

			expect(map.openPopup).toHaveBeenCalledWith(
				expect.objectContaining({
					offset: customOffset,
				}),
				"popup-custom-offset",
			);
		});
	});

	describe("clearMarkers", () => {
		it("should remove all markers from the map", () => {
			const mockMarker1 = { marker: { remove: vi.fn() } };
			const mockMarker2 = { marker: { remove: vi.fn() } };
			const map = createMockMap({
				markers: [mockMarker1, mockMarker2] as unknown as MapMapkaMarker[],
			});

			clearMarkers(map);

			expect(mockMarker1.marker.remove).toHaveBeenCalled();
			expect(mockMarker2.marker.remove).toHaveBeenCalled();
			expect(map.markers).toEqual([]);
		});

		it("should handle empty markers array", () => {
			const map = createMockMap({ markers: [] });

			expect(() => clearMarkers(map)).not.toThrow();
			expect(map.markers).toEqual([]);
		});
	});

	describe("addStyleMarkers", () => {
		it("should add markers from style metadata", () => {
			const styleMarkers: MapkaMarkerOptions[] = [
				{ lngLat: [10, 20], id: "style-marker-1" },
				{ lngLat: [30, 40], id: "style-marker-2" },
			];

			const map = createMockMap({
				getStyle: vi.fn(
					() =>
						({
							metadata: {
								mapka: {
									markers: styleMarkers,
								},
							},
						}) as unknown as StyleSpecification,
				),
			});

			addStyleMarkers(map);

			expect(map.markers).toHaveLength(2);
			expect(map.markers[0].id).toBe("style-marker-1");
		});

		it("should handle style without markers metadata", () => {
			const map = createMockMap({
				getStyle: vi.fn(() => ({}) as StyleSpecification),
			});

			addStyleMarkers(map);

			expect(map.markers).toHaveLength(0);
		});

		it("should handle missing mapka metadata", () => {
			const map = createMockMap({
				getStyle: vi.fn(
					() =>
						({
							metadata: {},
						}) as unknown as StyleSpecification,
				),
			});

			addStyleMarkers(map);

			expect(map.markers).toHaveLength(0);
		});
	});

	describe("addStyleDiffMarkers", () => {
		it("should add markers from next style specification", () => {
			const map = createMockMap();
			const nextStyle = {
				metadata: {
					mapka: {
						markers: [{ lngLat: [10, 20], id: "diff-marker-1" }],
					},
				},
			} as unknown as StyleSpecification;

			addStyleDiffMarkers(map, nextStyle);

			expect(map.markers).toHaveLength(1);
			expect(map.markers[0].id).toBe("diff-marker-1");
		});

		it("should handle next style without markers", () => {
			const map = createMockMap();
			const nextStyle = {} as StyleSpecification;

			addStyleDiffMarkers(map, nextStyle);

			expect(map.markers).toHaveLength(0);
		});
	});

	describe("updateMarkers", () => {
		it("should throw not implemented error", () => {
			const map = createMockMap();
			const markersOptions: MapkaMarkerOptions[] = [];

			expect(() => updateMarkers(map, markersOptions)).toThrow("Not implemented.");
		});
	});
});
