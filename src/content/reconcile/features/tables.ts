/**
 * Table rendering properties.
 *
 * This is a reconcile-phase feature handler. It reads root and clone from Captured via
 * bakeNonDefaultProps and writes bakedStyles and clone, the table layout properties. It
 * extends the "ship what renders" approach to table-only properties.
 *
 * The relevant spec is
 * https://developer.mozilla.org/en-US/docs/Web/CSS/border-collapse, which also covers
 * table-layout, border-spacing, caption-side, and empty-cells. It detects a table
 * element whose computed value for one of these properties is non-default. Non-tables
 * compute the defaults and are skipped, so no tag check is needed. It bakes the
 * non-default values onto the matching clone element (via the shared reconcile helper).
 * It touches bakedStyles and the clone only.
 *
 * border-collapse, border-spacing, table-layout, and caption-side change a table's
 * geometry, but they are inherited or table-scoped and frequently set on the <table> by
 * a class that does not survive, so a snipped table loses its collapsed borders or fixed
 * layout. Baking the computed value is pixel-safe.
 */
import type { Captured } from '../../types';
import { bakeNonDefaultProps } from '../match';

/**
 * Bakes non-default table rendering properties onto table elements.
 *
 * @param captured - bakedStyles and clone mutated in place
 */
export function apply(captured: Captured): Captured {
	bakeNonDefaultProps(captured, [
		{ prop: 'table-layout', isDefault: (v) => v === 'auto' },
		{ prop: 'border-collapse', isDefault: (v) => v === 'separate' },
		{ prop: 'border-spacing', isDefault: (v) => v === '0px' || v === '0px 0px' },
		{ prop: 'caption-side', isDefault: (v) => v === 'top' },
		{ prop: 'empty-cells', isDefault: (v) => v === 'show' },
	]);
	return captured;
}
