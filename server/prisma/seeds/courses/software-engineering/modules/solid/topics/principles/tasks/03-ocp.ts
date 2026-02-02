import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'se-solid-ocp',
	title: 'Open/Closed Principle',
	difficulty: 'medium',
	tags: ['go', 'solid', 'ocp', 'extensibility'],
	estimatedTime: '30m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement the Open/Closed Principle (OCP) - software entities should be open for extension but closed for modification.

**Current Problem:**

A PaymentProcessor with hardcoded payment methods requires modifying existing code to add new payment types.

**Your task:**

Refactor to use interfaces so new payment methods can be added without modifying existing code:

1. **PaymentMethod interface** - Defines contract for all payment methods
2. **CreditCardPayment** - Implements credit card processing
3. **PayPalPayment** - Implements PayPal processing
4. **CryptoPayment** - Implements cryptocurrency processing
5. **PaymentProcessor** - Processes any PaymentMethod without knowing implementation details

**Key Concepts:**
- **Abstraction**: Define interfaces for variation points
- **Polymorphism**: Different implementations of same interface
- **Extension**: Add new behavior without modifying existing code

**Example Usage:**

\`\`\`go
// Create different payment methods
creditCard := &CreditCardPayment{CardNumber: "1234-5678-9012-3456"}
paypal := &PayPalPayment{Email: "user@example.com"}
crypto := &CryptoPayment{WalletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}

// Process payments using same interface
processor := &PaymentProcessor{}
processor.Process(creditCard, 100.00)  // processes via credit card
processor.Process(paypal, 50.00)       // processes via PayPal
processor.Process(crypto, 25.00)       // processes via crypto

// Add new payment method? Just implement PaymentMethod interface!
// No changes to PaymentProcessor needed
\`\`\`

**Why OCP matters:**
- Add features without breaking existing code
- Reduce risk of introducing bugs
- Follow "don't touch working code" principle
- Enable plugin architectures

**Constraints:**
- All payment methods must implement PaymentMethod interface
- PaymentProcessor must work with any PaymentMethod
- Adding new payment type should not modify existing code`,
	initialCode: `package principles

import "fmt"

type PaymentProcessor struct{}

func (pp *PaymentProcessor) ProcessPayment(paymentType string, amount float64, details map[string]string) error {
	if paymentType == "credit_card" {
		return nil
		return nil
		return nil
	}
	return fmt.Errorf("unsupported payment type: %s", paymentType)
}

type PaymentMethod interface {
}

type CreditCardPayment struct {
	CardNumber string
}

func (cc *CreditCardPayment) Process(amount float64) error {
}

type PayPalPayment struct {
	Email string
}

func (pp *PayPalPayment) Process(amount float64) error {
}

type CryptoPayment struct {
	WalletAddress string
}

func (cp *CryptoPayment) Process(amount float64) error {
}

func (pp *PaymentProcessor) Process(method PaymentMethod, amount float64) error {
}`,
	solutionCode: `package principles

import "fmt"

// PaymentMethod interface defines contract for all payment methods
// Adding new payment type? Implement this interface - no other changes needed!
type PaymentMethod interface {
	Process(amount float64) error	// all payment methods must implement this
}

// CreditCardPayment implements PaymentMethod for credit card processing
type CreditCardPayment struct {
	CardNumber string	// credit card number (should be encrypted in production)
}

// Process executes credit card payment
func (cc *CreditCardPayment) Process(amount float64) error {
	// In production, integrate with payment gateway (Stripe, etc.)
	fmt.Printf("Processing $%.2f via Credit Card ending in %s\\n",
		amount, cc.CardNumber[len(cc.CardNumber)-4:])	// show last 4 digits only
	return nil	// return nil on success
}

// PayPalPayment implements PaymentMethod for PayPal processing
type PayPalPayment struct {
	Email string	// PayPal account email
}

// Process executes PayPal payment
func (pp *PayPalPayment) Process(amount float64) error {
	// In production, integrate with PayPal API
	fmt.Printf("Processing $%.2f via PayPal account %s\\n", amount, pp.Email)
	return nil	// return nil on success
}

// CryptoPayment implements PaymentMethod for cryptocurrency processing
type CryptoPayment struct {
	WalletAddress string	// cryptocurrency wallet address
}

// Process executes cryptocurrency payment
func (cp *CryptoPayment) Process(amount float64) error {
	// In production, integrate with blockchain API
	fmt.Printf("Processing $%.2f via Crypto wallet %s\\n", amount, cp.WalletAddress[:10]+"...")
	return nil	// return nil on success
}

// PaymentProcessor is now CLOSED for modification
// It works with any PaymentMethod without knowing implementation details
type PaymentProcessor struct{}

// Process handles payment using polymorphism
// This method NEVER needs to change when adding new payment types!
func (pp *PaymentProcessor) Process(method PaymentMethod, amount float64) error {
	// Delegate to the specific payment method implementation
	// Don't care about HOW it processes, just that it implements the interface
	return method.Process(amount)	// polymorphic call - works with any PaymentMethod
}

// Want to add Bitcoin? Just create BitcoinPayment implementing PaymentMethod
// type BitcoinPayment struct { Address string }
// func (bp *BitcoinPayment) Process(amount float64) error { ... }
// NO changes to PaymentProcessor needed!`,
	hint1: `For each payment implementation (CreditCard, PayPal, Crypto), implement the Process method that prints a message like "Processing $X via [Type]" and returns nil. Use fmt.Printf with the amount and the relevant field (CardNumber, Email, WalletAddress).`,
	hint2: `For PaymentProcessor.Process, simply call method.Process(amount) and return its result. The interface handles the polymorphism - you don't need to know which concrete type it is.`,
	testCode: `package principles

import "testing"

// Test1: CreditCardPayment.Process returns nil
func Test1(t *testing.T) {
	cc := &CreditCardPayment{CardNumber: "1234-5678-9012-3456"}
	err := cc.Process(100.00)
	if err != nil {
		t.Errorf("CreditCardPayment.Process error: %v", err)
	}
}

// Test2: PayPalPayment.Process returns nil
func Test2(t *testing.T) {
	pp := &PayPalPayment{Email: "user@example.com"}
	err := pp.Process(50.00)
	if err != nil {
		t.Errorf("PayPalPayment.Process error: %v", err)
	}
}

// Test3: CryptoPayment.Process returns nil
func Test3(t *testing.T) {
	cp := &CryptoPayment{WalletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}
	err := cp.Process(25.00)
	if err != nil {
		t.Errorf("CryptoPayment.Process error: %v", err)
	}
}

// Test4: PaymentProcessor.Process works with CreditCard
func Test4(t *testing.T) {
	processor := &PaymentProcessor{}
	cc := &CreditCardPayment{CardNumber: "4111111111111111"}
	err := processor.Process(cc, 200.00)
	if err != nil {
		t.Errorf("Process with CreditCard error: %v", err)
	}
}

// Test5: PaymentProcessor.Process works with PayPal
func Test5(t *testing.T) {
	processor := &PaymentProcessor{}
	pp := &PayPalPayment{Email: "test@paypal.com"}
	err := processor.Process(pp, 75.50)
	if err != nil {
		t.Errorf("Process with PayPal error: %v", err)
	}
}

// Test6: PaymentProcessor.Process works with Crypto
func Test6(t *testing.T) {
	processor := &PaymentProcessor{}
	cp := &CryptoPayment{WalletAddress: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"}
	err := processor.Process(cp, 0.05)
	if err != nil {
		t.Errorf("Process with Crypto error: %v", err)
	}
}

// Test7: All payment types implement PaymentMethod interface
func Test7(t *testing.T) {
	var method PaymentMethod

	method = &CreditCardPayment{CardNumber: "1234"}
	_ = method

	method = &PayPalPayment{Email: "test@test.com"}
	_ = method

	method = &CryptoPayment{WalletAddress: "0x123"}
	_ = method
}

// Test8: Process different amounts correctly
func Test8(t *testing.T) {
	amounts := []float64{0.01, 1.00, 100.00, 10000.00}
	processor := &PaymentProcessor{}
	cc := &CreditCardPayment{CardNumber: "1234567890123456"}

	for _, amt := range amounts {
		if err := processor.Process(cc, amt); err != nil {
			t.Errorf("Process(%v) error: %v", amt, err)
		}
	}
}

// Test9: PaymentProcessor is reusable
func Test9(t *testing.T) {
	processor := &PaymentProcessor{}
	cc := &CreditCardPayment{CardNumber: "1111222233334444"}
	pp := &PayPalPayment{Email: "reuse@test.com"}

	processor.Process(cc, 10.00)
	processor.Process(pp, 20.00)
	processor.Process(cc, 30.00)
}

// Test10: Zero amount works
func Test10(t *testing.T) {
	processor := &PaymentProcessor{}
	pp := &PayPalPayment{Email: "zero@test.com"}
	err := processor.Process(pp, 0.00)
	if err != nil {
		t.Errorf("Process with zero amount error: %v", err)
	}
}
`,
	whyItMatters: `The Open/Closed Principle is essential for building extensible systems that don't break when requirements change.

**Why OCP Matters:**

**1. The Cost of Modification**

\`\`\`go
// VIOLATES OCP - Must modify code to add features
type Discount struct{}

func (d *Discount) Calculate(customerType string, amount float64) float64 {
	if customerType == "regular" {
		return amount	// no discount
	} else if customerType == "premium" {
		return amount * 0.9	// 10% discount
	}
	// New requirement: add VIP customers with 20% discount
	// Must MODIFY this method - risk breaking existing discounts!
	else if customerType == "vip" {
		return amount * 0.8	// 20% discount
	}
	return amount
}

// FOLLOWS OCP - Extend without modifying
type DiscountStrategy interface {
	Apply(amount float64) float64
}

type RegularDiscount struct{}
func (r *RegularDiscount) Apply(amount float64) float64 {
	return amount	// existing code never changes
}

type PremiumDiscount struct{}
func (p *PremiumDiscount) Apply(amount float64) float64 {
	return amount * 0.9	// existing code never changes
}

// New requirement: add VIP - just create new type!
type VIPDiscount struct{}
func (v *VIPDiscount) Apply(amount float64) float64 {
	return amount * 0.8	// NEW code, didn't touch existing
}

// Calculator is closed for modification
type DiscountCalculator struct{}
func (dc *DiscountCalculator) Calculate(strategy DiscountStrategy, amount float64) float64 {
	return strategy.Apply(amount)	// works with any strategy, never needs to change
}
\`\`\`

**2. Real Production Scenario: Notification System**

\`\`\`go
// WITHOUT OCP - Notification system that violates OCP
type NotificationService struct{}

func (ns *NotificationService) Send(notificationType, recipient, message string) error {
	if notificationType == "email" {
		// send email
		return sendEmail(recipient, message)
	} else if notificationType == "sms" {
		// send SMS
		return sendSMS(recipient, message)
	}
	// New requirement: add Slack notifications
	// Must MODIFY this method - what if we break email/SMS?
	else if notificationType == "slack" {
		return sendSlack(recipient, message)
	}
	// New requirement: add Push notifications
	// MODIFY again - keeps growing, risk increases!
	else if notificationType == "push" {
		return sendPush(recipient, message)
	}
	return errors.New("unknown notification type")
}

// WITH OCP - Extensible notification system
type Notifier interface {
	Send(recipient, message string) error
}

type EmailNotifier struct{}
func (en *EmailNotifier) Send(recipient, message string) error {
	return sendEmail(recipient, message)	// stable, tested, working
}

type SMSNotifier struct{}
func (sn *SMSNotifier) Send(recipient, message string) error {
	return sendSMS(recipient, message)	// stable, tested, working
}

// New requirement: add Slack - just implement interface
type SlackNotifier struct{}
func (sn *SlackNotifier) Send(recipient, message string) error {
	return sendSlack(recipient, message)	// new code, existing untouched
}

// New requirement: add Push - just implement interface
type PushNotifier struct{}
func (pn *PushNotifier) Send(recipient, message string) error {
	return sendPush(recipient, message)	// new code, existing untouched
}

type NotificationService struct{}
func (ns *NotificationService) Notify(notifier Notifier, recipient, message string) error {
	return notifier.Send(recipient, message)	// never changes!
}
\`\`\`

**3. Testing Benefits**

\`\`\`go
// WITH OCP - Easy to test new features in isolation
type MockPayment struct {
	ProcessCalled bool
}

func (mp *MockPayment) Process(amount float64) error {
	mp.ProcessCalled = true
	return nil
}

func TestPaymentProcessor(t *testing.T) {
	mock := &MockPayment{}
	processor := &PaymentProcessor{}

	processor.Process(mock, 100.00)

	if !mock.ProcessCalled {
		t.Error("Process was not called")
	}
	// Test passes without touching real payment gateways!
}

// Test new Bitcoin payment without affecting existing tests
func TestBitcoinPayment(t *testing.T) {
	bitcoin := &BitcoinPayment{Address: "bc1q..."}
	err := bitcoin.Process(50.00)
	// Test only Bitcoin logic, existing payment tests unaffected
}
\`\`\`

**4. Real-World: Plugin Architecture**

\`\`\`go
// Go's standard library follows OCP extensively

// io.Reader interface is closed for modification
type Reader interface {
	Read(p []byte) (n int, err error)
}

// But open for extension - countless implementations:
// - os.File (read from file)
// - bytes.Buffer (read from memory)
// - http.Response.Body (read from network)
// - gzip.Reader (read compressed data)
// - strings.Reader (read from string)

// Functions accept interface, work with any implementation
func ioutil.ReadAll(r io.Reader) ([]byte, error) {
	// Works with files, network, memory, compression, etc.
	// Never needs to change when new Reader types are added!
}
\`\`\`

**5. Signs of OCP Violations**

Your code violates OCP if:
- Adding feature requires modifying existing functions
- Long if-else or switch statements on types
- Fragile code that breaks when adding features
- Can't add functionality without changing core code
- Tests break when adding new variants

**When to Apply OCP:**
- Code with multiple variants of similar behavior
- Systems that need to support plugins
- When requirements frequently add new types
- Building frameworks or libraries
- Anywhere you see type checking (if type == "x")`,
	order: 2,
	translations: {
		ru: {
			title: 'Принцип открытости/закрытости',
			description: `Реализуйте принцип открытости/закрытости (OCP) - программные сущности должны быть открыты для расширения, но закрыты для модификации.

**Текущая проблема:**

PaymentProcessor с жёстко закодированными методами оплаты требует модификации существующего кода для добавления новых типов платежей.

**Ваша задача:**

Рефакторить для использования интерфейсов, чтобы новые методы оплаты можно было добавлять без модификации существующего кода.`,
			hint1: `Для каждой реализации платежа (CreditCard, PayPal, Crypto) реализуйте метод Process, который выводит сообщение "Processing $X via [Type]" и возвращает nil. Используйте fmt.Printf с amount и соответствующим полем.`,
			hint2: `Для PaymentProcessor.Process просто вызовите method.Process(amount) и верните результат. Интерфейс обрабатывает полиморфизм - не нужно знать конкретный тип.`,
			whyItMatters: `Принцип открытости/закрытости необходим для создания расширяемых систем, которые не ломаются при изменении требований.`,
			solutionCode: `package principles

import "fmt"

type PaymentMethod interface {
	Process(amount float64) error
}

type CreditCardPayment struct {
	CardNumber string
}

func (cc *CreditCardPayment) Process(amount float64) error {
	fmt.Printf("Обработка $%.2f через кредитную карту %s\\n",
		amount, cc.CardNumber[len(cc.CardNumber)-4:])
	return nil
}

type PayPalPayment struct {
	Email string
}

func (pp *PayPalPayment) Process(amount float64) error {
	fmt.Printf("Обработка $%.2f через PayPal аккаунт %s\\n", amount, pp.Email)
	return nil
}

type CryptoPayment struct {
	WalletAddress string
}

func (cp *CryptoPayment) Process(amount float64) error {
	fmt.Printf("Обработка $%.2f через крипто-кошелёк %s\\n", amount, cp.WalletAddress[:10]+"...")
	return nil
}

type PaymentProcessor struct{}

func (pp *PaymentProcessor) Process(method PaymentMethod, amount float64) error {
	return method.Process(amount)
}`
		},
		uz: {
			title: 'Ochiq/Yopiq printsipi',
			description: `Ochiq/Yopiq prinsipini (OCP) amalga oshiring - dasturiy ob'ektlar kengaytirish uchun ochiq, lekin o'zgartirish uchun yopiq bo'lishi kerak.

**Hozirgi muammo:**

Qattiq practixngan to'lov usullari bilan PaymentProcessor yangi to'lov turlarini qo'shish uchun mavjud kodni o'zgartirishni talab qiladi.

**Sizning vazifangiz:**

Yangi to'lov usullarini mavjud kodni o'zgartirmasdan qo'shish uchun interfeyslardan foydalanish uchun refaktoring qiling.`,
			hint1: `Har bir to'lov amalga oshirish uchun (CreditCard, PayPal, Crypto) "Processing $X via [Type]" xabarini chiqaruvchi va nil qaytaruvchi Process metodini amalga oshiring. amount va tegishli maydon bilan fmt.Printf dan foydalaning.`,
			hint2: `PaymentProcessor.Process uchun shunchaki method.Process(amount) ni chaqiring va natijasini qaytaring. Interfeys polimorfizmni boshqaradi - aniq turni bilishingiz shart emas.`,
			whyItMatters: `Ochiq/Yopiq printsipi talablar o'zgarganda sinmaydigan kengaytiriladigan tizimlarni qurish uchun zarur.`,
			solutionCode: `package principles

import "fmt"

type PaymentMethod interface {
	Process(amount float64) error
}

type CreditCardPayment struct {
	CardNumber string
}

func (cc *CreditCardPayment) Process(amount float64) error {
	fmt.Printf("$%.2f kredit karta %s orqali qayta ishlanmoqda\\n",
		amount, cc.CardNumber[len(cc.CardNumber)-4:])
	return nil
}

type PayPalPayment struct {
	Email string
}

func (pp *PayPalPayment) Process(amount float64) error {
	fmt.Printf("$%.2f PayPal akkaunti %s orqali qayta ishlanmoqda\\n", amount, pp.Email)
	return nil
}

type CryptoPayment struct {
	WalletAddress string
}

func (cp *CryptoPayment) Process(amount float64) error {
	fmt.Printf("$%.2f kripto hamyon %s orqali qayta ishlanmoqda\\n", amount, cp.WalletAddress[:10]+"...")
	return nil
}

type PaymentProcessor struct{}

func (pp *PaymentProcessor) Process(method PaymentMethod, amount float64) error {
	return method.Process(amount)
}`
		}
	}
};

export default task;
