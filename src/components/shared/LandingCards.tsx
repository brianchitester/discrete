import ConceptCard from './ConceptCard';
import { getCompletionPercent } from '../../lib/progress';

const concepts = [
  {
    title: 'Graph Traversal',
    icon: '\u{1F50D}',
    href: '/concepts/graph-traversal',
    description: 'Watch BFS ripple like a wave and DFS dive like a spelunker. Draw walls, race algorithms side by side.',
    conceptId: 'graph-traversal' as const,
    totalMilestones: 4,
  },
  {
    title: 'Growth Rates',
    icon: '\u{1F4C8}',
    href: '/concepts/growth-rates',
    description: 'Slide N from 1 to 100 and watch O(2\u207F) explode off the chart. Toggle log scale for the real aha moment.',
    conceptId: 'growth-rates' as const,
    totalMilestones: 3,
  },
  {
    title: 'Hashing Collisions',
    icon: '\u{1FAA3}',
    href: '/concepts/hashing-collisions',
    description: 'Drag items into hash buckets. Switch from a bad hash to DJB2 and watch collisions melt away.',
    conceptId: 'hashing-collisions' as const,
    totalMilestones: 4,
  },
  {
    title: 'Subsets',
    icon: '\u{1F3F0}',
    href: '/concepts/subsets',
    description: 'Toggle elements and watch 2^n subsets appear. Feel how fast exponential growth really is.',
    conceptId: 'subsets' as const,
    totalMilestones: 4,
  },
  {
    title: 'Permutations',
    icon: '\u{1F510}',
    href: '/concepts/permutations',
    description: 'Arrange mystical runes in a lock and discover why n! grows so shockingly fast — factorial dwarfs exponential.',
    conceptId: 'permutations' as const,
    totalMilestones: 4,
  },
  {
    title: 'All-Pairs',
    icon: '\u{1F91D}',
    href: '/concepts/all-pairs',
    description: 'Add participants and watch every possible pair appear. C(n,2) grows quadratically — every new addition connects to everyone.',
    conceptId: 'all-pairs' as const,
    totalMilestones: 4,
  },
] as const;

export default function LandingCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {concepts.map((c) => (
        <ConceptCard
          key={c.conceptId}
          title={c.title}
          icon={c.icon}
          href={c.href}
          description={c.description}
          progress={getCompletionPercent(c.conceptId, c.totalMilestones)}
        />
      ))}
    </div>
  );
}
