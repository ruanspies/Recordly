import type { WebcamShape } from "@/components/video-editor/types";
import { loadAppSetting, saveAppSetting } from "@/lib/appSettings";

// Same key as EDITOR_PREFERENCES_STORAGE_KEY, repeated here so the HUD does not pull the
// editor's persistence code into its bundle.
const EDITOR_PREFERENCES_STORAGE_KEY = "recordly.editor.preferences";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readStoredEditorPreferences(): Record<string, unknown> {
	const persisted = loadAppSetting<unknown>(EDITOR_PREFERENCES_STORAGE_KEY);
	if (isRecord(persisted)) {
		return persisted;
	}

	try {
		const stored = JSON.parse(localStorage.getItem(EDITOR_PREFERENCES_STORAGE_KEY) ?? "");
		return isRecord(stored) ? stored : {};
	} catch {
		return {};
	}
}

export function parseWebcamShapePreference(editorPreferences: unknown): WebcamShape {
	const webcam = isRecord(editorPreferences) ? editorPreferences.webcam : null;
	return isRecord(webcam) && webcam.shape === "circle" ? "circle" : "squircle";
}

export function loadWebcamShapePreference(): WebcamShape {
	return parseWebcamShapePreference(readStoredEditorPreferences());
}

/** Stores the shape as the editor's webcam default so new recordings open with it. */
export function saveWebcamShapePreference(shape: WebcamShape): void {
	const editorPreferences = readStoredEditorPreferences();
	const webcam = isRecord(editorPreferences.webcam) ? editorPreferences.webcam : {};
	const next = { ...editorPreferences, webcam: { ...webcam, shape } };
	saveAppSetting(EDITOR_PREFERENCES_STORAGE_KEY, next);
	try {
		localStorage.setItem(EDITOR_PREFERENCES_STORAGE_KEY, JSON.stringify(next));
	} catch {
		// The live preview still follows the choice when preferences cannot be saved.
	}
}
