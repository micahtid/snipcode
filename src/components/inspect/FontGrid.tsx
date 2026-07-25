/**
 * The fonts inspector view.
 *
 * Renders the page's fonts as a grid of cards, each showing an "Aa" sample set in that
 * family, the family name, and its web or system origin plus variant count. Clicking a card
 * copies the family name.
 */
import type { FontReport } from '../../content/inspect/types';
import { InspectCard } from './InspectCard';

export function FontGrid({ fonts }: { fonts: FontReport[] }) {
	return (
		<div className="sc-inspect-grid">
			{fonts.map((font, i) => (
				<InspectCard
					key={`${font.family}-${i}`}
					preview={
						<span className="sc-font-preview" style={{ fontFamily: `'${font.family}', sans-serif` }}>
							Aa
						</span>
					}
					name={font.family}
					meta={`${font.origin === 'web' ? 'Web' : 'System'} · ${font.variants.length} variant${font.variants.length === 1 ? '' : 's'}`}
					onActivate={() => navigator.clipboard.writeText(font.family)}
					feedback="Copied"
					subtleFeedback
					title={`Copy "${font.family}"`}
				/>
			))}
		</div>
	);
}
