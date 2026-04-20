import { describe, it, expect, beforeEach } from 'vitest';
import { ModelCache } from '../model-cache.js';

describe('ModelCache.ensureFresh coalescing', () => {
  let cache: ModelCache;

  beforeEach(() => {
    cache = ModelCache.getInstance();
    cache.setModels([]);
    // Force invalid cache (setModels with empty list leaves it invalid)
  });

  it('coalesces concurrent populates into a single fetcher call', async () => {
    let calls = 0;
    const fetcher = async () => {
      calls += 1;
      await new Promise((r) => setTimeout(r, 25));
      return [{ id: 'a/b', name: 'Model A/B' }];
    };

    await Promise.all([
      cache.ensureFresh(fetcher),
      cache.ensureFresh(fetcher),
      cache.ensureFresh(fetcher),
      cache.ensureFresh(fetcher),
    ]);

    expect(calls).toBe(1);
    expect(cache.has('a/b')).toBe(true);
  });

  it('clears the in-flight slot after success so subsequent stale windows refetch', async () => {
    let calls = 0;
    const fetcher = async () => {
      calls += 1;
      return [{ id: 'x/y' }];
    };

    await cache.ensureFresh(fetcher);
    // Manually expire
    cache.setModels([]);
    await cache.ensureFresh(fetcher);
    expect(calls).toBe(2);
  });

  it('releases the in-flight slot on fetcher failure', async () => {
    let calls = 0;
    const fail = async () => {
      calls += 1;
      throw new Error('nope');
    };

    await expect(cache.ensureFresh(fail)).rejects.toThrow('nope');
    await expect(cache.ensureFresh(fail)).rejects.toThrow('nope');
    expect(calls).toBe(2);
  });
});
