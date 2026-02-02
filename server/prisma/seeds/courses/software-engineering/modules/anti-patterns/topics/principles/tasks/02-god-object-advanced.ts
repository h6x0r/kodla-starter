import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'se-ap-god-object-advanced',
	title: 'God Object Anti-pattern - Advanced',
	difficulty: 'medium',
	tags: ['go', 'anti-patterns', 'god-object', 'refactoring'],
	estimatedTime: '30m',
	isPremium: false,
	youtubeUrl: '',
	description: `Refactor a complex God Object with dependency injection and interface-based design.

**The Problem:**

A monolithic \`OrderProcessor\` that handles everything related to orders, making it untestable and inflexible.

**You will refactor:**

A God Object that:
1. Validates orders
2. Calculates totals
3. Processes payments
4. Sends notifications

**Split into services with interfaces:**
1. **OrderValidator** - Validation logic
2. **PriceCalculator** - Price calculations
3. **PaymentProcessor** - Payment handling
4. **NotificationService** - Notifications

**Use dependency injection to compose:**
\`\`\`go
processor := NewOrderService(
    NewOrderValidator(10),
    NewPriceCalculator(0.1),
    NewPaymentProcessor(),
    NewNotificationService(),
)
\`\`\`

**Your Task:**

Implement the refactored services with proper separation and dependency injection.`,
	initialCode: `package antipatterns

import "fmt"

type Order struct {
	ID       int
	Items    int
	Subtotal float64
}

type OrderValidator struct {
	maxItems int
}

func NewOrderValidator(maxItems int) *OrderValidator {
}

func (v *OrderValidator) Validate(order Order) error {
}

type PriceCalculator struct {
	taxRate float64
}

func NewPriceCalculator(taxRate float64) *PriceCalculator {
}

func (c *PriceCalculator) CalculateTotal(order Order) float64 {
}

type PaymentProcessor struct{}

func NewPaymentProcessor() *PaymentProcessor {
}

func (p *PaymentProcessor) Process(total float64) string {
}

type NotificationService struct{}

func NewNotificationService() *NotificationService {
}

func (n *NotificationService) SendConfirmation(orderID int) string {
}

type OrderService struct {
	validator    *OrderValidator
}

func NewOrderService(
}

func (s *OrderService) ProcessOrder(order Order) (string, error) {
}`,
	solutionCode: `package antipatterns

import "fmt"

// Order represents an order
type Order struct {
	ID       int
	Items    int
	Subtotal float64
}

// OrderValidator validates orders - single responsibility: validation
type OrderValidator struct {
	maxItems int	// validation constraint
}

func NewOrderValidator(maxItems int) *OrderValidator {
	return &OrderValidator{maxItems: maxItems}
}

func (v *OrderValidator) Validate(order Order) error {
	if order.Items > v.maxItems {	// check business rule
		return fmt.Errorf("too many items")
	}
	return nil	// validation passed
}

// PriceCalculator calculates prices - single responsibility: calculations
type PriceCalculator struct {
	taxRate float64	// tax calculation configuration
}

func NewPriceCalculator(taxRate float64) *PriceCalculator {
	return &PriceCalculator{taxRate: taxRate}
}

func (c *PriceCalculator) CalculateTotal(order Order) float64 {
	return order.Subtotal + (order.Subtotal * c.taxRate)	// subtotal + tax
}

// PaymentProcessor processes payments - single responsibility: payment
type PaymentProcessor struct{}

func NewPaymentProcessor() *PaymentProcessor {
	return &PaymentProcessor{}
}

func (p *PaymentProcessor) Process(total float64) string {
	return fmt.Sprintf("Payment processed: $%.2f", total)	// format with 2 decimals
}

// NotificationService sends notifications - single responsibility: notifications
type NotificationService struct{}

func NewNotificationService() *NotificationService {
	return &NotificationService{}
}

func (n *NotificationService) SendConfirmation(orderID int) string {
	return fmt.Sprintf("Confirmation sent for order #%d", orderID)	// format message
}

// OrderService orchestrates order processing - single responsibility: coordination
// Uses dependency injection for flexibility and testability
type OrderService struct {
	validator    *OrderValidator	// injected dependency
	calculator   *PriceCalculator	// injected dependency
	payment      *PaymentProcessor	// injected dependency
	notification *NotificationService	// injected dependency
}

func NewOrderService(
	validator *OrderValidator,
	calculator *PriceCalculator,
	payment *PaymentProcessor,
	notification *NotificationService,
) *OrderService {
	return &OrderService{	// dependency injection pattern
		validator:    validator,
		calculator:   calculator,
		payment:      payment,
		notification: notification,
	}
}

func (s *OrderService) ProcessOrder(order Order) (string, error) {
	// Step 1: Validate
	if err := s.validator.Validate(order); err != nil {
		return "", err	// validation failed, stop processing
	}

	// Step 2: Calculate total
	total := s.calculator.CalculateTotal(order)

	// Step 3: Process payment
	paymentResult := s.payment.Process(total)

	// Step 4: Send confirmation
	s.notification.SendConfirmation(order.ID)

	return paymentResult, nil	// success
}`,
	hint1: `Each New* function returns a pointer to a struct initialized with the provided parameters. OrderValidator checks if items > maxItems.`,
	hint2: `CalculateTotal adds tax to subtotal. Process uses fmt.Sprintf with "%.2f". ProcessOrder calls methods in sequence: Validate, CalculateTotal, Process, SendConfirmation.`,
	whyItMatters: `Dependency injection and service decomposition are crucial for building maintainable, testable systems.

**Why This Pattern Matters:**

**1. Testability Through Dependency Injection**

\`\`\`go
// BAD: God Object with hard-coded dependencies
type OrderProcessor struct {
	validator    *OrderValidator    // created internally
	payment      *StripePayment     // hard-coded to Stripe!
}

func NewOrderProcessor() *OrderProcessor {
	return &OrderProcessor{
		validator: &OrderValidator{},
		payment:   &StripePayment{apiKey: "sk_live_..."}, // can't test!
	}
}

// Testing is IMPOSSIBLE - always calls real Stripe API!
func TestOrderProcessor(t *testing.T) {
	processor := NewOrderProcessor()
	// Will make real API calls to Stripe in tests!
}
\`\`\`

\`\`\`go
// GOOD: Dependency injection allows testing
type OrderService struct {
	validator PaymentValidator  // interface, not concrete type
	payment   PaymentGateway    // interface, not concrete type
}

func NewOrderService(v PaymentValidator, p PaymentGateway) *OrderService {
	return &OrderService{validator: v, payment: p}
}

// Testing is EASY - inject mocks!
func TestOrderService(t *testing.T) {
	mockValidator := &MockValidator{}
	mockPayment := &MockPayment{}

	service := NewOrderService(mockValidator, mockPayment)
	// No real API calls, fast tests!
}
\`\`\`

**2. Flexibility to Change Implementation**

\`\`\`go
// Production: use real services
service := NewOrderService(
	NewOrderValidator(100),
	NewStripePayment("sk_live_..."),
)

// Development: use sandbox
service := NewOrderService(
	NewOrderValidator(10),
	NewStripePayment("sk_test_..."),
)

// Testing: use mocks
service := NewOrderService(
	NewAlwaysValidValidator(),
	NewFakePayment(),
)

// Same OrderService code works in all environments!
\`\`\`

**3. Easy to Swap Providers**

\`\`\`go
// Started with Stripe
stripeProcessor := NewStripePayment(apiKey)
service := NewOrderService(validator, stripeProcessor)

// Customer wants PayPal? Just swap implementation!
paypalProcessor := NewPayPalPayment(apiKey)
service := NewOrderService(validator, paypalProcessor)

// OrderService code doesn't change at all
\`\`\`

**Real-World Example - E-commerce System:**

\`\`\`go
// God Object - 2000 lines of tightly coupled code
type ShopManager struct {
	db              *sql.DB
	stripeKey       string
	emailServer     string
	inventoryDB     *sql.DB
	shippingAPI     *FedExAPI
	taxService      *AvalaraAPI
}

func (m *ShopManager) ProcessOrder(order Order) error {
	// Validates inline
	if order.Total < 0 { return errors.New("invalid") }

	// Calculates tax inline
	tax := order.Total * 0.08

	// Processes payment inline
	stripe.Charge(m.stripeKey, order.Total + tax)

	// Updates inventory inline
	m.inventoryDB.Exec("UPDATE...")

	// Ships order inline
	m.shippingAPI.CreateLabel(order)

	// Sends email inline
	smtp.Send(m.emailServer, order.Email, "Shipped!")

	// Can't test any piece individually
	// Can't swap Stripe for PayPal
	// Can't swap FedEx for UPS
	// Everything is hardcoded!
}
\`\`\`

\`\`\`go
// Refactored with Dependency Injection
type OrderService struct {
	validator  OrderValidator
	calculator TaxCalculator
	payment    PaymentGateway      // interface!
	inventory  InventoryManager    // interface!
	shipping   ShippingProvider    // interface!
	notifier   Notifier           // interface!
}

func NewOrderService(
	validator OrderValidator,
	calculator TaxCalculator,
	payment PaymentGateway,
	inventory InventoryManager,
	shipping ShippingProvider,
	notifier Notifier,
) *OrderService {
	return &OrderService{
		validator:  validator,
		calculator: calculator,
		payment:    payment,
		inventory:  inventory,
		shipping:   shipping,
		notifier:   notifier,
	}
}

func (s *OrderService) ProcessOrder(order Order) error {
	// Each step delegates to an injected dependency
	if err := s.validator.Validate(order); err != nil {
		return err
	}

	tax := s.calculator.Calculate(order)

	if err := s.payment.Charge(order.Total + tax); err != nil {
		return err
	}

	if err := s.inventory.Reserve(order.Items); err != nil {
		s.payment.Refund(order.Total + tax) // rollback
		return err
	}

	if err := s.shipping.Ship(order); err != nil {
		s.inventory.Release(order.Items)     // rollback
		s.payment.Refund(order.Total + tax)  // rollback
		return err
	}

	s.notifier.Notify(order.Email, "Shipped!")

	return nil
}

// Now we can easily test, swap providers, and maintain each piece
\`\`\`

**Testing Made Easy:**

\`\`\`go
// Test order processing with payment failure
func TestOrderService_PaymentFails(t *testing.T) {
	// Arrange: create mocks
	mockPayment := &MockPayment{
		shouldFail: true,  // configure mock to fail
	}

	service := NewOrderService(
		NewAlwaysValidValidator(),
		NewFixedTaxCalculator(0.08),
		mockPayment,  // inject mock
		NewMockInventory(),
		NewMockShipping(),
		NewMockNotifier(),
	)

	// Act
	err := service.ProcessOrder(testOrder)

	// Assert
	if err == nil {
		t.Error("Expected payment error")
	}

	// Verify no shipping happened when payment failed
	// Easy to verify because each service is separate!
}
\`\`\`

**Production Configuration:**

\`\`\`go
// Wire up real services in production
func NewProductionOrderService(cfg *Config) *OrderService {
	return NewOrderService(
		NewOrderValidator(cfg.MaxItems),
		NewAvalaraTaxCalculator(cfg.AvalaraKey),
		NewStripePayment(cfg.StripeKey),
		NewPostgresInventory(cfg.DB),
		NewFedExShipping(cfg.FedExKey),
		NewSendGridNotifier(cfg.SendGridKey),
	)
}

// Wire up test services in development
func NewDevelopmentOrderService() *OrderService {
	return NewOrderService(
		NewOrderValidator(10),
		NewFixedTaxCalculator(0.0),  // no tax in dev
		NewFakePayment(),            // fake payment
		NewInMemoryInventory(),      // in-memory
		NewNoOpShipping(),           // don't actually ship
		NewConsoleNotifier(),        // print to console
	)
}
\`\`\`

**Benefits Summary:**

1. **Testability**: Inject mocks for fast, isolated tests
2. **Flexibility**: Swap implementations without changing business logic
3. **Maintainability**: Each service is small and focused
4. **Reusability**: Use services in different contexts
5. **Team Scalability**: Different developers own different services
6. **Evolution**: Easy to add new features or change providers`,
	order: 1,
	testCode: `package antipatterns

import (
	"strings"
	"testing"
)

// Test1: OrderValidator accepts valid order
func Test1(t *testing.T) {
	v := NewOrderValidator(10)
	order := Order{ID: 1, Items: 5, Subtotal: 100}
	if err := v.Validate(order); err != nil {
		t.Errorf("Should accept order with 5 items, got %v", err)
	}
}

// Test2: OrderValidator rejects order with too many items
func Test2(t *testing.T) {
	v := NewOrderValidator(10)
	order := Order{ID: 1, Items: 15, Subtotal: 100}
	if err := v.Validate(order); err == nil {
		t.Error("Should reject order with 15 items when max is 10")
	}
}

// Test3: PriceCalculator calculates total with tax
func Test3(t *testing.T) {
	c := NewPriceCalculator(0.1)
	order := Order{Subtotal: 100.0}
	total := c.CalculateTotal(order)
	if total != 110.0 {
		t.Errorf("Expected 110.0, got %f", total)
	}
}

// Test4: PaymentProcessor returns formatted message
func Test4(t *testing.T) {
	p := NewPaymentProcessor()
	result := p.Process(100.50)
	if !strings.Contains(result, "100.50") {
		t.Error("Should contain formatted amount")
	}
	if !strings.Contains(result, "Payment processed") {
		t.Error("Should contain 'Payment processed'")
	}
}

// Test5: NotificationService returns confirmation message
func Test5(t *testing.T) {
	n := NewNotificationService()
	result := n.SendConfirmation(42)
	if !strings.Contains(result, "42") {
		t.Error("Should contain order ID")
	}
}

// Test6: OrderService ProcessOrder succeeds for valid order
func Test6(t *testing.T) {
	service := NewOrderService(
		NewOrderValidator(10),
		NewPriceCalculator(0.1),
		NewPaymentProcessor(),
		NewNotificationService(),
	)
	order := Order{ID: 1, Items: 5, Subtotal: 100}
	result, err := service.ProcessOrder(order)
	if err != nil {
		t.Errorf("Should succeed, got %v", err)
	}
	if result == "" {
		t.Error("Should return payment result")
	}
}

// Test7: OrderService ProcessOrder fails for invalid order
func Test7(t *testing.T) {
	service := NewOrderService(
		NewOrderValidator(5),
		NewPriceCalculator(0.1),
		NewPaymentProcessor(),
		NewNotificationService(),
	)
	order := Order{ID: 1, Items: 10, Subtotal: 100}
	_, err := service.ProcessOrder(order)
	if err == nil {
		t.Error("Should fail for too many items")
	}
}

// Test8: Order struct fields
func Test8(t *testing.T) {
	order := Order{ID: 1, Items: 5, Subtotal: 99.99}
	if order.ID != 1 || order.Items != 5 || order.Subtotal != 99.99 {
		t.Error("Order fields not set correctly")
	}
}

// Test9: PriceCalculator with zero tax
func Test9(t *testing.T) {
	c := NewPriceCalculator(0.0)
	order := Order{Subtotal: 50.0}
	if c.CalculateTotal(order) != 50.0 {
		t.Error("With 0 tax, total should equal subtotal")
	}
}

// Test10: OrderValidator with exact max items
func Test10(t *testing.T) {
	v := NewOrderValidator(10)
	order := Order{ID: 1, Items: 10, Subtotal: 100}
	if err := v.Validate(order); err != nil {
		t.Error("Should accept exactly max items")
	}
}
`,
	translations: {
		ru: {
			title: 'Антипаттерн God Object - Продвинутый',
			description: `Рефакторьте сложный God Object с внедрением зависимостей и дизайном на основе интерфейсов.

**Проблема:**

Монолитный \`OrderProcessor\`, который обрабатывает всё связанное с заказами, делая его нетестируемым и негибким.

**Вы выполните рефакторинг:**

God Object, который:
1. Валидирует заказы
2. Рассчитывает итоги
3. Обрабатывает платежи
4. Отправляет уведомления

**Разделите на сервисы с интерфейсами:**
1. **OrderValidator** - Логика валидации
2. **PriceCalculator** - Расчёты цен
3. **PaymentProcessor** - Обработка платежей
4. **NotificationService** - Уведомления

**Используйте внедрение зависимостей для композиции:**
\`\`\`go
processor := NewOrderService(
    NewOrderValidator(10),
    NewPriceCalculator(0.1),
    NewPaymentProcessor(),
    NewNotificationService(),
)
\`\`\`

**Ваша задача:**

Реализуйте рефакторинг сервисов с правильным разделением и внедрением зависимостей.`,
			hint1: `Каждая функция New* возвращает указатель на структуру, инициализированную с предоставленными параметрами. OrderValidator проверяет если items > maxItems.`,
			hint2: `CalculateTotal добавляет налог к subtotal. Process использует fmt.Sprintf с "%.2f". ProcessOrder вызывает методы последовательно: Validate, CalculateTotal, Process, SendConfirmation.`,
			whyItMatters: `Внедрение зависимостей и декомпозиция сервисов критически важны для построения поддерживаемых, тестируемых систем.

**Почему этот паттерн важен:**

**1. Тестируемость через внедрение зависимостей**

\`\`\`go
// ПЛОХО: God Object с жёстко закодированными зависимостями
type OrderProcessor struct {
	validator    *OrderValidator    // создаётся внутри
	payment      *StripePayment     // жёстко привязан к Stripe!
}

func NewOrderProcessor() *OrderProcessor {
	return &OrderProcessor{
		validator: &OrderValidator{},
		payment:   &StripePayment{apiKey: "sk_live_..."}, // не протестировать!
	}
}

// Тестирование НЕВОЗМОЖНО - всегда вызывает реальный API Stripe!
func TestOrderProcessor(t *testing.T) {
	processor := NewOrderProcessor()
	// Будет делать реальные API вызовы к Stripe в тестах!
}
\`\`\`

\`\`\`go
// ХОРОШО: Внедрение зависимостей позволяет тестирование
type OrderService struct {
	validator PaymentValidator  // интерфейс, не конкретный тип
	payment   PaymentGateway    // интерфейс, не конкретный тип
}

func NewOrderService(v PaymentValidator, p PaymentGateway) *OrderService {
	return &OrderService{validator: v, payment: p}
}

// Тестирование ЛЕГКО - внедряем моки!
func TestOrderService(t *testing.T) {
	mockValidator := &MockValidator{}
	mockPayment := &MockPayment{}

	service := NewOrderService(mockValidator, mockPayment)
	// Нет реальных API вызовов, быстрые тесты!
}
\`\`\`

**Преимущества:**

1. **Тестируемость**: Внедряйте моки для быстрых, изолированных тестов
2. **Гибкость**: Меняйте реализации без изменения бизнес-логики
3. **Поддерживаемость**: Каждый сервис маленький и сфокусированный
4. **Переиспользуемость**: Используйте сервисы в разных контекстах
5. **Масштабируемость команды**: Разные разработчики владеют разными сервисами`,
			solutionCode: `package antipatterns

import "fmt"

// Order представляет заказ
type Order struct {
	ID       int
	Items    int
	Subtotal float64
}

// OrderValidator валидирует заказы - единственная ответственность: валидация
type OrderValidator struct {
	maxItems int	// ограничение валидации
}

func NewOrderValidator(maxItems int) *OrderValidator {
	return &OrderValidator{maxItems: maxItems}
}

func (v *OrderValidator) Validate(order Order) error {
	if order.Items > v.maxItems {	// проверяем бизнес-правило
		return fmt.Errorf("too many items")
	}
	return nil	// валидация пройдена
}

// PriceCalculator рассчитывает цены - единственная ответственность: расчёты
type PriceCalculator struct {
	taxRate float64	// конфигурация расчёта налогов
}

func NewPriceCalculator(taxRate float64) *PriceCalculator {
	return &PriceCalculator{taxRate: taxRate}
}

func (c *PriceCalculator) CalculateTotal(order Order) float64 {
	return order.Subtotal + (order.Subtotal * c.taxRate)	// subtotal + налог
}

// PaymentProcessor обрабатывает платежи - единственная ответственность: платежи
type PaymentProcessor struct{}

func NewPaymentProcessor() *PaymentProcessor {
	return &PaymentProcessor{}
}

func (p *PaymentProcessor) Process(total float64) string {
	return fmt.Sprintf("Payment processed: $%.2f", total)	// форматируем с 2 десятичными
}

// NotificationService отправляет уведомления - единственная ответственность: уведомления
type NotificationService struct{}

func NewNotificationService() *NotificationService {
	return &NotificationService{}
}

func (n *NotificationService) SendConfirmation(orderID int) string {
	return fmt.Sprintf("Confirmation sent for order #%d", orderID)	// форматируем сообщение
}

// OrderService оркестрирует обработку заказов - единственная ответственность: координация
// Использует внедрение зависимостей для гибкости и тестируемости
type OrderService struct {
	validator    *OrderValidator	// внедрённая зависимость
	calculator   *PriceCalculator	// внедрённая зависимость
	payment      *PaymentProcessor	// внедрённая зависимость
	notification *NotificationService	// внедрённая зависимость
}

func NewOrderService(
	validator *OrderValidator,
	calculator *PriceCalculator,
	payment *PaymentProcessor,
	notification *NotificationService,
) *OrderService {
	return &OrderService{	// паттерн внедрения зависимостей
		validator:    validator,
		calculator:   calculator,
		payment:      payment,
		notification: notification,
	}
}

func (s *OrderService) ProcessOrder(order Order) (string, error) {
	// Шаг 1: Валидация
	if err := s.validator.Validate(order); err != nil {
		return "", err	// валидация не прошла, прекращаем обработку
	}

	// Шаг 2: Расчёт итога
	total := s.calculator.CalculateTotal(order)

	// Шаг 3: Обработка платежа
	paymentResult := s.payment.Process(total)

	// Шаг 4: Отправка подтверждения
	s.notification.SendConfirmation(order.ID)

	return paymentResult, nil	// успех
}`
		},
		uz: {
			title: 'God Object Anti-pattern - Ilg\'or',
			description: `Dependency injection va interface asosidagi dizayn bilan murakkab God Object ni refaktoring qiling.

**Muammo:**

Buyurtmalar bilan bog'liq hamma narsani boshqaradigan monolitik \`OrderProcessor\`, uni test qilib bo'lmaydigan va moslashuvchan emas.

**Siz refaktoring qilasiz:**

Quyidagilarni bajaradigan God Object:
1. Buyurtmalarni validatsiya qiladi
2. Umumiy summani hisoblab chiqadi
3. To'lovlarni qayta ishlaydi
4. Bildirishnomalar yuboradi

**Interfeyslar bilan servislarga bo'ling:**
1. **OrderValidator** - Validatsiya logikasi
2. **PriceCalculator** - Narx hisob-kitoblari
3. **PaymentProcessor** - To'lov qayta ishlash
4. **NotificationService** - Bildirishnomalar

**Kompozitsiya uchun dependency injection ishlating:**
\`\`\`go
processor := NewOrderService(
    NewOrderValidator(10),
    NewPriceCalculator(0.1),
    NewPaymentProcessor(),
    NewNotificationService(),
)
\`\`\`

**Sizning vazifangiz:**

To'g'ri ajratish va dependency injection bilan refaktoringlangan servislarni amalga oshiring.`,
			hint1: `Har bir New* funksiyasi berilgan parametrlar bilan initsializatsiya qilingan strukturaga ko'rsatkichni qaytaradi. OrderValidator items > maxItems ni tekshiradi.`,
			hint2: `CalculateTotal subtotal ga soliqni qo'shadi. Process fmt.Sprintf dan "%.2f" bilan foydalanadi. ProcessOrder metodlarni ketma-ket chaqiradi: Validate, CalculateTotal, Process, SendConfirmation.`,
			whyItMatters: `Dependency injection va servis dekompozitsiyasi qo'llab-quvvatlanadigan, test qilinadigan tizimlar qurish uchun muhimdir.

**Bu pattern nima uchun muhim:**

**1. Dependency injection orqali test qilish mumkinligi**

\`\`\`go
// YOMON: Qattiq practixngan bog'liqliklarga ega God Object
type OrderProcessor struct {
	validator    *OrderValidator    // ichida yaratilgan
	payment      *StripePayment     // Stripe ga qattiq bog'langan!
}

func NewOrderProcessor() *OrderProcessor {
	return &OrderProcessor{
		validator: &OrderValidator{},
		payment:   &StripePayment{apiKey: "sk_live_..."}, // test qilib bo'lmaydi!
	}
}

// Test qilish MUMKIN EMAS - har doim haqiqiy Stripe API ni chaqiradi!
func TestOrderProcessor(t *testing.T) {
	processor := NewOrderProcessor()
	// Testlarda haqiqiy API chaqiruvlari qiladi!
}
\`\`\`

\`\`\`go
// YAXSHI: Dependency injection test qilish imkonini beradi
type OrderService struct {
	validator PaymentValidator  // interfeys, konkret tip emas
	payment   PaymentGateway    // interfeys, konkret tip emas
}

func NewOrderService(v PaymentValidator, p PaymentGateway) *OrderService {
	return &OrderService{validator: v, payment: p}
}

// Test qilish OSON - mocklar inject qiling!
func TestOrderService(t *testing.T) {
	mockValidator := &MockValidator{}
	mockPayment := &MockPayment{}

	service := NewOrderService(mockValidator, mockPayment)
	// Haqiqiy API chaqiruvlari yo'q, tez testlar!
}
\`\`\`

**Afzalliklar:**

1. **Test qilish mumkinligi**: Tez, izolyatsiya qilingan testlar uchun mocklar inject qiling
2. **Moslashuvchanlik**: Biznes logikasini o'zgartirmasdan implementatsiyalarni almashtiring
3. **Qo'llab-quvvatlash**: Har bir servis kichik va fokusli
4. **Qayta foydalanish**: Servislarni turli kontekstlarda ishlating
5. **Jamoa miqyosliligi**: Turli dasturchilar turli servislarga ega`,
			solutionCode: `package antipatterns

import "fmt"

// Order buyurtmani ifodalaydi
type Order struct {
	ID       int
	Items    int
	Subtotal float64
}

// OrderValidator buyurtmalarni validatsiya qiladi - yagona mas'uliyat: validatsiya
type OrderValidator struct {
	maxItems int	// validatsiya cheklovi
}

func NewOrderValidator(maxItems int) *OrderValidator {
	return &OrderValidator{maxItems: maxItems}
}

func (v *OrderValidator) Validate(order Order) error {
	if order.Items > v.maxItems {	// biznes qoidasini tekshiramiz
		return fmt.Errorf("too many items")
	}
	return nil	// validatsiya o'tdi
}

// PriceCalculator narxlarni hisoblab chiqadi - yagona mas'uliyat: hisob-kitoblar
type PriceCalculator struct {
	taxRate float64	// soliq hisoblash konfiguratsiyasi
}

func NewPriceCalculator(taxRate float64) *PriceCalculator {
	return &PriceCalculator{taxRate: taxRate}
}

func (c *PriceCalculator) CalculateTotal(order Order) float64 {
	return order.Subtotal + (order.Subtotal * c.taxRate)	// subtotal + soliq
}

// PaymentProcessor to'lovlarni qayta ishlaydi - yagona mas'uliyat: to'lov
type PaymentProcessor struct{}

func NewPaymentProcessor() *PaymentProcessor {
	return &PaymentProcessor{}
}

func (p *PaymentProcessor) Process(total float64) string {
	return fmt.Sprintf("Payment processed: $%.2f", total)	// 2 o'nli bilan formatlash
}

// NotificationService bildirishnomalar yuboradi - yagona mas'uliyat: bildirishnomalar
type NotificationService struct{}

func NewNotificationService() *NotificationService {
	return &NotificationService{}
}

func (n *NotificationService) SendConfirmation(orderID int) string {
	return fmt.Sprintf("Confirmation sent for order #%d", orderID)	// xabarni formatlash
}

// OrderService buyurtma qayta ishlashni orkestrlaydi - yagona mas'uliyat: koordinatsiya
// Moslashuvchanlik va test qilish mumkinligi uchun dependency injection dan foydalanadi
type OrderService struct {
	validator    *OrderValidator	// inject qilingan bog'liqlik
	calculator   *PriceCalculator	// inject qilingan bog'liqlik
	payment      *PaymentProcessor	// inject qilingan bog'liqlik
	notification *NotificationService	// inject qilingan bog'liqlik
}

func NewOrderService(
	validator *OrderValidator,
	calculator *PriceCalculator,
	payment *PaymentProcessor,
	notification *NotificationService,
) *OrderService {
	return &OrderService{	// dependency injection patterni
		validator:    validator,
		calculator:   calculator,
		payment:      payment,
		notification: notification,
	}
}

func (s *OrderService) ProcessOrder(order Order) (string, error) {
	// Qadam 1: Validatsiya
	if err := s.validator.Validate(order); err != nil {
		return "", err	// validatsiya muvaffaqiyatsiz, qayta ishlashni to'xtatamiz
	}

	// Qadam 2: Umumiy summani hisoblash
	total := s.calculator.CalculateTotal(order)

	// Qadam 3: To'lovni qayta ishlash
	paymentResult := s.payment.Process(total)

	// Qadam 4: Tasdiqlash yuborish
	s.notification.SendConfirmation(order.ID)

	return paymentResult, nil	// muvaffaqiyat
}`
		}
	}
};

export default task;
