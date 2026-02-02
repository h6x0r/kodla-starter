import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'java-dp-decorator',
	title: 'Decorator Pattern',
	difficulty: 'medium',
	tags: ['java', 'design-patterns', 'structural', 'decorator'],
	estimatedTime: '30m',
	isPremium: false,
	youtubeUrl: '',
	description: `Implement the **Decorator Pattern** in Java — attach additional responsibilities to objects dynamically without modifying their structure.

## Overview

The Decorator pattern lets you wrap objects with new behaviors at runtime. Unlike inheritance, decorators can be combined flexibly and don't create a class explosion.

## Key Components

| Component | Role | Implementation |
|-----------|------|----------------|
| **Component** | Common interface | \`Coffee\` interface |
| **ConcreteComponent** | Base object | \`SimpleCoffee\` class |
| **Decorator** | Abstract wrapper | \`CoffeeDecorator\` class |
| **ConcreteDecorator** | Adds behavior | \`MilkDecorator\`, \`SugarDecorator\` |

## Your Task

Implement a coffee ordering system with toppings:

1. **Coffee** interface - Component with getDescription() and getCost()
2. **SimpleCoffee** - Base coffee ($2.00)
3. **CoffeeDecorator** - Abstract decorator holding wrapped coffee
4. **MilkDecorator** - Adds milk ($0.50)
5. **SugarDecorator** - Adds sugar ($0.25)

## Example Usage

\`\`\`java
Coffee coffee = new SimpleCoffee();	// create base coffee
System.out.println(coffee.getCost());	// Output: 2.0

coffee = new MilkDecorator(coffee);	// wrap with milk decorator
System.out.println(coffee.getCost());	// Output: 2.5

coffee = new SugarDecorator(coffee);	// wrap with sugar decorator
System.out.println(coffee.getDescription());	// Output: Simple Coffee, Milk, Sugar
System.out.println(coffee.getCost());	// Output: 2.75
\`\`\`

## Key Insight

Decorators can be stacked infinitely — each wraps the previous, adding its behavior!`,
	initialCode: `interface Coffee {
    String getDescription();
}

class SimpleCoffee implements Coffee {
    @Override
    public String getDescription() { throw new UnsupportedOperationException("TODO"); }
    @Override
    public double getCost() { throw new UnsupportedOperationException("TODO"); }
}

abstract class CoffeeDecorator implements Coffee {
    protected Coffee coffee;

    public CoffeeDecorator(Coffee coffee) {
    }
}

class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) {
    }

    @Override
    public String getDescription() { throw new UnsupportedOperationException("TODO"); }
    @Override
    public double getCost() { throw new UnsupportedOperationException("TODO"); }
}

class SugarDecorator extends CoffeeDecorator {
    public SugarDecorator(Coffee coffee) {
    }

    @Override
    public String getDescription() { throw new UnsupportedOperationException("TODO"); }
    @Override
    public double getCost() { throw new UnsupportedOperationException("TODO"); }
}`,
	solutionCode: `interface Coffee {	// Component - defines interface for objects
    String getDescription();	// get coffee description
    double getCost();	// get coffee cost
}

class SimpleCoffee implements Coffee {	// ConcreteComponent - base object to decorate
    @Override
    public String getDescription() { return "Simple Coffee"; }	// base description
    @Override
    public double getCost() { return 2.0; }	// base price $2.00
}

abstract class CoffeeDecorator implements Coffee {	// Decorator - wraps component
    protected Coffee coffee;	// reference to wrapped coffee

    public CoffeeDecorator(Coffee coffee) {	// constructor accepts coffee to wrap
        this.coffee = coffee;	// store wrapped object
    }
}

class MilkDecorator extends CoffeeDecorator {	// ConcreteDecorator - adds milk
    public MilkDecorator(Coffee coffee) {	// constructor
        super(coffee);	// pass to parent
    }

    @Override
    public String getDescription() {	// enhanced description
        return coffee.getDescription() + ", Milk";	// delegate + add own description
    }

    @Override
    public double getCost() {	// enhanced cost
        return coffee.getCost() + 0.5;	// delegate + add milk cost ($0.50)
    }
}

class SugarDecorator extends CoffeeDecorator {	// ConcreteDecorator - adds sugar
    public SugarDecorator(Coffee coffee) {	// constructor
        super(coffee);	// pass to parent
    }

    @Override
    public String getDescription() {	// enhanced description
        return coffee.getDescription() + ", Sugar";	// delegate + add own description
    }

    @Override
    public double getCost() {	// enhanced cost
        return coffee.getCost() + 0.25;	// delegate + add sugar cost ($0.25)
    }
}`,
	hint1: `**SimpleCoffee Implementation (ConcreteComponent)**

SimpleCoffee is the base object that will be decorated:

\`\`\`java
class SimpleCoffee implements Coffee {
    @Override
    public String getDescription() {
        return "Simple Coffee";  // Base description
    }

    @Override
    public double getCost() {
        return 2.0;  // Base price: $2.00
    }
}
\`\`\`

Key points:
- This is the core object being wrapped
- Provides default behavior
- Doesn't know about decorators`,
	hint2: `**Decorator Implementation**

Each decorator wraps a Coffee and adds behavior:

\`\`\`java
class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) {
        super(coffee);  // Store wrapped coffee
    }

    @Override
    public String getDescription() {
        // Delegate to wrapped object + add own behavior
        return coffee.getDescription() + ", Milk";
    }

    @Override
    public double getCost() {
        // Delegate + add own cost
        return coffee.getCost() + 0.5;
    }
}
\`\`\`

Pattern: Always delegate to wrapped object first, then add your behavior!`,
	whyItMatters: `## Problem & Solution

**Without Decorator (inheritance explosion):**
\`\`\`java
class Coffee {}	// base
class CoffeeWithMilk extends Coffee {}	// 1 topping
class CoffeeWithSugar extends Coffee {}	// 1 topping
class CoffeeWithMilkAndSugar extends Coffee {}	// 2 toppings
class CoffeeWithMilkAndSugarAndWhip extends Coffee {}	// 3 toppings
// Explosion of classes for every combination!	// unmaintainable
\`\`\`

**With Decorator:**
\`\`\`java
Coffee coffee = new SimpleCoffee();	// start with base
coffee = new MilkDecorator(coffee);	// add milk
coffee = new SugarDecorator(coffee);	// add sugar
coffee = new WhipDecorator(coffee);	// add whip - any combination!
\`\`\`

---

## Real-World Examples

| Domain | Component | Decorators |
|--------|-----------|------------|
| **Java I/O** | InputStream | BufferedInputStream, DataInputStream |
| **Collections** | List | synchronizedList(), unmodifiableList() |
| **Spring** | Service | @Transactional, @Cacheable |
| **GUI** | Window | ScrollDecorator, BorderDecorator |
| **Logging** | Logger | TimestampDecorator, LevelDecorator |
| **HTTP** | Request | AuthDecorator, CompressionDecorator |

---

## Production Pattern: Data Stream Decorators

\`\`\`java
interface DataSource {	// Component interface
    void writeData(String data);	// write data
    String readData();	// read data
}

class FileDataSource implements DataSource {	// ConcreteComponent - file storage
    private String filename;	// file path

    public FileDataSource(String filename) {	// constructor
        this.filename = filename;	// store filename
    }

    @Override
    public void writeData(String data) {	// write to file
        try (FileWriter writer = new FileWriter(filename)) {	// open file
            writer.write(data);	// write data
        } catch (IOException e) { e.printStackTrace(); }	// handle error
    }

    @Override
    public String readData() {	// read from file
        try {	// try reading
            return new String(Files.readAllBytes(Paths.get(filename)));	// read all bytes
        } catch (IOException e) { return ""; }	// return empty on error
    }
}

abstract class DataSourceDecorator implements DataSource {	// Base Decorator
    protected DataSource wrappee;	// wrapped data source

    public DataSourceDecorator(DataSource source) {	// constructor
        this.wrappee = source;	// store wrapped source
    }

    @Override
    public void writeData(String data) {	// delegate write
        wrappee.writeData(data);	// forward to wrapped
    }

    @Override
    public String readData() {	// delegate read
        return wrappee.readData();	// forward to wrapped
    }
}

class EncryptionDecorator extends DataSourceDecorator {	// Encryption decorator
    public EncryptionDecorator(DataSource source) {	// constructor
        super(source);	// pass to parent
    }

    @Override
    public void writeData(String data) {	// encrypt before writing
        String encrypted = Base64.getEncoder().encodeToString(data.getBytes());	// encode to Base64
        super.writeData(encrypted);	// write encrypted data
    }

    @Override
    public String readData() {	// decrypt after reading
        String data = super.readData();	// read encrypted data
        return new String(Base64.getDecoder().decode(data));	// decode from Base64
    }
}

class CompressionDecorator extends DataSourceDecorator {	// Compression decorator
    public CompressionDecorator(DataSource source) {	// constructor
        super(source);	// pass to parent
    }

    @Override
    public void writeData(String data) {	// compress before writing
        super.writeData(compress(data));	// write compressed
    }

    @Override
    public String readData() {	// decompress after reading
        return decompress(super.readData());	// read and decompress
    }

    private String compress(String data) { /* GZIP compression */ return data; }	// compress logic
    private String decompress(String data) { /* GZIP decompression */ return data; }	// decompress logic
}

// Usage - stack decorators!
DataSource source = new FileDataSource("data.txt");	// base file source
source = new CompressionDecorator(source);	// add compression
source = new EncryptionDecorator(source);	// add encryption

source.writeData("Sensitive data");	// data is compressed, then encrypted, then saved
String data = source.readData();	// data is loaded, decrypted, then decompressed
\`\`\`

---

## Common Mistakes to Avoid

| Mistake | Problem | Solution |
|---------|---------|----------|
| **Forgetting delegation** | Not calling wrapped object's method | Always call super/wrappee method first |
| **Decorator without interface** | Decorator not same type as component | Decorator must implement same interface |
| **Too many decorators** | Overly complex wrapping chains | Consider Facade for complex combinations |
| **Order dependency** | Decorators order affects behavior | Document order requirements clearly |
| **Modifying component** | Changing wrapped object directly | Treat wrapped object as immutable |`,
	order: 3,
	testCode: `import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class Test1 {
    @Test
    void simpleCoffeeDescription() {
        Coffee coffee = new SimpleCoffee();
        assertEquals("Simple Coffee", coffee.getDescription(), "SimpleCoffee should return correct description");
    }
}

class Test2 {
    @Test
    void simpleCoffeeCost() {
        Coffee coffee = new SimpleCoffee();
        assertEquals(2.0, coffee.getCost(), 0.01, "SimpleCoffee should cost 2.0");
    }
}

class Test3 {
    @Test
    void milkDecoratorAddsMilkToDescription() {
        Coffee coffee = new SimpleCoffee();
        coffee = new MilkDecorator(coffee);
        assertTrue(coffee.getDescription().contains("Milk"), "MilkDecorator should add Milk to description");
    }
}

class Test4 {
    @Test
    void milkDecoratorAddsCost() {
        Coffee coffee = new SimpleCoffee();
        coffee = new MilkDecorator(coffee);
        assertEquals(2.5, coffee.getCost(), 0.01, "MilkDecorator should add 0.5 to cost");
    }
}

class Test5 {
    @Test
    void sugarDecoratorAddsSugarToDescription() {
        Coffee coffee = new SimpleCoffee();
        coffee = new SugarDecorator(coffee);
        assertTrue(coffee.getDescription().contains("Sugar"), "SugarDecorator should add Sugar to description");
    }
}

class Test6 {
    @Test
    void sugarDecoratorAddsCost() {
        Coffee coffee = new SimpleCoffee();
        coffee = new SugarDecorator(coffee);
        assertEquals(2.25, coffee.getCost(), 0.01, "SugarDecorator should add 0.25 to cost");
    }
}

class Test7 {
    @Test
    void stackedDecoratorsCombineDescriptions() {
        Coffee coffee = new SimpleCoffee();
        coffee = new MilkDecorator(coffee);
        coffee = new SugarDecorator(coffee);
        String desc = coffee.getDescription();
        assertTrue(desc.contains("Simple Coffee"), "Should contain base description");
        assertTrue(desc.contains("Milk"), "Should contain Milk");
        assertTrue(desc.contains("Sugar"), "Should contain Sugar");
    }
}

class Test8 {
    @Test
    void stackedDecoratorsAddAllCosts() {
        Coffee coffee = new SimpleCoffee();
        coffee = new MilkDecorator(coffee);
        coffee = new SugarDecorator(coffee);
        assertEquals(2.75, coffee.getCost(), 0.01, "Stacked decorators should add all costs");
    }
}

class Test9 {
    @Test
    void multipleOfSameDecorator() {
        Coffee coffee = new SimpleCoffee();
        coffee = new MilkDecorator(coffee);
        coffee = new MilkDecorator(coffee);
        assertEquals(3.0, coffee.getCost(), 0.01, "Two milk decorators should add 1.0");
    }
}

class Test10 {
    @Test
    void coffeeInterfacePolymorphism() {
        Coffee base = new SimpleCoffee();
        Coffee withMilk = new MilkDecorator(base);
        assertTrue(withMilk instanceof Coffee, "Decorator should implement Coffee interface");
    }
}
`,
	translations: {
		ru: {
			title: 'Паттерн Decorator (Декоратор)',
			description: `Реализуйте **паттерн Decorator** на Java — динамически добавляйте дополнительные обязанности объектам без изменения их структуры.

## Обзор

Паттерн Decorator позволяет оборачивать объекты новым поведением во время выполнения. В отличие от наследования, декораторы можно гибко комбинировать без взрыва классов.

## Ключевые компоненты

| Компонент | Роль | Реализация |
|-----------|------|------------|
| **Component** | Общий интерфейс | Интерфейс \`Coffee\` |
| **ConcreteComponent** | Базовый объект | Класс \`SimpleCoffee\` |
| **Decorator** | Абстрактная обёртка | Класс \`CoffeeDecorator\` |
| **ConcreteDecorator** | Добавляет поведение | \`MilkDecorator\`, \`SugarDecorator\` |

## Ваша задача

Реализуйте систему заказа кофе с добавками:

1. **Coffee** интерфейс - Component с getDescription() и getCost()
2. **SimpleCoffee** - Базовый кофе ($2.00)
3. **CoffeeDecorator** - Абстрактный декоратор с обёрнутым кофе
4. **MilkDecorator** - Добавляет молоко ($0.50)
5. **SugarDecorator** - Добавляет сахар ($0.25)

## Пример использования

\`\`\`java
Coffee coffee = new SimpleCoffee();	// создаём базовый кофе
System.out.println(coffee.getCost());	// Вывод: 2.0

coffee = new MilkDecorator(coffee);	// оборачиваем декоратором молока
System.out.println(coffee.getCost());	// Вывод: 2.5

coffee = new SugarDecorator(coffee);	// оборачиваем декоратором сахара
System.out.println(coffee.getDescription());	// Вывод: Simple Coffee, Milk, Sugar
System.out.println(coffee.getCost());	// Вывод: 2.75
\`\`\`

## Ключевая идея

Декораторы можно складывать бесконечно — каждый оборачивает предыдущий, добавляя своё поведение!`,
			hint1: `**Реализация SimpleCoffee (ConcreteComponent)**

SimpleCoffee — базовый объект, который будет декорироваться:

\`\`\`java
class SimpleCoffee implements Coffee {
    @Override
    public String getDescription() {
        return "Simple Coffee";  // Базовое описание
    }

    @Override
    public double getCost() {
        return 2.0;  // Базовая цена: $2.00
    }
}
\`\`\`

Ключевые моменты:
- Это основной объект, который оборачивается
- Предоставляет поведение по умолчанию
- Не знает о декораторах`,
			hint2: `**Реализация декоратора**

Каждый декоратор оборачивает Coffee и добавляет поведение:

\`\`\`java
class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) {
        super(coffee);  // Сохраняем обёрнутый кофе
    }

    @Override
    public String getDescription() {
        // Делегируем обёрнутому объекту + добавляем своё поведение
        return coffee.getDescription() + ", Milk";
    }

    @Override
    public double getCost() {
        // Делегируем + добавляем свою стоимость
        return coffee.getCost() + 0.5;
    }
}
\`\`\`

Паттерн: Всегда сначала делегируйте обёрнутому объекту, затем добавляйте своё поведение!`,
			whyItMatters: `## Проблема и решение

**Без Decorator (взрыв наследования):**
\`\`\`java
class Coffee {}	// базовый
class CoffeeWithMilk extends Coffee {}	// 1 добавка
class CoffeeWithSugar extends Coffee {}	// 1 добавка
class CoffeeWithMilkAndSugar extends Coffee {}	// 2 добавки
class CoffeeWithMilkAndSugarAndWhip extends Coffee {}	// 3 добавки
// Взрыв классов для каждой комбинации!	// неподдерживаемо
\`\`\`

**С Decorator:**
\`\`\`java
Coffee coffee = new SimpleCoffee();	// начинаем с базы
coffee = new MilkDecorator(coffee);	// добавляем молоко
coffee = new SugarDecorator(coffee);	// добавляем сахар
coffee = new WhipDecorator(coffee);	// добавляем сливки - любая комбинация!
\`\`\`

---

## Примеры из реального мира

| Домен | Component | Decorators |
|-------|-----------|------------|
| **Java I/O** | InputStream | BufferedInputStream, DataInputStream |
| **Collections** | List | synchronizedList(), unmodifiableList() |
| **Spring** | Service | @Transactional, @Cacheable |
| **GUI** | Window | ScrollDecorator, BorderDecorator |
| **Logging** | Logger | TimestampDecorator, LevelDecorator |
| **HTTP** | Request | AuthDecorator, CompressionDecorator |

---

## Production паттерн: Декораторы потока данных

\`\`\`java
interface DataSource {	// Интерфейс Component
    void writeData(String data);	// записать данные
    String readData();	// прочитать данные
}

class FileDataSource implements DataSource {	// ConcreteComponent - файловое хранилище
    private String filename;	// путь к файлу

    public FileDataSource(String filename) {	// конструктор
        this.filename = filename;	// сохраняем имя файла
    }

    @Override
    public void writeData(String data) {	// запись в файл
        try (FileWriter writer = new FileWriter(filename)) {	// открываем файл
            writer.write(data);	// записываем данные
        } catch (IOException e) { e.printStackTrace(); }	// обрабатываем ошибку
    }

    @Override
    public String readData() {	// чтение из файла
        try {	// пробуем прочитать
            return new String(Files.readAllBytes(Paths.get(filename)));	// читаем все байты
        } catch (IOException e) { return ""; }	// возвращаем пустое при ошибке
    }
}

abstract class DataSourceDecorator implements DataSource {	// Базовый декоратор
    protected DataSource wrappee;	// обёрнутый источник данных

    public DataSourceDecorator(DataSource source) {	// конструктор
        this.wrappee = source;	// сохраняем обёрнутый источник
    }

    @Override
    public void writeData(String data) {	// делегируем запись
        wrappee.writeData(data);	// передаём обёрнутому
    }

    @Override
    public String readData() {	// делегируем чтение
        return wrappee.readData();	// передаём обёрнутому
    }
}

class EncryptionDecorator extends DataSourceDecorator {	// Декоратор шифрования
    public EncryptionDecorator(DataSource source) {	// конструктор
        super(source);	// передаём родителю
    }

    @Override
    public void writeData(String data) {	// шифруем перед записью
        String encrypted = Base64.getEncoder().encodeToString(data.getBytes());	// кодируем в Base64
        super.writeData(encrypted);	// записываем зашифрованные данные
    }

    @Override
    public String readData() {	// расшифровываем после чтения
        String data = super.readData();	// читаем зашифрованные данные
        return new String(Base64.getDecoder().decode(data));	// декодируем из Base64
    }
}

class CompressionDecorator extends DataSourceDecorator {	// Декоратор сжатия
    public CompressionDecorator(DataSource source) {	// конструктор
        super(source);	// передаём родителю
    }

    @Override
    public void writeData(String data) {	// сжимаем перед записью
        super.writeData(compress(data));	// записываем сжатые
    }

    @Override
    public String readData() {	// распаковываем после чтения
        return decompress(super.readData());	// читаем и распаковываем
    }

    private String compress(String data) { /* GZIP сжатие */ return data; }	// логика сжатия
    private String decompress(String data) { /* GZIP распаковка */ return data; }	// логика распаковки
}

// Использование - складываем декораторы!
DataSource source = new FileDataSource("data.txt");	// базовый файловый источник
source = new CompressionDecorator(source);	// добавляем сжатие
source = new EncryptionDecorator(source);	// добавляем шифрование

source.writeData("Sensitive data");	// данные сжимаются, шифруются, сохраняются
String data = source.readData();	// данные загружаются, расшифровываются, распаковываются
\`\`\`

---

## Распространённые ошибки

| Ошибка | Проблема | Решение |
|--------|----------|---------|
| **Забывают делегирование** | Не вызывают метод обёрнутого объекта | Всегда сначала вызывайте метод super/wrappee |
| **Декоратор без интерфейса** | Декоратор не того же типа, что и компонент | Декоратор должен реализовывать тот же интерфейс |
| **Слишком много декораторов** | Чрезмерно сложные цепочки оборачивания | Рассмотрите Facade для сложных комбинаций |
| **Зависимость от порядка** | Порядок декораторов влияет на поведение | Чётко документируйте требования к порядку |
| **Изменение компонента** | Прямое изменение обёрнутого объекта | Рассматривайте обёрнутый объект как immutable |`
		},
		uz: {
			title: 'Decorator (Dekorator) Pattern',
			description: `Java da **Decorator patternini** amalga oshiring — ob'ektlarga strukturasini o'zgartirmasdan dinamik ravishda qo'shimcha mas'uliyatlar qo'shing.

## Umumiy ko'rinish

Decorator patterni ob'ektlarni runtime da yangi xatti-harakatlar bilan o'rash imkonini beradi. Merosdan farqli o'laroq, dekoratorlarni moslashuvchan tarzda birlashtirish mumkin va klasslar portlashi yuzaga kelmaydi.

## Asosiy komponentlar

| Komponent | Rol | Amalga oshirish |
|-----------|-----|-----------------|
| **Component** | Umumiy interfeys | \`Coffee\` interfeysi |
| **ConcreteComponent** | Asosiy ob'ekt | \`SimpleCoffee\` klassi |
| **Decorator** | Abstrakt o'ram | \`CoffeeDecorator\` klassi |
| **ConcreteDecorator** | Xatti-harakat qo'shadi | \`MilkDecorator\`, \`SugarDecorator\` |

## Vazifangiz

Qo'shimchalar bilan qahva buyurtma tizimini amalga oshiring:

1. **Coffee** interfeysi - getDescription() va getCost() bilan Component
2. **SimpleCoffee** - Asosiy qahva ($2.00)
3. **CoffeeDecorator** - O'ralgan qahvani ushlab turadigan abstrakt dekorator
4. **MilkDecorator** - Sut qo'shadi ($0.50)
5. **SugarDecorator** - Shakar qo'shadi ($0.25)

## Foydalanish namunasi

\`\`\`java
Coffee coffee = new SimpleCoffee();	// asosiy qahva yaratamiz
System.out.println(coffee.getCost());	// Chiqish: 2.0

coffee = new MilkDecorator(coffee);	// sut dekoratori bilan o'raymiz
System.out.println(coffee.getCost());	// Chiqish: 2.5

coffee = new SugarDecorator(coffee);	// shakar dekoratori bilan o'raymiz
System.out.println(coffee.getDescription());	// Chiqish: Simple Coffee, Milk, Sugar
System.out.println(coffee.getCost());	// Chiqish: 2.75
\`\`\`

## Asosiy tushuncha

Dekoratorlarni cheksiz qo'shish mumkin — har biri oldingisini o'rab, o'z xatti-harakatini qo'shadi!`,
			hint1: `**SimpleCoffee amalga oshirish (ConcreteComponent)**

SimpleCoffee — dekoratsiya qilinadigan asosiy ob'ekt:

\`\`\`java
class SimpleCoffee implements Coffee {
    @Override
    public String getDescription() {
        return "Simple Coffee";  // Asosiy tavsif
    }

    @Override
    public double getCost() {
        return 2.0;  // Asosiy narx: $2.00
    }
}
\`\`\`

Asosiy nuqtalar:
- Bu o'raladigan asosiy ob'ekt
- Standart xatti-harakatni ta'minlaydi
- Dekoratorlar haqida bilmaydi`,
			hint2: `**Dekorator amalga oshirish**

Har bir dekorator Coffee ni o'raydi va xatti-harakat qo'shadi:

\`\`\`java
class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee coffee) {
        super(coffee);  // O'ralgan qahvani saqlaymiz
    }

    @Override
    public String getDescription() {
        // O'ralgan ob'ektga delegatsiya + o'z xatti-harakatini qo'shish
        return coffee.getDescription() + ", Milk";
    }

    @Override
    public double getCost() {
        // Delegatsiya + o'z narxini qo'shish
        return coffee.getCost() + 0.5;
    }
}
\`\`\`

Pattern: Doimo avval o'ralgan ob'ektga delegatsiya qiling, keyin o'z xatti-harakatingizni qo'shing!`,
			whyItMatters: `## Muammo va yechim

**Decorator siz (meros portlashi):**
\`\`\`java
class Coffee {}	// asosiy
class CoffeeWithMilk extends Coffee {}	// 1 qo'shimcha
class CoffeeWithSugar extends Coffee {}	// 1 qo'shimcha
class CoffeeWithMilkAndSugar extends Coffee {}	// 2 qo'shimcha
class CoffeeWithMilkAndSugarAndWhip extends Coffee {}	// 3 qo'shimcha
// Har bir kombinatsiya uchun klasslar portlashi!	// boshqarib bo'lmaydi
\`\`\`

**Decorator bilan:**
\`\`\`java
Coffee coffee = new SimpleCoffee();	// asosiydan boshlaymiz
coffee = new MilkDecorator(coffee);	// sut qo'shamiz
coffee = new SugarDecorator(coffee);	// shakar qo'shamiz
coffee = new WhipDecorator(coffee);	// ko'pik qo'shamiz - istalgan kombinatsiya!
\`\`\`

---

## Haqiqiy dunyo namunalari

| Domen | Component | Decorators |
|-------|-----------|------------|
| **Java I/O** | InputStream | BufferedInputStream, DataInputStream |
| **Collections** | List | synchronizedList(), unmodifiableList() |
| **Spring** | Service | @Transactional, @Cacheable |
| **GUI** | Window | ScrollDecorator, BorderDecorator |
| **Logging** | Logger | TimestampDecorator, LevelDecorator |
| **HTTP** | Request | AuthDecorator, CompressionDecorator |

---

## Production pattern: Ma'lumotlar oqimi dekoratorlari

\`\`\`java
interface DataSource {	// Component interfeysi
    void writeData(String data);	// ma'lumot yozish
    String readData();	// ma'lumot o'qish
}

class FileDataSource implements DataSource {	// ConcreteComponent - fayl saqlash
    private String filename;	// fayl yo'li

    public FileDataSource(String filename) {	// konstruktor
        this.filename = filename;	// fayl nomini saqlash
    }

    @Override
    public void writeData(String data) {	// faylga yozish
        try (FileWriter writer = new FileWriter(filename)) {	// faylni ochish
            writer.write(data);	// ma'lumot yozish
        } catch (IOException e) { e.printStackTrace(); }	// xatoni boshqarish
    }

    @Override
    public String readData() {	// fayldan o'qish
        try {	// o'qishga urinish
            return new String(Files.readAllBytes(Paths.get(filename)));	// barcha baytlarni o'qish
        } catch (IOException e) { return ""; }	// xatoda bo'shni qaytarish
    }
}

abstract class DataSourceDecorator implements DataSource {	// Asosiy dekorator
    protected DataSource wrappee;	// o'ralgan ma'lumot manbasi

    public DataSourceDecorator(DataSource source) {	// konstruktor
        this.wrappee = source;	// o'ralgan manbani saqlash
    }

    @Override
    public void writeData(String data) {	// yozishni delegatsiya qilish
        wrappee.writeData(data);	// o'ralganga uzatish
    }

    @Override
    public String readData() {	// o'qishni delegatsiya qilish
        return wrappee.readData();	// o'ralganga uzatish
    }
}

class EncryptionDecorator extends DataSourceDecorator {	// Shifrlash dekoratori
    public EncryptionDecorator(DataSource source) {	// konstruktor
        super(source);	// ota-onaga uzatish
    }

    @Override
    public void writeData(String data) {	// yozishdan oldin shifrlash
        String encrypted = Base64.getEncoder().encodeToString(data.getBytes());	// Base64 ga practixsh
        super.writeData(encrypted);	// shifrlangan ma'lumotni yozish
    }

    @Override
    public String readData() {	// o'qishdan keyin deshifrlash
        String data = super.readData();	// shifrlangan ma'lumotni o'qish
        return new String(Base64.getDecoder().decode(data));	// Base64 dan depractixsh
    }
}

class CompressionDecorator extends DataSourceDecorator {	// Siqish dekoratori
    public CompressionDecorator(DataSource source) {	// konstruktor
        super(source);	// ota-onaga uzatish
    }

    @Override
    public void writeData(String data) {	// yozishdan oldin siqish
        super.writeData(compress(data));	// siqilganini yozish
    }

    @Override
    public String readData() {	// o'qishdan keyin ochish
        return decompress(super.readData());	// o'qish va ochish
    }

    private String compress(String data) { /* GZIP siqish */ return data; }	// siqish logikasi
    private String decompress(String data) { /* GZIP ochish */ return data; }	// ochish logikasi
}

// Foydalanish - dekoratorlarni qatlaymiz!
DataSource source = new FileDataSource("data.txt");	// asosiy fayl manbasi
source = new CompressionDecorator(source);	// siqishni qo'shamiz
source = new EncryptionDecorator(source);	// shifrlashni qo'shamiz

source.writeData("Sensitive data");	// ma'lumot siqiladi, shifrlanadi, saqlanadi
String data = source.readData();	// ma'lumot yuklanadi, deshifrlanadi, ochiladi
\`\`\`

---

## Keng tarqalgan xatolar

| Xato | Muammo | Yechim |
|------|--------|--------|
| **Delegatsiyani unutish** | O'ralgan ob'ekt metodini chaqirmaslik | Doimo avval super/wrappee metodini chaqiring |
| **Interfeysi yo'q dekorator** | Dekorator komponent bilan bir xil tip emas | Dekorator xuddi shu interfeysni amalga oshirishi kerak |
| **Juda ko'p dekoratorlar** | Haddan tashqari murakkab o'rash zanjirlari | Murakkab kombinatsiyalar uchun Facade ni ko'rib chiqing |
| **Tartib bog'liqligi** | Dekoratorlar tartibi xatti-harakatga ta'sir qiladi | Tartib talablarini aniq hujjatlashtiring |
| **Komponentni o'zgartirish** | O'ralgan ob'ektni to'g'ridan-to'g'ri o'zgartirish | O'ralgan ob'ektni immutable deb hisoblang |`
		}
	}
};

export default task;
