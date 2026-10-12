import { afterEach, describe, expect, it, vi } from "vitest";
import {
	loadWebcamShapePreference,
	parseWebcamShapePreference,
	saveWebcamShapePreference,
} from "./webcamShapePreference";

const KEY = "recordly.editor.preferences";

function stubSettings(initial: unknown) {
	let stored = initial;
	vi.stubGlobal("electronAPI", {
		getAppSetting: (key: string) => (key === KEY ? stored : null),
		setAppSetting: (_key: string, value: unknown) => {
			stored = value;
			return true;
		},
	});
	vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => undefined });
	return () => stored;
}

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("webcam shape preference", () => {
	it("falls back to the squircle for missing or unknown shapes", () => {
		expect(parseWebcamShapePreference(null)).toBe("squircle");
		expect(parseWebcamShapePreference({ webcam: { shape: "blob" } })).toBe("squircle");
		expect(parseWebcamShapePreference({ webcam: { shape: "circle" } })).toBe("circle");
	});

	it("saves the shape without dropping other editor preferences", () => {
		const read = stubSettings({ wallpaper: "#123456", webcam: { roundness: 69 } });

		saveWebcamShapePreference("circle");

		expect(read()).toEqual({
			wallpaper: "#123456",
			webcam: { roundness: 69, shape: "circle" },
		});
		expect(loadWebcamShapePreference()).toBe("circle");
	});
});
