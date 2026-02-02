import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-testing-sub-benchmarks',
	title: 'Sub-benchmarks',
	difficulty: 'medium',	tags: ['go', 'benchmarking', 'organization'],
	estimatedTime: '25m',	isPremium: false,
	youtubeUrl: '',
	description: `Organize benchmarks using **b.Run** sub-benchmarks for better structure.

**Requirements:**
1. Implement JSON and XML encoding functions
2. Create sub-benchmarks for different data sizes
3. Use b.Run(name, func(b *testing.B) {...})
4. Test small, medium, large datasets
5. Run specific sub-benchmark with -bench=

**Constraints:**
- Use b.Run for sub-benchmarks
- Test at least 3 sizes
- Run: go test -bench=BenchmarkJSON/large`,
	initialCode: `package subbench_test

import (
	"encoding/json"
	"testing"
)

type Data struct {
	Values []int
}

// TODO: Write sub-benchmarks
func BenchmarkJSON(b *testing.B) {
	// TODO: Implement
}`,
	solutionCode: `package subbench_test

import (
	"encoding/json"
	"testing"
)

type Data struct {
	Values []int
}

func BenchmarkJSON(b *testing.B) {
	// Small dataset
	b.Run("small", func(b *testing.B) {
		data := Data{Values: make([]int, 10)}
		b.ResetTimer()  // Reset timer after setup

		for i := 0; i < b.N; i++ {
			json.Marshal(data)
		}
	})

	// Medium dataset
	b.Run("medium", func(b *testing.B) {
		data := Data{Values: make([]int, 1000)}
		b.ResetTimer()

		for i := 0; i < b.N; i++ {
			json.Marshal(data)
		}
	})

	// Large dataset
	b.Run("large", func(b *testing.B) {
		data := Data{Values: make([]int, 100000)}
		b.ResetTimer()

		for i := 0; i < b.N; i++ {
			json.Marshal(data)
		}
	})
}`,
			hint1: `Use b.ResetTimer() after setup to exclude initialization from benchmark.`,
			hint2: `Run specific: go test -bench=BenchmarkJSON/large`,
			testCode: `package subbench_test

import (
	"encoding/json"
	"testing"
)

func Test1(t *testing.T) {
	data := Data{Values: []int{1, 2, 3}}
	bytes, err := json.Marshal(data)
	if err != nil {
		t.Fatalf("marshal failed: %v", err)
	}
	if len(bytes) == 0 {
		t.Error("expected non-empty JSON")
	}
}

func Test2(t *testing.T) {
	data := Data{Values: []int{}}
	bytes, _ := json.Marshal(data)
	expected := ` + "`" + `{"Values":[]}` + "`" + `
	if string(bytes) != expected {
		t.Errorf("expected %s, got %s", expected, string(bytes))
	}
}

func Test3(t *testing.T) {
	data := Data{Values: make([]int, 10)}
	bytes, _ := json.Marshal(data)
	var decoded Data
	if err := json.Unmarshal(bytes, &decoded); err != nil {
		t.Fatalf("unmarshal failed: %v", err)
	}
	if len(decoded.Values) != 10 {
		t.Errorf("expected 10 values, got %d", len(decoded.Values))
	}
}

func Test4(t *testing.T) {
	data := Data{Values: []int{100, 200, 300}}
	bytes, _ := json.Marshal(data)
	var decoded Data
	json.Unmarshal(bytes, &decoded)
	for i, v := range []int{100, 200, 300} {
		if decoded.Values[i] != v {
			t.Errorf("value at %d: expected %d, got %d", i, v, decoded.Values[i])
		}
	}
}

func Test5(t *testing.T) {
	data := Data{Values: make([]int, 1000)}
	for i := 0; i < 1000; i++ {
		data.Values[i] = i
	}
	bytes, _ := json.Marshal(data)
	if len(bytes) < 1000 {
		t.Error("expected larger JSON output for 1000 elements")
	}
}

func Test6(t *testing.T) {
	data := Data{Values: []int{-1, -2, -3}}
	bytes, _ := json.Marshal(data)
	var decoded Data
	json.Unmarshal(bytes, &decoded)
	if decoded.Values[0] != -1 || decoded.Values[1] != -2 || decoded.Values[2] != -3 {
		t.Error("negative values not preserved")
	}
}

func Test7(t *testing.T) {
	data := Data{}
	bytes, _ := json.Marshal(data)
	expected := ` + "`" + `{"Values":null}` + "`" + `
	if string(bytes) != expected {
		t.Errorf("expected %s, got %s", expected, string(bytes))
	}
}

func Test8(t *testing.T) {
	data := Data{Values: []int{0, 0, 0}}
	bytes, _ := json.Marshal(data)
	var decoded Data
	json.Unmarshal(bytes, &decoded)
	for i, v := range decoded.Values {
		if v != 0 {
			t.Errorf("expected 0 at %d, got %d", i, v)
		}
	}
}

func Test9(t *testing.T) {
	data := Data{Values: []int{1}}
	bytes, _ := json.Marshal(data)
	expected := ` + "`" + `{"Values":[1]}` + "`" + `
	if string(bytes) != expected {
		t.Errorf("expected %s, got %s", expected, string(bytes))
	}
}

func Test10(t *testing.T) {
	large := Data{Values: make([]int, 100000)}
	bytes, err := json.Marshal(large)
	if err != nil {
		t.Fatalf("large marshal failed: %v", err)
	}
	if len(bytes) < 100000 {
		t.Error("expected large JSON for 100k elements")
	}
}
`,
			whyItMatters: `Sub-benchmarks organize performance tests by scenarios and enable selective execution of specific cases.`,
			order: 3,
	translations: {
		ru: {
			title: 'Вложенные бенчмарки',
			description: `Организуйте бенчмарки используя **b.Run** под-бенчмарки для лучшей структуры.`,
			hint1: `Используйте b.ResetTimer() после setup чтобы исключить инициализацию.`,
			hint2: `Запуск конкретного: go test -bench=BenchmarkJSON/large`,
			whyItMatters: `Под-бенчмарки организуют тесты производительности и позволяют выборочное выполнение конкретных сценариев.`,
			solutionCode: `package subbench_test

import (
	"encoding/json"
	"testing"
)

type Data struct {
	Values []int
}

func BenchmarkJSON(b *testing.B) {
	// Маленький набор данных
	b.Run("small", func(b *testing.B) {
		data := Data{Values: make([]int, 10)}
		b.ResetTimer()  // Сбросить таймер после настройки

		for i := 0; i < b.N; i++ {
			json.Marshal(data)
		}
	})

	// Средний набор данных
	b.Run("medium", func(b *testing.B) {
		data := Data{Values: make([]int, 1000)}
		b.ResetTimer()

		for i := 0; i < b.N; i++ {
			json.Marshal(data)
		}
	})

	// Большой набор данных
	b.Run("large", func(b *testing.B) {
		data := Data{Values: make([]int, 100000)}
		b.ResetTimer()

		for i := 0; i < b.N; i++ {
			json.Marshal(data)
		}
	})
}`
		},
		uz: {
			title: `Ichki benchmarklar`,
			description: `Yaxshiroq struktura uchun **b.Run** sub-benchmarklaridan foydalanib benchmarklarni tashkil qiling.

**Talablar:**
1. JSON va XML practixsh funksiyalarini amalga oshiring
2. Turli o'lchamlar uchun sub-benchmarklar yarating
3. b.Run(name, func(b *testing.B) {...}) dan foydalaning
4. Kichik, o'rtacha, katta to'plamlarni test qiling
5. -bench= bilan muayyan sub-benchmark ishga tushiring

**Cheklovlar:**
- Sub-benchmarklar uchun b.Run foydalaning
- Kamida 3 ta o'lchamni test qiling
- Ishga tushirish: go test -bench=BenchmarkJSON/large`,
			hint1: `Initsializatsiyani chiqarib tashlash uchun sozlashdan keyin b.ResetTimer() dan foydalaning.`,
			hint2: `Muayyan ishga tushirish: go test -bench=BenchmarkJSON/large`,
			whyItMatters: `Sub-benchmarklar ishlash testlarini tashkil qiladi va muayyan stsenariylarni tanlangan holda bajarishga imkon beradi.`,
			solutionCode: `package subbench_test

import (
	"encoding/json"
	"testing"
)

type Data struct {
	Values []int
}

func BenchmarkJSON(b *testing.B) {
	// Kichik ma'lumotlar to'plami
	b.Run("small", func(b *testing.B) {
		data := Data{Values: make([]int, 10)}
		b.ResetTimer()  // Sozlashdan keyin timerni qayta o'rnatish

		for i := 0; i < b.N; i++ {
			json.Marshal(data)
		}
	})

	// O'rtacha ma'lumotlar to'plami
	b.Run("medium", func(b *testing.B) {
		data := Data{Values: make([]int, 1000)}
		b.ResetTimer()

		for i := 0; i < b.N; i++ {
			json.Marshal(data)
		}
	})

	// Katta ma'lumotlar to'plami
	b.Run("large", func(b *testing.B) {
		data := Data{Values: make([]int, 100000)}
		b.ResetTimer()

		for i := 0; i < b.N; i++ {
			json.Marshal(data)
		}
	})
}`
		}
	}
};

export default task;
