import { Task } from '../../../../../../../types';

export const task: Task = {
	slug: 'java-dp-interpreter',
	title: 'Interpreter Pattern',
	difficulty: 'hard',
	tags: ['java', 'design-patterns', 'behavioral', 'interpreter', 'dsl'],
	estimatedTime: '40m',
	isPremium: false,
	youtubeUrl: '',
	description: `## Overview

The **Interpreter Pattern** defines a representation for a language's grammar along with an interpreter that uses the representation to interpret sentences in the language. Each grammar rule becomes a class, and the interpreter walks the abstract syntax tree to evaluate expressions.

## Key Components

| Component | Description |
|-----------|-------------|
| **AbstractExpression** | Interface declaring interpret() operation |
| **TerminalExpression** | Implements interpret for terminal symbols (literals) |
| **NonterminalExpression** | Implements interpret for grammar rules (operators) |
| **Context** | Contains global information for interpreter |
| **Client** | Builds abstract syntax tree and calls interpret |

## Your Task

Implement an arithmetic expression interpreter:
1. \`NumberExpression\` - terminal expression that returns numeric value
2. \`AddExpression\` - nonterminal that adds two sub-expressions
3. \`SubtractExpression\` - nonterminal that subtracts right from left
4. \`MultiplyExpression\` - nonterminal that multiplies two sub-expressions

## Example Usage

\`\`\`java
// Build expression tree: (5 + 3) * 2	// composite structure represents expression
Expression five = new NumberExpression(5);	// terminal: literal 5
Expression three = new NumberExpression(3);	// terminal: literal 3
Expression two = new NumberExpression(2);	// terminal: literal 2

Expression sum = new AddExpression(five, three);	// nonterminal: 5 + 3
Expression result = new MultiplyExpression(sum, two);	// nonterminal: (5+3) * 2

int value = result.interpret();	// recursively evaluate: returns 16
System.out.println("Result: " + value);	// output: Result: 16
\`\`\`

## Key Insight

Each expression node knows how to interpret itself. The tree structure represents the grammar, and recursive interpret() calls evaluate the entire expression from leaves to root.`,
	initialCode: `interface Expression {	// AbstractExpression - declares interpret operation
    int interpret();	// evaluate this expression and return result
}

class NumberExpression implements Expression {
    private int number;	// the numeric value

    public NumberExpression(int number) {	// constructor takes literal value
    }

    @Override
    public int interpret() {	// terminal returns its value directly
        throw new UnsupportedOperationException("TODO");
    }
}

class AddExpression implements Expression {
    private Expression left, right;	// operands are expressions themselves

    public AddExpression(Expression left, Expression right) {
    }

    @Override
    public int interpret() {	// add results of sub-expressions
        throw new UnsupportedOperationException("TODO");
    }
}

class SubtractExpression implements Expression {
    private Expression left, right;	// operands are expressions themselves

    public SubtractExpression(Expression left, Expression right) {
    }

    @Override
    public int interpret() {	// subtract right from left
        throw new UnsupportedOperationException("TODO");
    }
}

class MultiplyExpression implements Expression {
    private Expression left, right;	// operands are expressions themselves

    public MultiplyExpression(Expression left, Expression right) {
    }

    @Override
    public int interpret() {	// multiply results of sub-expressions
        throw new UnsupportedOperationException("TODO");
    }
}`,
	solutionCode: `interface Expression {	// AbstractExpression - declares interpret operation
    int interpret();	// evaluate this expression and return result
}

// Terminal expression - represents leaf nodes (numbers)
class NumberExpression implements Expression {	// TerminalExpression for literals
    private int number;	// the numeric value this expression represents

    public NumberExpression(int number) {	// constructor takes literal value
        this.number = number;	// store the number for later interpretation
    }

    @Override
    public int interpret() {	// terminal expression: return value directly
        return number;	// leaf node returns its stored value
    }
}

// Nonterminal expression - addition operation
class AddExpression implements Expression {	// NonterminalExpression for "+"
    private Expression left, right;	// child expressions (can be any Expression)

    public AddExpression(Expression left, Expression right) {	// constructor takes two operands
        this.left = left;	// store left operand expression
        this.right = right;	// store right operand expression
    }

    @Override
    public int interpret() {	// recursively interpret children and combine
        return left.interpret() + right.interpret();	// evaluate both sides, then add
    }
}

// Nonterminal expression - subtraction operation
class SubtractExpression implements Expression {	// NonterminalExpression for "-"
    private Expression left, right;	// child expressions

    public SubtractExpression(Expression left, Expression right) {	// constructor takes two operands
        this.left = left;	// store minuend expression
        this.right = right;	// store subtrahend expression
    }

    @Override
    public int interpret() {	// recursively interpret children and combine
        return left.interpret() - right.interpret();	// evaluate both sides, then subtract
    }
}

// Nonterminal expression - multiplication operation
class MultiplyExpression implements Expression {	// NonterminalExpression for "*"
    private Expression left, right;	// child expressions

    public MultiplyExpression(Expression left, Expression right) {	// constructor takes two operands
        this.left = left;	// store multiplicand expression
        this.right = right;	// store multiplier expression
    }

    @Override
    public int interpret() {	// recursively interpret children and combine
        return left.interpret() * right.interpret();	// evaluate both sides, then multiply
    }
}`,
	hint1: `## Terminal vs Nonterminal Expressions

Terminal expressions are the leaves of the AST - they return values directly:

\`\`\`java
// NumberExpression is TERMINAL - no children
@Override
public int interpret() {	// terminal interpretation
    return number;	// just return the stored value
}
\`\`\`

Nonterminal expressions have children and combine their results:

\`\`\`java
// AddExpression is NONTERMINAL - has children
@Override
public int interpret() {	// nonterminal interpretation
    // First interpret children, then combine results
    int leftValue = left.interpret();	// recursive call
    int rightValue = right.interpret();	// recursive call
    return leftValue + rightValue;	// combine with operation
}
\`\`\``,
	hint2: `## The Recursive Interpretation Pattern

Each binary expression follows the same pattern - interpret both operands, apply operation:

\`\`\`java
// Pattern for ANY binary operator
class BinaryExpression implements Expression {
    private Expression left, right;	// child expressions

    @Override
    public int interpret() {
        int l = left.interpret();	// Step 1: evaluate left subtree
        int r = right.interpret();	// Step 2: evaluate right subtree
        return applyOperation(l, r);	// Step 3: combine results
    }
}

// For Add: return l + r
// For Subtract: return l - r
// For Multiply: return l * r
// For Divide: return l / r (check r != 0!)
\`\`\`

The tree structure ensures correct order of operations!`,
	whyItMatters: `## The Problem

Building interpreters without proper grammar representation leads to messy, unmaintainable code:

\`\`\`java
// WITHOUT Interpreter - hardcoded parsing logic
class Calculator {
    public int evaluate(String expression) {	// string-based evaluation
        // Messy parsing with regex or string manipulation
        String[] parts = expression.split("\\\\+");	// only handles addition
        int result = 0;
        for (String part : parts) {
            result += Integer.parseInt(part.trim());	// no operator precedence
        }
        return result;	// can't handle nested expressions
    }
}

// Adding multiplication? Rewrite everything!
// Adding parentheses? Complete nightmare!
\`\`\`

## The Solution

With Interpreter pattern, grammar rules become composable classes:

\`\`\`java
// WITH Interpreter - composable expression tree
Expression expr = new MultiplyExpression(	// top-level: multiplication
    new AddExpression(	// left: addition
        new NumberExpression(5),	// leaf: 5
        new NumberExpression(3)	// leaf: 3
    ),
    new SubtractExpression(	// right: subtraction
        new NumberExpression(10),	// leaf: 10
        new NumberExpression(2)	// leaf: 2
    )
);

int result = expr.interpret();	// evaluates: (5+3) * (10-2) = 64
// Adding new operators = adding new classes
// Tree structure handles precedence automatically
\`\`\`

## Real-World Applications

| Application | Grammar/Language | Use Case |
|-------------|------------------|----------|
| **SQL Parsers** | SQL WHERE clauses | Query building/optimization |
| **Regular Expressions** | Regex syntax | Pattern matching engines |
| **Expression Languages** | SpEL, OGNL, JEXL | Configuration expressions |
| **Rule Engines** | Business rules DSL | Dynamic business logic |
| **Math Parsers** | Arithmetic/algebra | Calculators, plotting |
| **Template Engines** | Template syntax | Thymeleaf, FreeMarker |
| **Query Builders** | Criteria API | JPA Specification |

## Production Pattern: Boolean Rule Engine

\`\`\`java
// Context - holds variables for evaluation
class Context {	// shared state for interpretation
    private final Map<String, Object> variables = new HashMap<>();	// variable bindings

    public void setVariable(String name, Object value) {	// bind variable
        variables.put(name, value);	// store name-value pair
    }

    public Object getVariable(String name) {	// lookup variable
        return variables.get(name);	// return bound value
    }
}

// AbstractExpression for boolean rules
interface BooleanExpression {	// grammar for boolean expressions
    boolean interpret(Context context);	// evaluate with context
}

// Terminal: Variable reference
class Variable implements BooleanExpression {	// terminal for variable lookup
    private final String name;	// variable name to lookup

    public Variable(String name) {	// construct with variable name
        this.name = name;	// store for later lookup
    }

    @Override
    public boolean interpret(Context context) {	// lookup in context
        Object value = context.getVariable(name);	// get bound value
        return Boolean.TRUE.equals(value);	// convert to boolean
    }
}

// Terminal: Comparison expression
class GreaterThan implements BooleanExpression {	// terminal for > comparison
    private final String variable;	// variable to compare
    private final int threshold;	// threshold value

    public GreaterThan(String variable, int threshold) {	// construct comparison
        this.variable = variable;	// store variable name
        this.threshold = threshold;	// store threshold
    }

    @Override
    public boolean interpret(Context context) {	// evaluate comparison
        Object value = context.getVariable(variable);	// get variable value
        if (value instanceof Number) {	// type check
            return ((Number) value).intValue() > threshold;	// compare
        }
        return false;	// non-numeric is false
    }
}

// Nonterminal: AND expression
class AndExpression implements BooleanExpression {	// nonterminal for &&
    private final BooleanExpression left;	// left operand
    private final BooleanExpression right;	// right operand

    public AndExpression(BooleanExpression left, BooleanExpression right) {
        this.left = left;	// store left expression
        this.right = right;	// store right expression
    }

    @Override
    public boolean interpret(Context context) {	// evaluate AND
        return left.interpret(context) && right.interpret(context);	// short-circuit
    }
}

// Nonterminal: OR expression
class OrExpression implements BooleanExpression {	// nonterminal for ||
    private final BooleanExpression left;	// left operand
    private final BooleanExpression right;	// right operand

    public OrExpression(BooleanExpression left, BooleanExpression right) {
        this.left = left;	// store left expression
        this.right = right;	// store right expression
    }

    @Override
    public boolean interpret(Context context) {	// evaluate OR
        return left.interpret(context) || right.interpret(context);	// short-circuit
    }
}

// Nonterminal: NOT expression
class NotExpression implements BooleanExpression {	// nonterminal for !
    private final BooleanExpression expression;	// operand to negate

    public NotExpression(BooleanExpression expression) {	// construct NOT
        this.expression = expression;	// store operand
    }

    @Override
    public boolean interpret(Context context) {	// evaluate NOT
        return !expression.interpret(context);	// negate result
    }
}

// Rule parser - converts string to expression tree
class RuleParser {	// client that builds AST
    public BooleanExpression parse(String rule) {	// parse rule string
        // Simplified: handles "age > 18 AND premium"
        if (rule.contains(" AND ")) {	// AND expression
            String[] parts = rule.split(" AND ");	// split by AND
            return new AndExpression(	// create AND node
                parse(parts[0].trim()),	// parse left
                parse(parts[1].trim())	// parse right
            );
        }
        if (rule.contains(" OR ")) {	// OR expression
            String[] parts = rule.split(" OR ");	// split by OR
            return new OrExpression(	// create OR node
                parse(parts[0].trim()),	// parse left
                parse(parts[1].trim())	// parse right
            );
        }
        if (rule.startsWith("NOT ")) {	// NOT expression
            return new NotExpression(	// create NOT node
                parse(rule.substring(4).trim())	// parse operand
            );
        }
        if (rule.contains(" > ")) {	// Greater than comparison
            String[] parts = rule.split(" > ");	// split by >
            return new GreaterThan(	// create comparison node
                parts[0].trim(),	// variable name
                Integer.parseInt(parts[1].trim())	// threshold value
            );
        }
        return new Variable(rule.trim());	// default: variable reference
    }
}

// Usage example
class RuleEngine {	// demonstrates full rule engine
    public static void main(String[] args) {
        RuleParser parser = new RuleParser();	// create parser

        // Define rule: age > 18 AND premium
        BooleanExpression rule = parser.parse(	// parse rule string
            "age > 18 AND premium"	// business rule as string
        );

        // Create context with user data
        Context context = new Context();	// evaluation context
        context.setVariable("age", 25);	// user is 25 years old
        context.setVariable("premium", true);	// user is premium

        // Evaluate rule
        boolean eligible = rule.interpret(context);	// evaluate rule tree
        System.out.println("Eligible: " + eligible);	// output: true

        // Change context
        context.setVariable("age", 16);	// user is now 16
        eligible = rule.interpret(context);	// re-evaluate
        System.out.println("Eligible: " + eligible);	// output: false
    }
}
\`\`\`

## Common Mistakes to Avoid

| Mistake | Problem | Solution |
|---------|---------|----------|
| **Complex grammars** | AST becomes huge and slow | Use parser generators (ANTLR) for complex grammars |
| **No context** | Can't handle variables/state | Add Context object for shared interpretation state |
| **Deep recursion** | Stack overflow on large expressions | Use iteration with explicit stack, or limit depth |
| **Parsing in expressions** | Mixing parsing with interpretation | Separate parsing (build AST) from interpretation |
| **Mutable expressions** | Thread safety issues | Make expression objects immutable |
| **No caching** | Re-evaluate same subexpressions | Cache intermediate results if expressions reused |`,
	order: 10,
	testCode: `import static org.junit.Assert.*;
import org.junit.Test;

// Test1: NumberExpression returns its value
class Test1 {
    @Test
    public void test() {
        Expression five = new NumberExpression(5);
        assertEquals(5, five.interpret());
    }
}

// Test2: AddExpression adds two numbers
class Test2 {
    @Test
    public void test() {
        Expression sum = new AddExpression(
            new NumberExpression(5),
            new NumberExpression(3)
        );
        assertEquals(8, sum.interpret());
    }
}

// Test3: SubtractExpression subtracts right from left
class Test3 {
    @Test
    public void test() {
        Expression diff = new SubtractExpression(
            new NumberExpression(10),
            new NumberExpression(4)
        );
        assertEquals(6, diff.interpret());
    }
}

// Test4: MultiplyExpression multiplies two numbers
class Test4 {
    @Test
    public void test() {
        Expression product = new MultiplyExpression(
            new NumberExpression(6),
            new NumberExpression(7)
        );
        assertEquals(42, product.interpret());
    }
}

// Test5: Nested expression (5 + 3) * 2 = 16
class Test5 {
    @Test
    public void test() {
        Expression sum = new AddExpression(
            new NumberExpression(5),
            new NumberExpression(3)
        );
        Expression result = new MultiplyExpression(sum, new NumberExpression(2));
        assertEquals(16, result.interpret());
    }
}

// Test6: Complex expression (10 - 2) * (3 + 1) = 32
class Test6 {
    @Test
    public void test() {
        Expression left = new SubtractExpression(
            new NumberExpression(10),
            new NumberExpression(2)
        );
        Expression right = new AddExpression(
            new NumberExpression(3),
            new NumberExpression(1)
        );
        Expression result = new MultiplyExpression(left, right);
        assertEquals(32, result.interpret());
    }
}

// Test7: NumberExpression with zero
class Test7 {
    @Test
    public void test() {
        Expression zero = new NumberExpression(0);
        assertEquals(0, zero.interpret());
    }
}

// Test8: Subtraction resulting in negative
class Test8 {
    @Test
    public void test() {
        Expression diff = new SubtractExpression(
            new NumberExpression(3),
            new NumberExpression(10)
        );
        assertEquals(-7, diff.interpret());
    }
}

// Test9: Multiply by zero
class Test9 {
    @Test
    public void test() {
        Expression product = new MultiplyExpression(
            new NumberExpression(100),
            new NumberExpression(0)
        );
        assertEquals(0, product.interpret());
    }
}

// Test10: Chain of additions 1 + 2 + 3 + 4 = 10
class Test10 {
    @Test
    public void test() {
        Expression sum1 = new AddExpression(
            new NumberExpression(1),
            new NumberExpression(2)
        );
        Expression sum2 = new AddExpression(sum1, new NumberExpression(3));
        Expression sum3 = new AddExpression(sum2, new NumberExpression(4));
        assertEquals(10, sum3.interpret());
    }
}
`,
	translations: {
		ru: {
			title: 'Паттерн Interpreter (Интерпретатор)',
			description: `## Обзор

**Паттерн Interpreter** определяет представление грамматики языка вместе с интерпретатором, который использует это представление для интерпретации предложений на этом языке. Каждое правило грамматики становится классом, и интерпретатор обходит абстрактное синтаксическое дерево для вычисления выражений.

## Ключевые компоненты

| Компонент | Описание |
|-----------|----------|
| **AbstractExpression** | Интерфейс, объявляющий операцию interpret() |
| **TerminalExpression** | Реализует interpret для терминальных символов (литералов) |
| **NonterminalExpression** | Реализует interpret для правил грамматики (операторов) |
| **Context** | Содержит глобальную информацию для интерпретатора |
| **Client** | Строит абстрактное синтаксическое дерево и вызывает interpret |

## Ваша задача

Реализуйте интерпретатор арифметических выражений:
1. \`NumberExpression\` - терминальное выражение, возвращающее числовое значение
2. \`AddExpression\` - нетерминальное, складывающее два подвыражения
3. \`SubtractExpression\` - нетерминальное, вычитающее правое из левого
4. \`MultiplyExpression\` - нетерминальное, умножающее два подвыражения

## Пример использования

\`\`\`java
// Построение дерева выражений: (5 + 3) * 2	// композитная структура представляет выражение
Expression five = new NumberExpression(5);	// терминал: литерал 5
Expression three = new NumberExpression(3);	// терминал: литерал 3
Expression two = new NumberExpression(2);	// терминал: литерал 2

Expression sum = new AddExpression(five, three);	// нетерминал: 5 + 3
Expression result = new MultiplyExpression(sum, two);	// нетерминал: (5+3) * 2

int value = result.interpret();	// рекурсивное вычисление: возвращает 16
System.out.println("Результат: " + value);	// вывод: Результат: 16
\`\`\`

## Ключевой принцип

Каждый узел выражения знает, как интерпретировать себя. Древовидная структура представляет грамматику, и рекурсивные вызовы interpret() вычисляют всё выражение от листьев к корню.`,
			hint1: `## Терминальные vs Нетерминальные выражения

Терминальные выражения - это листья AST - они возвращают значения напрямую:

\`\`\`java
// NumberExpression - ТЕРМИНАЛЬНОЕ - нет потомков
@Override
public int interpret() {	// терминальная интерпретация
    return number;	// просто вернуть хранимое значение
}
\`\`\`

Нетерминальные выражения имеют потомков и комбинируют их результаты:

\`\`\`java
// AddExpression - НЕТЕРМИНАЛЬНОЕ - есть потомки
@Override
public int interpret() {	// нетерминальная интерпретация
    // Сначала интерпретировать потомков, затем объединить результаты
    int leftValue = left.interpret();	// рекурсивный вызов
    int rightValue = right.interpret();	// рекурсивный вызов
    return leftValue + rightValue;	// объединить с операцией
}
\`\`\``,
			hint2: `## Паттерн рекурсивной интерпретации

Каждое бинарное выражение следует одному паттерну - интерпретировать оба операнда, применить операцию:

\`\`\`java
// Паттерн для ЛЮБОГО бинарного оператора
class BinaryExpression implements Expression {
    private Expression left, right;	// дочерние выражения

    @Override
    public int interpret() {
        int l = left.interpret();	// Шаг 1: вычислить левое поддерево
        int r = right.interpret();	// Шаг 2: вычислить правое поддерево
        return applyOperation(l, r);	// Шаг 3: объединить результаты
    }
}

// Для Add: return l + r
// Для Subtract: return l - r
// Для Multiply: return l * r
// Для Divide: return l / r (проверить r != 0!)
\`\`\`

Древовидная структура обеспечивает правильный порядок операций!`,
			whyItMatters: `## Проблема

Построение интерпретаторов без правильного представления грамматики приводит к запутанному, неподдерживаемому коду:

\`\`\`java
// БЕЗ Interpreter - жёстко закодированная логика парсинга
class Calculator {
    public int evaluate(String expression) {	// вычисление на основе строк
        // Запутанный парсинг с regex или манипуляцией строками
        String[] parts = expression.split("\\\\+");	// только сложение
        int result = 0;
        for (String part : parts) {
            result += Integer.parseInt(part.trim());	// нет приоритета операций
        }
        return result;	// не может обрабатывать вложенные выражения
    }
}

// Добавить умножение? Переписать всё!
// Добавить скобки? Полный кошмар!
\`\`\`

## Решение

С паттерном Interpreter правила грамматики становятся компонуемыми классами:

\`\`\`java
// С Interpreter - компонуемое дерево выражений
Expression expr = new MultiplyExpression(	// верхний уровень: умножение
    new AddExpression(	// левое: сложение
        new NumberExpression(5),	// лист: 5
        new NumberExpression(3)	// лист: 3
    ),
    new SubtractExpression(	// правое: вычитание
        new NumberExpression(10),	// лист: 10
        new NumberExpression(2)	// лист: 2
    )
);

int result = expr.interpret();	// вычисляет: (5+3) * (10-2) = 64
// Добавление новых операторов = добавление новых классов
// Древовидная структура автоматически обрабатывает приоритет
\`\`\`

## Применение в реальном мире

| Применение | Грамматика/Язык | Случай использования |
|------------|-----------------|---------------------|
| **SQL парсеры** | SQL WHERE предложения | Построение/оптимизация запросов |
| **Регулярные выражения** | Синтаксис Regex | Движки сопоставления шаблонов |
| **Языки выражений** | SpEL, OGNL, JEXL | Выражения конфигурации |
| **Движки правил** | DSL бизнес-правил | Динамическая бизнес-логика |
| **Математические парсеры** | Арифметика/алгебра | Калькуляторы, построение графиков |
| **Шаблонизаторы** | Синтаксис шаблонов | Thymeleaf, FreeMarker |
| **Строители запросов** | Criteria API | JPA Specification |

## Продакшн паттерн: Движок булевых правил

\`\`\`java
// Context - хранит переменные для вычисления
class Context {	// общее состояние для интерпретации
    private final Map<String, Object> variables = new HashMap<>();	// привязки переменных

    public void setVariable(String name, Object value) {	// привязать переменную
        variables.put(name, value);	// сохранить пару имя-значение
    }

    public Object getVariable(String name) {	// найти переменную
        return variables.get(name);	// вернуть привязанное значение
    }
}

// AbstractExpression для булевых правил
interface BooleanExpression {	// грамматика для булевых выражений
    boolean interpret(Context context);	// вычислить с контекстом
}

// Терминал: Ссылка на переменную
class Variable implements BooleanExpression {	// терминал для поиска переменной
    private final String name;	// имя переменной для поиска

    public Variable(String name) {	// создать с именем переменной
        this.name = name;	// сохранить для последующего поиска
    }

    @Override
    public boolean interpret(Context context) {	// поиск в контексте
        Object value = context.getVariable(name);	// получить привязанное значение
        return Boolean.TRUE.equals(value);	// преобразовать в boolean
    }
}

// Терминал: Выражение сравнения
class GreaterThan implements BooleanExpression {	// терминал для сравнения >
    private final String variable;	// переменная для сравнения
    private final int threshold;	// пороговое значение

    public GreaterThan(String variable, int threshold) {	// создать сравнение
        this.variable = variable;	// сохранить имя переменной
        this.threshold = threshold;	// сохранить порог
    }

    @Override
    public boolean interpret(Context context) {	// вычислить сравнение
        Object value = context.getVariable(variable);	// получить значение
        if (value instanceof Number) {	// проверка типа
            return ((Number) value).intValue() > threshold;	// сравнить
        }
        return false;	// нечисловое - false
    }
}

// Нетерминал: AND выражение
class AndExpression implements BooleanExpression {	// нетерминал для &&
    private final BooleanExpression left;	// левый операнд
    private final BooleanExpression right;	// правый операнд

    public AndExpression(BooleanExpression left, BooleanExpression right) {
        this.left = left;	// сохранить левое выражение
        this.right = right;	// сохранить правое выражение
    }

    @Override
    public boolean interpret(Context context) {	// вычислить AND
        return left.interpret(context) && right.interpret(context);	// короткое замыкание
    }
}

// Нетерминал: OR выражение
class OrExpression implements BooleanExpression {	// нетерминал для ||
    private final BooleanExpression left;	// левый операнд
    private final BooleanExpression right;	// правый операнд

    public OrExpression(BooleanExpression left, BooleanExpression right) {
        this.left = left;	// сохранить левое выражение
        this.right = right;	// сохранить правое выражение
    }

    @Override
    public boolean interpret(Context context) {	// вычислить OR
        return left.interpret(context) || right.interpret(context);	// короткое замыкание
    }
}

// Нетерминал: NOT выражение
class NotExpression implements BooleanExpression {	// нетерминал для !
    private final BooleanExpression expression;	// операнд для отрицания

    public NotExpression(BooleanExpression expression) {	// создать NOT
        this.expression = expression;	// сохранить операнд
    }

    @Override
    public boolean interpret(Context context) {	// вычислить NOT
        return !expression.interpret(context);	// инвертировать результат
    }
}

// Парсер правил - преобразует строку в дерево выражений
class RuleParser {	// клиент, строящий AST
    public BooleanExpression parse(String rule) {	// парсить строку правила
        // Упрощённо: обрабатывает "age > 18 AND premium"
        if (rule.contains(" AND ")) {	// AND выражение
            String[] parts = rule.split(" AND ");	// разделить по AND
            return new AndExpression(	// создать узел AND
                parse(parts[0].trim()),	// парсить левое
                parse(parts[1].trim())	// парсить правое
            );
        }
        if (rule.contains(" OR ")) {	// OR выражение
            String[] parts = rule.split(" OR ");	// разделить по OR
            return new OrExpression(	// создать узел OR
                parse(parts[0].trim()),	// парсить левое
                parse(parts[1].trim())	// парсить правое
            );
        }
        if (rule.startsWith("NOT ")) {	// NOT выражение
            return new NotExpression(	// создать узел NOT
                parse(rule.substring(4).trim())	// парсить операнд
            );
        }
        if (rule.contains(" > ")) {	// Сравнение больше
            String[] parts = rule.split(" > ");	// разделить по >
            return new GreaterThan(	// создать узел сравнения
                parts[0].trim(),	// имя переменной
                Integer.parseInt(parts[1].trim())	// пороговое значение
            );
        }
        return new Variable(rule.trim());	// по умолчанию: ссылка на переменную
    }
}

// Пример использования
class RuleEngine {	// демонстрирует полный движок правил
    public static void main(String[] args) {
        RuleParser parser = new RuleParser();	// создать парсер

        // Определить правило: age > 18 AND premium
        BooleanExpression rule = parser.parse(	// парсить строку правила
            "age > 18 AND premium"	// бизнес-правило как строка
        );

        // Создать контекст с данными пользователя
        Context context = new Context();	// контекст вычисления
        context.setVariable("age", 25);	// пользователю 25 лет
        context.setVariable("premium", true);	// пользователь премиум

        // Вычислить правило
        boolean eligible = rule.interpret(context);	// вычислить дерево
        System.out.println("Подходит: " + eligible);	// вывод: true

        // Изменить контекст
        context.setVariable("age", 16);	// пользователю теперь 16
        eligible = rule.interpret(context);	// перевычислить
        System.out.println("Подходит: " + eligible);	// вывод: false
    }
}
\`\`\`

## Частые ошибки, которых следует избегать

| Ошибка | Проблема | Решение |
|--------|----------|---------|
| **Сложные грамматики** | AST становится огромным и медленным | Использовать генераторы парсеров (ANTLR) для сложных грамматик |
| **Нет контекста** | Не может обрабатывать переменные/состояние | Добавить объект Context для общего состояния интерпретации |
| **Глубокая рекурсия** | Переполнение стека на больших выражениях | Использовать итерацию с явным стеком или ограничить глубину |
| **Парсинг в выражениях** | Смешивание парсинга с интерпретацией | Разделить парсинг (построение AST) и интерпретацию |
| **Изменяемые выражения** | Проблемы потокобезопасности | Сделать объекты выражений неизменяемыми |
| **Нет кэширования** | Повторное вычисление одинаковых подвыражений | Кэшировать промежуточные результаты при повторном использовании |`
		},
		uz: {
			title: 'Interpreter Pattern',
			description: `## Umumiy ko'rinish

**Interpreter Pattern** til grammatikasi uchun ifoda bilan birga, bu ifodani tilning jumlalarini talqin qilish uchun ishlatadigan interpretatorni belgilaydi. Har bir grammatika qoidasi klassga aylanadi va interpretator abstrakt sintaktik daraxtni bosib o'tib ifodalarni hisoblaydi.

## Asosiy komponentlar

| Komponent | Tavsif |
|-----------|--------|
| **AbstractExpression** | interpret() operatsiyasini e'lon qiluvchi interfeys |
| **TerminalExpression** | Terminal belgilar (literallar) uchun interpret ni amalga oshiradi |
| **NonterminalExpression** | Grammatika qoidalari (operatorlar) uchun interpret ni amalga oshiradi |
| **Context** | Interpretator uchun global ma'lumotni saqlaydi |
| **Client** | Abstrakt sintaktik daraxtni quradi va interpret ni chaqiradi |

## Sizning vazifangiz

Arifmetik ifoda interpretatorini amalga oshiring:
1. \`NumberExpression\` - raqamli qiymatni qaytaradigan terminal ifoda
2. \`AddExpression\` - ikkita sub-ifodani qo'shadigan noterminal
3. \`SubtractExpression\` - o'ngni chapdan ayiradigan noterminal
4. \`MultiplyExpression\` - ikkita sub-ifodani ko'paytiradigan noterminal

## Foydalanish misoli

\`\`\`java
// Ifoda daraxtini qurish: (5 + 3) * 2	// kompozit struktura ifodani ifodalaydi
Expression five = new NumberExpression(5);	// terminal: literal 5
Expression three = new NumberExpression(3);	// terminal: literal 3
Expression two = new NumberExpression(2);	// terminal: literal 2

Expression sum = new AddExpression(five, three);	// noterminal: 5 + 3
Expression result = new MultiplyExpression(sum, two);	// noterminal: (5+3) * 2

int value = result.interpret();	// rekursiv hisoblash: 16 qaytaradi
System.out.println("Natija: " + value);	// chiqish: Natija: 16
\`\`\`

## Asosiy tushuncha

Har bir ifoda tugun o'zini qanday talqin qilishni biladi. Daraxt strukturasi grammatikani ifodalaydi va rekursiv interpret() chaqiruvlari butun ifodani barglardan ildizga hisoblaydi.`,
			hint1: `## Terminal vs Noterminal ifodalar

Terminal ifodalar AST ning barglari - ular to'g'ridan-to'g'ri qiymatlarni qaytaradi:

\`\`\`java
// NumberExpression - TERMINAL - bolalari yo'q
@Override
public int interpret() {	// terminal talqin
    return number;	// shunchaki saqlangan qiymatni qaytarish
}
\`\`\`

Noterminal ifodalar bolalarga ega va ularning natijalarini birlashtiradi:

\`\`\`java
// AddExpression - NOTERMINAL - bolalari bor
@Override
public int interpret() {	// noterminal talqin
    // Avval bolalarni talqin qilish, keyin natijalarni birlashtirish
    int leftValue = left.interpret();	// rekursiv chaqiruv
    int rightValue = right.interpret();	// rekursiv chaqiruv
    return leftValue + rightValue;	// operatsiya bilan birlashtirish
}
\`\`\``,
			hint2: `## Rekursiv talqin qilish pattern

Har bir binar ifoda bir xil patternni kuzatadi - ikkala operandni talqin qilish, operatsiyani qo'llash:

\`\`\`java
// HAR QANDAY binar operator uchun pattern
class BinaryExpression implements Expression {
    private Expression left, right;	// bola ifodalar

    @Override
    public int interpret() {
        int l = left.interpret();	// 1-qadam: chap daraxtni hisoblash
        int r = right.interpret();	// 2-qadam: o'ng daraxtni hisoblash
        return applyOperation(l, r);	// 3-qadam: natijalarni birlashtirish
    }
}

// Add uchun: return l + r
// Subtract uchun: return l - r
// Multiply uchun: return l * r
// Divide uchun: return l / r (r != 0 tekshirish!)
\`\`\`

Daraxt strukturasi to'g'ri operatsiyalar tartibini ta'minlaydi!`,
			whyItMatters: `## Muammo

Grammatikaning to'g'ri ifodasiz interpretatorlar qurish chalkash, qo'llab-quvvatlab bo'lmaydigan kodga olib keladi:

\`\`\`java
// Interpreter SDAN - qattiq practixngan parsing mantiq
class Calculator {
    public int evaluate(String expression) {	// satrga asoslangan hisoblash
        // Chalkash parsing regex yoki satr manipulyatsiyasi bilan
        String[] parts = expression.split("\\\\+");	// faqat qo'shishni boshqaradi
        int result = 0;
        for (String part : parts) {
            result += Integer.parseInt(part.trim());	// operatsiyalar ustunligi yo'q
        }
        return result;	// ichki ifodalarni boshqara olmaydi
    }
}

// Ko'paytirish qo'shishmi? Hammasini qayta yozish!
// Qavslar qo'shishmi? To'liq dahshat!
\`\`\`

## Yechim

Interpreter pattern bilan grammatika qoidalari komponuemay klasslar bo'ladi:

\`\`\`java
// Interpreter BILAN - komponuemay ifoda daraxti
Expression expr = new MultiplyExpression(	// yuqori daraja: ko'paytirish
    new AddExpression(	// chap: qo'shish
        new NumberExpression(5),	// barg: 5
        new NumberExpression(3)	// barg: 3
    ),
    new SubtractExpression(	// o'ng: ayirish
        new NumberExpression(10),	// barg: 10
        new NumberExpression(2)	// barg: 2
    )
);

int result = expr.interpret();	// hisoblaydi: (5+3) * (10-2) = 64
// Yangi operatorlar qo'shish = yangi klasslar qo'shish
// Daraxt strukturasi ustunlikni avtomatik boshqaradi
\`\`\`

## Haqiqiy dunyo ilovalari

| Ilova | Grammatika/Til | Foydalanish holati |
|-------|----------------|-------------------|
| **SQL parserlari** | SQL WHERE bandlari | So'rov qurish/optimallashtirish |
| **Regulyar ifodalar** | Regex sintaksisi | Pattern matching dvigatellari |
| **Ifoda tillari** | SpEL, OGNL, JEXL | Konfiguratsiya ifodalari |
| **Qoidalar dvigatellari** | Biznes qoidalari DSL | Dinamik biznes mantiq |
| **Matematik parserlar** | Arifmetika/algebra | Kalkulyatorlar, grafik chizish |
| **Shablon dvigatellari** | Shablon sintaksisi | Thymeleaf, FreeMarker |
| **So'rov qurovchilari** | Criteria API | JPA Specification |

## Production Pattern: Boolean qoidalar dvigateli

\`\`\`java
// Context - hisoblash uchun o'zgaruvchilarni saqlaydi
class Context {	// talqin uchun umumiy holat
    private final Map<String, Object> variables = new HashMap<>();	// o'zgaruvchi bog'lanishlar

    public void setVariable(String name, Object value) {	// o'zgaruvchini bog'lash
        variables.put(name, value);	// nom-qiymat juftini saqlash
    }

    public Object getVariable(String name) {	// o'zgaruvchini topish
        return variables.get(name);	// bog'langan qiymatni qaytarish
    }
}

// Boolean qoidalar uchun AbstractExpression
interface BooleanExpression {	// boolean ifodalar grammatikasi
    boolean interpret(Context context);	// kontekst bilan hisoblash
}

// Terminal: O'zgaruvchi havola
class Variable implements BooleanExpression {	// o'zgaruvchi qidirish uchun terminal
    private final String name;	// qidirish uchun o'zgaruvchi nomi

    public Variable(String name) {	// o'zgaruvchi nomi bilan yaratish
        this.name = name;	// keyingi qidirish uchun saqlash
    }

    @Override
    public boolean interpret(Context context) {	// kontekstda qidirish
        Object value = context.getVariable(name);	// bog'langan qiymatni olish
        return Boolean.TRUE.equals(value);	// boolean ga aylantirish
    }
}

// Terminal: Solishtirish ifodasi
class GreaterThan implements BooleanExpression {	// > solishtirish uchun terminal
    private final String variable;	// solishtirish uchun o'zgaruvchi
    private final int threshold;	// chegara qiymati

    public GreaterThan(String variable, int threshold) {	// solishtirish yaratish
        this.variable = variable;	// o'zgaruvchi nomini saqlash
        this.threshold = threshold;	// chegarani saqlash
    }

    @Override
    public boolean interpret(Context context) {	// solishtirishni hisoblash
        Object value = context.getVariable(variable);	// o'zgaruvchi qiymatini olish
        if (value instanceof Number) {	// tip tekshiruvi
            return ((Number) value).intValue() > threshold;	// solishtirish
        }
        return false;	// raqamli bo'lmagan - false
    }
}

// Noterminal: AND ifoda
class AndExpression implements BooleanExpression {	// && uchun noterminal
    private final BooleanExpression left;	// chap operand
    private final BooleanExpression right;	// o'ng operand

    public AndExpression(BooleanExpression left, BooleanExpression right) {
        this.left = left;	// chap ifodani saqlash
        this.right = right;	// o'ng ifodani saqlash
    }

    @Override
    public boolean interpret(Context context) {	// AND ni hisoblash
        return left.interpret(context) && right.interpret(context);	// qisqa tutashuv
    }
}

// Noterminal: OR ifoda
class OrExpression implements BooleanExpression {	// || uchun noterminal
    private final BooleanExpression left;	// chap operand
    private final BooleanExpression right;	// o'ng operand

    public OrExpression(BooleanExpression left, BooleanExpression right) {
        this.left = left;	// chap ifodani saqlash
        this.right = right;	// o'ng ifodani saqlash
    }

    @Override
    public boolean interpret(Context context) {	// OR ni hisoblash
        return left.interpret(context) || right.interpret(context);	// qisqa tutashuv
    }
}

// Noterminal: NOT ifoda
class NotExpression implements BooleanExpression {	// ! uchun noterminal
    private final BooleanExpression expression;	// inkor qilish operand

    public NotExpression(BooleanExpression expression) {	// NOT yaratish
        this.expression = expression;	// operandni saqlash
    }

    @Override
    public boolean interpret(Context context) {	// NOT ni hisoblash
        return !expression.interpret(context);	// natijani inkor qilish
    }
}

// Qoida parseri - satrni ifoda daraxtiga aylantiradi
class RuleParser {	// AST quradigan client
    public BooleanExpression parse(String rule) {	// qoida satrini parse qilish
        // Soddalashtirilgan: "age > 18 AND premium" ni boshqaradi
        if (rule.contains(" AND ")) {	// AND ifoda
            String[] parts = rule.split(" AND ");	// AND bo'yicha ajratish
            return new AndExpression(	// AND tugun yaratish
                parse(parts[0].trim()),	// chapni parse qilish
                parse(parts[1].trim())	// o'ngni parse qilish
            );
        }
        if (rule.contains(" OR ")) {	// OR ifoda
            String[] parts = rule.split(" OR ");	// OR bo'yicha ajratish
            return new OrExpression(	// OR tugun yaratish
                parse(parts[0].trim()),	// chapni parse qilish
                parse(parts[1].trim())	// o'ngni parse qilish
            );
        }
        if (rule.startsWith("NOT ")) {	// NOT ifoda
            return new NotExpression(	// NOT tugun yaratish
                parse(rule.substring(4).trim())	// operandni parse qilish
            );
        }
        if (rule.contains(" > ")) {	// Katta solishtirish
            String[] parts = rule.split(" > ");	// > bo'yicha ajratish
            return new GreaterThan(	// solishtirish tugun yaratish
                parts[0].trim(),	// o'zgaruvchi nomi
                Integer.parseInt(parts[1].trim())	// chegara qiymati
            );
        }
        return new Variable(rule.trim());	// default: o'zgaruvchi havola
    }
}

// Foydalanish misoli
class RuleEngine {	// to'liq qoidalar dvigatelini namoyish qiladi
    public static void main(String[] args) {
        RuleParser parser = new RuleParser();	// parser yaratish

        // Qoidani aniqlash: age > 18 AND premium
        BooleanExpression rule = parser.parse(	// qoida satrini parse qilish
            "age > 18 AND premium"	// biznes qoidasi satr sifatida
        );

        // Foydalanuvchi ma'lumotlari bilan kontekst yaratish
        Context context = new Context();	// hisoblash konteksti
        context.setVariable("age", 25);	// foydalanuvchi 25 yoshda
        context.setVariable("premium", true);	// foydalanuvchi premium

        // Qoidani hisoblash
        boolean eligible = rule.interpret(context);	// qoida daraxtini hisoblash
        System.out.println("Mos keladi: " + eligible);	// chiqish: true

        // Kontekstni o'zgartirish
        context.setVariable("age", 16);	// foydalanuvchi endi 16 yoshda
        eligible = rule.interpret(context);	// qayta hisoblash
        System.out.println("Mos keladi: " + eligible);	// chiqish: false
    }
}
\`\`\`

## Oldini olish kerak bo'lgan keng tarqalgan xatolar

| Xato | Muammo | Yechim |
|------|--------|--------|
| **Murakkab grammatikalar** | AST katta va sekin bo'ladi | Murakkab grammatikalar uchun parser generatorlaridan foydalanish (ANTLR) |
| **Kontekst yo'q** | O'zgaruvchilar/holatni boshqara olmaydi | Umumiy talqin holati uchun Context obyekti qo'shish |
| **Chuqur rekursiya** | Katta ifodalarda stack overflow | Aniq stack bilan iteratsiya ishlatish yoki chuqurlikni cheklash |
| **Ifodalarda parsing** | Parsing va talqinni aralashtirish | Parsingni (AST qurish) talqindan ajratish |
| **O'zgaruvchan ifodalar** | Thread xavfsizligi muammolari | Ifoda obyektlarini o'zgarmas qilish |
| **Kesh yo'q** | Bir xil sub-ifodalarni qayta hisoblash** | Qayta ishlatilganda oraliq natijalarni kesh qilish |`
		}
	}
};

export default task;
