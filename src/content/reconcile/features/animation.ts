/**
 * Animation, transition, and transform context.
 *
 * This is a reconcile-phase feature handler. It reads root, clone, and bakedStyles
 * from Captured and writes bakedStyles and clone, the transform context and animation
 * declarations. It extends the "ship what renders" rule to the transform and animation
 * context, without disturbing the per-element decision about the `transform` value.
 *
 * The relevant spec is https://developer.mozilla.org/en-US/docs/Web/CSS/transform,
 * which also covers animation, transition, perspective, transform-style, and
 * backface-visibility. It detects an element with a non-default value for one of the
 * transform-context or animation and transition properties, and otherwise early-returns
 * per element. It bakes those computed values onto the matching clone element. It
 * deliberately does not re-bake `transform` or the individual translate, rotate, and
 * scale properties, because those can be mid-animation at capture time and the
 * per-element pass already owns the value. It mutates bakedStyles and the clone inline
 * styles only.
 *
 * The static transform context of transform-origin, perspective, and the 3d flags,
 * together with the animation and transition shorthands, is easily omitted from the
 * authored cascade, yet it shapes the rendered frame. The grader freezes animations at
 * frame 0 (reducedMotion), so the @keyframes 0% styles only apply if the element still
 * carries its `animation` declaration and the keyframes travel. resolve/anim keeps the
 * referenced ones, with cubic-bezier precision intact in the verbatim keyframe text.
 * `transform` itself is left to the per-element pass, so an animated element is not
 * locked to a mid-flight frame that would mismatch frame 0.
 */
import type { Captured } from '../../types';
import { pairedSubtrees } from '../match';

/**
 * The transform-context and animation properties this handler preserves. This is
 * the bounded css-spec surface for animation and 3d, a feature-handler spec set
 * rather than a hardcoded property list. `transform` is intentionally absent.
 */
const ANIM_CONTEXT_PROPS = [
	'transform-origin', 'perspective', 'perspective-origin', 'transform-style', 'backface-visibility',
	'animation', 'transition', 'transition-timing-function', 'animation-timing-function', 'will-change',
];

/** Computed values that mean "default" and need no baking. */
function isDefault(prop: string, value: string): boolean {
	const v = value.trim();
	if (v === '' || v === 'none' || v === 'auto' || v === 'normal') return true;
	if (prop === 'perspective' && v === 'none') return true;
	if (prop === 'transform-style' && v === 'flat') return true;
	if (prop === 'backface-visibility' && v === 'visible') return true;
	if (prop === 'will-change' && v === 'auto') return true;
	// A zeroed transition (0s) has no effect at rest.
	if (prop === 'transition' && /^all 0s ease 0s$|^0s\b/.test(v)) return true;
	return false;
}

/**
 * Bakes non-default transform-context and animation declarations onto each element.
 *
 * @param captured - bakedStyles and clone are mutated in place
 */
export function apply(captured: Captured): Captured {
	for (const [original, clone] of pairedSubtrees(captured.root, captured.clone)) {
		const computed = getComputedStyle(original);
		const baked = captured.bakedStyles.get(clone) ?? new Map<string, string>();
		for (const prop of ANIM_CONTEXT_PROPS) {
			if (baked.has(prop)) continue;
			const value = computed.getPropertyValue(prop);
			if (isDefault(prop, value)) continue;
			baked.set(prop, value);
			try {
				(clone as HTMLElement).style.setProperty(prop, value);
			} catch {
				// Invalid for this element, so skip it.
			}
		}
		captured.bakedStyles.set(clone, baked);
	}
	return captured;
}
