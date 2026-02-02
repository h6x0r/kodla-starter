import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-benchmark-comparison',
	title: 'Benchmark Comparison',
	difficulty: 'hard',	tags: ['go', 'benchmarking', 'optimization', 'comparison'],
	estimatedTime: '30m',	isPremium: false,
	youtubeUrl: '',
	description: `Compare algorithm performance using **benchstat** and multiple implementations.

**Requirements:**
1. Implement 3 search algorithms: Linear, Binary, Map
2. Benchmark each with different data sizes
3. Use b.ReportAllocs() for all
4. Save results: go test -bench=. > old.txt
5. Compare with benchstat

**Constraints:**
- Implement 3 different approaches
- Test with 100, 1000, 10000 elements
- Report memory allocations`,
	initialCode: `package compare_test
// TODO: Implement LinearSearch
func LinearSearch(slice []int, target int) bool {
	return false // TODO: Implement
}

// TODO: Implement BinarySearch (sorted slice)
func BinarySearch(slice []int, target int) bool {
	return false // TODO: Implement
}

// TODO: Implement MapSearch
func MapSearch(m map[int]bool, target int) bool {
	return false // TODO: Implement
}

// TODO: Write comparative benchmarks
func BenchmarkSearch(b *B) {
	// TODO: Implement
}`,
	solutionCode: `package compare_test

import (
	"sort"
)

func LinearSearch(slice []int, target int) bool {
	for _, v := range slice {  // O(n)
		if v == target {
			return true
		}
	}
	return false
}

func BinarySearch(slice []int, target int) bool {
	i := sort.SearchInts(slice, target)  // O(log n)
	return i < len(slice) && slice[i] == target
}

func MapSearch(m map[int]bool, target int) bool {
	return m[target]  // O(1)
}

func BenchmarkSearch(b *B) {
	sizes := []int{100, 1000, 10000}

	for _, size := range sizes {
		// Prepare data
		slice := make([]int, size)
		for i := 0; i < size; i++ {
			slice[i] = i
		}

		m := make(map[int]bool, size)
		for i := 0; i < size; i++ {
			m[i] = true
		}

		target := size / 2  // Middle element

		// Linear search benchmark
		b.Run(fmt.Sprintf("Linear/%d", size), func(b *B) {
			b.ReportAllocs()
			for i := 0; i < b.N; i++ {
				LinearSearch(slice, target)
			}
		})

		// Binary search benchmark
		b.Run(fmt.Sprintf("Binary/%d", size), func(b *B) {
			b.ReportAllocs()
			for i := 0; i < b.N; i++ {
				BinarySearch(slice, target)
			}
		})

		// Map search benchmark
		b.Run(fmt.Sprintf("Map/%d", size), func(b *B) {
			b.ReportAllocs()
			for i := 0; i < b.N; i++ {
				MapSearch(m, target)
			}
		})
	}
}`,
			hint1: `Run: go test -bench=. -benchmem to compare all implementations.`,
			hint2: `Different algorithms have different time complexity: O(n), O(log n), O(1).`,
			testCode: `package compare_test

import (
	"sort"
)

func Test1(t *T) {
	slice := []int{1, 2, 3, 4, 5}
	if !LinearSearch(slice, 3) {
		t.Error("LinearSearch should find 3")
	}
}

func Test2(t *T) {
	slice := []int{1, 2, 3, 4, 5}
	if LinearSearch(slice, 10) {
		t.Error("LinearSearch should not find 10")
	}
}

func Test3(t *T) {
	slice := []int{1, 2, 3, 4, 5}
	if !BinarySearch(slice, 3) {
		t.Error("BinarySearch should find 3")
	}
}

func Test4(t *T) {
	slice := []int{1, 2, 3, 4, 5}
	if BinarySearch(slice, 10) {
		t.Error("BinarySearch should not find 10")
	}
}

func Test5(t *T) {
	m := map[int]bool{1: true, 2: true, 3: true}
	if !MapSearch(m, 2) {
		t.Error("MapSearch should find 2")
	}
}

func Test6(t *T) {
	m := map[int]bool{1: true, 2: true}
	if MapSearch(m, 5) {
		t.Error("MapSearch should not find 5")
	}
}

func Test7(t *T) {
	slice := []int{}
	if LinearSearch(slice, 1) {
		t.Error("LinearSearch on empty slice should return false")
	}
}

func Test8(t *T) {
	slice := []int{}
	if BinarySearch(slice, 1) {
		t.Error("BinarySearch on empty slice should return false")
	}
}

func Test9(t *T) {
	m := map[int]bool{}
	if MapSearch(m, 1) {
		t.Error("MapSearch on empty map should return false")
	}
}

func Test10(t *T) {
	slice := make([]int, 1000)
	for i := 0; i < 1000; i++ {
		slice[i] = i * 2
	}
	sort.Ints(slice)
	if !BinarySearch(slice, 500) {
		t.Error("BinarySearch should find 500 in sorted slice")
	}
	if BinarySearch(slice, 501) {
		t.Error("BinarySearch should not find 501 (odd) in even-only slice")
	}
}
`,
			whyItMatters: `Benchmark comparison reveals best algorithm for your use case and data size.`,
			order: 4,
	translations: {
		ru: {
			title: 'Сравнение бенчмарков',
			description: `Сравнивайте производительность алгоритмов используя **benchstat** и множество реализаций.`,
			hint1: `Запуск: go test -bench=. -benchmem для сравнения всех реализаций.`,
			hint2: `Разные алгоритмы имеют разную сложность: O(n), O(log n), O(1).`,
			whyItMatters: `Сравнение бенчмарков выявляет лучший алгоритм для вашего случая.`,
			solutionCode: `package compare_test

import (
	"fmt"
	"sort"
)

func LinearSearch(slice []int, target int) bool {
	for _, v := range slice {  // O(n)
		if v == target {
			return true
		}
	}
	return false
}

func BinarySearch(slice []int, target int) bool {
	i := sort.SearchInts(slice, target)  // O(log n)
	return i < len(slice) && slice[i] == target
}

func MapSearch(m map[int]bool, target int) bool {
	return m[target]  // O(1)
}

func BenchmarkSearch(b *B) {
	sizes := []int{100, 1000, 10000}

	for _, size := range sizes {
		// Подготовить данные
		slice := make([]int, size)
		for i := 0; i < size; i++ {
			slice[i] = i
		}

		m := make(map[int]bool, size)
		for i := 0; i < size; i++ {
			m[i] = true
		}

		target := size / 2  // Средний элемент

		// Бенчмарк линейного поиска
		b.Run(fmt.Sprintf("Linear/%d", size), func(b *B) {
			b.ReportAllocs()
			for i := 0; i < b.N; i++ {
				LinearSearch(slice, target)
			}
		})

		// Бенчмарк бинарного поиска
		b.Run(fmt.Sprintf("Binary/%d", size), func(b *B) {
			b.ReportAllocs()
			for i := 0; i < b.N; i++ {
				BinarySearch(slice, target)
			}
		})

		// Бенчмарк поиска по map
		b.Run(fmt.Sprintf("Map/%d", size), func(b *B) {
			b.ReportAllocs()
			for i := 0; i < b.N; i++ {
				MapSearch(m, target)
			}
		})
	}
}`
		},
		uz: {
			title: `Benchmarklarni solishtirish`,
			description: `**benchstat** va ko'p amalga oshirishlardan foydalanib algoritm ishlashini solishtiring.`,
			hint1: `Ishga tushirish: barcha amalga oshirishlarni solishtirish uchun go test -bench=. -benchmem`,
			hint2: `Turli algoritmlar turli murakkablikka ega: O(n), O(log n), O(1).`,
			whyItMatters: `Benchmark taqqoslash sizning holatlaringiz uchun eng yaxshi algoritmni aniqlaydi.`,
			solutionCode: `package compare_test

import (
	"fmt"
	"sort"
)

func LinearSearch(slice []int, target int) bool {
	for _, v := range slice {  // O(n)
		if v == target {
			return true
		}
	}
	return false
}

func BinarySearch(slice []int, target int) bool {
	i := sort.SearchInts(slice, target)  // O(log n)
	return i < len(slice) && slice[i] == target
}

func MapSearch(m map[int]bool, target int) bool {
	return m[target]  // O(1)
}

func BenchmarkSearch(b *B) {
	sizes := []int{100, 1000, 10000}

	for _, size := range sizes {
		// Ma'lumotlarni tayyorlash
		slice := make([]int, size)
		for i := 0; i < size; i++ {
			slice[i] = i
		}

		m := make(map[int]bool, size)
		for i := 0; i < size; i++ {
			m[i] = true
		}

		target := size / 2  // O'rta element

		// Chiziqli qidiruv benchmark
		b.Run(fmt.Sprintf("Linear/%d", size), func(b *B) {
			b.ReportAllocs()
			for i := 0; i < b.N; i++ {
				LinearSearch(slice, target)
			}
		})

		// Ikkilik qidiruv benchmark
		b.Run(fmt.Sprintf("Binary/%d", size), func(b *B) {
			b.ReportAllocs()
			for i := 0; i < b.N; i++ {
				BinarySearch(slice, target)
			}
		})

		// Map qidiruv benchmark
		b.Run(fmt.Sprintf("Map/%d", size), func(b *B) {
			b.ReportAllocs()
			for i := 0; i < b.N; i++ {
				MapSearch(m, target)
			}
		})
	}
}`
		}
	}
};

export default task;
