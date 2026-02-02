import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-basic-benchmark',
	title: 'Basic Benchmark',
	difficulty: 'easy',	tags: ['go', 'benchmarking', 'performance'],
	estimatedTime: '20m',	isPremium: false,
	youtubeUrl: '',
	description: `Write a basic benchmark using **b.N loop** to measure function performance.

**Requirements:**
1. Implement \`Fibonacci(n int) int\` function
2. Write \`BenchmarkFibonacci\` function
3. Use \`b.N\` loop for iterations
4. Run with \`go test -bench=.\`
5. Analyze ns/op output

**Example:**
\`\`\`go
func BenchmarkFibonacci(b *B) {
    for i := 0; i < b.N; i++ {
        Fibonacci(20)
    }
}
\`\`\`

**Constraints:**
- Benchmark function must start with "Benchmark"
- Must use b.N for iterations
- Test at least 2 different inputs`,
	initialCode: `package bench_test
// TODO: Implement Fibonacci
func Fibonacci(n int) int {
	return 0 // TODO: Implement
}

// TODO: Write BenchmarkFibonacci
func BenchmarkFibonacci(b *B) {
	// TODO: Implement
}`,
	solutionCode: `package bench_test
func Fibonacci(n int) int {
	if n <= 1 {	// Base case
		return n
	}
	return Fibonacci(n-1) + Fibonacci(n-2)	// Recursive
}

func BenchmarkFibonacci(b *B) {
	// Benchmark with n=10
	for i := 0; i < b.N; i++ {	// b.N iterations
		Fibonacci(10)
	}
}

func BenchmarkFibonacci20(b *B) {
	// Benchmark with n=20
	for i := 0; i < b.N; i++ {
		Fibonacci(20)
	}
}`,
	testCode: `package bench_test
func TestFibonacciZero(t *T) {
	result := Fibonacci(0)
	expected := 0
	if result != expected {
		t.Errorf("expected %d, got %d", expected, result)
	}
}

func TestFibonacciOne(t *T) {
	result := Fibonacci(1)
	expected := 1
	if result != expected {
		t.Errorf("expected %d, got %d", expected, result)
	}
}

func TestFibonacciTwo(t *T) {
	result := Fibonacci(2)
	expected := 1
	if result != expected {
		t.Errorf("expected %d, got %d", expected, result)
	}
}

func TestFibonacciThree(t *T) {
	result := Fibonacci(3)
	expected := 2
	if result != expected {
		t.Errorf("expected %d, got %d", expected, result)
	}
}

func TestFibonacciFour(t *T) {
	result := Fibonacci(4)
	expected := 3
	if result != expected {
		t.Errorf("expected %d, got %d", expected, result)
	}
}

func TestFibonacciFive(t *T) {
	result := Fibonacci(5)
	expected := 5
	if result != expected {
		t.Errorf("expected %d, got %d", expected, result)
	}
}

func TestFibonacciSix(t *T) {
	result := Fibonacci(6)
	expected := 8
	if result != expected {
		t.Errorf("expected %d, got %d", expected, result)
	}
}

func TestFibonacciSeven(t *T) {
	result := Fibonacci(7)
	expected := 13
	if result != expected {
		t.Errorf("expected %d, got %d", expected, result)
	}
}

func TestFibonacciTen(t *T) {
	result := Fibonacci(10)
	expected := 55
	if result != expected {
		t.Errorf("expected %d, got %d", expected, result)
	}
}

func TestFibonacciTwenty(t *T) {
	result := Fibonacci(20)
	expected := 6765
	if result != expected {
		t.Errorf("expected %d, got %d", expected, result)
	}
}`,
			hint1: `Benchmark function signature: func BenchmarkXxx(b *B). Use b.N loop.`,
			hint2: `Run: go test -bench=. to see ns/op (nanoseconds per operation).`,
			whyItMatters: `Benchmarks measure performance, identify bottlenecks, and track optimization impact.`,
			order: 0,
	translations: {
		ru: {
			title: 'Базовый бенчмарк',
			description: `Напишите базовый бенчмарк используя **b.N цикл** для измерения производительности функции.`,
			hint1: `Сигнатура: func BenchmarkXxx(b *B). Используйте b.N цикл.`,
			hint2: `Запуск: go test -bench=. для просмотра ns/op.`,
			whyItMatters: `Бенчмарки измеряют производительность и отслеживают оптимизации.`,
			solutionCode: `package bench_test
func Fibonacci(n int) int {
	if n <= 1 {	// Базовый случай
		return n
	}
	return Fibonacci(n-1) + Fibonacci(n-2)	// Рекурсия
}

func BenchmarkFibonacci(b *B) {
	// Бенчмарк с n=10
	for i := 0; i < b.N; i++ {	// b.N итераций
		Fibonacci(10)
	}
}

func BenchmarkFibonacci20(b *B) {
	// Бенчмарк с n=20
	for i := 0; i < b.N; i++ {
		Fibonacci(20)
	}
}`
		},
		uz: {
			title: `Asosiy benchmark`,
			description: `Funksiya ishlashini o'lchash uchun **b.N tsikli** dan foydalangan holda asosiy benchmark yozing.`,
			hint1: `Signatura: func BenchmarkXxx(b *B). b.N tsiklidan foydalaning.`,
			hint2: `Ishga tushirish: ns/op ni ko'rish uchun go test -bench=.`,
			whyItMatters: `Benchmarklar ishlashni o'lchaydi va optimizatsiyalarni kuzatadi.`,
			solutionCode: `package bench_test
func Fibonacci(n int) int {
	if n <= 1 {	// Asosiy holat
		return n
	}
	return Fibonacci(n-1) + Fibonacci(n-2)	// Rekursiv
}

func BenchmarkFibonacci(b *B) {
	// n=10 bilan benchmark
	for i := 0; i < b.N; i++ {	// b.N iteratsiyalar
		Fibonacci(10)
	}
}

func BenchmarkFibonacci20(b *B) {
	// n=20 bilan benchmark
	for i := 0; i < b.N; i++ {
		Fibonacci(20)
	}
}`
		}
	}
};

export default task;
