import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'go-dp-memento',
	title: 'Memento Pattern',
	difficulty: 'medium',
	tags: ['go', 'design-patterns', 'behavioral', 'memento'],
	estimatedTime: '30m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement the Memento pattern in Go - capture and restore an object's internal state without violating encapsulation.

**You will implement:**

1. **Memento** - Stores editor state
2. **Editor** - Originator with Save/Restore
3. **History** - Caretaker managing mementos

**Example Usage:**

\`\`\`go
editor := &Editor{}	// create editor (originator)
history := NewHistory()	// create history (caretaker)

editor.SetContent("Hello")	// first state
history.Push(editor.Save())	// save state to history

editor.SetContent("Hello World")	// second state
history.Push(editor.Save())	// save second state

editor.SetContent("Hello World!")	// third state - oops, added unwanted "!"

// Undo - restore previous state
editor.Restore(history.Pop())	// restore "Hello World"
fmt.Println(editor.GetContent())	// "Hello World"

editor.Restore(history.Pop())	// restore "Hello"
fmt.Println(editor.GetContent())	// "Hello"

history.Pop()	// returns nil - no more history
\`\`\``,
	initialCode: `package patterns

type Memento struct {
	content string
}

func (m *Memento) GetContent() string {
	return m.content
}

type Editor struct {
	content string
}

func (e *Editor) SetContent(content string) {
}

func (e *Editor) GetContent() string {
}

func (e *Editor) Save() *Memento {
}

func (e *Editor) Restore(m *Memento) {
}

type History struct {
	mementos []*Memento
}

func NewHistory() *History {
}

func (h *History) Push(m *Memento) {
}

func (h *History) Pop() *Memento {
}`,
	solutionCode: `package patterns

type Memento struct {	// immutable snapshot of state
	content string	// captured editor content
}

func (m *Memento) GetContent() string {	// accessor for stored state
	return m.content	// return captured content
}

type Editor struct {	// originator - creates and uses mementos
	content string	// current editor content
}

func (e *Editor) SetContent(content string) {	// modify editor state
	e.content = content	// update current content
}

func (e *Editor) GetContent() string {	// get current state
	return e.content	// return current content
}

func (e *Editor) Save() *Memento {	// create snapshot of current state
	return &Memento{content: e.content}	// capture content in new memento
}

func (e *Editor) Restore(m *Memento) {	// restore from snapshot
	if m != nil {	// guard against nil memento
		e.content = m.GetContent()	// restore content from memento
	}
}

type History struct {	// caretaker - stores mementos without examining them
	mementos []*Memento	// stack of saved states
}

func NewHistory() *History {	// factory constructor
	return &History{mementos: make([]*Memento, 0)}	// initialize empty history
}

func (h *History) Push(m *Memento) {	// save memento to history
	h.mementos = append(h.mementos, m)	// add to end of stack
}

func (h *History) Pop() *Memento {	// retrieve and remove last memento
	if len(h.mementos) == 0 {	// check if history is empty
		return nil	// nothing to restore
	}
	last := h.mementos[len(h.mementos)-1]	// get last element
	h.mementos = h.mementos[:len(h.mementos)-1]	// remove from stack
	return last	// return popped memento
}`,
	hint1: `**Editor Methods (Originator):**

\`\`\`go
// SetContent - update editor state
func (e *Editor) SetContent(content string) {
	e.content = content	// simply assign new content
}

// GetContent - read current state
func (e *Editor) GetContent() string {
	return e.content	// return current content
}

// Save - create memento with current state
func (e *Editor) Save() *Memento {
	return &Memento{content: e.content}	// snapshot current content
}

// Restore - apply memento state
func (e *Editor) Restore(m *Memento) {
	if m != nil {	// check for nil before accessing
		e.content = m.GetContent()	// restore from memento
	}
}
\`\`\``,
	hint2: `**History Methods (Caretaker):**

\`\`\`go
// Push - add memento to stack
func (h *History) Push(m *Memento) {
	h.mementos = append(h.mementos, m)	// append to end
}

// Pop - remove and return last memento
func (h *History) Pop() *Memento {
	if len(h.mementos) == 0 {	// empty check
		return nil	// return nil if no history
	}
	last := h.mementos[len(h.mementos)-1]	// get last
	h.mementos = h.mementos[:len(h.mementos)-1]	// slice off last
	return last	// return removed memento
}
\`\`\`

Key: Pop returns nil when empty, allowing safe chaining of undo operations.`,
	whyItMatters: `## Why Memento Pattern Exists

**Problem:** Exposing internal state for undo breaks encapsulation.

\`\`\`go
// Without Memento - exposed internals
type Editor struct {
    Content string	// must be public for undo!
}

// Client stores state directly
previousContent := editor.Content	// knows about internals
editor.Content = "New text"
editor.Content = previousContent	// direct manipulation

// Problems:
// - Client knows Editor's internal structure
// - No control over what gets saved
// - Can't add new fields without breaking clients
\`\`\`

**Solution:** Memento encapsulates state capture:

\`\`\`go
// With Memento - encapsulated state
type Editor struct {
    content string	// private - client can't access
}

memento := editor.Save()	// black-box snapshot
editor.SetContent("New text")
editor.Restore(memento)	// restore without knowing internals

// Benefits:
// - Client doesn't know what's in memento
// - Editor controls what gets saved
// - Can change internal structure freely
\`\`\`

---

## Real-World Mementos in Go

**1. Text Editor Undo/Redo:**
- Each keystroke/action creates memento
- Undo pops from history, redo uses separate stack

**2. Game Save System:**
- Save game state (position, inventory, progress)
- Load restores complete game state

**3. Database Transactions:**
- Begin transaction creates checkpoint
- Rollback restores to checkpoint

**4. Form State Recovery:**
- Auto-save form data as user types
- Recover after browser crash

---

## Production Pattern: Full Undo/Redo System

\`\`\`go
package memento

import (
	"encoding/json"
	"time"
)

// DocumentState captures complete document state
type DocumentState struct {
	Content    string	// document text
	CursorPos  int	// cursor position
	Selection  *Selection	// text selection if any
	Timestamp  time.Time	// when saved
}

type Selection struct {
	Start int	// selection start position
	End   int	// selection end position
}

// Memento wraps state - could be serialized
type Memento struct {
	state []byte	// JSON-encoded state
}

func (m *Memento) GetState() (*DocumentState, error) {	// deserialize state
	var state DocumentState
	err := json.Unmarshal(m.state, &state)
	return &state, err
}

// Document is the originator
type Document struct {
	content   string	// current text
	cursorPos int	// current cursor position
	selection *Selection	// current selection
}

func NewDocument() *Document {	// factory
	return &Document{content: "", cursorPos: 0}
}

func (d *Document) SetContent(content string) {	// update content
	d.content = content
}

func (d *Document) GetContent() string {	// read content
	return d.content
}

func (d *Document) SetCursor(pos int) {	// move cursor
	d.cursorPos = pos
}

func (d *Document) SetSelection(start, end int) {	// select text
	d.selection = &Selection{Start: start, End: end}
}

func (d *Document) ClearSelection() {	// clear selection
	d.selection = nil
}

func (d *Document) Save() *Memento {	// create snapshot
	state := DocumentState{
		Content:   d.content,
		CursorPos: d.cursorPos,
		Selection: d.selection,
		Timestamp: time.Now(),
	}
	data, _ := json.Marshal(state)	// serialize state
	return &Memento{state: data}
}

func (d *Document) Restore(m *Memento) error {	// restore from snapshot
	if m == nil {
		return nil	// nothing to restore
	}
	state, err := m.GetState()
	if err != nil {
		return err	// deserialization failed
	}
	d.content = state.Content	// restore all fields
	d.cursorPos = state.CursorPos
	d.selection = state.Selection
	return nil
}

// UndoManager handles undo/redo stacks
type UndoManager struct {
	undoStack []*Memento	// for undo operations
	redoStack []*Memento	// for redo operations
	maxSize   int	// maximum history size
}

func NewUndoManager(maxSize int) *UndoManager {	// factory with limit
	return &UndoManager{
		undoStack: make([]*Memento, 0),
		redoStack: make([]*Memento, 0),
		maxSize:   maxSize,
	}
}

func (um *UndoManager) SaveState(m *Memento) {	// save for undo
	um.undoStack = append(um.undoStack, m)
	if len(um.undoStack) > um.maxSize {	// enforce size limit
		um.undoStack = um.undoStack[1:]	// remove oldest
	}
	um.redoStack = nil	// clear redo on new action
}

func (um *UndoManager) Undo() *Memento {	// get state to restore
	if len(um.undoStack) == 0 {
		return nil	// nothing to undo
	}
	// Pop from undo
	last := um.undoStack[len(um.undoStack)-1]
	um.undoStack = um.undoStack[:len(um.undoStack)-1]
	// Push to redo (for redo functionality)
	um.redoStack = append(um.redoStack, last)
	// Return previous state (second to last, or nil)
	if len(um.undoStack) > 0 {
		return um.undoStack[len(um.undoStack)-1]
	}
	return nil
}

func (um *UndoManager) Redo() *Memento {	// redo last undone action
	if len(um.redoStack) == 0 {
		return nil	// nothing to redo
	}
	last := um.redoStack[len(um.redoStack)-1]
	um.redoStack = um.redoStack[:len(um.redoStack)-1]
	um.undoStack = append(um.undoStack, last)
	return last
}

func (um *UndoManager) CanUndo() bool {	// check if undo available
	return len(um.undoStack) > 1	// need at least 2 states to undo
}

func (um *UndoManager) CanRedo() bool {	// check if redo available
	return len(um.redoStack) > 0
}

// Usage:
// doc := NewDocument()
// undoManager := NewUndoManager(100)
//
// doc.SetContent("Hello")
// undoManager.SaveState(doc.Save())
//
// doc.SetContent("Hello World")
// undoManager.SaveState(doc.Save())
//
// if undoManager.CanUndo() {
//     doc.Restore(undoManager.Undo())
// }
// // doc.content == "Hello"
\`\`\`

---

## Common Mistakes to Avoid

**1. Memento exposing mutable state:**
\`\`\`go
// Wrong - memento returns reference
type Memento struct {
	state *EditorState	// pointer to mutable state
}

func (e *Editor) Save() *Memento {
	return &Memento{state: &e.state}	// shares mutable state!
}
// Changes to editor affect the memento!

// Right - memento stores copy
func (e *Editor) Save() *Memento {
	return &Memento{content: e.content}	// copy value
}
// Memento is independent of editor
\`\`\`

**2. Not checking nil in Restore:**
\`\`\`go
// Wrong - crashes on nil
func (e *Editor) Restore(m *Memento) {
	e.content = m.GetContent()	// panic if m is nil!
}

// Right - guard against nil
func (e *Editor) Restore(m *Memento) {
	if m != nil {	// nil check
		e.content = m.GetContent()
	}
}
\`\`\`

**3. Unlimited history growth:**
\`\`\`go
// Wrong - unbounded memory
func (h *History) Push(m *Memento) {
	h.mementos = append(h.mementos, m)	// grows forever!
}

// Right - enforce limit
func (h *History) Push(m *Memento) {
	h.mementos = append(h.mementos, m)
	if len(h.mementos) > h.maxSize {	// check limit
		h.mementos = h.mementos[1:]	// drop oldest
	}
}
\`\`\``,
	order: 7,
	testCode: `package patterns

import (
	"testing"
)

// Test1: Editor SetContent and GetContent work
func Test1(t *testing.T) {
	e := &Editor{}
	e.SetContent("Hello")
	if e.GetContent() != "Hello" {
		t.Error("SetContent/GetContent should work")
	}
}

// Test2: Editor Save creates memento
func Test2(t *testing.T) {
	e := &Editor{}
	e.SetContent("Test")
	m := e.Save()
	if m == nil || m.GetContent() != "Test" {
		t.Error("Save should create memento with content")
	}
}

// Test3: Editor Restore restores state
func Test3(t *testing.T) {
	e := &Editor{}
	e.SetContent("Original")
	m := e.Save()
	e.SetContent("Changed")
	e.Restore(m)
	if e.GetContent() != "Original" {
		t.Error("Restore should restore original state")
	}
}

// Test4: Restore with nil does nothing
func Test4(t *testing.T) {
	e := &Editor{}
	e.SetContent("Test")
	e.Restore(nil)
	if e.GetContent() != "Test" {
		t.Error("Restore nil should not change content")
	}
}

// Test5: NewHistory creates empty history
func Test5(t *testing.T) {
	h := NewHistory()
	if h == nil {
		t.Error("NewHistory should return non-nil")
	}
}

// Test6: History Push adds memento
func Test6(t *testing.T) {
	h := NewHistory()
	m := &Memento{content: "test"}
	h.Push(m)
	popped := h.Pop()
	if popped != m {
		t.Error("Push should add memento that can be popped")
	}
}

// Test7: History Pop returns nil when empty
func Test7(t *testing.T) {
	h := NewHistory()
	if h.Pop() != nil {
		t.Error("Pop should return nil for empty history")
	}
}

// Test8: History Pop returns in LIFO order
func Test8(t *testing.T) {
	h := NewHistory()
	m1 := &Memento{content: "first"}
	m2 := &Memento{content: "second"}
	h.Push(m1)
	h.Push(m2)
	if h.Pop().GetContent() != "second" {
		t.Error("Pop should return last pushed (LIFO)")
	}
}

// Test9: Full undo workflow
func Test9(t *testing.T) {
	e := &Editor{}
	h := NewHistory()
	e.SetContent("v1")
	h.Push(e.Save())
	e.SetContent("v2")
	h.Push(e.Save())
	e.SetContent("v3")
	e.Restore(h.Pop())
	if e.GetContent() != "v2" {
		t.Errorf("Should restore to v2, got %s", e.GetContent())
	}
}

// Test10: Memento GetContent returns stored content
func Test10(t *testing.T) {
	m := &Memento{content: "stored"}
	if m.GetContent() != "stored" {
		t.Error("GetContent should return stored content")
	}
}
`,
	translations: {
		ru: {
			title: 'Паттерн Memento (Снимок)',
			description: `Реализуйте паттерн Memento на Go — захватывайте и восстанавливайте состояние объекта без нарушения инкапсуляции.

**Вы реализуете:**

1. **Memento** - Хранит состояние редактора
2. **Editor** - Создатель с методами Save/Restore
3. **History** - Опекун, управляющий снимками

**Пример использования:**

\`\`\`go
editor := &Editor{}	// создать редактор (создатель)
history := NewHistory()	// создать историю (опекун)

editor.SetContent("Hello")	// первое состояние
history.Push(editor.Save())	// сохранить состояние в историю

editor.SetContent("Hello World")	// второе состояние
history.Push(editor.Save())	// сохранить второе состояние

editor.SetContent("Hello World!")	// третье состояние - упс, добавили ненужный "!"

// Отмена - восстановить предыдущее состояние
editor.Restore(history.Pop())	// восстановить "Hello World"
fmt.Println(editor.GetContent())	// "Hello World"

editor.Restore(history.Pop())	// восстановить "Hello"
fmt.Println(editor.GetContent())	// "Hello"

history.Pop()	// вернёт nil - больше нет истории
\`\`\``,
			hint1: `**Методы Editor (Создатель):**

\`\`\`go
// SetContent - обновить состояние редактора
func (e *Editor) SetContent(content string) {
	e.content = content	// просто присвоить новое содержимое
}

// GetContent - прочитать текущее состояние
func (e *Editor) GetContent() string {
	return e.content	// вернуть текущее содержимое
}

// Save - создать memento с текущим состоянием
func (e *Editor) Save() *Memento {
	return &Memento{content: e.content}	// снимок текущего содержимого
}

// Restore - применить состояние из memento
func (e *Editor) Restore(m *Memento) {
	if m != nil {	// проверить на nil перед доступом
		e.content = m.GetContent()	// восстановить из memento
	}
}
\`\`\``,
			hint2: `**Методы History (Опекун):**

\`\`\`go
// Push - добавить memento в стек
func (h *History) Push(m *Memento) {
	h.mementos = append(h.mementos, m)	// добавить в конец
}

// Pop - удалить и вернуть последний memento
func (h *History) Pop() *Memento {
	if len(h.mementos) == 0 {	// проверка на пустоту
		return nil	// вернуть nil если нет истории
	}
	last := h.mementos[len(h.mementos)-1]	// получить последний
	h.mementos = h.mementos[:len(h.mementos)-1]	// отрезать последний
	return last	// вернуть удалённый memento
}
\`\`\`

Ключ: Pop возвращает nil когда пусто, позволяя безопасно цеплять операции отмены.`,
			whyItMatters: `## Зачем нужен паттерн Memento

**Проблема:** Раскрытие внутреннего состояния для отмены нарушает инкапсуляцию.

\`\`\`go
// Без Memento - раскрытые внутренности
type Editor struct {
    Content string	// должно быть публичным для отмены!
}

// Клиент сохраняет состояние напрямую
previousContent := editor.Content	// знает о внутренностях
editor.Content = "New text"
editor.Content = previousContent	// прямая манипуляция

// Проблемы:
// - Клиент знает внутреннюю структуру Editor
// - Нет контроля над тем, что сохраняется
// - Нельзя добавить новые поля без поломки клиентов
\`\`\`

**Решение:** Memento инкапсулирует захват состояния:

\`\`\`go
// С Memento - инкапсулированное состояние
type Editor struct {
    content string	// приватное - клиент не может получить доступ
}

memento := editor.Save()	// чёрный ящик-снимок
editor.SetContent("New text")
editor.Restore(memento)	// восстановление без знания внутренностей

// Преимущества:
// - Клиент не знает что внутри memento
// - Editor контролирует что сохраняется
// - Можно свободно менять внутреннюю структуру
\`\`\`

---

## Реальные Memento в Go

**1. Отмена/Повтор в текстовом редакторе:**
- Каждое нажатие клавиши/действие создаёт memento
- Отмена берёт из истории, повтор использует отдельный стек

**2. Система сохранения игр:**
- Сохранение состояния игры (позиция, инвентарь, прогресс)
- Загрузка восстанавливает полное состояние игры

**3. Транзакции базы данных:**
- Begin transaction создаёт контрольную точку
- Rollback восстанавливает к контрольной точке

**4. Восстановление состояния форм:**
- Автосохранение данных формы по мере ввода
- Восстановление после краша браузера

---

## Production-паттерн: Полная система Undo/Redo

\`\`\`go
package memento

import (
	"encoding/json"
	"time"
)

// DocumentState захватывает полное состояние документа
type DocumentState struct {
	Content    string	// текст документа
	CursorPos  int	// позиция курсора
	Selection  *Selection	// выделение текста если есть
	Timestamp  time.Time	// когда сохранено
}

type Selection struct {
	Start int	// начало выделения
	End   int	// конец выделения
}

// Memento оборачивает состояние - может быть сериализован
type Memento struct {
	state []byte	// JSON-кодированное состояние
}

func (m *Memento) GetState() (*DocumentState, error) {	// десериализовать состояние
	var state DocumentState
	err := json.Unmarshal(m.state, &state)
	return &state, err
}

// Document - создатель
type Document struct {
	content   string	// текущий текст
	cursorPos int	// текущая позиция курсора
	selection *Selection	// текущее выделение
}

func NewDocument() *Document {	// фабрика
	return &Document{content: "", cursorPos: 0}
}

func (d *Document) SetContent(content string) {	// обновить содержимое
	d.content = content
}

func (d *Document) GetContent() string {	// прочитать содержимое
	return d.content
}

func (d *Document) SetCursor(pos int) {	// переместить курсор
	d.cursorPos = pos
}

func (d *Document) SetSelection(start, end int) {	// выделить текст
	d.selection = &Selection{Start: start, End: end}
}

func (d *Document) ClearSelection() {	// снять выделение
	d.selection = nil
}

func (d *Document) Save() *Memento {	// создать снимок
	state := DocumentState{
		Content:   d.content,
		CursorPos: d.cursorPos,
		Selection: d.selection,
		Timestamp: time.Now(),
	}
	data, _ := json.Marshal(state)	// сериализовать состояние
	return &Memento{state: data}
}

func (d *Document) Restore(m *Memento) error {	// восстановить из снимка
	if m == nil {
		return nil	// нечего восстанавливать
	}
	state, err := m.GetState()
	if err != nil {
		return err	// ошибка десериализации
	}
	d.content = state.Content	// восстановить все поля
	d.cursorPos = state.CursorPos
	d.selection = state.Selection
	return nil
}

// UndoManager управляет стеками undo/redo
type UndoManager struct {
	undoStack []*Memento	// для операций отмены
	redoStack []*Memento	// для операций повтора
	maxSize   int	// максимальный размер истории
}

func NewUndoManager(maxSize int) *UndoManager {	// фабрика с лимитом
	return &UndoManager{
		undoStack: make([]*Memento, 0),
		redoStack: make([]*Memento, 0),
		maxSize:   maxSize,
	}
}

func (um *UndoManager) SaveState(m *Memento) {	// сохранить для отмены
	um.undoStack = append(um.undoStack, m)
	if len(um.undoStack) > um.maxSize {	// применить ограничение
		um.undoStack = um.undoStack[1:]	// удалить старейший
	}
	um.redoStack = nil	// очистить redo при новом действии
}

func (um *UndoManager) Undo() *Memento {	// получить состояние для восстановления
	if len(um.undoStack) == 0 {
		return nil	// нечего отменять
	}
	// Извлечь из undo
	last := um.undoStack[len(um.undoStack)-1]
	um.undoStack = um.undoStack[:len(um.undoStack)-1]
	// Добавить в redo (для функции повтора)
	um.redoStack = append(um.redoStack, last)
	// Вернуть предыдущее состояние (предпоследнее, или nil)
	if len(um.undoStack) > 0 {
		return um.undoStack[len(um.undoStack)-1]
	}
	return nil
}

func (um *UndoManager) Redo() *Memento {	// повторить последнее отменённое
	if len(um.redoStack) == 0 {
		return nil	// нечего повторять
	}
	last := um.redoStack[len(um.redoStack)-1]
	um.redoStack = um.redoStack[:len(um.redoStack)-1]
	um.undoStack = append(um.undoStack, last)
	return last
}

func (um *UndoManager) CanUndo() bool {	// проверить доступность отмены
	return len(um.undoStack) > 1	// нужно минимум 2 состояния для отмены
}

func (um *UndoManager) CanRedo() bool {	// проверить доступность повтора
	return len(um.redoStack) > 0
}

// Использование:
// doc := NewDocument()
// undoManager := NewUndoManager(100)
//
// doc.SetContent("Hello")
// undoManager.SaveState(doc.Save())
//
// doc.SetContent("Hello World")
// undoManager.SaveState(doc.Save())
//
// if undoManager.CanUndo() {
//     doc.Restore(undoManager.Undo())
// }
// // doc.content == "Hello"
\`\`\`

---

## Распространённые ошибки

**1. Memento раскрывает изменяемое состояние:**
\`\`\`go
// Неправильно - memento возвращает ссылку
type Memento struct {
	state *EditorState	// указатель на изменяемое состояние
}

func (e *Editor) Save() *Memento {
	return &Memento{state: &e.state}	// разделяет изменяемое состояние!
}
// Изменения в редакторе влияют на memento!

// Правильно - memento хранит копию
func (e *Editor) Save() *Memento {
	return &Memento{content: e.content}	// копирует значение
}
// Memento независим от редактора
\`\`\`

**2. Не проверять nil в Restore:**
\`\`\`go
// Неправильно - падает на nil
func (e *Editor) Restore(m *Memento) {
	e.content = m.GetContent()	// паника если m равен nil!
}

// Правильно - защита от nil
func (e *Editor) Restore(m *Memento) {
	if m != nil {	// проверка nil
		e.content = m.GetContent()
	}
}
\`\`\`

**3. Неограниченный рост истории:**
\`\`\`go
// Неправильно - неограниченная память
func (h *History) Push(m *Memento) {
	h.mementos = append(h.mementos, m)	// растёт бесконечно!
}

// Правильно - применить ограничение
func (h *History) Push(m *Memento) {
	h.mementos = append(h.mementos, m)
	if len(h.mementos) > h.maxSize {	// проверить лимит
		h.mementos = h.mementos[1:]	// удалить старейший
	}
}
\`\`\``
		},
		uz: {
			title: 'Memento (Esdalik) Pattern',
			description: `Go tilida Memento patternini amalga oshiring — inkapsulyatsiyani buzmasdan ob'ekt holatini saqlang va tiklang.

**Siz amalga oshirasiz:**

1. **Memento** - Tahrirlovchi holatini saqlaydi
2. **Editor** - Save/Restore metodlari bilan yaratuvchi
3. **History** - Mementolarni boshqaruvchi nazoratchi

**Foydalanish namunasi:**

\`\`\`go
editor := &Editor{}	// tahrirlovchi yaratish (yaratuvchi)
history := NewHistory()	// tarix yaratish (nazoratchi)

editor.SetContent("Hello")	// birinchi holat
history.Push(editor.Save())	// holatni tarixga saqlash

editor.SetContent("Hello World")	// ikkinchi holat
history.Push(editor.Save())	// ikkinchi holatni saqlash

editor.SetContent("Hello World!")	// uchinchi holat - kerakmas "!" qo'shildi

// Bekor qilish - oldingi holatni tiklash
editor.Restore(history.Pop())	// "Hello World" ni tiklash
fmt.Println(editor.GetContent())	// "Hello World"

editor.Restore(history.Pop())	// "Hello" ni tiklash
fmt.Println(editor.GetContent())	// "Hello"

history.Pop()	// nil qaytaradi - boshqa tarix yo'q
\`\`\``,
			hint1: `**Editor metodlari (Yaratuvchi):**

\`\`\`go
// SetContent - tahrirlovchi holatini yangilash
func (e *Editor) SetContent(content string) {
	e.content = content	// yangi kontentni belgilash
}

// GetContent - joriy holatni o'qish
func (e *Editor) GetContent() string {
	return e.content	// joriy kontentni qaytarish
}

// Save - joriy holat bilan memento yaratish
func (e *Editor) Save() *Memento {
	return &Memento{content: e.content}	// joriy kontentni suratga olish
}

// Restore - memento holatini qo'llash
func (e *Editor) Restore(m *Memento) {
	if m != nil {	// kirishdan oldin nil tekshirish
		e.content = m.GetContent()	// mementodan tiklash
	}
}
\`\`\``,
			hint2: `**History metodlari (Nazoratchi):**

\`\`\`go
// Push - mementoni stackga qo'shish
func (h *History) Push(m *Memento) {
	h.mementos = append(h.mementos, m)	// oxiriga qo'shish
}

// Pop - oxirgi mementoni olib tashlash va qaytarish
func (h *History) Pop() *Memento {
	if len(h.mementos) == 0 {	// bo'shlik tekshiruvi
		return nil	// tarix bo'lmasa nil qaytarish
	}
	last := h.mementos[len(h.mementos)-1]	// oxirgini olish
	h.mementos = h.mementos[:len(h.mementos)-1]	// oxirgini kesish
	return last	// olib tashlangan mementoni qaytarish
}
\`\`\`

Kalit: Bo'sh bo'lganda Pop nil qaytaradi, bekor qilish operatsiyalarini xavfsiz zanjirga ulash imkonini beradi.`,
			whyItMatters: `## Memento Pattern nima uchun kerak

**Muammo:** Bekor qilish uchun ichki holatni ochish inkapsulyatsiyani buzadi.

\`\`\`go
// Memento siz - ochilgan ichki qismlar
type Editor struct {
    Content string	// bekor qilish uchun public bo'lishi kerak!
}

// Mijoz holatni to'g'ridan-to'g'ri saqlaydi
previousContent := editor.Content	// ichki qismlar haqida biladi
editor.Content = "New text"
editor.Content = previousContent	// to'g'ridan-to'g'ri manipulyatsiya

// Muammolar:
// - Mijoz Editor ichki tuzilmasini biladi
// - Nima saqlanishini nazorat qilish mumkin emas
// - Mijozlarni buzmasdan yangi maydonlar qo'shib bo'lmaydi
\`\`\`

**Yechim:** Memento holat olishni inkapsulyatsiya qiladi:

\`\`\`go
// Memento bilan - inkapsulyatsiya qilingan holat
type Editor struct {
    content string	// private - mijoz kira olmaydi
}

memento := editor.Save()	// qora quti surat
editor.SetContent("New text")
editor.Restore(memento)	// ichki qismlarni bilmasdan tiklash

// Afzalliklar:
// - Mijoz memento ichida nima borligini bilmaydi
// - Editor nima saqlanishini nazorat qiladi
// - Ichki tuzilmani erkin o'zgartirish mumkin
\`\`\`

---

## Go da haqiqiy Mementolar

**1. Matn tahrirlovchisida Undo/Redo:**
- Har bir tugma bosish/harakat memento yaratadi
- Undo tarixdan oladi, redo alohida stackdan foydalanadi

**2. O'yin saqlash tizimi:**
- O'yin holatini saqlash (pozitsiya, inventar, progress)
- Yuklash to'liq o'yin holatini tiklaydi

**3. Ma'lumotlar bazasi tranzaksiyalari:**
- Begin transaction tekshiruv nuqtasi yaratadi
- Rollback tekshiruv nuqtasiga tiklaydi

**4. Forma holatini tiklash:**
- Foydalanuvchi yozganda forma ma'lumotlarini avto-saqlash
- Brauzer buzilgandan keyin tiklash

---

## Production pattern: To'liq Undo/Redo tizimi

\`\`\`go
package memento

import (
	"encoding/json"
	"time"
)

// DocumentState to'liq hujjat holatini oladi
type DocumentState struct {
	Content    string	// hujjat matni
	CursorPos  int	// kursor pozitsiyasi
	Selection  *Selection	// matn tanlash agar bor bo'lsa
	Timestamp  time.Time	// qachon saqlangan
}

type Selection struct {
	Start int	// tanlash boshlanishi
	End   int	// tanlash tugashi
}

// Memento holatni o'raydi - serializatsiya qilinishi mumkin
type Memento struct {
	state []byte	// JSON-practixngan holat
}

func (m *Memento) GetState() (*DocumentState, error) {	// holatni deserializatsiya qilish
	var state DocumentState
	err := json.Unmarshal(m.state, &state)
	return &state, err
}

// Document yaratuvchi
type Document struct {
	content   string	// joriy matn
	cursorPos int	// joriy kursor pozitsiyasi
	selection *Selection	// joriy tanlash
}

func NewDocument() *Document {	// fabrika
	return &Document{content: "", cursorPos: 0}
}

func (d *Document) SetContent(content string) {	// kontentni yangilash
	d.content = content
}

func (d *Document) GetContent() string {	// kontentni o'qish
	return d.content
}

func (d *Document) SetCursor(pos int) {	// kursorni ko'chirish
	d.cursorPos = pos
}

func (d *Document) SetSelection(start, end int) {	// matnni tanlash
	d.selection = &Selection{Start: start, End: end}
}

func (d *Document) ClearSelection() {	// tanlashni tozalash
	d.selection = nil
}

func (d *Document) Save() *Memento {	// surat yaratish
	state := DocumentState{
		Content:   d.content,
		CursorPos: d.cursorPos,
		Selection: d.selection,
		Timestamp: time.Now(),
	}
	data, _ := json.Marshal(state)	// holatni serializatsiya qilish
	return &Memento{state: data}
}

func (d *Document) Restore(m *Memento) error {	// suratdan tiklash
	if m == nil {
		return nil	// tiklanadigan narsa yo'q
	}
	state, err := m.GetState()
	if err != nil {
		return err	// deserializatsiya xatosi
	}
	d.content = state.Content	// barcha maydonlarni tiklash
	d.cursorPos = state.CursorPos
	d.selection = state.Selection
	return nil
}

// UndoManager undo/redo stacklarni boshqaradi
type UndoManager struct {
	undoStack []*Memento	// bekor qilish operatsiyalari uchun
	redoStack []*Memento	// qayta bajarish operatsiyalari uchun
	maxSize   int	// maksimal tarix o'lchami
}

func NewUndoManager(maxSize int) *UndoManager {	// limitli fabrika
	return &UndoManager{
		undoStack: make([]*Memento, 0),
		redoStack: make([]*Memento, 0),
		maxSize:   maxSize,
	}
}

func (um *UndoManager) SaveState(m *Memento) {	// bekor qilish uchun saqlash
	um.undoStack = append(um.undoStack, m)
	if len(um.undoStack) > um.maxSize {	// chegarani qo'llash
		um.undoStack = um.undoStack[1:]	// eng eskisini olib tashlash
	}
	um.redoStack = nil	// yangi harakatda redoni tozalash
}

func (um *UndoManager) Undo() *Memento {	// tiklash uchun holatni olish
	if len(um.undoStack) == 0 {
		return nil	// bekor qiladigan narsa yo'q
	}
	// Undodan olish
	last := um.undoStack[len(um.undoStack)-1]
	um.undoStack = um.undoStack[:len(um.undoStack)-1]
	// Redoga qo'shish (qayta bajarish funksiyasi uchun)
	um.redoStack = append(um.redoStack, last)
	// Oldingi holatni qaytarish (oxirgidan oldingi, yoki nil)
	if len(um.undoStack) > 0 {
		return um.undoStack[len(um.undoStack)-1]
	}
	return nil
}

func (um *UndoManager) Redo() *Memento {	// oxirgi bekor qilinganni qayta bajarish
	if len(um.redoStack) == 0 {
		return nil	// qayta bajariladigan narsa yo'q
	}
	last := um.redoStack[len(um.redoStack)-1]
	um.redoStack = um.redoStack[:len(um.redoStack)-1]
	um.undoStack = append(um.undoStack, last)
	return last
}

func (um *UndoManager) CanUndo() bool {	// bekor qilish mavjudligini tekshirish
	return len(um.undoStack) > 1	// bekor qilish uchun kamida 2 holat kerak
}

func (um *UndoManager) CanRedo() bool {	// qayta bajarish mavjudligini tekshirish
	return len(um.redoStack) > 0
}

// Foydalanish:
// doc := NewDocument()
// undoManager := NewUndoManager(100)
//
// doc.SetContent("Hello")
// undoManager.SaveState(doc.Save())
//
// doc.SetContent("Hello World")
// undoManager.SaveState(doc.Save())
//
// if undoManager.CanUndo() {
//     doc.Restore(undoManager.Undo())
// }
// // doc.content == "Hello"
\`\`\`

---

## Keng tarqalgan xatolar

**1. Memento o'zgaruvchan holatni ochadi:**
\`\`\`go
// Noto'g'ri - memento havola qaytaradi
type Memento struct {
	state *EditorState	// o'zgaruvchan holatga pointer
}

func (e *Editor) Save() *Memento {
	return &Memento{state: &e.state}	// o'zgaruvchan holatni ulashadi!
}
// Tahririovchidagi o'zgarishlar mementoga ta'sir qiladi!

// To'g'ri - memento nusxa saqlaydi
func (e *Editor) Save() *Memento {
	return &Memento{content: e.content}	// qiymatni nusxalash
}
// Memento tahrirlovchidan mustaqil
\`\`\`

**2. Restore da nil tekshirmaslik:**
\`\`\`go
// Noto'g'ri - nil da buziladi
func (e *Editor) Restore(m *Memento) {
	e.content = m.GetContent()	// m nil bo'lsa panika!
}

// To'g'ri - nil dan himoya
func (e *Editor) Restore(m *Memento) {
	if m != nil {	// nil tekshiruvi
		e.content = m.GetContent()
	}
}
\`\`\`

**3. Cheksiz tarix o'sishi:**
\`\`\`go
// Noto'g'ri - cheklanmagan xotira
func (h *History) Push(m *Memento) {
	h.mementos = append(h.mementos, m)	// cheksiz o'sadi!
}

// To'g'ri - chegarani qo'llash
func (h *History) Push(m *Memento) {
	h.mementos = append(h.mementos, m)
	if len(h.mementos) > h.maxSize {	// limitni tekshirish
		h.mementos = h.mementos[1:]	// eng eskisini tashlab yuborish
	}
}
\`\`\``
		}
	}
};

export default task;
