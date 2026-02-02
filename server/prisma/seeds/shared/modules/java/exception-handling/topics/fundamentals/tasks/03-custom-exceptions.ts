import { Task } from '../../../../types';

export const task: Task = {
    slug: 'java-custom-exceptions',
    title: 'Creating Custom Exceptions',
    difficulty: 'medium',
    tags: ['java', 'exceptions', 'custom', 'validation'],
    estimatedTime: '25m',
    isPremium: false,
    youtubeUrl: '',
    description: `Create a banking system with custom exceptions for validation and business logic errors.

Requirements:
1. Create InsufficientFundsException extending Exception
2. Create InvalidAccountException extending RuntimeException
3. Implement BankAccount class with withdraw() method that throws InsufficientFundsException
4. Add custom error messages with account details
5. Include error codes in custom exceptions

Example:
\`\`\`java
BankAccount account = new BankAccount("ACC001", 1000);
account.withdraw(500);   // Success
account.withdraw(800);   // Throws InsufficientFundsException
\`\`\``,
    initialCode: `// TODO: Create InsufficientFundsException class

// TODO: Create InvalidAccountException class

public class BankAccount {
    private String accountId;
    private double balance;

    public BankAccount(String accountId, double initialBalance) {
        // TODO: Initialize and validate
    }

    public void withdraw(double amount) throws InsufficientFundsException {
        // TODO: Implement with custom exception
    }

    public void deposit(double amount) {
        // TODO: Implement with validation
    }

    public double getBalance() {
        return balance;
    }

    public static void main(String[] args) {
        try {
            BankAccount account = new BankAccount("ACC001", 1000);
            System.out.println("Initial balance: $" + account.getBalance());

            account.withdraw(500);
            System.out.println("After withdrawal: $" + account.getBalance());

            account.withdraw(800);
        } catch (InsufficientFundsException e) {
            System.out.println("Transaction failed: " + e.getMessage());
        } catch (InvalidAccountException e) {
            System.out.println("Account error: " + e.getMessage());
        }
    }
}`,
    solutionCode: `// Custom checked exception for insufficient funds
class InsufficientFundsException extends Exception {
    private String accountId;
    private double requestedAmount;
    private double availableBalance;
    private String errorCode;

    public InsufficientFundsException(String accountId, double requestedAmount,
                                      double availableBalance) {
        // Call parent constructor with formatted message
        super(String.format("Account %s: Insufficient funds. Requested: $%.2f, Available: $%.2f",
                          accountId, requestedAmount, availableBalance));
        this.accountId = accountId;
        this.requestedAmount = requestedAmount;
        this.availableBalance = availableBalance;
        this.errorCode = "INS_FUNDS_001";
    }

    // Getters for custom fields
    public String getAccountId() { return accountId; }
    public double getRequestedAmount() { return requestedAmount; }
    public double getAvailableBalance() { return availableBalance; }
    public String getErrorCode() { return errorCode; }
}

// Custom unchecked exception for invalid account operations
class InvalidAccountException extends RuntimeException {
    private String errorCode;

    public InvalidAccountException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() { return errorCode; }
}

public class BankAccount {
    private String accountId;
    private double balance;

    public BankAccount(String accountId, double initialBalance) {
        // Validate account ID
        if (accountId == null || accountId.trim().isEmpty()) {
            throw new InvalidAccountException(
                "Account ID cannot be null or empty", "INV_ACC_001");
        }

        // Validate initial balance
        if (initialBalance < 0) {
            throw new InvalidAccountException(
                "Initial balance cannot be negative", "INV_ACC_002");
        }

        this.accountId = accountId;
        this.balance = initialBalance;
    }

    public void withdraw(double amount) throws InsufficientFundsException {
        // Validate withdrawal amount
        if (amount <= 0) {
            throw new InvalidAccountException(
                "Withdrawal amount must be positive", "INV_AMT_001");
        }

        // Check sufficient funds
        if (amount > balance) {
            throw new InsufficientFundsException(accountId, amount, balance);
        }

        // Perform withdrawal
        balance -= amount;
        System.out.println("Withdrawn $" + amount + " from " + accountId);
    }

    public void deposit(double amount) {
        // Validate deposit amount
        if (amount <= 0) {
            throw new InvalidAccountException(
                "Deposit amount must be positive", "INV_AMT_002");
        }

        balance += amount;
        System.out.println("Deposited $" + amount + " to " + accountId);
    }

    public double getBalance() {
        return balance;
    }

    public static void main(String[] args) {
        try {
            BankAccount account = new BankAccount("ACC001", 1000);
            System.out.println("Initial balance: $" + account.getBalance());

            account.withdraw(500);
            System.out.println("After withdrawal: $" + account.getBalance());

            account.withdraw(800);
        } catch (InsufficientFundsException e) {
            System.out.println("Transaction failed: " + e.getMessage());
            System.out.println("Error code: " + e.getErrorCode());
        } catch (InvalidAccountException e) {
            System.out.println("Account error: " + e.getMessage());
            System.out.println("Error code: " + e.getErrorCode());
        }
    }
}`,
    hint1: `Extend Exception for checked exceptions (must be declared) and RuntimeException for unchecked exceptions. Add custom fields to store additional context about the error.`,
    hint2: `Use String.format() in the super() constructor call to create detailed error messages. Add getter methods for custom fields so callers can access error details.`,
    whyItMatters: `Custom exceptions make your code more expressive and maintainable. They allow you to provide domain-specific error information and handle different business logic errors appropriately. This is essential for building robust enterprise applications.

**Production Pattern:**
\`\`\`java
public class PaymentService {
    public void processPayment(Payment payment) throws PaymentException {
        try {
            validatePayment(payment);
            chargeCard(payment);
            updateInventory(payment);
        } catch (InsufficientFundsException e) {
            logger.warn("Payment declined: {}", e.getErrorCode());
            metrics.incrementCounter("payment.declined.insufficient_funds");
            throw e;
        } catch (InvalidCardException e) {
            logger.error("Invalid card: {}", e.getCardMask());
            alertService.sendAlert("Invalid card detected");
            throw new PaymentException("Card validation failed", e);
        }
    }
}
\`\`\`

**Practical Benefits:**
- Clear classification of business errors
- Contextual information for debugging
- Integration with monitoring systems`,
    order: 3,
    testCode: `import static org.junit.Assert.*;
import org.junit.Test;

// Test1: Verify BankAccount creation
class Test1 {
    @Test
    public void test() {
        try {
            BankAccount account = new BankAccount("ACC001", 1000);
            assertNotNull("BankAccount should be created", account);
            assertEquals("Initial balance should be 1000", 1000.0, account.getBalance(), 0.01);
        } catch (Exception e) {
            fail("Should create valid account: " + e.getMessage());
        }
    }
}

// Test2: Verify successful withdrawal
class Test2 {
    @Test
    public void test() {
        try {
            BankAccount account = new BankAccount("ACC002", 1000);
            account.withdraw(500);
            assertEquals("Balance should be 500 after withdrawal", 500.0, account.getBalance(), 0.01);
        } catch (InsufficientFundsException e) {
            fail("Should allow valid withdrawal: " + e.getMessage());
        } catch (Exception e) {
            fail("Unexpected exception: " + e.getMessage());
        }
    }
}

// Test3: Verify InsufficientFundsException is thrown
class Test3 {
    @Test
    public void test() {
        try {
            BankAccount account = new BankAccount("ACC003", 1000);
            account.withdraw(1500);
            fail("Should throw InsufficientFundsException");
        } catch (InsufficientFundsException e) {
            assertTrue("Exception message should contain account details", e.getMessage().contains("ACC003"));
            assertEquals("Error code should be set", "INS_FUNDS_001", e.getErrorCode());
        } catch (Exception e) {
            fail("Unexpected exception type: " + e.getMessage());
        }
    }
}

// Test4: Verify deposit functionality
class Test4 {
    @Test
    public void test() {
        try {
            BankAccount account = new BankAccount("ACC004", 1000);
            account.deposit(500);
            assertEquals("Balance should be 1500 after deposit", 1500.0, account.getBalance(), 0.01);
        } catch (Exception e) {
            fail("Deposit should work: " + e.getMessage());
        }
    }
}

// Test5: Verify invalid account creation
class Test5 {
    @Test
    public void test() {
        try {
            BankAccount account = new BankAccount(null, 1000);
            fail("Should throw InvalidAccountException for null ID");
        } catch (InvalidAccountException e) {
            assertNotNull("Exception message should not be null", e.getMessage());
            assertTrue("Exception should have error code",
                e.getErrorCode() != null && e.getErrorCode().startsWith("INV_ACC"));
        } catch (Exception e) {
            fail("Unexpected exception: " + e.getMessage());
        }
    }
}

// Test6: Verify negative deposit
class Test6 {
    @Test
    public void test() {
        try {
            BankAccount account = new BankAccount("ACC006", 1000);
            account.deposit(-100);
            fail("Should throw InvalidAccountException for negative deposit");
        } catch (InvalidAccountException e) {
            assertNotNull("Exception message should not be null", e.getMessage());
            assertTrue("Exception should have error code",
                e.getErrorCode() != null && e.getErrorCode().startsWith("INV_AMT"));
        } catch (Exception e) {
            fail("Unexpected exception: " + e.getMessage());
        }
    }
}

// Test7: Verify exception details
class Test7 {
    @Test
    public void test() {
        try {
            BankAccount account = new BankAccount("ACC007", 100);
            account.withdraw(200);
            fail("Should throw InsufficientFundsException");
        } catch (InsufficientFundsException e) {
            assertEquals("Account ID should match", "ACC007", e.getAccountId());
            assertEquals("Requested amount should be 200", 200.0, e.getRequestedAmount(), 0.01);
            assertEquals("Available balance should be 100", 100.0, e.getAvailableBalance(), 0.01);
        } catch (Exception e) {
            fail("Unexpected exception: " + e.getMessage());
        }
    }
}

// Test8: main method shows transaction failure message
class Test8 {
    @Test
    public void test() {
        java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
        java.io.PrintStream oldOut = System.out;
        System.setOut(new java.io.PrintStream(out));
        BankAccount.main(new String[]{});
        System.setOut(oldOut);
        String output = out.toString();
        assertTrue("Main should show transaction failure or error code",
            output.contains("Transaction failed") || output.contains("Error code") ||
            output.contains("INS_FUNDS") || output.contains("Withdrawn") ||
            output.contains("Транзакция не выполнена") || output.contains("Tranzaksiya muvaffaqiyatsiz"));
    }
}

// Test9: Verify multiple operations
class Test9 {
    @Test
    public void test() {
        try {
            BankAccount account = new BankAccount("ACC009", 1000);
            account.withdraw(300);
            account.deposit(500);
            account.withdraw(200);
            assertEquals("Final balance should be 1000", 1000.0, account.getBalance(), 0.01);
        } catch (Exception e) {
            fail("Multiple operations should work: " + e.getMessage());
        }
    }
}

// Test10: Verify custom exception inheritance
class Test10 {
    @Test
    public void test() {
        try {
            BankAccount account = new BankAccount("ACC010", 100);
            account.withdraw(200);
            fail("Should throw InsufficientFundsException");
        } catch (InsufficientFundsException e) {
            assertTrue("Should be instance of Exception", e instanceof Exception);
            assertNotNull("Message should not be null", e.getMessage());
            assertNotNull("Error code should not be null", e.getErrorCode());
        } catch (Exception e) {
            fail("Wrong exception type: " + e.getMessage());
        }
    }
}
`,
    translations: {
        ru: {
            title: 'Создание Пользовательских Исключений',
            solutionCode: `// Пользовательское проверяемое исключение для недостатка средств
class InsufficientFundsException extends Exception {
    private String accountId;
    private double requestedAmount;
    private double availableBalance;
    private String errorCode;

    public InsufficientFundsException(String accountId, double requestedAmount,
                                      double availableBalance) {
        // Вызов конструктора родителя с форматированным сообщением
        super(String.format("Счет %s: Недостаточно средств. Запрошено: $%.2f, Доступно: $%.2f",
                          accountId, requestedAmount, availableBalance));
        this.accountId = accountId;
        this.requestedAmount = requestedAmount;
        this.availableBalance = availableBalance;
        this.errorCode = "INS_FUNDS_001";
    }

    // Геттеры для пользовательских полей
    public String getAccountId() { return accountId; }
    public double getRequestedAmount() { return requestedAmount; }
    public double getAvailableBalance() { return availableBalance; }
    public String getErrorCode() { return errorCode; }
}

// Пользовательское непроверяемое исключение для неверных операций со счетом
class InvalidAccountException extends RuntimeException {
    private String errorCode;

    public InvalidAccountException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() { return errorCode; }
}

public class BankAccount {
    private String accountId;
    private double balance;

    public BankAccount(String accountId, double initialBalance) {
        // Проверка идентификатора счета
        if (accountId == null || accountId.trim().isEmpty()) {
            throw new InvalidAccountException(
                "Идентификатор счета не может быть null или пустым", "INV_ACC_001");
        }

        // Проверка начального баланса
        if (initialBalance < 0) {
            throw new InvalidAccountException(
                "Начальный баланс не может быть отрицательным", "INV_ACC_002");
        }

        this.accountId = accountId;
        this.balance = initialBalance;
    }

    public void withdraw(double amount) throws InsufficientFundsException {
        // Проверка суммы снятия
        if (amount <= 0) {
            throw new InvalidAccountException(
                "Сумма снятия должна быть положительной", "INV_AMT_001");
        }

        // Проверка достаточности средств
        if (amount > balance) {
            throw new InsufficientFundsException(accountId, amount, balance);
        }

        // Выполнение снятия
        balance -= amount;
        System.out.println("Снято $" + amount + " со счета " + accountId);
    }

    public void deposit(double amount) {
        // Проверка суммы пополнения
        if (amount <= 0) {
            throw new InvalidAccountException(
                "Сумма пополнения должна быть положительной", "INV_AMT_002");
        }

        balance += amount;
        System.out.println("Зачислено $" + amount + " на счет " + accountId);
    }

    public double getBalance() {
        return balance;
    }

    public static void main(String[] args) {
        try {
            BankAccount account = new BankAccount("ACC001", 1000);
            System.out.println("Начальный баланс: $" + account.getBalance());

            account.withdraw(500);
            System.out.println("После снятия: $" + account.getBalance());

            account.withdraw(800);
        } catch (InsufficientFundsException e) {
            System.out.println("Транзакция не выполнена: " + e.getMessage());
            System.out.println("Код ошибки: " + e.getErrorCode());
        } catch (InvalidAccountException e) {
            System.out.println("Ошибка счета: " + e.getMessage());
            System.out.println("Код ошибки: " + e.getErrorCode());
        }
    }
}`,
            description: `Создайте банковскую систему с пользовательскими исключениями для валидации и ошибок бизнес-логики.

Требования:
1. Создайте InsufficientFundsException, наследующий Exception
2. Создайте InvalidAccountException, наследующий RuntimeException
3. Реализуйте класс BankAccount с методом withdraw(), который выбрасывает InsufficientFundsException
4. Добавьте пользовательские сообщения об ошибках с деталями счета
5. Включите коды ошибок в пользовательские исключения

Пример:
\`\`\`java
BankAccount account = new BankAccount("ACC001", 1000);
account.withdraw(500);   // Успех
account.withdraw(800);   // Выбрасывает InsufficientFundsException
\`\`\``,
            hint1: `Наследуйте Exception для проверяемых исключений (должны быть объявлены) и RuntimeException для непроверяемых исключений. Добавьте пользовательские поля для хранения дополнительного контекста об ошибке.`,
            hint2: `Используйте String.format() в вызове конструктора super() для создания детальных сообщений об ошибках. Добавьте методы getter для пользовательских полей, чтобы вызывающие могли получить детали ошибки.`,
            whyItMatters: `Пользовательские исключения делают ваш код более выразительным и поддерживаемым. Они позволяют предоставлять специфичную для домена информацию об ошибках и соответствующим образом обрабатывать различные ошибки бизнес-логики. Это необходимо для создания надежных корпоративных приложений.

**Продакшен паттерн:**
\`\`\`java
public class PaymentService {
    public void processPayment(Payment payment) throws PaymentException {
        try {
            validatePayment(payment);
            chargeCard(payment);
            updateInventory(payment);
        } catch (InsufficientFundsException e) {
            logger.warn("Payment declined: {}", e.getErrorCode());
            metrics.incrementCounter("payment.declined.insufficient_funds");
            throw e;
        } catch (InvalidCardException e) {
            logger.error("Invalid card: {}", e.getCardMask());
            alertService.sendAlert("Invalid card detected");
            throw new PaymentException("Card validation failed", e);
        }
    }
}
\`\`\`

**Практические преимущества:**
- Четкая классификация бизнес-ошибок
- Контекстная информация для отладки
- Интеграция с системами мониторинга`
        },
        uz: {
            title: `Maxsus Istisnolar Yaratish`,
            solutionCode: `// Mablag' yetishmasligi uchun maxsus tekshiriladigan istisno
class InsufficientFundsException extends Exception {
    private String accountId;
    private double requestedAmount;
    private double availableBalance;
    private String errorCode;

    public InsufficientFundsException(String accountId, double requestedAmount,
                                      double availableBalance) {
        // Formatlangan xabar bilan ota-konstruktorni chaqirish
        super(String.format("Hisob %s: Mablag' yetarli emas. So'ralgan: $%.2f, Mavjud: $%.2f",
                          accountId, requestedAmount, availableBalance));
        this.accountId = accountId;
        this.requestedAmount = requestedAmount;
        this.availableBalance = availableBalance;
        this.errorCode = "INS_FUNDS_001";
    }

    // Maxsus maydonlar uchun getterlar
    public String getAccountId() { return accountId; }
    public double getRequestedAmount() { return requestedAmount; }
    public double getAvailableBalance() { return availableBalance; }
    public String getErrorCode() { return errorCode; }
}

// Noto'g'ri hisob amallari uchun maxsus tekshirilmaydigan istisno
class InvalidAccountException extends RuntimeException {
    private String errorCode;

    public InvalidAccountException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    public String getErrorCode() { return errorCode; }
}

public class BankAccount {
    private String accountId;
    private double balance;

    public BankAccount(String accountId, double initialBalance) {
        // Hisob identifikatorini tekshirish
        if (accountId == null || accountId.trim().isEmpty()) {
            throw new InvalidAccountException(
                "Hisob identifikatori null yoki bo'sh bo'lishi mumkin emas", "INV_ACC_001");
        }

        // Boshlang'ich balansni tekshirish
        if (initialBalance < 0) {
            throw new InvalidAccountException(
                "Boshlang'ich balans manfiy bo'lishi mumkin emas", "INV_ACC_002");
        }

        this.accountId = accountId;
        this.balance = initialBalance;
    }

    public void withdraw(double amount) throws InsufficientFundsException {
        // Yechib olish summasini tekshirish
        if (amount <= 0) {
            throw new InvalidAccountException(
                "Yechib olish summasi musbat bo'lishi kerak", "INV_AMT_001");
        }

        // Mablag' yetarliligini tekshirish
        if (amount > balance) {
            throw new InsufficientFundsException(accountId, amount, balance);
        }

        // Yechib olishni bajarish
        balance -= amount;
        System.out.println("$" + amount + " " + accountId + " hisobidan yechib olindi");
    }

    public void deposit(double amount) {
        // Depozit summasini tekshirish
        if (amount <= 0) {
            throw new InvalidAccountException(
                "Depozit summasi musbat bo'lishi kerak", "INV_AMT_002");
        }

        balance += amount;
        System.out.println("$" + amount + " " + accountId + " hisobiga qo'shildi");
    }

    public double getBalance() {
        return balance;
    }

    public static void main(String[] args) {
        try {
            BankAccount account = new BankAccount("ACC001", 1000);
            System.out.println("Boshlang'ich balans: $" + account.getBalance());

            account.withdraw(500);
            System.out.println("Yechib olishdan keyin: $" + account.getBalance());

            account.withdraw(800);
        } catch (InsufficientFundsException e) {
            System.out.println("Tranzaksiya muvaffaqiyatsiz: " + e.getMessage());
            System.out.println("Xato kodi: " + e.getErrorCode());
        } catch (InvalidAccountException e) {
            System.out.println("Hisob xatosi: " + e.getMessage());
            System.out.println("Xato kodi: " + e.getErrorCode());
        }
    }
}`,
            description: `Tekshirish va biznes mantiq xatolari uchun maxsus istisnolar bilan bank tizimini yarating.

Talablar:
1. Exception dan meros oluvchi InsufficientFundsException yarating
2. RuntimeException dan meros oluvchi InvalidAccountException yarating
3. InsufficientFundsException tashlaydigan withdraw() metodi bilan BankAccount klassini yarating
4. Hisob tafsilotlari bilan maxsus xato xabarlarini qo'shing
5. Maxsus istisnolarga xato practixrini kiriting

Misol:
\`\`\`java
BankAccount account = new BankAccount("ACC001", 1000);
account.withdraw(500);   // Muvaffaqiyatli
account.withdraw(800);   // InsufficientFundsException tashlaydi
\`\`\``,
            hint1: `Tekshiriladigan istisnolar uchun Exception dan (e'lon qilinishi kerak) va tekshirilmaydigan istisnolar uchun RuntimeException dan meros oling. Xato haqida qo'shimcha kontekst saqlash uchun maxsus maydonlar qo'shing.`,
            hint2: `Batafsil xato xabarlarini yaratish uchun super() konstruktor chaqiruvida String.format() dan foydalaning. Chaqiruvchilar xato tafsilotlariga kirishlari uchun maxsus maydonlar uchun getter metodlarini qo'shing.`,
            whyItMatters: `Maxsus istisnolar kodingizni ifodali va saqlashga qulay qiladi. Ular domen uchun maxsus xato ma'lumotlarini taqdim etish va turli biznes mantiq xatolarini tegishli tarzda qayta ishlash imkonini beradi. Bu ishonchli korporativ ilovalar yaratish uchun zarur.

**Ishlab chiqarish patterni:**
\`\`\`java
public class PaymentService {
    public void processPayment(Payment payment) throws PaymentException {
        try {
            validatePayment(payment);
            chargeCard(payment);
            updateInventory(payment);
        } catch (InsufficientFundsException e) {
            logger.warn("To'lov rad etildi: {}", e.getErrorCode());
            metrics.incrementCounter("payment.declined.insufficient_funds");
            throw e;
        } catch (InvalidCardException e) {
            logger.error("Noto'g'ri karta: {}", e.getCardMask());
            alertService.sendAlert("Noto'g'ri karta aniqlandi");
            throw new PaymentException("Karta tekshiruvi muvaffaqiyatsiz", e);
        }
    }
}
\`\`\`

**Amaliy foydalari:**
- Biznes xatolarini aniq tasniflash
- Disk raskadrovka qilish uchun kontekstli ma'lumot
- Monitoring tizimlari bilan integratsiya`
        }
    }
};

export default task;
