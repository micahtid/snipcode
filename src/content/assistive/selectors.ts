/**
 * Assistive element descriptor.
 *
 * This runs in the capture phase and reads element from Captured, returning the element
 * descriptor without writing back. The assistive json's `element` block needs both a
 * shortest-unique `selector` and a churn-resistant `robustSelector`. Those are computed once
 * during capture by capture/dom.ts buildElementMetadata and stored on Captured.element. This
 * module is the assistive-side accessor for that block, so emit.ts depends on the assistive
 * layer rather than reaching into capture. It also guards that both selectors are populated.
 */
import type { Captured } from '../types';

/**
 * Returns the assistive element descriptor, asserting both selectors are present.
 *
 * @param captured - reads the element metadata built during capture
 */
export function describeElement(captured: Captured): Captured['element'] {
	const el = captured.element;
	// Both selectors are always emitted, by definition of done. Fall back to the
	// shortest selector if a robust one could not be derived.
	if (!el.robustSelector) el.robustSelector = el.selector;
	return el;
}
