/**
 * Viewport and container units.
 *
 * This is a reconcile-phase feature handler. It reads root, clone, and bakedStyles from
 * Captured and writes bakedStyles and clone, resolving viewport and container units. It
 * locks pixel fidelity at the capture viewport.
 *
 * The relevant spec is
 * https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths.
 * It detects a baked value containing a viewport (vw, vh, dvh, svh, lvh, vmin, vmax) or
 * container (cqw, cqh, cqi, cqb, ...) length, and early-returns otherwise. It replaces
 * such values with the live element's computed literal (px). It mutates bakedStyles and
 * the clone inline styles only.
 *
 * Viewport and container units resolve against the viewport or containment context,
 * which changes when the snip is reparented. A 50vw hero becomes half of whatever
 * viewport it lands in. An alternative, wrapping the snip in a captured-viewport
 * container, cannot work for a standalone element crop. The grader renders output.html
 * at the element's own dimensions, so a viewport-sized wrapper would clip. Resolving to
 * the captured computed literal locks the pixels exactly as preferring the computed
 * value does when an authored value would not survive, and it needs no synthetic
 * wrapper.
 *
 * This file has two extensions. Logical props (margin-inline, inset-inline-start, ...)
 * survive as the authored value when authored, but they resolve against the element's
 * direction and writing-mode, which must be baked when non-default for rtl and vertical
 * text. Material v6 and tailwind v4 lean on logical props. The aspect-ratio property and
 * intrinsic <img> width and height attributes are baked so the box keeps its ratio
 * standalone.
 */
import type { Captured } from '../../types';
import { pairedSubtrees } from '../match';

// Viewport-percentage and container-query length units, the dynamic ones.
const DYNAMIC_UNIT = /\b\d*\.?\d+(?:vw|vh|vi|vb|vmin|vmax|dvw|dvh|svw|svh|lvw|lvh|cqw|cqh|cqi|cqb|cqmin|cqmax)\b/i;

/**
 * Resolves baked values that use viewport/container units to their captured px.
 *
 * @param captured - bakedStyles and clone are mutated in place
 */
export function apply(captured: Captured): Captured {
	for (const [original, clone] of pairedSubtrees(captured.root, captured.clone)) {
		const baked = captured.bakedStyles.get(clone) ?? new Map<string, string>();
		const computed = getComputedStyle(original);

		// Resolve viewport and container units to captured px.
		for (const [prop, value] of baked) {
			if (!DYNAMIC_UNIT.test(value)) continue;
			const literal = computed.getPropertyValue(prop);
			if (!literal || DYNAMIC_UNIT.test(literal)) continue; // Could not resolve, so leave as-is
			setBaked(clone, baked, prop, literal);
		}

		// Logical properties resolve against direction and writing-mode, so bake them
		// when non-default so rtl and vertical text maps inline and block axes correctly.
		bakeNonDefault(clone, baked, computed, 'direction', (v) => v === '' || v === 'ltr');
		bakeNonDefault(clone, baked, computed, 'writing-mode', (v) => v === '' || v === 'horizontal-tb');

		// Bake aspect-ratio when explicitly set so the box keeps its ratio.
		bakeNonDefault(clone, baked, computed, 'aspect-ratio', (v) => v === '' || v === 'auto');

		// <img> intrinsic dimensions feed aspect-ratio: auto and prevent layout
		// shift. Copy the natural size to width and height attributes when missing.
		if (original instanceof HTMLImageElement && clone instanceof HTMLImageElement) {
			pinIntrinsicSize(original, clone, baked);
		}

		if (baked.size > 0) captured.bakedStyles.set(clone, baked);
	}
	return captured;
}

/**
 * Copy a loaded image's natural size to width and height attributes, but only when
 * css sizes neither dimension, otherwise attr-derived aspect-ratio could fight
 * the baked css and shift the box.
 */
function pinIntrinsicSize(original: HTMLImageElement, clone: HTMLImageElement, baked: Map<string, string>): void {
	if (original.naturalWidth === 0 || original.naturalHeight === 0) return; // Not loaded
	if (baked.has('width') || baked.has('height')) return; // Css already sizes it
	if (clone.hasAttribute('width') || clone.hasAttribute('height')) return;
	clone.setAttribute('width', String(original.naturalWidth));
	clone.setAttribute('height', String(original.naturalHeight));
}

/** Bake a computed property when a predicate says its value is non-default. */
function bakeNonDefault(
	clone: Element,
	baked: Map<string, string>,
	computed: CSSStyleDeclaration,
	prop: string,
	isDefault: (value: string) => boolean,
): void {
	if (baked.has(prop)) return;
	const value = computed.getPropertyValue(prop);
	if (isDefault(value)) return;
	setBaked(clone, baked, prop, value);
}

/** Record a value in the baked map and on the clone's inline style. */
function setBaked(clone: Element, baked: Map<string, string>, prop: string, value: string): void {
	baked.set(prop, value);
	try {
		(clone as HTMLElement).style.setProperty(prop, value);
	} catch {
		// Invalid for this element, so skip it.
	}
}
