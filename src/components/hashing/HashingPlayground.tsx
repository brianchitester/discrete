import { useState, useCallback, useEffect, useRef } from 'react';
import {
  hashFunctions,
  defaultItems,
  computeBuckets,
  computeMetrics,
  hashItem,
  type HashFunction,
} from '../../lib/hashing';
import { useProgress } from '../../hooks/useProgress';
import Slider from '../shared/Slider';
import InfoPanel from '../shared/InfoPanel';
import BucketVisualizer from './BucketVisualizer';
import DraggableItem from './DraggableItem';
import HashFunctionSelector from './HashFunctionSelector';
import CollisionCounter from './CollisionCounter';

const ITEM_COLORS = [
  '#6366f1', '#3b82f6', '#22c55e', '#eab308', '#f97316',
  '#ef4444', '#a855f7', '#ec4899', '#14b8a6', '#84cc16',
];

function colorForItem(item: string): string {
  let hash = 0;
  for (let i = 0; i < item.length; i++) {
    hash = ((hash << 5) - hash + item.charCodeAt(i)) | 0;
  }
  return ITEM_COLORS[Math.abs(hash) % ITEM_COLORS.length];
}

export default function HashingPlayground() {
  const [addedItems, setAddedItems] = useState<string[]>([]);
  const [selectedFnId, setSelectedFnId] = useState(hashFunctions[0].id);
  const [bucketCount, setBucketCount] = useState(7);
  const [highlightBucket, setHighlightBucket] = useState<number | null>(null);
  const [autoFilling, setAutoFilling] = useState(false);
  const autoFillRef = useRef(false);
  const triedFnsRef = useRef<Set<string>>(new Set([hashFunctions[0].id]));

  const { markMilestone, recordVisit } = useProgress('hashing-collisions');

  useEffect(() => {
    recordVisit();
  }, [recordVisit]);

  const selectedFn = hashFunctions.find(f => f.id === selectedFnId) ?? hashFunctions[0];
  const buckets = computeBuckets(addedItems, selectedFn, bucketCount);
  const metrics = computeMetrics(buckets);

  // Track collisions milestone
  useEffect(() => {
    if (metrics.collisions > 0 && addedItems.length > 0) {
      markMilestone('saw-collision');
    }
  }, [metrics.collisions, addedItems.length, markMilestone]);

  const handleAddItem = useCallback((item: string) => {
    setAddedItems(prev => {
      if (prev.includes(item)) return prev;
      const next = [...prev, item];

      if (next.length === 1) {
        markMilestone('added-first-item');
      }

      return next;
    });

    // Briefly highlight the target bucket
    const idx = hashItem(item, selectedFn, bucketCount);
    setHighlightBucket(idx);
    setTimeout(() => setHighlightBucket(null), 600);
  }, [selectedFn, bucketCount, markMilestone]);

  const handleSelectFn = useCallback((id: string) => {
    setSelectedFnId(id);
    triedFnsRef.current.add(id);
    if (triedFnsRef.current.size >= hashFunctions.length) {
      markMilestone('tried-all-hash-functions');
    }
  }, [markMilestone]);

  const handleBucketCountChange = useCallback((count: number) => {
    setBucketCount(count);
    markMilestone('changed-bucket-count');
  }, [markMilestone]);

  const handleReset = useCallback(() => {
    setAutoFilling(false);
    autoFillRef.current = false;
    setAddedItems([]);
    setHighlightBucket(null);
  }, []);

  const handleAutoFill = useCallback(() => {
    const remaining = defaultItems.filter(item => !addedItems.includes(item));
    if (remaining.length === 0 || autoFilling) return;

    setAutoFilling(true);
    autoFillRef.current = true;

    let i = 0;
    const interval = setInterval(() => {
      if (i >= remaining.length || !autoFillRef.current) {
        clearInterval(interval);
        setAutoFilling(false);
        autoFillRef.current = false;
        return;
      }
      handleAddItem(remaining[i]);
      i++;
    }, 150);
  }, [addedItems, autoFilling, handleAddItem]);

  return (
    <div className="space-y-6">
      {/* Controls Row */}
      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <HashFunctionSelector
          functions={hashFunctions}
          selectedId={selectedFnId}
          onSelect={handleSelectFn}
        />
        <div className="flex flex-col gap-3 lg:w-56">
          <Slider
            label="Buckets (k)"
            min={3}
            max={20}
            value={bucketCount}
            onChange={handleBucketCountChange}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAutoFill}
              disabled={autoFilling || addedItems.length === defaultItems.length}
              className="flex-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {autoFilling ? 'Adding...' : 'Auto-fill All'}
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border dark:border-border-dark hover:bg-surface-alt dark:hover:bg-surface-dark-alt transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <CollisionCounter metrics={metrics} />

      {/* Main area: Item pool + Buckets */}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        {/* Item Pool */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
            Item Pool ({defaultItems.length - addedItems.length} remaining)
          </h3>
          <div className="flex flex-wrap gap-1.5 p-3 rounded-lg border border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt min-h-[80px]">
            {defaultItems.map(item => (
              <DraggableItem
                key={item}
                item={item}
                onAdd={handleAddItem}
                disabled={addedItems.includes(item)}
                color={colorForItem(item)}
              />
            ))}
          </div>
        </div>

        {/* Bucket Visualization */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-text-muted dark:text-text-dark-muted uppercase tracking-wide">
            Hash Buckets ({bucketCount} slots)
          </h3>
          <div className="p-3 rounded-lg border border-border dark:border-border-dark bg-surface-alt dark:bg-surface-dark-alt">
            <BucketVisualizer buckets={buckets} highlightBucket={highlightBucket} />
          </div>
        </div>
      </div>

      {/* Info Panels */}
      <div className="space-y-3">
        <InfoPanel title="What are hash collisions?">
          <p>
            A <strong>hash collision</strong> occurs when two different inputs produce the same
            hash value and map to the same bucket. Try adding items with the "Bad: Length"
            hash function -- notice how "apple", "grape", and "mango" (all 5 letters) collide
            because the hash only considers string length.
          </p>
          <p className="mt-2">
            A good hash function distributes items evenly across buckets, minimizing collisions.
            Switch to "Good: DJB2" to see dramatically better distribution.
          </p>
        </InfoPanel>
        <InfoPanel title="The Pigeonhole Principle">
          <p>
            The <strong>Pigeonhole Principle</strong> states: if you place <em>n</em> items
            into <em>k</em> containers and <em>n &gt; k</em>, at least one container must
            hold more than one item. In hashing terms: if you hash 20 items into 7 buckets,
            at least one bucket <em>must</em> have a collision -- no hash function can avoid it.
          </p>
          <p className="mt-2">
            Try setting the bucket count low (3-5) and auto-filling all items. Collisions are
            mathematically guaranteed! Increase the bucket count to see how more space reduces
            collisions but never eliminates them entirely when items exceed buckets.
          </p>
        </InfoPanel>
      </div>
    </div>
  );
}
