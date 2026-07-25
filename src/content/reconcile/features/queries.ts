/**
 * @media and @container resolution.
 *
 * This is a reconcile-phase feature handler. It reads root, clone, and bakedStyles
 * from Captured and writes bakedStyles and clone, baking container context. It extends
 * the "ship what renders" approach to the containment context that container queries
 * resolve against.
 *
 * The relevant spec is
 * https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries. It
 * detects an element whose computed container-type is not `normal`, and otherwise
 * early-returns per element. It bakes container-type, and container-name when set, onto
 * the matching clone element. It mutates bakedStyles and the clone inline styles only.
 *
 * @media is already flattened at capture. match.ts only admits rules whose @media
 * currently applies (matchMedia), so prefers-color-scheme, prefers-reduced-motion, and
 * breakpoint variants are resolved to the captured viewport's values and baked as the
 * computed result. @container is the part that needs help. A descendant's container
 * query resolves against an ancestor's containment context, which is lost if
 * container-type is not preserved. Baking the computed container-type keeps that context
 * inside the snip. The container's width is locked by features/units.ts, so the two
 * cooperate. Baking the real computed container-type is pixel-safe.
 */
import type { Captured } from '../../types';
import { pairedSubtrees } from '../match';

/**
 * Preserves the container-type containment context on each element.
 *
 * @param captured - bakedStyles and clone are mutated in place
 */
export function apply(captured: Captured): Captured {
	for (const [original, clone] of pairedSubtrees(captured.root, captured.clone)) {
		const computed = getComputedStyle(original);
		const containerType = computed.getPropertyValue('container-type');
		// `normal` is the default, meaning no containment, so there is nothing to preserve.
		if (!containerType || containerType === 'normal') continue;

		const baked = captured.bakedStyles.get(clone) ?? new Map<string, string>();
		bake(clone, baked, 'container-type', containerType);
		const name = computed.getPropertyValue('container-name');
		if (name && name !== 'none') bake(clone, baked, 'container-name', name);
		captured.bakedStyles.set(clone, baked);
	}
	return captured;
}

/** Record a value in the baked map and on the clone's inline style. */
function bake(clone: Element, baked: Map<string, string>, prop: string, value: string): void {
	if (baked.has(prop)) return;
	baked.set(prop, value);
	try {
		(clone as HTMLElement).style.setProperty(prop, value);
	} catch {
		// Invalid for this element, so skip it.
	}
}
