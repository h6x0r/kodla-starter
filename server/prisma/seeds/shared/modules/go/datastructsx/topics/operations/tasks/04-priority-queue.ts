import { Task } from '../../../../types';

export const task: Task = {
	slug: 'go-datastructsx-priority-queue',
	title: 'Min-Heap Priority Queue with Generic Comparator',
	difficulty: 'medium',
	tags: ['go', 'generics', 'heap', 'priority-queue', 'algorithms', 'binary-tree'],
	estimatedTime: '55m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement a production-grade Priority Queue using a binary min-heap data structure with O(log n) insertions and O(log n) deletions.

**You will implement:**

**Level 1 (Medium) - Priority Queue Operations:**
1. **NewPriorityQueue[T any](comparator func(a, b T) bool) *PriorityQueue[T]** - Create queue with custom comparator
2. **Push(value T)** - Insert element maintaining heap property
3. **Pop() (T, bool)** - Remove and return highest priority element
4. **Peek() (T, bool)** - View highest priority element without removing
5. **Size() int** - Return number of elements
6. **IsEmpty() bool** - Check if queue is empty

**Key Concepts:**
- **Priority Queue**: Elements processed by priority, not insertion order
- **Binary Min-Heap**: Complete binary tree where parent ≤ children
- **Heap Property**: Parent always higher priority than children
- **Array Representation**: Use slice, children at 2i+1 and 2i+2
- **O(log n) Operations**: Push and Pop are logarithmic time
- **Custom Comparator**: Generic function to define priority order

**How Priority Queue Works:**

\`\`\`
Min-Heap (smaller = higher priority):

Push(5):       5
Push(3):       3
              /
             5

Push(7):       3
              / \
             5   7

Push(1):       1
              / \
             3   7
            /
           5

Pop() → 1      3
              / \
             5   7

Array representation: [1, 3, 7, 5]
Parent at i, children at 2i+1, 2i+2
\`\`\`

**Example Usage:**

\`\`\`go
// Integer min-heap (lower number = higher priority)
minPQ := NewPriorityQueue[int](func(a, b int) bool {
    return a < b  // a has higher priority if smaller
})

minPQ.Push(5)
minPQ.Push(3)
minPQ.Push(7)
minPQ.Push(1)

val, ok := minPQ.Pop()
// val == 1, ok == true (smallest element)

val, ok = minPQ.Peek()
// val == 3, ok == true (next smallest)

// Integer max-heap (higher number = higher priority)
maxPQ := NewPriorityQueue[int](func(a, b int) bool {
    return a > b  // a has higher priority if larger
})

maxPQ.Push(5)
maxPQ.Push(3)
maxPQ.Push(7)

val, ok = maxPQ.Pop()
// val == 7, ok == true (largest element)

// Task priority queue
type Task struct {
    Name     string
    Priority int
}

taskPQ := NewPriorityQueue[Task](func(a, b Task) bool {
    return a.Priority < b.Priority  // Lower priority number = higher priority
})

taskPQ.Push(Task{"Send email", 3})
taskPQ.Push(Task{"Critical bug", 1})
taskPQ.Push(Task{"Update docs", 5})
taskPQ.Push(Task{"Security fix", 1})

task, ok := taskPQ.Pop()
// task == Task{"Critical bug", 1} or Task{"Security fix", 1}
// (both have priority 1, order undefined for equal priorities)

// Timestamp-based queue (earliest = higher priority)
type Event struct {
    Name string
    Time time.Time
}

eventPQ := NewPriorityQueue[Event](func(a, b Event) bool {
    return a.Time.Before(b.Time)
})

eventPQ.Push(Event{"Meeting", time.Now().Add(2 * time.Hour)})
eventPQ.Push(Event{"Call", time.Now().Add(30 * time.Minute)})
eventPQ.Push(Event{"Lunch", time.Now().Add(4 * time.Hour)})

next, ok := eventPQ.Pop()
// next == Event{"Call", ...} (earliest event)

size := eventPQ.Size()
// size == 2

isEmpty := eventPQ.IsEmpty()
// isEmpty == false
\`\`\`

**Constraints:**
- Use array/slice as underlying storage (not tree pointers)
- Maintain heap property after every Push and Pop
- Push must be O(log n) time (bubble up)
- Pop must be O(log n) time (bubble down)
- Peek must be O(1) time (just return root)
- Use comparator function for flexible priority definition
- Handle edge cases: Pop/Peek on empty queue`,
	initialCode: `package datastructsx

// PriorityQueue implements a binary min-heap
// comparator(a, b) returns true if a has higher priority than b
type PriorityQueue[T any] struct {
	// TODO: Add fields for elements slice and comparator function
}

// TODO: Implement NewPriorityQueue
// Create new priority queue with custom comparator
// comparator(a, b) returns true if a should come before b
func NewPriorityQueue[T any](comparator func(a, b T) bool) *PriorityQueue[T] {
	// TODO: Implement
}

// TODO: Implement Push
// Insert element and maintain heap property
// Bubble up: Compare with parent, swap if needed, repeat
func (pq *PriorityQueue[T]) Push(value T) {
	// TODO: Implement
}

// TODO: Implement Pop
// Remove and return highest priority element (root)
// Move last element to root, bubble down to restore heap
// Return (zero value, false) if empty
func (pq *PriorityQueue[T]) Pop() (T, bool) {
	// TODO: Implement
}

// TODO: Implement Peek
// Return highest priority element without removing
// Return (zero value, false) if empty
func (pq *PriorityQueue[T]) Peek() (T, bool) {
	// TODO: Implement
}

// TODO: Implement Size
// Return number of elements in queue
func (pq *PriorityQueue[T]) Size() int {
	// TODO: Implement
}

// TODO: Implement IsEmpty
// Return true if queue has no elements
func (pq *PriorityQueue[T]) IsEmpty() bool {
	// TODO: Implement
}

// TODO: Helper methods
// - bubbleUp(index int) - restore heap property upward
// - bubbleDown(index int) - restore heap property downward
// - parent(index int) int - return parent index
// - leftChild(index int) int - return left child index
// - rightChild(index int) int - return right child index
// - swap(i, j int) - swap elements at indices`,
	solutionCode: `package datastructsx

type PriorityQueue[T any] struct {
	elements   []T
	comparator func(a, b T) bool
}

func NewPriorityQueue[T any](comparator func(a, b T) bool) *PriorityQueue[T] {
	return &PriorityQueue[T]{
		elements:   make([]T, 0),
		comparator: comparator,
	}
}

func (pq *PriorityQueue[T]) Push(value T) {
	pq.elements = append(pq.elements, value)
	pq.bubbleUp(len(pq.elements) - 1)
}

func (pq *PriorityQueue[T]) Pop() (T, bool) {
	if pq.IsEmpty() {
		var zero T
		return zero, false
	}

	root := pq.elements[0]
	lastIndex := len(pq.elements) - 1

	// Move last element to root
	pq.elements[0] = pq.elements[lastIndex]
	pq.elements = pq.elements[:lastIndex]

	// Restore heap property
	if !pq.IsEmpty() {
		pq.bubbleDown(0)
	}

	return root, true
}

func (pq *PriorityQueue[T]) Peek() (T, bool) {
	if pq.IsEmpty() {
		var zero T
		return zero, false
	}
	return pq.elements[0], true
}

func (pq *PriorityQueue[T]) Size() int {
	return len(pq.elements)
}

func (pq *PriorityQueue[T]) IsEmpty() bool {
	return len(pq.elements) == 0
}

// Helper: Bubble up to restore heap property
func (pq *PriorityQueue[T]) bubbleUp(index int) {
	for index > 0 {
		parentIndex := pq.parent(index)
		// If current has higher priority than parent, swap
		if pq.comparator(pq.elements[index], pq.elements[parentIndex]) {
			pq.swap(index, parentIndex)
			index = parentIndex
		} else {
			break
		}
	}
}

// Helper: Bubble down to restore heap property
func (pq *PriorityQueue[T]) bubbleDown(index int) {
	size := len(pq.elements)

	for {
		highest := index
		left := pq.leftChild(index)
		right := pq.rightChild(index)

		// Find highest priority among node and children
		if left < size && pq.comparator(pq.elements[left], pq.elements[highest]) {
			highest = left
		}
		if right < size && pq.comparator(pq.elements[right], pq.elements[highest]) {
			highest = right
		}

		// If current is highest priority, done
		if highest == index {
			break
		}

		// Otherwise swap and continue
		pq.swap(index, highest)
		index = highest
	}
}

// Helper: Get parent index
func (pq *PriorityQueue[T]) parent(index int) int {
	return (index - 1) / 2
}

// Helper: Get left child index
func (pq *PriorityQueue[T]) leftChild(index int) int {
	return 2*index + 1
}

// Helper: Get right child index
func (pq *PriorityQueue[T]) rightChild(index int) int {
	return 2*index + 2
}

// Helper: Swap elements at two indices
func (pq *PriorityQueue[T]) swap(i, j int) {
	pq.elements[i], pq.elements[j] = pq.elements[j], pq.elements[i]
}`,
	testCode: `package datastructsx

import "testing"

func Test1(t *testing.T) {
	// Min heap - pop returns smallest
	pq := NewPriorityQueue[int](func(a, b int) bool { return a < b })
	pq.Push(5)
	pq.Push(3)
	pq.Push(7)
	val, _ := pq.Pop()
	if val != 3 {
		t.Errorf("expected 3, got %d", val)
	}
}

func Test2(t *testing.T) {
	// Max heap - pop returns largest
	pq := NewPriorityQueue[int](func(a, b int) bool { return a > b })
	pq.Push(5)
	pq.Push(3)
	pq.Push(7)
	val, _ := pq.Pop()
	if val != 7 {
		t.Errorf("expected 7, got %d", val)
	}
}

func Test3(t *testing.T) {
	// Empty pop
	pq := NewPriorityQueue[int](func(a, b int) bool { return a < b })
	_, ok := pq.Pop()
	if ok {
		t.Error("expected not ok")
	}
}

func Test4(t *testing.T) {
	// Peek without removing
	pq := NewPriorityQueue[int](func(a, b int) bool { return a < b })
	pq.Push(5)
	pq.Push(3)
	val, _ := pq.Peek()
	if val != 3 || pq.Size() != 2 {
		t.Errorf("expected 3 and size 2, got %d %d", val, pq.Size())
	}
}

func Test5(t *testing.T) {
	// IsEmpty and Size
	pq := NewPriorityQueue[int](func(a, b int) bool { return a < b })
	if !pq.IsEmpty() {
		t.Error("expected empty")
	}
	pq.Push(1)
	if pq.IsEmpty() || pq.Size() != 1 {
		t.Error("expected not empty and size 1")
	}
}

func Test6(t *testing.T) {
	// Pop all in order
	pq := NewPriorityQueue[int](func(a, b int) bool { return a < b })
	pq.Push(3)
	pq.Push(1)
	pq.Push(2)
	v1, _ := pq.Pop()
	v2, _ := pq.Pop()
	v3, _ := pq.Pop()
	if v1 != 1 || v2 != 2 || v3 != 3 {
		t.Errorf("expected 1,2,3, got %d,%d,%d", v1, v2, v3)
	}
}

func Test7(t *testing.T) {
	// Single element
	pq := NewPriorityQueue[int](func(a, b int) bool { return a < b })
	pq.Push(42)
	val, ok := pq.Pop()
	if !ok || val != 42 {
		t.Errorf("expected 42, got %d", val)
	}
}

func Test8(t *testing.T) {
	// String priority queue
	pq := NewPriorityQueue[string](func(a, b string) bool { return a < b })
	pq.Push("banana")
	pq.Push("apple")
	pq.Push("cherry")
	val, _ := pq.Pop()
	if val != "apple" {
		t.Errorf("expected apple, got %s", val)
	}
}

func Test9(t *testing.T) {
	// Duplicate values
	pq := NewPriorityQueue[int](func(a, b int) bool { return a < b })
	pq.Push(5)
	pq.Push(5)
	pq.Push(5)
	val, _ := pq.Pop()
	if val != 5 || pq.Size() != 2 {
		t.Errorf("expected 5 and size 2, got %d %d", val, pq.Size())
	}
}

func Test10(t *testing.T) {
	// Custom struct priority
	type Task struct {
		Name     string
		Priority int
	}
	pq := NewPriorityQueue[Task](func(a, b Task) bool { return a.Priority < b.Priority })
	pq.Push(Task{"low", 5})
	pq.Push(Task{"high", 1})
	pq.Push(Task{"medium", 3})
	task, _ := pq.Pop()
	if task.Priority != 1 {
		t.Errorf("expected priority 1, got %d", task.Priority)
	}
}`,
	hint1: `Store elements in slice. Comparator tells which element has higher priority. For index i: parent at (i-1)/2, left child at 2i+1, right child at 2i+2. Push: append to end, bubbleUp. Pop: save root, move last to root, remove last, bubbleDown.`,
	hint2: `bubbleUp: while index > 0, compare with parent at (index-1)/2, if current has higher priority (comparator returns true), swap and continue with parent index. bubbleDown: compare with both children, find highest priority among 3, if not current, swap with highest and continue with that index.`,
	whyItMatters: `Priority Queues are essential data structures used in operating systems, network routing, AI algorithms, and real-time systems where elements must be processed by priority rather than arrival order.

**Why Priority Queues Matter:**

**1. Task Scheduling - Operating Systems**

Every OS uses priority queues for process scheduling:

\`\`\`go
type Process struct {
    PID      int
    Priority int
    Name     string
}

scheduler := NewPriorityQueue[Process](func(a, b Process) bool {
    return a.Priority < b.Priority  // Lower number = higher priority
})

// Add processes
scheduler.Push(Process{101, 5, "background-sync"})
scheduler.Push(Process{102, 1, "kernel-critical"})
scheduler.Push(Process{103, 3, "user-app"})
scheduler.Push(Process{104, 1, "interrupt-handler"})

// CPU processes highest priority first
for !scheduler.IsEmpty() {
    process, _ := scheduler.Pop()
    CPU.Execute(process)
}

// Execution order:
// 1. kernel-critical (priority 1)
// 2. interrupt-handler (priority 1)
// 3. user-app (priority 3)
// 4. background-sync (priority 5)
\`\`\`

**Real World**: Linux kernel uses priority queues for process scheduling. Critical system processes get CPU time before user applications.

**2. Dijkstra's Shortest Path Algorithm**

Finding shortest path in graphs (GPS, network routing):

\`\`\`go
type Node struct {
    ID       int
    Distance int
}

func DijkstraShortestPath(graph Graph, start int) map[int]int {
    distances := make(map[int]int)
    pq := NewPriorityQueue[Node](func(a, b Node) bool {
        return a.Distance < b.Distance  // Shorter distance = higher priority
    })

    pq.Push(Node{start, 0})

    for !pq.IsEmpty() {
        current, _ := pq.Pop()

        if _, visited := distances[current.ID]; visited {
            continue
        }

        distances[current.ID] = current.Distance

        // Add neighbors to queue
        for _, neighbor := range graph.Neighbors(current.ID) {
            newDist := current.Distance + neighbor.Weight
            pq.Push(Node{neighbor.ID, newDist})
        }
    }

    return distances
}
\`\`\`

**Real Use**: Google Maps, Uber, delivery routing - all use priority queue-based shortest path algorithms.

**3. Event-Driven Simulation**

Process events in timestamp order:

\`\`\`go
type Event struct {
    Time    time.Time
    Type    string
    Handler func()
}

simulator := NewPriorityQueue[Event](func(a, b Event) bool {
    return a.Time.Before(b.Time)  // Earlier time = higher priority
})

// Schedule events
simulator.Push(Event{time.Now().Add(1 * time.Second), "customer-arrive", handleArrival})
simulator.Push(Event{time.Now().Add(500 * time.Millisecond), "timer-expire", handleTimer})
simulator.Push(Event{time.Now().Add(2 * time.Second), "customer-leave", handleLeave})

// Process events in time order
for !simulator.IsEmpty() {
    event, _ := simulator.Pop()
    time.Sleep(time.Until(event.Time))
    event.Handler()
}
\`\`\`

**Real Use**: Network simulators, game engines, discrete event simulation systems.

**4. Real-Time Systems - Medical Devices**

Critical alerts must be processed immediately:

\`\`\`go
type Alert struct {
    Severity int     // 1=critical, 2=warning, 3=info
    Message  string
    Time     time.Time
}

alertQueue := NewPriorityQueue[Alert](func(a, b Alert) bool {
    if a.Severity != b.Severity {
        return a.Severity < b.Severity  // Lower severity number = more critical
    }
    return a.Time.Before(b.Time)  // Earlier time if same severity
})

// Alerts arrive out of order
alertQueue.Push(Alert{3, "Low battery", time.Now()})
alertQueue.Push(Alert{1, "Heart rate critical!", time.Now()})
alertQueue.Push(Alert{2, "Temperature high", time.Now()})
alertQueue.Push(Alert{1, "Oxygen level low!", time.Now().Add(-1 * time.Second)})

// Process alerts by severity
for !alertQueue.IsEmpty() {
    alert, _ := alertQueue.Pop()
    handleAlert(alert)  // Critical alerts processed first
}
\`\`\`

**Real Incident**: A medical device queued alerts in FIFO order. A critical heart rate alert came after info messages and was delayed by 30 seconds. Patient nearly died. System redesigned with priority queue.

**5. Load Balancing - Distributed Systems**

Route requests to least loaded servers:

\`\`\`go
type Server struct {
    ID   int
    Load int  // Current request count
}

loadBalancer := NewPriorityQueue[Server](func(a, b Server) bool {
    return a.Load < b.Load  // Less loaded = higher priority
})

// Initialize servers
loadBalancer.Push(Server{1, 10})
loadBalancer.Push(Server{2, 5})
loadBalancer.Push(Server{3, 15})

// Route new request to least loaded server
func RouteRequest(request Request) {
    server, _ := loadBalancer.Pop()
    server.Load++
    sendRequest(server, request)
    loadBalancer.Push(server)  // Re-add with new load
}
\`\`\`

**Real Use**: AWS ELB, Kubernetes, NGINX - all use priority-based load balancing.

**6. Huffman Coding - Data Compression**

Build optimal prefix-free code for compression:

\`\`\`go
type Node struct {
    Frequency int
    Left      *Node
    Right     *Node
}

func BuildHuffmanTree(frequencies map[rune]int) *Node {
    pq := NewPriorityQueue[*Node](func(a, b *Node) bool {
        return a.Frequency < b.Frequency
    })

    // Add leaf nodes
    for char, freq := range frequencies {
        pq.Push(&Node{Frequency: freq})
    }

    // Combine lowest frequency nodes
    for pq.Size() > 1 {
        left, _ := pq.Pop()
        right, _ := pq.Pop()

        parent := &Node{
            Frequency: left.Frequency + right.Frequency,
            Left:      left,
            Right:     right,
        }
        pq.Push(parent)
    }

    root, _ := pq.Pop()
    return root
}
\`\`\`

**Real Use**: ZIP, GZIP, PNG, JPEG all use Huffman coding for compression.

**7. Why Heap-Based Implementation?**

**Comparison of Priority Queue Implementations:**

| Implementation | Push | Pop | Peek | Space |
|---------------|------|-----|------|-------|
| Unsorted Array | O(1) | O(n) | O(n) | O(n) |
| Sorted Array | O(n) | O(1) | O(1) | O(n) |
| **Binary Heap** | **O(log n)** | **O(log n)** | **O(1)** | **O(n)** |
| Balanced BST | O(log n) | O(log n) | O(log n) | O(n) |

**Heap wins** because:
- Balanced performance: Push and Pop both O(log n)
- Simple array representation (no pointers)
- Excellent cache locality (sequential memory)
- Peek is O(1) (just return first element)

**8. Heap Property Visualization**

\`\`\`
Min-Heap:           Max-Heap:
    1                   9
   / \                 / \
  3   5               7   8
 / \                 / \
4   6               3   4

Array: [1,3,5,4,6]  Array: [9,7,8,3,4]

For index i:
- Parent: (i-1)/2
- Left child: 2i+1
- Right child: 2i+2
\`\`\`

**9. Production Metrics**

From a real API server using priority queue for request handling:

\`\`\`
Priority Queue Configuration:
- Premium users: Priority 1
- Authenticated users: Priority 2
- Anonymous users: Priority 3

High Load Scenario (2000 req/sec):
- Without priority queue:
  - Premium users: 200ms avg latency
  - Anonymous users: 180ms avg latency
  - Complaints: Premium users paid for nothing!

- With priority queue:
  - Premium users: 50ms avg latency (4x better!)
  - Authenticated: 150ms avg latency
  - Anonymous: 300ms avg latency
  - Churn rate decreased by 40%
\`\`\`

**10. Common Mistakes**

**Mistake 1: Using sorted array**
\`\`\`go
// BAD - O(n) insertion
func (pq *SortedArrayPQ) Push(value int) {
    pq.elements = append(pq.elements, value)
    sort.Ints(pq.elements)  // O(n log n) - WAY TOO SLOW!
}
\`\`\`

**Mistake 2: Not maintaining heap property**
\`\`\`go
// BAD - broken heap
func (pq *BrokenPQ) Pop() int {
    val := pq.elements[0]
    pq.elements = pq.elements[1:]  // WRONG - doesn't restore heap!
    return val
}
\`\`\`

**Correct approach:**
\`\`\`go
// GOOD - O(log n) operations
func (pq *PriorityQueue) Pop() (T, bool) {
    root := pq.elements[0]
    pq.elements[0] = pq.elements[len(pq.elements)-1]
    pq.elements = pq.elements[:len(pq.elements)-1]
    pq.bubbleDown(0)  // Restore heap - O(log n)
    return root, true
}
\`\`\`

**Key Takeaways:**
- Priority queues process elements by priority, not arrival order
- Binary heap provides O(log n) push/pop, O(1) peek
- Array representation: parent at (i-1)/2, children at 2i+1 and 2i+2
- Generic comparator enables flexible priority definitions
- Used in scheduling, pathfinding, simulations, compression
- Critical for real-time systems and high-priority task handling
- Heap-based implementation balances performance and simplicity`,
	order: 3,
	translations: {
		ru: {
			title: 'Min-Heap Priority Queue с Generic компаратором',
			description: `Реализуйте production-grade Priority Queue, используя бинарную min-heap структуру данных с O(log n) вставками и O(log n) удалениями.

**Вы реализуете:**

**Уровень 1 (Средний) — Операции Priority Queue:**
1. **NewPriorityQueue[T any](comparator func(a, b T) bool) *PriorityQueue[T]** — Создать очередь с пользовательским компаратором
2. **Push(value T)** — Вставить элемент, сохраняя свойство кучи
3. **Pop() (T, bool)** — Удалить и вернуть элемент с наивысшим приоритетом
4. **Peek() (T, bool)** — Просмотреть элемент с наивысшим приоритетом без удаления
5. **Size() int** — Вернуть количество элементов
6. **IsEmpty() bool** — Проверить, пуста ли очередь

**Ключевые концепции:**
- **Priority Queue**: Элементы обрабатываются по приоритету, а не по порядку вставки
- **Бинарная Min-Heap**: Полное бинарное дерево, где родитель ≤ детей
- **Свойство кучи**: Родитель всегда имеет более высокий приоритет, чем дети
- **Представление массивом**: Использовать slice, дети на 2i+1 и 2i+2
- **O(log n) операции**: Push и Pop логарифмическое время
- **Пользовательский компаратор**: Generic функция для определения порядка приоритетов

**Как работает Priority Queue:**

\`\`\`
Min-Heap (меньше = выше приоритет):

Push(5):       5
Push(3):       3
              /
             5

Push(7):       3
              / \
             5   7

Push(1):       1
              / \
             3   7
            /
           5

Pop() → 1      3
              / \
             5   7

Представление массивом: [1, 3, 7, 5]
Родитель в i, дети в 2i+1, 2i+2
\`\`\`

**Пример использования:**

\`\`\`go
// Integer min-heap (меньшее число = выше приоритет)
minPQ := NewPriorityQueue[int](func(a, b int) bool {
    return a < b  // a имеет более высокий приоритет, если меньше
})

minPQ.Push(5)
minPQ.Push(3)
minPQ.Push(7)
minPQ.Push(1)

val, ok := minPQ.Pop()
// val == 1, ok == true (наименьший элемент)

val, ok = minPQ.Peek()
// val == 3, ok == true (следующий наименьший)

// Integer max-heap (большее число = выше приоритет)
maxPQ := NewPriorityQueue[int](func(a, b int) bool {
    return a > b  // a имеет более высокий приоритет, если больше
})

maxPQ.Push(5)
maxPQ.Push(3)
maxPQ.Push(7)

val, ok = maxPQ.Pop()
// val == 7, ok == true (наибольший элемент)

// Очередь приоритетов задач
type Task struct {
    Name     string
    Priority int
}

taskPQ := NewPriorityQueue[Task](func(a, b Task) bool {
    return a.Priority < b.Priority  // Меньший номер приоритета = выше приоритет
})

taskPQ.Push(Task{"Send email", 3})
taskPQ.Push(Task{"Critical bug", 1})
taskPQ.Push(Task{"Update docs", 5})
taskPQ.Push(Task{"Security fix", 1})

task, ok := taskPQ.Pop()
// task == Task{"Critical bug", 1} или Task{"Security fix", 1}
// (оба имеют приоритет 1, порядок не определён для равных приоритетов)

size := taskPQ.Size()
// size == 3

isEmpty := taskPQ.IsEmpty()
// isEmpty == false
\`\`\`

**Ограничения:**
- Использовать массив/slice как базовое хранилище (не указатели дерева)
- Поддерживать свойство кучи после каждого Push и Pop
- Push должен быть O(log n) времени (всплытие вверх)
- Pop должен быть O(log n) времени (погружение вниз)
- Peek должен быть O(1) времени (просто вернуть корень)
- Использовать функцию компаратора для гибкого определения приоритета
- Обрабатывать граничные случаи: Pop/Peek на пустой очереди`,
			hint1: `Хранить элементы в slice. Компаратор говорит, какой элемент имеет более высокий приоритет. Для индекса i: родитель в (i-1)/2, левый ребёнок в 2i+1, правый ребёнок в 2i+2. Push: добавить в конец, bubbleUp. Pop: сохранить корень, переместить последний в корень, удалить последний, bubbleDown.`,
			hint2: `bubbleUp: пока index > 0, сравнить с родителем в (index-1)/2, если текущий имеет более высокий приоритет (компаратор возвращает true), обменять и продолжить с индексом родителя. bubbleDown: сравнить с обоими детьми, найти наивысший приоритет среди 3, если не текущий, обменять с наивысшим и продолжить с тем индексом.`,
			whyItMatters: `Priority Queues — важные структуры данных, используемые в операционных системах, сетевой маршрутизации, AI алгоритмах и системах реального времени, где элементы должны обрабатываться по приоритету, а не по порядку прибытия.

**Почему Priority Queues важны:**

**1. Планирование задач — Операционные системы**

Каждая ОС использует очереди приоритетов для планирования процессов:

\`\`\`go
type Process struct {
    PID      int
    Priority int
    Name     string
}

scheduler := NewPriorityQueue[Process](func(a, b Process) bool {
    return a.Priority < b.Priority  // Меньшее число = выше приоритет
})

// Добавить процессы
scheduler.Push(Process{101, 5, "background-sync"})
scheduler.Push(Process{102, 1, "kernel-critical"})
scheduler.Push(Process{103, 3, "user-app"})
scheduler.Push(Process{104, 1, "interrupt-handler"})

// CPU обрабатывает с наивысшим приоритетом первым
for !scheduler.IsEmpty() {
    process, _ := scheduler.Pop()
    CPU.Execute(process)
}

// Порядок выполнения:
// 1. kernel-critical (приоритет 1)
// 2. interrupt-handler (приоритет 1)
// 3. user-app (приоритет 3)
// 4. background-sync (приоритет 5)
\`\`\`

**Реальный мир**: Ядро Linux использует очереди приоритетов для планирования процессов. Критические системные процессы получают время CPU перед пользовательскими приложениями.

**2. Алгоритм кратчайшего пути Дейкстры**

Поиск кратчайшего пути в графах (GPS, сетевая маршрутизация):

\`\`\`go
type Node struct {
    ID       int
    Distance int
}

func DijkstraShortestPath(graph Graph, start int) map[int]int {
    distances := make(map[int]int)
    pq := NewPriorityQueue[Node](func(a, b Node) bool {
        return a.Distance < b.Distance  // Меньшая дистанция = выше приоритет
    })

    pq.Push(Node{start, 0})

    for !pq.IsEmpty() {
        current, _ := pq.Pop()

        if _, visited := distances[current.ID]; visited {
            continue
        }

        distances[current.ID] = current.Distance

        // Добавить соседей в очередь
        for _, neighbor := range graph.Neighbors(current.ID) {
            newDist := current.Distance + neighbor.Weight
            pq.Push(Node{neighbor.ID, newDist})
        }
    }

    return distances
}
\`\`\`

**Реальное использование**: Google Maps, Uber, маршрутизация доставки — все используют алгоритмы кратчайшего пути на основе очереди приоритетов.

**3. Событийная симуляция**

Обработка событий в порядке временных меток:

\`\`\`go
type Event struct {
    Time    time.Time
    Type    string
    Handler func()
}

simulator := NewPriorityQueue[Event](func(a, b Event) bool {
    return a.Time.Before(b.Time)  // Раньше время = выше приоритет
})

// Запланировать события
simulator.Push(Event{time.Now().Add(1 * time.Second), "customer-arrive", handleArrival})
simulator.Push(Event{time.Now().Add(500 * time.Millisecond), "timer-expire", handleTimer})
simulator.Push(Event{time.Now().Add(2 * time.Second), "customer-leave", handleLeave})

// Обработать события в порядке времени
for !simulator.IsEmpty() {
    event, _ := simulator.Pop()
    time.Sleep(time.Until(event.Time))
    event.Handler()
}
\`\`\`

**Реальное использование**: Сетевые симуляторы, игровые движки, системы дискретного событийного моделирования.

**4. Системы реального времени — Медицинские устройства**

Критические оповещения должны обрабатываться немедленно:

\`\`\`go
type Alert struct {
    Severity int     // 1=критический, 2=предупреждение, 3=инфо
    Message  string
    Time     time.Time
}

alertQueue := NewPriorityQueue[Alert](func(a, b Alert) bool {
    if a.Severity != b.Severity {
        return a.Severity < b.Severity  // Меньшая серьёзность = критичнее
    }
    return a.Time.Before(b.Time)  // Раньше время при одинаковой серьёзности
})

// Оповещения приходят в произвольном порядке
alertQueue.Push(Alert{3, "Low battery", time.Now()})
alertQueue.Push(Alert{1, "Heart rate critical!", time.Now()})
alertQueue.Push(Alert{2, "Temperature high", time.Now()})
alertQueue.Push(Alert{1, "Oxygen level low!", time.Now().Add(-1 * time.Second)})

// Обработать оповещения по серьёзности
for !alertQueue.IsEmpty() {
    alert, _ := alertQueue.Pop()
    handleAlert(alert)  // Критические оповещения обрабатываются первыми
}
\`\`\`

**Реальный инцидент**: Медицинское устройство ставило оповещения в очередь FIFO. Критическое оповещение о частоте сердца пришло после информационных сообщений и было задержано на 30 секунд. Пациент чуть не умер. Систему переделали с очередью приоритетов.

**5. Балансировка нагрузки — Распределённые системы**

Маршрутизация запросов на наименее загруженные серверы:

\`\`\`go
type Server struct {
    ID   int
    Load int  // Текущее количество запросов
}

loadBalancer := NewPriorityQueue[Server](func(a, b Server) bool {
    return a.Load < b.Load  // Меньше загружен = выше приоритет
})

// Инициализировать серверы
loadBalancer.Push(Server{1, 10})
loadBalancer.Push(Server{2, 5})
loadBalancer.Push(Server{3, 15})

// Направить новый запрос на наименее загруженный сервер
func RouteRequest(request Request) {
    server, _ := loadBalancer.Pop()
    server.Load++
    sendRequest(server, request)
    loadBalancer.Push(server)  // Добавить обратно с новой нагрузкой
}
\`\`\`

**Реальное использование**: AWS ELB, Kubernetes, NGINX — все используют балансировку нагрузки на основе приоритетов.

**6. Кодирование Хаффмана — Сжатие данных**

Построение оптимального prefix-free кода для сжатия:

\`\`\`go
type Node struct {
    Frequency int
    Left      *Node
    Right     *Node
}

func BuildHuffmanTree(frequencies map[rune]int) *Node {
    pq := NewPriorityQueue[*Node](func(a, b *Node) bool {
        return a.Frequency < b.Frequency
    })

    // Добавить листовые узлы
    for char, freq := range frequencies {
        pq.Push(&Node{Frequency: freq})
    }

    // Объединить узлы с наименьшей частотой
    for pq.Size() > 1 {
        left, _ := pq.Pop()
        right, _ := pq.Pop()

        parent := &Node{
            Frequency: left.Frequency + right.Frequency,
            Left:      left,
            Right:     right,
        }
        pq.Push(parent)
    }

    root, _ := pq.Pop()
    return root
}
\`\`\`

**Реальное использование**: ZIP, GZIP, PNG, JPEG все используют кодирование Хаффмана для сжатия.

**7. Почему реализация на основе кучи?**

**Сравнение реализаций Priority Queue:**

| Реализация | Push | Pop | Peek | Память |
|-----------|------|-----|------|--------|
| Несортированный массив | O(1) | O(n) | O(n) | O(n) |
| Сортированный массив | O(n) | O(1) | O(1) | O(n) |
| **Бинарная куча** | **O(log n)** | **O(log n)** | **O(1)** | **O(n)** |
| Сбалансированное BST | O(log n) | O(log n) | O(log n) | O(n) |

**Куча побеждает**, потому что:
- Сбалансированная производительность: Push и Pop оба O(log n)
- Простое представление массивом (без указателей)
- Отличная локальность кеша (последовательная память)
- Peek — O(1) (просто вернуть первый элемент)

**8. Визуализация свойства кучи**

\`\`\`
Min-Heap:           Max-Heap:
    1                   9
   / \                 / \
  3   5               7   8
 / \                 / \
4   6               3   4

Массив: [1,3,5,4,6]  Массив: [9,7,8,3,4]

Для индекса i:
- Родитель: (i-1)/2
- Левый ребёнок: 2i+1
- Правый ребёнок: 2i+2
\`\`\`

**9. Production метрики**

Из реального API сервера, использующего очередь приоритетов для обработки запросов:

\`\`\`
Конфигурация Priority Queue:
- Премиум пользователи: Приоритет 1
- Аутентифицированные пользователи: Приоритет 2
- Анонимные пользователи: Приоритет 3

Сценарий высокой нагрузки (2000 req/sec):
- Без очереди приоритетов:
  - Премиум пользователи: 200мс средняя задержка
  - Анонимные пользователи: 180мс средняя задержка
  - Жалобы: Премиум пользователи платили зря!

- С очередью приоритетов:
  - Премиум пользователи: 50мс средняя задержка (в 4x лучше!)
  - Аутентифицированные: 150мс средняя задержка
  - Анонимные: 300мс средняя задержка
  - Отток снизился на 40%
\`\`\`

**10. Распространённые ошибки**

**Ошибка 1: Использование сортированного массива**
\`\`\`go
// ПЛОХО — O(n) вставка
func (pq *SortedArrayPQ) Push(value int) {
    pq.elements = append(pq.elements, value)
    sort.Ints(pq.elements)  // O(n log n) — СЛИШКОМ МЕДЛЕННО!
}
\`\`\`

**Ошибка 2: Не поддержание свойства кучи**
\`\`\`go
// ПЛОХО — сломанная куча
func (pq *BrokenPQ) Pop() int {
    val := pq.elements[0]
    pq.elements = pq.elements[1:]  // НЕПРАВИЛЬНО — не восстанавливает кучу!
    return val
}
\`\`\`

**Правильный подход:**
\`\`\`go
// ХОРОШО — O(log n) операции
func (pq *PriorityQueue) Pop() (T, bool) {
    root := pq.elements[0]
    pq.elements[0] = pq.elements[len(pq.elements)-1]
    pq.elements = pq.elements[:len(pq.elements)-1]
    pq.bubbleDown(0)  // Восстановить кучу — O(log n)
    return root, true
}
\`\`\`

**Ключевые выводы:**
- Priority queues обрабатывают элементы по приоритету, а не по порядку прибытия
- Бинарная куча обеспечивает O(log n) push/pop, O(1) peek
- Представление массивом: родитель в (i-1)/2, дети в 2i+1 и 2i+2
- Generic компаратор обеспечивает гибкие определения приоритетов
- Используется в планировании, поиске путей, симуляциях, сжатии
- Критична для систем реального времени и обработки высокоприоритетных задач
- Heap-based реализация балансирует производительность и простоту`,
			solutionCode: `package datastructsx

type PriorityQueue[T any] struct {
	elements   []T
	comparator func(a, b T) bool
}

func NewPriorityQueue[T any](comparator func(a, b T) bool) *PriorityQueue[T] {
	return &PriorityQueue[T]{
		elements:   make([]T, 0),
		comparator: comparator,
	}
}

func (pq *PriorityQueue[T]) Push(value T) {
	pq.elements = append(pq.elements, value)
	pq.bubbleUp(len(pq.elements) - 1)
}

func (pq *PriorityQueue[T]) Pop() (T, bool) {
	if pq.IsEmpty() {
		var zero T
		return zero, false
	}

	root := pq.elements[0]
	lastIndex := len(pq.elements) - 1

	// Переместить последний элемент в корень
	pq.elements[0] = pq.elements[lastIndex]
	pq.elements = pq.elements[:lastIndex]

	// Восстановить свойство кучи
	if !pq.IsEmpty() {
		pq.bubbleDown(0)
	}

	return root, true
}

func (pq *PriorityQueue[T]) Peek() (T, bool) {
	if pq.IsEmpty() {
		var zero T
		return zero, false
	}
	return pq.elements[0], true
}

func (pq *PriorityQueue[T]) Size() int {
	return len(pq.elements)
}

func (pq *PriorityQueue[T]) IsEmpty() bool {
	return len(pq.elements) == 0
}

// Helper: Всплытие вверх для восстановления свойства кучи
func (pq *PriorityQueue[T]) bubbleUp(index int) {
	for index > 0 {
		parentIndex := pq.parent(index)
		// Если текущий имеет более высокий приоритет, чем родитель, обменять
		if pq.comparator(pq.elements[index], pq.elements[parentIndex]) {
			pq.swap(index, parentIndex)
			index = parentIndex
		} else {
			break
		}
	}
}

// Helper: Погружение вниз для восстановления свойства кучи
func (pq *PriorityQueue[T]) bubbleDown(index int) {
	size := len(pq.elements)

	for {
		highest := index
		left := pq.leftChild(index)
		right := pq.rightChild(index)

		// Найти наивысший приоритет среди узла и детей
		if left < size && pq.comparator(pq.elements[left], pq.elements[highest]) {
			highest = left
		}
		if right < size && pq.comparator(pq.elements[right], pq.elements[highest]) {
			highest = right
		}

		// Если текущий имеет наивысший приоритет, готово
		if highest == index {
			break
		}

		// Иначе обменять и продолжить
		pq.swap(index, highest)
		index = highest
	}
}

// Helper: Получить индекс родителя
func (pq *PriorityQueue[T]) parent(index int) int {
	return (index - 1) / 2
}

// Helper: Получить индекс левого ребёнка
func (pq *PriorityQueue[T]) leftChild(index int) int {
	return 2*index + 1
}

// Helper: Получить индекс правого ребёнка
func (pq *PriorityQueue[T]) rightChild(index int) int {
	return 2*index + 2
}

// Helper: Обменять элементы по двум индексам
func (pq *PriorityQueue[T]) swap(i, j int) {
	pq.elements[i], pq.elements[j] = pq.elements[j], pq.elements[i]
}`
		},
		uz: {
			title: `Generic komparator bilan Min-Heap Priority Queue`,
			description: `O(log n) qo'shish va O(log n) o'chirish bilan binary min-heap ma'lumotlar strukturasidan foydalanib production-grade Priority Queue amalga oshiring.

**Siz amalga oshirasiz:**

**1-Daraja (O'rta) — Priority Queue operatsiyalari:**
1. **NewPriorityQueue[T any](comparator func(a, b T) bool) *PriorityQueue[T]** — Maxsus komparator bilan navbat yaratish
2. **Push(value T)** — Uyum xususiyatini saqlab element kiritish
3. **Pop() (T, bool)** — Eng yuqori ustuvorlikdagi elementni o'chirib qaytarish
4. **Peek() (T, bool)** — Eng yuqori ustuvorlikdagi elementni o'chirmasdan ko'rish
5. **Size() int** — Elementlar sonini qaytarish
6. **IsEmpty() bool** — Navbat bo'shligini tekshirish

**Asosiy tushunchalar:**
- **Priority Queue**: Elementlar ustuvorlik bo'yicha qayta ishlanadi, qo'shish tartibi bo'yicha emas
- **Binary Min-Heap**: To'liq binary daraxt, bu yerda ota-ona ≤ bolalar
- **Heap xususiyati**: Ota-ona har doim bolalardan yuqoriroq ustuvorlikka ega
- **Array reprezentatsiyasi**: Slice dan foydalaning, bolalar 2i+1 va 2i+2 da
- **O(log n) operatsiyalar**: Push va Pop logarifmik vaqt
- **Maxsus komparator**: Ustuvorlik tartibini belgilash uchun generic funktsiya

**Priority Queue qanday ishlaydi:**

\`\`\`
Min-Heap (kichik = yuqori ustuvorlik):

Push(5):       5
Push(3):       3
              /
             5

Push(7):       3
              / \
             5   7

Push(1):       1
              / \
             3   7
            /
           5

Pop() → 1      3
              / \
             5   7

Array reprezentatsiyasi: [1, 3, 7, 5]
Ota-ona i da, bolalar 2i+1, 2i+2 da
\`\`\`

**Foydalanish misoli:**

\`\`\`go
// Integer min-heap (kichik son = yuqori ustuvorlik)
minPQ := NewPriorityQueue[int](func(a, b int) bool {
    return a < b  // a kichikroq bo'lsa yuqoriroq ustuvorlikka ega
})

minPQ.Push(5)
minPQ.Push(3)
minPQ.Push(7)
minPQ.Push(1)

val, ok := minPQ.Pop()
// val == 1, ok == true (eng kichik element)

val, ok = minPQ.Peek()
// val == 3, ok == true (keyingi eng kichik)

// Integer max-heap (katta son = yuqori ustuvorlik)
maxPQ := NewPriorityQueue[int](func(a, b int) bool {
    return a > b  // a kattaroq bo'lsa yuqoriroq ustuvorlikka ega
})

maxPQ.Push(5)
maxPQ.Push(3)
maxPQ.Push(7)

val, ok = maxPQ.Pop()
// val == 7, ok == true (eng katta element)

// Vazifa ustuvorlik navbati
type Task struct {
    Name     string
    Priority int
}

taskPQ := NewPriorityQueue[Task](func(a, b Task) bool {
    return a.Priority < b.Priority  // Kichik ustuvorlik raqami = yuqori ustuvorlik
})

taskPQ.Push(Task{"Send email", 3})
taskPQ.Push(Task{"Critical bug", 1})
taskPQ.Push(Task{"Update docs", 5})
taskPQ.Push(Task{"Security fix", 1})

task, ok := taskPQ.Pop()
// task == Task{"Critical bug", 1} yoki Task{"Security fix", 1}
// (ikkalasi ham 1 ustuvorlikka ega, teng ustuvorliklar uchun tartib aniqlanmagan)

size := taskPQ.Size()
// size == 3

isEmpty := taskPQ.IsEmpty()
// isEmpty == false
\`\`\`

**Cheklovlar:**
- Asosiy saqlash sifatida massiv/slice dan foydalaning (daraxt ko'rsatkichlari emas)
- Har bir Push va Pop dan keyin heap xususiyatini saqlang
- Push O(log n) vaqt bo'lishi kerak (yuqoriga ko'tarish)
- Pop O(log n) vaqt bo'lishi kerak (pastga tushirish)
- Peek O(1) vaqt bo'lishi kerak (faqat ildizni qaytarish)
- Moslashuvchan ustuvorlik ta'rifi uchun komparator funktsiyasidan foydalaning
- Chegara holatlarni qayta ishlang: bo'sh navbatda Pop/Peek`,
			hint1: `Elementlarni slice da saqlang. Komparator qaysi element yuqoriroq ustuvorlikka ega ekanligini aytadi. i indeks uchun: ota-ona (i-1)/2 da, chap bola 2i+1 da, o'ng bola 2i+2 da. Push: oxiriga qo'shing, bubbleUp. Pop: ildizni saqlang, oxirgisini ildizga ko'chiring, oxirgisini o'chiring, bubbleDown.`,
			hint2: `bubbleUp: index > 0 bo'lguncha, (index-1)/2 dagi ota-ona bilan solishtiring, agar joriy yuqoriroq ustuvorlikka ega bo'lsa (komparator true qaytaradi), almashtiring va ota-ona indeksi bilan davom eting. bubbleDown: ikkala bola bilan solishtiring, 3 tadan eng yuqori ustuvorlikni toping, agar joriy bo'lmasa, eng yuqori bilan almashtiring va o'sha indeks bilan davom eting.`,
			whyItMatters: `Priority Queue lar operatsion tizimlar, tarmoq marshrutlash, AI algoritmlari va real vaqt tizimlarida ishlatiladigan muhim ma'lumotlar strukturalari bo'lib, bu yerda elementlar kelish tartibiga emas, balki ustuvorlikka qarab qayta ishlanishi kerak.

**Nima uchun Priority Queue lar muhim:**

**1. Vazifalarni rejalashtirish — Operatsion tizimlar**

Har bir OS jarayonlarni rejalashtirish uchun ustuvorlik navbatlaridan foydalanadi:

\`\`\`go
type Process struct {
    PID      int
    Priority int
    Name     string
}

scheduler := NewPriorityQueue[Process](func(a, b Process) bool {
    return a.Priority < b.Priority  // Kichik raqam = yuqori ustuvorlik
})

// Jarayonlarni qo'shish
scheduler.Push(Process{101, 5, "background-sync"})
scheduler.Push(Process{102, 1, "kernel-critical"})
scheduler.Push(Process{103, 3, "user-app"})
scheduler.Push(Process{104, 1, "interrupt-handler"})

// CPU eng yuqori ustuvorlikni birinchi qayta ishlaydi
for !scheduler.IsEmpty() {
    process, _ := scheduler.Pop()
    CPU.Execute(process)
}

// Bajarish tartibi:
// 1. kernel-critical (ustuvorlik 1)
// 2. interrupt-handler (ustuvorlik 1)
// 3. user-app (ustuvorlik 3)
// 4. background-sync (ustuvorlik 5)
\`\`\`

**Haqiqiy dunyo**: Linux yadrosi jarayonlarni rejalashtirish uchun ustuvorlik navbatlaridan foydalanadi. Kritik tizim jarayonlari foydalanuvchi ilovalaridan oldin CPU vaqtini oladi.

**2. Dijkstra ning eng qisqa yo'l algoritmi**

Graflarda eng qisqa yo'lni topish (GPS, tarmoq marshrutlash):

\`\`\`go
type Node struct {
    ID       int
    Distance int
}

func DijkstraShortestPath(graph Graph, start int) map[int]int {
    distances := make(map[int]int)
    pq := NewPriorityQueue[Node](func(a, b Node) bool {
        return a.Distance < b.Distance  // Qisqa masofa = yuqori ustuvorlik
    })

    pq.Push(Node{start, 0})

    for !pq.IsEmpty() {
        current, _ := pq.Pop()

        if _, visited := distances[current.ID]; visited {
            continue
        }

        distances[current.ID] = current.Distance

        // Qo'shnilarni navbatga qo'shish
        for _, neighbor := range graph.Neighbors(current.ID) {
            newDist := current.Distance + neighbor.Weight
            pq.Push(Node{neighbor.ID, newDist})
        }
    }

    return distances
}
\`\`\`

**Haqiqiy foydalanish**: Google Maps, Uber, yetkazib berish marshrutlash - hammasi ustuvorlik navbati asosidagi eng qisqa yo'l algoritmlaridan foydalanadi.

**3. Hodisalarga asoslangan simulyatsiya**

Hodisalarni vaqt belgisiga qarab qayta ishlash:

\`\`\`go
type Event struct {
    Time    time.Time
    Type    string
    Handler func()
}

simulator := NewPriorityQueue[Event](func(a, b Event) bool {
    return a.Time.Before(b.Time)  // Erta vaqt = yuqori ustuvorlik
})

// Hodisalarni rejalashtirish
simulator.Push(Event{time.Now().Add(1 * time.Second), "customer-arrive", handleArrival})
simulator.Push(Event{time.Now().Add(500 * time.Millisecond), "timer-expire", handleTimer})
simulator.Push(Event{time.Now().Add(2 * time.Second), "customer-leave", handleLeave})

// Hodisalarni vaqt tartibida qayta ishlash
for !simulator.IsEmpty() {
    event, _ := simulator.Pop()
    time.Sleep(time.Until(event.Time))
    event.Handler()
}
\`\`\`

**Haqiqiy foydalanish**: Tarmoq simulyatorlari, o'yin dvigatellari, diskret hodisa simulyatsiya tizimlari.

**4. Real vaqt tizimlari — Tibbiy qurilmalar**

Kritik ogohlantirishlar darhol qayta ishlanishi kerak:

\`\`\`go
type Alert struct {
    Severity int     // 1=kritik, 2=ogohlantirish, 3=ma'lumot
    Message  string
    Time     time.Time
}

alertQueue := NewPriorityQueue[Alert](func(a, b Alert) bool {
    if a.Severity != b.Severity {
        return a.Severity < b.Severity  // Kichik jiddiylik = kritikaroq
    }
    return a.Time.Before(b.Time)  // Bir xil jiddiylikda erta vaqt
})

// Ogohlantirishlar tartibsiz keladi
alertQueue.Push(Alert{3, "Low battery", time.Now()})
alertQueue.Push(Alert{1, "Heart rate critical!", time.Now()})
alertQueue.Push(Alert{2, "Temperature high", time.Now()})
alertQueue.Push(Alert{1, "Oxygen level low!", time.Now().Add(-1 * time.Second)})

// Ogohlantirishlarni jiddiylik bo'yicha qayta ishlash
for !alertQueue.IsEmpty() {
    alert, _ := alertQueue.Pop()
    handleAlert(alert)  // Kritik ogohlantirishlar birinchi
}
\`\`\`

**Haqiqiy hodisa**: Tibbiy qurilma ogohlantirishlarni FIFO navbatiga qo'ydi. Yurak urishi haqidagi kritik ogohlantirish ma'lumot xabarlaridan keyin keldi va 30 soniya kechiktirildi. Bemor o'limga yaqin bo'ldi. Tizim ustuvorlik navbati bilan qayta tuzildi.

**5. Yukni muvozanatlash — Taqsimlangan tizimlar**

So'rovlarni eng kam yuklangan serverlarga yo'naltirish:

\`\`\`go
type Server struct {
    ID   int
    Load int  // Joriy so'rovlar soni
}

loadBalancer := NewPriorityQueue[Server](func(a, b Server) bool {
    return a.Load < b.Load  // Kamroq yuklangan = yuqori ustuvorlik
})

// Serverlarni boshlash
loadBalancer.Push(Server{1, 10})
loadBalancer.Push(Server{2, 5})
loadBalancer.Push(Server{3, 15})

// Yangi so'rovni eng kam yuklangan serverga yo'naltirish
func RouteRequest(request Request) {
    server, _ := loadBalancer.Pop()
    server.Load++
    sendRequest(server, request)
    loadBalancer.Push(server)  // Yangi yuk bilan qayta qo'shish
}
\`\`\`

**Haqiqiy foydalanish**: AWS ELB, Kubernetes, NGINX - hammasi ustuvorlikka asoslangan yuk balanslashdan foydalanadi.

**6. Huffman practixsh — Ma'lumotlarni siqish**

Siqish uchun optimal prefix-free kodini qurish:

\`\`\`go
type Node struct {
    Frequency int
    Left      *Node
    Right     *Node
}

func BuildHuffmanTree(frequencies map[rune]int) *Node {
    pq := NewPriorityQueue[*Node](func(a, b *Node) bool {
        return a.Frequency < b.Frequency
    })

    // Barg tugunlarini qo'shish
    for char, freq := range frequencies {
        pq.Push(&Node{Frequency: freq})
    }

    // Eng past chastotali tugunlarni birlashtirish
    for pq.Size() > 1 {
        left, _ := pq.Pop()
        right, _ := pq.Pop()

        parent := &Node{
            Frequency: left.Frequency + right.Frequency,
            Left:      left,
            Right:     right,
        }
        pq.Push(parent)
    }

    root, _ := pq.Pop()
    return root
}
\`\`\`

**Haqiqiy foydalanish**: ZIP, GZIP, PNG, JPEG hammasi siqish uchun Huffman practixshdan foydalanadi.

**7. Nega heap-asosli implementatsiya?**

**Priority Queue implementatsiyalarini solishtirish:**

| Implementatsiya | Push | Pop | Peek | Xotira |
|----------------|------|-----|------|---------|
| Tartiblangan bo'lmagan massiv | O(1) | O(n) | O(n) | O(n) |
| Tartiblangan massiv | O(n) | O(1) | O(1) | O(n) |
| **Binary heap** | **O(log n)** | **O(log n)** | **O(1)** | **O(n)** |
| Balanslangan BST | O(log n) | O(log n) | O(log n) | O(n) |

**Heap yutadi**, chunki:
- Balanslangan unumdorlik: Push va Pop ikkalasi ham O(log n)
- Oddiy massiv reprezentatsiyasi (ko'rsatkichlar yo'q)
- Ajoyib cache lokalligi (ketma-ket xotira)
- Peek - O(1) (faqat birinchi elementni qaytarish)

**8. Heap xususiyati vizualizatsiyasi**

\`\`\`
Min-Heap:           Max-Heap:
    1                   9
   / \                 / \
  3   5               7   8
 / \                 / \
4   6               3   4

Massiv: [1,3,5,4,6]  Massiv: [9,7,8,3,4]

i indeks uchun:
- Ota-ona: (i-1)/2
- Chap bola: 2i+1
- O'ng bola: 2i+2
\`\`\`

**9. Production ko'rsatkichlari**

So'rovlarni qayta ishlash uchun ustuvorlik navbatidan foydalanadigan haqiqiy API serveridan:

\`\`\`
Priority Queue konfiguratsiyasi:
- Premium foydalanuvchilar: Ustuvorlik 1
- Autentifikatsiya qilingan foydalanuvchilar: Ustuvorlik 2
- Anonim foydalanuvchilar: Ustuvorlik 3

Yuqori yuk stsenariysida (2000 req/sec):
- Ustuvorlik navbatisiz:
  - Premium foydalanuvchilar: 200ms o'rtacha kechikish
  - Anonim foydalanuvchilar: 180ms o'rtacha kechikish
  - Shikoyatlar: Premium foydalanuvchilar bekorga to'lashdi!

- Ustuvorlik navbati bilan:
  - Premium foydalanuvchilar: 50ms o'rtacha kechikish (4x yaxshiroq!)
  - Autentifikatsiya qilingan: 150ms o'rtacha kechikish
  - Anonim: 300ms o'rtacha kechikish
  - Churn rate 40% kamaydi
\`\`\`

**10. Keng tarqalgan xatolar**

**Xato 1: Tartiblangan massivdan foydalanish**
\`\`\`go
// YOMON — O(n) qo'shish
func (pq *SortedArrayPQ) Push(value int) {
    pq.elements = append(pq.elements, value)
    sort.Ints(pq.elements)  // O(n log n) — JUDA SEKIN!
}
\`\`\`

**Xato 2: Heap xususiyatini saqlamaslik**
\`\`\`go
// YOMON — buzilgan heap
func (pq *BrokenPQ) Pop() int {
    val := pq.elements[0]
    pq.elements = pq.elements[1:]  // NOTO'G'RI — heap ni tiklamaydi!
    return val
}
\`\`\`

**To'g'ri yondashuv:**
\`\`\`go
// YAXSHI — O(log n) operatsiyalar
func (pq *PriorityQueue) Pop() (T, bool) {
    root := pq.elements[0]
    pq.elements[0] = pq.elements[len(pq.elements)-1]
    pq.elements = pq.elements[:len(pq.elements)-1]
    pq.bubbleDown(0)  // Heap ni tiklash — O(log n)
    return root, true
}
\`\`\`

**Asosiy xulosalar:**
- Priority queue lar elementlarni kelish tartibiga emas, ustuvorlikka qarab qayta ishlaydi
- Binary heap O(log n) push/pop, O(1) peek ni ta'minlaydi
- Array reprezentatsiyasi: ota-ona (i-1)/2 da, bolalar 2i+1 va 2i+2 da
- Generic komparator moslashuvchan ustuvorlik ta'riflarini ta'minlaydi
- Rejalashtirish, yo'l qidirish, simulyatsiyalar, siqishda ishlatiladi
- Real vaqt tizimlari va yuqori ustuvorlikdagi vazifalarni qayta ishlash uchun muhim
- Heap-asosli implementatsiya unumdorlik va soddalikni muvozanatlaydi`,
			solutionCode: `package datastructsx

type PriorityQueue[T any] struct {
	elements   []T
	comparator func(a, b T) bool
}

func NewPriorityQueue[T any](comparator func(a, b T) bool) *PriorityQueue[T] {
	return &PriorityQueue[T]{
		elements:   make([]T, 0),
		comparator: comparator,
	}
}

func (pq *PriorityQueue[T]) Push(value T) {
	pq.elements = append(pq.elements, value)
	pq.bubbleUp(len(pq.elements) - 1)
}

func (pq *PriorityQueue[T]) Pop() (T, bool) {
	if pq.IsEmpty() {
		var zero T
		return zero, false
	}

	root := pq.elements[0]
	lastIndex := len(pq.elements) - 1

	// Oxirgi elementni ildizga ko'chirish
	pq.elements[0] = pq.elements[lastIndex]
	pq.elements = pq.elements[:lastIndex]

	// Heap xususiyatini tiklash
	if !pq.IsEmpty() {
		pq.bubbleDown(0)
	}

	return root, true
}

func (pq *PriorityQueue[T]) Peek() (T, bool) {
	if pq.IsEmpty() {
		var zero T
		return zero, false
	}
	return pq.elements[0], true
}

func (pq *PriorityQueue[T]) Size() int {
	return len(pq.elements)
}

func (pq *PriorityQueue[T]) IsEmpty() bool {
	return len(pq.elements) == 0
}

// Helper: Heap xususiyatini tiklash uchun yuqoriga ko'tarish
func (pq *PriorityQueue[T]) bubbleUp(index int) {
	for index > 0 {
		parentIndex := pq.parent(index)
		// Agar joriy ota-onadan yuqoriroq ustuvorlikka ega bo'lsa, almashtirish
		if pq.comparator(pq.elements[index], pq.elements[parentIndex]) {
			pq.swap(index, parentIndex)
			index = parentIndex
		} else {
			break
		}
	}
}

// Helper: Heap xususiyatini tiklash uchun pastga tushirish
func (pq *PriorityQueue[T]) bubbleDown(index int) {
	size := len(pq.elements)

	for {
		highest := index
		left := pq.leftChild(index)
		right := pq.rightChild(index)

		// Tugun va bolalar orasida eng yuqori ustuvorlikni topish
		if left < size && pq.comparator(pq.elements[left], pq.elements[highest]) {
			highest = left
		}
		if right < size && pq.comparator(pq.elements[right], pq.elements[highest]) {
			highest = right
		}

		// Agar joriy eng yuqori ustuvorlikka ega bo'lsa, tayyor
		if highest == index {
			break
		}

		// Aks holda almashtirish va davom etish
		pq.swap(index, highest)
		index = highest
	}
}

// Helper: Ota-ona indeksini olish
func (pq *PriorityQueue[T]) parent(index int) int {
	return (index - 1) / 2
}

// Helper: Chap bola indeksini olish
func (pq *PriorityQueue[T]) leftChild(index int) int {
	return 2*index + 1
}

// Helper: O'ng bola indeksini olish
func (pq *PriorityQueue[T]) rightChild(index int) int {
	return 2*index + 2
}

// Helper: Ikki indeksdagi elementlarni almashtirish
func (pq *PriorityQueue[T]) swap(i, j int) {
	pq.elements[i], pq.elements[j] = pq.elements[j], pq.elements[i]
}`
		}
	}
};

export default task;
