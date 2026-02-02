import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'java-dp-factory-method',
	title: 'Factory Method Pattern',
	difficulty: 'medium',
	tags: ['java', 'design-patterns', 'creational', 'factory-method'],
	estimatedTime: '30m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement the Factory Method pattern in Java - define an interface for creating objects, letting subclasses decide which class to instantiate.

**You will implement:**

1. **Document interface** - open(), save() methods
2. **PDFDocument, WordDocument** - Concrete products
3. **DocumentFactory abstract class** - Creator with factory method
4. **PDFFactory, WordFactory** - Concrete creators

**Example Usage:**

\`\`\`java
DocumentFactory factory = new PDFFactory();	// create concrete creator
Document doc = factory.createDocument();	// factory method creates product
String result = doc.open();	// "Opening PDF document"
String saved = doc.save();	// "Saving PDF document"

// Using template method
DocumentFactory wordFactory = new WordFactory();	// another creator
String opened = wordFactory.openDocument();	// template method uses factory method internally
\`\`\``,
	initialCode: `interface Document {
    String open();
    String save();
}

class PDFDocument implements Document {
    @Override
    public String open() {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public String save() {
        throw new UnsupportedOperationException("TODO");
    }
}

class WordDocument implements Document {
    @Override
    public String open() {
        throw new UnsupportedOperationException("TODO");
    }

    @Override
    public String save() {
        throw new UnsupportedOperationException("TODO");
    }
}

abstract class DocumentFactory {
    public abstract Document createDocument();

    public String openDocument() {
    }
}

class PDFFactory extends DocumentFactory {
    @Override
    public Document createDocument() {
        throw new UnsupportedOperationException("TODO");
    }
}

class WordFactory extends DocumentFactory {
    @Override
    public Document createDocument() {
        throw new UnsupportedOperationException("TODO");
    }
}`,
	solutionCode: `interface Document {	// Product interface - defines what all documents can do
    String open();	// open operation contract
    String save();	// save operation contract
}

class PDFDocument implements Document {	// Concrete Product - PDF implementation
    @Override
    public String open() {	// implement open for PDF
        return "Opening PDF document";	// PDF-specific behavior
    }

    @Override
    public String save() {	// implement save for PDF
        return "Saving PDF document";	// PDF-specific persistence
    }
}

class WordDocument implements Document {	// Concrete Product - Word implementation
    @Override
    public String open() {	// implement open for Word
        return "Opening Word document";	// Word-specific behavior
    }

    @Override
    public String save() {	// implement save for Word
        return "Saving Word document";	// Word-specific persistence
    }
}

abstract class DocumentFactory {	// Creator - declares the factory method
    public abstract Document createDocument();	// factory method - subclasses implement

    public String openDocument() {	// template method - uses factory method
        Document doc = createDocument();	// delegate creation to subclass
        return doc.open();	// use the created product
    }
}

class PDFFactory extends DocumentFactory {	// Concrete Creator - creates PDF documents
    @Override
    public Document createDocument() {	// implement factory method
        return new PDFDocument();	// return concrete product instance
    }
}

class WordFactory extends DocumentFactory {	// Concrete Creator - creates Word documents
    @Override
    public Document createDocument() {	// implement factory method
        return new WordDocument();	// return concrete product instance
    }
}`,
	hint1: `**Document Interface and Implementations:**

The Document interface defines the contract for all document types:

\`\`\`java
interface Document {
    String open();	// opens the document
    String save();	// saves the document
}
\`\`\`

Each concrete product implements the interface with specific behavior:

\`\`\`java
class PDFDocument implements Document {
    @Override
    public String open() {
        return "Opening PDF document";	// PDF-specific message
    }

    @Override
    public String save() {
        return "Saving PDF document";	// PDF-specific message
    }
}
\`\`\`

WordDocument follows the same pattern but returns Word-specific messages.`,
	hint2: `**Factory Classes:**

The abstract factory defines the factory method that subclasses must implement:

\`\`\`java
abstract class DocumentFactory {
    public abstract Document createDocument();	// factory method - subclasses decide what to create

    public String openDocument() {	// template method pattern
        Document doc = createDocument();	// uses factory method
        return doc.open();	// operates on product
    }
}
\`\`\`

Concrete factories implement the factory method:

\`\`\`java
class PDFFactory extends DocumentFactory {
    @Override
    public Document createDocument() {
        return new PDFDocument();	// this factory creates PDF documents
    }
}

class WordFactory extends DocumentFactory {
    @Override
    public Document createDocument() {
        return new WordDocument();	// this factory creates Word documents
    }
}
\`\`\``,
	whyItMatters: `## Why Factory Method Exists

Factory Method solves the problem of creating objects without specifying exact classes. It provides a way to delegate instantiation to subclasses.

**Problem - Tight Coupling to Concrete Classes:**

\`\`\`java
// ❌ Bad: Client code tightly coupled to concrete classes
class DocumentProcessor {
    public void process(String type) {
        Document doc;
        if (type.equals("pdf")) {
            doc = new PDFDocument();	// hardcoded dependency
        } else if (type.equals("word")) {
            doc = new WordDocument();	// another hardcoded dependency
        } else {
            throw new IllegalArgumentException("Unknown type");
        }
        doc.open();
    }
}
\`\`\`

**Solution - Factory Method Decouples Creation:**

\`\`\`java
// ✅ Good: Client works with abstract factory
class DocumentProcessor {
    private final DocumentFactory factory;	// depends on abstraction

    public DocumentProcessor(DocumentFactory factory) {
        this.factory = factory;	// inject the factory
    }

    public void process() {
        Document doc = factory.createDocument();	// factory handles creation
        doc.open();	// work with abstract product
    }
}
\`\`\`

---

## Real-World Examples

1. **java.util.Calendar.getInstance()** - Returns Calendar subclass based on locale
2. **java.text.NumberFormat.getInstance()** - Returns locale-specific formatter
3. **JDBC DriverManager.getConnection()** - Returns database-specific Connection
4. **javax.xml.parsers.DocumentBuilderFactory** - Creates XML parser implementations
5. **Spring Framework BeanFactory** - Creates and manages beans

---

## Production Pattern: Payment Gateway Factory

\`\`\`java
// Product interface
interface PaymentGateway {	// defines payment operations
    PaymentResult processPayment(PaymentRequest request);	// process a payment
    RefundResult refundPayment(String transactionId, BigDecimal amount);	// issue refund
    PaymentStatus checkStatus(String transactionId);	// check payment status
}

// Concrete Products
class StripeGateway implements PaymentGateway {	// Stripe implementation
    private final String apiKey;	// Stripe API key

    public StripeGateway(String apiKey) {	// constructor with config
        this.apiKey = apiKey;	// store the API key
    }

    @Override
    public PaymentResult processPayment(PaymentRequest request) {	// Stripe payment processing
        // Stripe API call implementation
        return new PaymentResult("stripe_txn_" + UUID.randomUUID(), PaymentStatus.SUCCESS);
    }

    @Override
    public RefundResult refundPayment(String transactionId, BigDecimal amount) {	// Stripe refund
        return new RefundResult(transactionId, amount, RefundStatus.COMPLETED);
    }

    @Override
    public PaymentStatus checkStatus(String transactionId) {	// Stripe status check
        return PaymentStatus.SUCCESS;	// simplified implementation
    }
}

class PayPalGateway implements PaymentGateway {	// PayPal implementation
    private final String clientId;	// PayPal client ID
    private final String clientSecret;	// PayPal secret

    public PayPalGateway(String clientId, String clientSecret) {	// constructor with credentials
        this.clientId = clientId;	// store client ID
        this.clientSecret = clientSecret;	// store secret
    }

    @Override
    public PaymentResult processPayment(PaymentRequest request) {	// PayPal payment processing
        // PayPal API call implementation
        return new PaymentResult("paypal_" + UUID.randomUUID(), PaymentStatus.SUCCESS);
    }

    @Override
    public RefundResult refundPayment(String transactionId, BigDecimal amount) {	// PayPal refund
        return new RefundResult(transactionId, amount, RefundStatus.COMPLETED);
    }

    @Override
    public PaymentStatus checkStatus(String transactionId) {	// PayPal status check
        return PaymentStatus.SUCCESS;	// simplified implementation
    }
}

// Abstract Creator
abstract class PaymentGatewayFactory {	// factory base class
    protected abstract PaymentGateway createGateway();	// factory method - subclasses implement

    public PaymentResult executePayment(PaymentRequest request) {	// template method
        PaymentGateway gateway = createGateway();	// create via factory method
        validateRequest(request);	// common validation
        return gateway.processPayment(request);	// delegate to gateway
    }

    private void validateRequest(PaymentRequest request) {	// shared validation logic
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
    }
}

// Concrete Creators
class StripeGatewayFactory extends PaymentGatewayFactory {	// creates Stripe gateways
    private final String apiKey;	// configuration

    public StripeGatewayFactory(String apiKey) {	// factory configured at construction
        this.apiKey = apiKey;	// store config
    }

    @Override
    protected PaymentGateway createGateway() {	// implement factory method
        return new StripeGateway(apiKey);	// create configured Stripe gateway
    }
}

class PayPalGatewayFactory extends PaymentGatewayFactory {	// creates PayPal gateways
    private final String clientId;	// PayPal client ID
    private final String clientSecret;	// PayPal secret

    public PayPalGatewayFactory(String clientId, String clientSecret) {	// constructor
        this.clientId = clientId;	// store credentials
        this.clientSecret = clientSecret;	// store credentials
    }

    @Override
    protected PaymentGateway createGateway() {	// implement factory method
        return new PayPalGateway(clientId, clientSecret);	// create configured PayPal gateway
    }
}

// Usage
class PaymentService {	// high-level service
    private final PaymentGatewayFactory factory;	// depends on abstract factory

    public PaymentService(PaymentGatewayFactory factory) {	// inject factory
        this.factory = factory;	// store reference
    }

    public PaymentResult checkout(Cart cart) {	// business operation
        PaymentRequest request = new PaymentRequest(cart.getTotal(), cart.getCurrency());
        return factory.executePayment(request);	// factory handles creation and processing
    }
}
\`\`\`

---

## Common Mistakes to Avoid

1. **Returning null from factory method** - Always return valid instance or throw exception
2. **Too many conditional branches** - If you have many if-else in factory, consider Abstract Factory
3. **Not making factory method protected/public** - It must be overridable by subclasses
4. **Forgetting template method** - Factory often pairs with Template Method for common operations`,
	order: 1,
	testCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Test1 {
    @Test
    void pdfDocumentOpenReturnsPDFMessage() {
        Document doc = new PDFDocument();
        String result = doc.open();
        assertTrue(result.contains("PDF"), "PDFDocument.open should mention PDF");
    }
}

class Test2 {
    @Test
    void pdfDocumentSaveReturnsPDFMessage() {
        Document doc = new PDFDocument();
        String result = doc.save();
        assertTrue(result.contains("PDF"), "PDFDocument.save should mention PDF");
    }
}

class Test3 {
    @Test
    void wordDocumentOpenReturnsWordMessage() {
        Document doc = new WordDocument();
        String result = doc.open();
        assertTrue(result.contains("Word"), "WordDocument.open should mention Word");
    }
}

class Test4 {
    @Test
    void wordDocumentSaveReturnsWordMessage() {
        Document doc = new WordDocument();
        String result = doc.save();
        assertTrue(result.contains("Word"), "WordDocument.save should mention Word");
    }
}

class Test5 {
    @Test
    void pdfFactoryCreatesPDFDocument() {
        DocumentFactory factory = new PDFFactory();
        Document doc = factory.createDocument();
        assertTrue(doc instanceof PDFDocument, "PDFFactory should create PDFDocument");
    }
}

class Test6 {
    @Test
    void wordFactoryCreatesWordDocument() {
        DocumentFactory factory = new WordFactory();
        Document doc = factory.createDocument();
        assertTrue(doc instanceof WordDocument, "WordFactory should create WordDocument");
    }
}

class Test7 {
    @Test
    void openDocumentUsesPDFFactory() {
        DocumentFactory factory = new PDFFactory();
        String result = factory.openDocument();
        assertTrue(result.contains("PDF"), "openDocument should use PDF product");
    }
}

class Test8 {
    @Test
    void openDocumentUsesWordFactory() {
        DocumentFactory factory = new WordFactory();
        String result = factory.openDocument();
        assertTrue(result.contains("Word"), "openDocument should use Word product");
    }
}

class Test9 {
    @Test
    void factoriesCreateDifferentProducts() {
        DocumentFactory pdfFactory = new PDFFactory();
        DocumentFactory wordFactory = new WordFactory();
        assertNotEquals(pdfFactory.createDocument().getClass(), wordFactory.createDocument().getClass());
    }
}

class Test10 {
    @Test
    void documentInterfaceImplemented() {
        Document pdf = new PDFDocument();
        Document word = new WordDocument();
        assertNotNull(pdf.open());
        assertNotNull(pdf.save());
        assertNotNull(word.open());
        assertNotNull(word.save());
    }
}
`,
	translations: {
		ru: {
			title: 'Паттерн Factory Method (Фабричный метод)',
			description: `Реализуйте паттерн Factory Method на Java — определите интерфейс создания объектов, позволяя подклассам решать, какой класс инстанцировать.

**Вы реализуете:**

1. **Интерфейс Document** - методы open(), save()
2. **PDFDocument, WordDocument** - Конкретные продукты
3. **Абстрактный класс DocumentFactory** - Создатель с фабричным методом
4. **PDFFactory, WordFactory** - Конкретные создатели

**Пример использования:**

\`\`\`java
DocumentFactory factory = new PDFFactory();	// создаём конкретного создателя
Document doc = factory.createDocument();	// фабричный метод создаёт продукт
String result = doc.open();	// "Opening PDF document"
String saved = doc.save();	// "Saving PDF document"

// Использование шаблонного метода
DocumentFactory wordFactory = new WordFactory();	// другой создатель
String opened = wordFactory.openDocument();	// шаблонный метод использует фабричный метод внутри
\`\`\``,
			hint1: `**Интерфейс Document и реализации:**

Интерфейс Document определяет контракт для всех типов документов:

\`\`\`java
interface Document {
    String open();	// открывает документ
    String save();	// сохраняет документ
}
\`\`\`

Каждый конкретный продукт реализует интерфейс со специфическим поведением:

\`\`\`java
class PDFDocument implements Document {
    @Override
    public String open() {
        return "Opening PDF document";	// сообщение специфичное для PDF
    }

    @Override
    public String save() {
        return "Saving PDF document";	// сообщение специфичное для PDF
    }
}
\`\`\`

WordDocument следует той же схеме, но возвращает сообщения для Word.`,
			hint2: `**Классы фабрик:**

Абстрактная фабрика определяет фабричный метод, который подклассы должны реализовать:

\`\`\`java
abstract class DocumentFactory {
    public abstract Document createDocument();	// фабричный метод - подклассы решают что создавать

    public String openDocument() {	// паттерн шаблонный метод
        Document doc = createDocument();	// использует фабричный метод
        return doc.open();	// работает с продуктом
    }
}
\`\`\`

Конкретные фабрики реализуют фабричный метод:

\`\`\`java
class PDFFactory extends DocumentFactory {
    @Override
    public Document createDocument() {
        return new PDFDocument();	// эта фабрика создаёт PDF документы
    }
}

class WordFactory extends DocumentFactory {
    @Override
    public Document createDocument() {
        return new WordDocument();	// эта фабрика создаёт Word документы
    }
}
\`\`\``,
			whyItMatters: `## Зачем нужен Factory Method

Factory Method решает проблему создания объектов без указания конкретных классов. Он предоставляет способ делегировать инстанцирование подклассам.

**Проблема - Жёсткая связь с конкретными классами:**

\`\`\`java
// ❌ Плохо: Клиентский код жёстко связан с конкретными классами
class DocumentProcessor {
    public void process(String type) {
        Document doc;
        if (type.equals("pdf")) {
            doc = new PDFDocument();	// жёстко закодированная зависимость
        } else if (type.equals("word")) {
            doc = new WordDocument();	// ещё одна жёсткая зависимость
        } else {
            throw new IllegalArgumentException("Unknown type");
        }
        doc.open();
    }
}
\`\`\`

**Решение - Factory Method развязывает создание:**

\`\`\`java
// ✅ Хорошо: Клиент работает с абстрактной фабрикой
class DocumentProcessor {
    private final DocumentFactory factory;	// зависит от абстракции

    public DocumentProcessor(DocumentFactory factory) {
        this.factory = factory;	// внедряем фабрику
    }

    public void process() {
        Document doc = factory.createDocument();	// фабрика обрабатывает создание
        doc.open();	// работаем с абстрактным продуктом
    }
}
\`\`\`

---

## Примеры из реального мира

1. **java.util.Calendar.getInstance()** - Возвращает подкласс Calendar на основе локали
2. **java.text.NumberFormat.getInstance()** - Возвращает форматтер для конкретной локали
3. **JDBC DriverManager.getConnection()** - Возвращает Connection для конкретной БД
4. **javax.xml.parsers.DocumentBuilderFactory** - Создаёт реализации XML парсера
5. **Spring Framework BeanFactory** - Создаёт и управляет бинами

---

## Production паттерн: Фабрика платёжных шлюзов

\`\`\`java
// Интерфейс продукта
interface PaymentGateway {	// определяет операции оплаты
    PaymentResult processPayment(PaymentRequest request);	// обработать платёж
    RefundResult refundPayment(String transactionId, BigDecimal amount);	// сделать возврат
    PaymentStatus checkStatus(String transactionId);	// проверить статус платежа
}

// Конкретные продукты
class StripeGateway implements PaymentGateway {	// реализация Stripe
    private final String apiKey;	// API ключ Stripe

    public StripeGateway(String apiKey) {	// конструктор с конфигурацией
        this.apiKey = apiKey;	// сохраняем API ключ
    }

    @Override
    public PaymentResult processPayment(PaymentRequest request) {	// обработка платежа Stripe
        // Реализация вызова Stripe API
        return new PaymentResult("stripe_txn_" + UUID.randomUUID(), PaymentStatus.SUCCESS);
    }

    @Override
    public RefundResult refundPayment(String transactionId, BigDecimal amount) {	// возврат Stripe
        return new RefundResult(transactionId, amount, RefundStatus.COMPLETED);
    }

    @Override
    public PaymentStatus checkStatus(String transactionId) {	// проверка статуса Stripe
        return PaymentStatus.SUCCESS;	// упрощённая реализация
    }
}

class PayPalGateway implements PaymentGateway {	// реализация PayPal
    private final String clientId;	// client ID PayPal
    private final String clientSecret;	// секрет PayPal

    public PayPalGateway(String clientId, String clientSecret) {	// конструктор с учётными данными
        this.clientId = clientId;	// сохраняем client ID
        this.clientSecret = clientSecret;	// сохраняем секрет
    }

    @Override
    public PaymentResult processPayment(PaymentRequest request) {	// обработка платежа PayPal
        // Реализация вызова PayPal API
        return new PaymentResult("paypal_" + UUID.randomUUID(), PaymentStatus.SUCCESS);
    }

    @Override
    public RefundResult refundPayment(String transactionId, BigDecimal amount) {	// возврат PayPal
        return new RefundResult(transactionId, amount, RefundStatus.COMPLETED);
    }

    @Override
    public PaymentStatus checkStatus(String transactionId) {	// проверка статуса PayPal
        return PaymentStatus.SUCCESS;	// упрощённая реализация
    }
}

// Абстрактный создатель
abstract class PaymentGatewayFactory {	// базовый класс фабрики
    protected abstract PaymentGateway createGateway();	// фабричный метод - подклассы реализуют

    public PaymentResult executePayment(PaymentRequest request) {	// шаблонный метод
        PaymentGateway gateway = createGateway();	// создаём через фабричный метод
        validateRequest(request);	// общая валидация
        return gateway.processPayment(request);	// делегируем шлюзу
    }

    private void validateRequest(PaymentRequest request) {	// общая логика валидации
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
    }
}

// Конкретные создатели
class StripeGatewayFactory extends PaymentGatewayFactory {	// создаёт Stripe шлюзы
    private final String apiKey;	// конфигурация

    public StripeGatewayFactory(String apiKey) {	// фабрика настраивается при создании
        this.apiKey = apiKey;	// сохраняем конфигурацию
    }

    @Override
    protected PaymentGateway createGateway() {	// реализуем фабричный метод
        return new StripeGateway(apiKey);	// создаём настроенный Stripe шлюз
    }
}

class PayPalGatewayFactory extends PaymentGatewayFactory {	// создаёт PayPal шлюзы
    private final String clientId;	// PayPal client ID
    private final String clientSecret;	// PayPal секрет

    public PayPalGatewayFactory(String clientId, String clientSecret) {	// конструктор
        this.clientId = clientId;	// сохраняем учётные данные
        this.clientSecret = clientSecret;	// сохраняем учётные данные
    }

    @Override
    protected PaymentGateway createGateway() {	// реализуем фабричный метод
        return new PayPalGateway(clientId, clientSecret);	// создаём настроенный PayPal шлюз
    }
}

// Использование
class PaymentService {	// высокоуровневый сервис
    private final PaymentGatewayFactory factory;	// зависит от абстрактной фабрики

    public PaymentService(PaymentGatewayFactory factory) {	// внедряем фабрику
        this.factory = factory;	// сохраняем ссылку
    }

    public PaymentResult checkout(Cart cart) {	// бизнес-операция
        PaymentRequest request = new PaymentRequest(cart.getTotal(), cart.getCurrency());
        return factory.executePayment(request);	// фабрика обрабатывает создание и обработку
    }
}
\`\`\`

---

## Частые ошибки, которых следует избегать

1. **Возврат null из фабричного метода** - Всегда возвращайте валидный экземпляр или бросайте исключение
2. **Слишком много условных ветвей** - Если много if-else в фабрике, рассмотрите Abstract Factory
3. **Не делать фабричный метод protected/public** - Он должен быть переопределяемым подклассами
4. **Забывать о шаблонном методе** - Factory часто сочетается с Template Method для общих операций`
		},
		uz: {
			title: 'Factory Method (Fabrika Metodi) Pattern',
			description: `Java da Factory Method patternini amalga oshiring — ob'ektlar yaratish interfeysini aniqlang, pastki sinflarga qaysi klassni yaratishni hal qilishga ruxsat bering.

**Siz amalga oshirasiz:**

1. **Document interfeysi** - open(), save() metodlari
2. **PDFDocument, WordDocument** - Konkret mahsulotlar
3. **DocumentFactory abstrakt klassi** - Fabrika metodi bilan yaratuvchi
4. **PDFFactory, WordFactory** - Konkret yaratuvchilar

**Foydalanish misoli:**

\`\`\`java
DocumentFactory factory = new PDFFactory();	// konkret yaratuvchini yaratamiz
Document doc = factory.createDocument();	// fabrika metodi mahsulot yaratadi
String result = doc.open();	// "Opening PDF document"
String saved = doc.save();	// "Saving PDF document"

// Shablon metodidan foydalanish
DocumentFactory wordFactory = new WordFactory();	// boshqa yaratuvchi
String opened = wordFactory.openDocument();	// shablon metodi ichida fabrika metodidan foydalanadi
\`\`\``,
			hint1: `**Document interfeysi va amalga oshirishlar:**

Document interfeysi barcha hujjat turlari uchun shartnomani belgilaydi:

\`\`\`java
interface Document {
    String open();	// hujjatni ochadi
    String save();	// hujjatni saqlaydi
}
\`\`\`

Har bir konkret mahsulot interfeysni o'ziga xos xatti-harakat bilan amalga oshiradi:

\`\`\`java
class PDFDocument implements Document {
    @Override
    public String open() {
        return "Opening PDF document";	// PDF ga xos xabar
    }

    @Override
    public String save() {
        return "Saving PDF document";	// PDF ga xos xabar
    }
}
\`\`\`

WordDocument xuddi shunday sxemaga amal qiladi, lekin Word ga xos xabarlarni qaytaradi.`,
			hint2: `**Fabrika klasslari:**

Abstrakt fabrika pastki sinflar amalga oshirishi kerak bo'lgan fabrika metodini belgilaydi:

\`\`\`java
abstract class DocumentFactory {
    public abstract Document createDocument();	// fabrika metodi - pastki sinflar nimani yaratishni hal qiladi

    public String openDocument() {	// shablon metodi pattern
        Document doc = createDocument();	// fabrika metodidan foydalanadi
        return doc.open();	// mahsulot bilan ishlaydi
    }
}
\`\`\`

Konkret fabrikalar fabrika metodini amalga oshiradi:

\`\`\`java
class PDFFactory extends DocumentFactory {
    @Override
    public Document createDocument() {
        return new PDFDocument();	// bu fabrika PDF hujjatlarni yaratadi
    }
}

class WordFactory extends DocumentFactory {
    @Override
    public Document createDocument() {
        return new WordDocument();	// bu fabrika Word hujjatlarni yaratadi
    }
}
\`\`\``,
			whyItMatters: `## Factory Method nima uchun kerak

Factory Method ob'ektlarni konkret klasslarni ko'rsatmasdan yaratish muammosini hal qiladi. U instansiyalashni pastki sinflarga delegatsiya qilish usulini taqdim etadi.

**Muammo - Konkret klasslarga qattiq bog'liqlik:**

\`\`\`java
// ❌ Yomon: Klient kodi konkret klasslarga qattiq bog'langan
class DocumentProcessor {
    public void process(String type) {
        Document doc;
        if (type.equals("pdf")) {
            doc = new PDFDocument();	// qattiq practixngan bog'liqlik
        } else if (type.equals("word")) {
            doc = new WordDocument();	// yana bir qattiq bog'liqlik
        } else {
            throw new IllegalArgumentException("Unknown type");
        }
        doc.open();
    }
}
\`\`\`

**Yechim - Factory Method yaratishni ajratadi:**

\`\`\`java
// ✅ Yaxshi: Klient abstrakt fabrika bilan ishlaydi
class DocumentProcessor {
    private final DocumentFactory factory;	// abstraksiyaga bog'liq

    public DocumentProcessor(DocumentFactory factory) {
        this.factory = factory;	// fabrikani kiritamiz
    }

    public void process() {
        Document doc = factory.createDocument();	// fabrika yaratishni boshqaradi
        doc.open();	// abstrakt mahsulot bilan ishlaymiz
    }
}
\`\`\`

---

## Haqiqiy dunyo misollari

1. **java.util.Calendar.getInstance()** - Lokalga asoslangan Calendar pastki klassini qaytaradi
2. **java.text.NumberFormat.getInstance()** - Lokalga xos formatlash vositasini qaytaradi
3. **JDBC DriverManager.getConnection()** - Ma'lumotlar bazasiga xos Connection qaytaradi
4. **javax.xml.parsers.DocumentBuilderFactory** - XML parser amalga oshirishlarini yaratadi
5. **Spring Framework BeanFactory** - Beanlarni yaratadi va boshqaradi

---

## Production pattern: To'lov shlyuzi fabrikasi

\`\`\`java
// Mahsulot interfeysi
interface PaymentGateway {	// to'lov operatsiyalarini belgilaydi
    PaymentResult processPayment(PaymentRequest request);	// to'lovni qayta ishlash
    RefundResult refundPayment(String transactionId, BigDecimal amount);	// qaytarim berish
    PaymentStatus checkStatus(String transactionId);	// to'lov holatini tekshirish
}

// Konkret mahsulotlar
class StripeGateway implements PaymentGateway {	// Stripe amalga oshirish
    private final String apiKey;	// Stripe API kaliti

    public StripeGateway(String apiKey) {	// konfiguratsiya bilan konstruktor
        this.apiKey = apiKey;	// API kalitini saqlaymiz
    }

    @Override
    public PaymentResult processPayment(PaymentRequest request) {	// Stripe to'lov qayta ishlash
        // Stripe API chaqiruvi amalga oshirish
        return new PaymentResult("stripe_txn_" + UUID.randomUUID(), PaymentStatus.SUCCESS);
    }

    @Override
    public RefundResult refundPayment(String transactionId, BigDecimal amount) {	// Stripe qaytarim
        return new RefundResult(transactionId, amount, RefundStatus.COMPLETED);
    }

    @Override
    public PaymentStatus checkStatus(String transactionId) {	// Stripe holat tekshiruvi
        return PaymentStatus.SUCCESS;	// soddalashtirilgan amalga oshirish
    }
}

class PayPalGateway implements PaymentGateway {	// PayPal amalga oshirish
    private final String clientId;	// PayPal client ID
    private final String clientSecret;	// PayPal secret

    public PayPalGateway(String clientId, String clientSecret) {	// hisob ma'lumotlari bilan konstruktor
        this.clientId = clientId;	// client ID ni saqlaymiz
        this.clientSecret = clientSecret;	// secretni saqlaymiz
    }

    @Override
    public PaymentResult processPayment(PaymentRequest request) {	// PayPal to'lov qayta ishlash
        // PayPal API chaqiruvi amalga oshirish
        return new PaymentResult("paypal_" + UUID.randomUUID(), PaymentStatus.SUCCESS);
    }

    @Override
    public RefundResult refundPayment(String transactionId, BigDecimal amount) {	// PayPal qaytarim
        return new RefundResult(transactionId, amount, RefundStatus.COMPLETED);
    }

    @Override
    public PaymentStatus checkStatus(String transactionId) {	// PayPal holat tekshiruvi
        return PaymentStatus.SUCCESS;	// soddalashtirilgan amalga oshirish
    }
}

// Abstrakt yaratuvchi
abstract class PaymentGatewayFactory {	// fabrika bazaviy klassi
    protected abstract PaymentGateway createGateway();	// fabrika metodi - pastki sinflar amalga oshiradi

    public PaymentResult executePayment(PaymentRequest request) {	// shablon metodi
        PaymentGateway gateway = createGateway();	// fabrika metodi orqali yaratamiz
        validateRequest(request);	// umumiy validatsiya
        return gateway.processPayment(request);	// shlyuzga delegatsiya qilamiz
    }

    private void validateRequest(PaymentRequest request) {	// umumiy validatsiya mantiqi
        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
    }
}

// Konkret yaratuvchilar
class StripeGatewayFactory extends PaymentGatewayFactory {	// Stripe shlyuzlarini yaratadi
    private final String apiKey;	// konfiguratsiya

    public StripeGatewayFactory(String apiKey) {	// fabrika yaratilganda sozlanadi
        this.apiKey = apiKey;	// konfiguratsiyani saqlaymiz
    }

    @Override
    protected PaymentGateway createGateway() {	// fabrika metodini amalga oshiramiz
        return new StripeGateway(apiKey);	// sozlangan Stripe shlyuzini yaratamiz
    }
}

class PayPalGatewayFactory extends PaymentGatewayFactory {	// PayPal shlyuzlarini yaratadi
    private final String clientId;	// PayPal client ID
    private final String clientSecret;	// PayPal secret

    public PayPalGatewayFactory(String clientId, String clientSecret) {	// konstruktor
        this.clientId = clientId;	// hisob ma'lumotlarini saqlaymiz
        this.clientSecret = clientSecret;	// hisob ma'lumotlarini saqlaymiz
    }

    @Override
    protected PaymentGateway createGateway() {	// fabrika metodini amalga oshiramiz
        return new PayPalGateway(clientId, clientSecret);	// sozlangan PayPal shlyuzini yaratamiz
    }
}

// Foydalanish
class PaymentService {	// yuqori darajali servis
    private final PaymentGatewayFactory factory;	// abstrakt fabrikaga bog'liq

    public PaymentService(PaymentGatewayFactory factory) {	// fabrikani kiritamiz
        this.factory = factory;	// havolani saqlaymiz
    }

    public PaymentResult checkout(Cart cart) {	// biznes operatsiyasi
        PaymentRequest request = new PaymentRequest(cart.getTotal(), cart.getCurrency());
        return factory.executePayment(request);	// fabrika yaratish va qayta ishlashni boshqaradi
    }
}
\`\`\`

---

## Qochish kerak bo'lgan keng tarqalgan xatolar

1. **Fabrika metodidan null qaytarish** - Har doim yaroqli instansiya qaytaring yoki istisno tashlang
2. **Juda ko'p shartli tarmoqlar** - Fabrikada ko'p if-else bo'lsa, Abstract Factory ni ko'rib chiqing
3. **Fabrika metodini protected/public qilmaslik** - U pastki sinflar tomonidan qayta aniqlanishi kerak
4. **Shablon metodini unutish** - Factory ko'pincha umumiy operatsiyalar uchun Template Method bilan birgalikda ishlatiladi`
		}
	}
};

export default task;
