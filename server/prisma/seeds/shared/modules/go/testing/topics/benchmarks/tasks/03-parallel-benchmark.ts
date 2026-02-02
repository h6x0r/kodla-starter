import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-parallel-benchmark',
	title: 'Parallel Benchmarks',
	difficulty: 'medium',	tags: ['go', 'benchmarking', 'parallel', 'concurrency'],
	estimatedTime: '25m',	isPremium: false,
	youtubeUrl: '',
	description: `Run benchmarks in parallel using **b.RunParallel** to test concurrent performance.

**Requirements:**
1. Implement thread-safe cache
2. Write parallel benchmark with b.RunParallel
3. Use pb.Next() loop
4. Compare sequential vs parallel performance
5. Run with \`-cpu\` flag

**Constraints:**
- Use b.RunParallel(func(pb *PB) {...})
- Test concurrent access
- Must be thread-safe`,
	initialCode: `package parallel_test

import (
	"sync"
)

type SafeCache struct {
	mu   sync.RWMutex
	data map[string]int
}

func NewSafeCache() *SafeCache {
	return &SafeCache{data: make(map[string]int)}
}

// TODO: Implement thread-safe Get
func (c *SafeCache) Get(key string) (int, bool) {
	// TODO: Implement
}

// TODO: Implement thread-safe Set
func (c *SafeCache) Set(key string, value int) {
	// TODO: Implement
}

// TODO: Write parallel benchmark
func BenchmarkSafeCacheParallel(b *B) {
	// TODO: Implement
}`,
	solutionCode: `package parallel_test

import (
	"sync"
)

type SafeCache struct {
	mu   sync.RWMutex
	data map[string]int
}

func NewSafeCache() *SafeCache {
	return &SafeCache{data: make(map[string]int)}
}

func (c *SafeCache) Get(key string) (int, bool) {
	c.mu.RLock()	// Read lock
	defer c.mu.RUnlock()
	val, ok := c.data[key]
	return val, ok
}

func (c *SafeCache) Set(key string, value int) {
	c.mu.Lock()	// Write lock
	defer c.mu.Unlock()
	c.data[key] = value
}

func BenchmarkSafeCacheParallel(b *B) {
	cache := NewSafeCache()
	cache.Set("key1", 100)

	b.RunParallel(func(pb *PB) {	// Run in parallel
		for pb.Next() {	// Each goroutine loops
			cache.Get("key1")
			cache.Set("key2", 200)
		}
	})
}`,
			hint1: `b.RunParallel runs function across multiple goroutines. Use pb.Next() for loop.`,
			hint2: `Test with: go test -bench=. -cpu=1,2,4,8 to see scaling.`,
			testCode: `package parallel_test

import (
	"sync"
)

func Test1(t *T) {
	cache := NewSafeCache()
	cache.Set("key", 42)
	val, ok := cache.Get("key")
	if !ok || val != 42 {
		t.Errorf("expected (42, true), got (%d, %v)", val, ok)
	}
}

func Test2(t *T) {
	cache := NewSafeCache()
	_, ok := cache.Get("nonexistent")
	if ok {
		t.Error("expected false for nonexistent key")
	}
}

func Test3(t *T) {
	cache := NewSafeCache()
	cache.Set("key", 1)
	cache.Set("key", 2)
	val, _ := cache.Get("key")
	if val != 2 {
		t.Errorf("expected 2, got %d", val)
	}
}

func Test4(t *T) {
	cache := NewSafeCache()
	for i := 0; i < 100; i++ {
		cache.Set("k", i)
	}
	val, ok := cache.Get("k")
	if !ok || val != 99 {
		t.Errorf("expected (99, true), got (%d, %v)", val, ok)
	}
}

func Test5(t *T) {
	cache := NewSafeCache()
	cache.Set("a", 1)
	cache.Set("b", 2)
	cache.Set("c", 3)
	v1, _ := cache.Get("a")
	v2, _ := cache.Get("b")
	v3, _ := cache.Get("c")
	if v1 != 1 || v2 != 2 || v3 != 3 {
		t.Error("multiple keys failed")
	}
}

func Test6(t *T) {
	cache := NewSafeCache()
	var wg sync.WaitGroup
	for i := 0; i < 10; i++ {
		wg.Add(1)
		go func(n int) {
			defer wg.Done()
			cache.Set("key", n)
		}(i)
	}
	wg.Wait()
	_, ok := cache.Get("key")
	if !ok {
		t.Error("concurrent set failed")
	}
}

func Test7(t *T) {
	cache := NewSafeCache()
	cache.Set("key", 100)
	var wg sync.WaitGroup
	for i := 0; i < 100; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			cache.Get("key")
		}()
	}
	wg.Wait()
}

func Test8(t *T) {
	cache := NewSafeCache()
	cache.Set("zero", 0)
	val, ok := cache.Get("zero")
	if !ok || val != 0 {
		t.Errorf("expected (0, true), got (%d, %v)", val, ok)
	}
}

func Test9(t *T) {
	cache := NewSafeCache()
	cache.Set("neg", -100)
	val, ok := cache.Get("neg")
	if !ok || val != -100 {
		t.Errorf("expected (-100, true), got (%d, %v)", val, ok)
	}
}

func Test10(t *T) {
	cache := NewSafeCache()
	var wg sync.WaitGroup
	for i := 0; i < 50; i++ {
		wg.Add(2)
		go func(n int) {
			defer wg.Done()
			cache.Set("mixed", n)
		}(i)
		go func() {
			defer wg.Done()
			cache.Get("mixed")
		}()
	}
	wg.Wait()
}
`,
			whyItMatters: `Parallel benchmarks reveal concurrency bottlenecks and lock contention.`,
			order: 2,
	translations: {
		ru: {
			title: 'Параллельный бенчмарк',
			description: `Запускайте бенчмарки параллельно используя **b.RunParallel** для тестирования параллельной производительности.`,
			hint1: `b.RunParallel запускает функцию в нескольких goroutines.`,
			hint2: `Тест: go test -bench=. -cpu=1,2,4,8 для проверки масштабирования.`,
			whyItMatters: `Параллельные бенчмарки выявляют узкие места в параллелизме.`,
			solutionCode: `package parallel_test

import (
	"sync"
)

type SafeCache struct {
	mu   sync.RWMutex
	data map[string]int
}

func NewSafeCache() *SafeCache {
	return &SafeCache{data: make(map[string]int)}
}

func (c *SafeCache) Get(key string) (int, bool) {
	c.mu.RLock()	// Блокировка на чтение
	defer c.mu.RUnlock()
	val, ok := c.data[key]
	return val, ok
}

func (c *SafeCache) Set(key string, value int) {
	c.mu.Lock()	// Блокировка на запись
	defer c.mu.Unlock()
	c.data[key] = value
}

func BenchmarkSafeCacheParallel(b *B) {
	cache := NewSafeCache()
	cache.Set("key1", 100)

	b.RunParallel(func(pb *PB) {	// Запуск параллельно
		for pb.Next() {	// Каждая goroutine циклится
			cache.Get("key1")
			cache.Set("key2", 200)
		}
	})
}`
		},
		uz: {
			title: `Parallel benchmarklar`,
			description: `Parallel ishlashni testlash uchun **b.RunParallel** dan foydalanib benchmarklarni parallel ishga tushiring.`,
			hint1: `b.RunParallel funksiyani bir nechta goroutinelarda ishga tushiradi.`,
			hint2: `Test: masshtablashni tekshirish uchun go test -bench=. -cpu=1,2,4,8`,
			whyItMatters: `Parallel benchmarklar parallellikdagi to'siqlarni aniqlaydi.`,
			solutionCode: `package parallel_test

import (
	"sync"
)

type SafeCache struct {
	mu   sync.RWMutex
	data map[string]int
}

func NewSafeCache() *SafeCache {
	return &SafeCache{data: make(map[string]int)}
}

func (c *SafeCache) Get(key string) (int, bool) {
	c.mu.RLock()	// O'qish qulfi
	defer c.mu.RUnlock()
	val, ok := c.data[key]
	return val, ok
}

func (c *SafeCache) Set(key string, value int) {
	c.mu.Lock()	// Yozish qulfi
	defer c.mu.Unlock()
	c.data[key] = value
}

func BenchmarkSafeCacheParallel(b *B) {
	cache := NewSafeCache()
	cache.Set("key1", 100)

	b.RunParallel(func(pb *PB) {	// Parallel ishga tushirish
		for pb.Next() {	// Har bir goroutine tsikl
			cache.Get("key1")
			cache.Set("key2", 200)
		}
	})
}`
		}
	}
};

export default task;
