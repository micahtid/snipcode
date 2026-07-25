/**
 * List and counter properties.
 *
 * This is a reconcile-phase feature handler. It reads root and clone from Captured via
 * bakeNonDefaultProps and writes bakedStyles and clone, the list and counter
 * properties. It extends the "ship what renders" approach.
 *
 * The relevant spec is https://developer.mozilla.org/en-US/docs/Web/CSS/list-style,
 * which also covers counter-reset and counter-increment, which drive ::marker via
 * features/pseudo. It detects an element with a non-default list-style-* or counter-*
 * value, and otherwise early-returns per property. It bakes the non-default values onto
 * the matching clone element. List-style-image urls arrive already absolute from
 * getComputedStyle. It touches bakedStyles and the clone only.
 *
 * Custom bullet glyphs (list-style-type), bullet images (list-style-image), and
 * counters (counter-reset and counter-increment) are rendered through ::marker. They
 * are list-scoped and set through classes that do not survive, so a snipped list
 * reverts to plain discs or numbers. Baking the computed value is pixel-safe.
 * features/pseudo emits the ::marker rule that consumes the counters.
 */
import type { Captured } from '../../types';
import { bakeNonDefaultProps } from '../match';

/**
 * Bakes non-default list-style and counter properties.
 *
 * @param captured - bakedStyles and clone mutated in place
 */
export function apply(captured: Captured): Captured {
	bakeNonDefaultProps(captured, [
		{ prop: 'list-style-type', isDefault: (v) => v === 'disc' || v === 'decimal' || v === 'none' },
		{ prop: 'list-style-image', isDefault: (v) => v === 'none' },
		{ prop: 'list-style-position', isDefault: (v) => v === 'outside' },
		{ prop: 'counter-reset', isDefault: (v) => v === 'none' },
		{ prop: 'counter-increment', isDefault: (v) => v === 'none' },
	]);
	return captured;
}
