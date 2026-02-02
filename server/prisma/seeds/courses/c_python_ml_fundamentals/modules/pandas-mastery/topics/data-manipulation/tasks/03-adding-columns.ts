import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'pandas-adding-columns',
	title: 'Adding and Modifying Columns',
	difficulty: 'easy',
	tags: ['pandas', 'columns', 'transformation'],
	estimatedTime: '12m',
	isPremium: false,
	order: 3,
	description: `# Adding and Modifying Columns

Creating new columns from existing data is the core of feature engineering.

## Task

Implement four functions:
1. \`add_constant_column(df, name, value)\` - Add column with constant value
2. \`add_computed_column(df, name, col1, col2, operation)\` - Add column computed from two others
3. \`apply_function(df, column, func)\` - Apply function to column
4. \`rename_columns(df, mapping)\` - Rename columns using a mapping dict

## Example

\`\`\`python
df = pd.DataFrame({'price': [100, 200], 'quantity': [2, 3]})

add_constant_column(df, 'currency', 'USD')  # Add 'USD' to all rows
add_computed_column(df, 'total', 'price', 'quantity', 'multiply')  # 200, 600
apply_function(df, 'price', lambda x: x * 1.1)  # Apply 10% increase
rename_columns(df, {'price': 'unit_price'})  # Rename price -> unit_price
\`\`\``,

	initialCode: `import pandas as pd

def add_constant_column(df: pd.DataFrame, name: str, value) -> pd.DataFrame:
    """Add column with constant value."""
    # Your code here
    pass

def add_computed_column(df: pd.DataFrame, name: str, col1: str, col2: str, operation: str) -> pd.DataFrame:
    """Add column computed from two others. Operations: 'add', 'subtract', 'multiply', 'divide'."""
    # Your code here
    pass

def apply_function(df: pd.DataFrame, column: str, func) -> pd.DataFrame:
    """Apply function to column values."""
    # Your code here
    pass

def rename_columns(df: pd.DataFrame, mapping: dict) -> pd.DataFrame:
    """Rename columns using a mapping dict."""
    # Your code here
    pass
`,

	solutionCode: `import pandas as pd

def add_constant_column(df: pd.DataFrame, name: str, value) -> pd.DataFrame:
    """Add column with constant value."""
    df = df.copy()
    df[name] = value
    return df

def add_computed_column(df: pd.DataFrame, name: str, col1: str, col2: str, operation: str) -> pd.DataFrame:
    """Add column computed from two others. Operations: 'add', 'subtract', 'multiply', 'divide'."""
    df = df.copy()
    if operation == 'add':
        df[name] = df[col1] + df[col2]
    elif operation == 'subtract':
        df[name] = df[col1] - df[col2]
    elif operation == 'multiply':
        df[name] = df[col1] * df[col2]
    elif operation == 'divide':
        df[name] = df[col1] / df[col2]
    return df

def apply_function(df: pd.DataFrame, column: str, func) -> pd.DataFrame:
    """Apply function to column values."""
    df = df.copy()
    df[column] = df[column].apply(func)
    return df

def rename_columns(df: pd.DataFrame, mapping: dict) -> pd.DataFrame:
    """Rename columns using a mapping dict."""
    return df.rename(columns=mapping)
`,

	testCode: `import pandas as pd
import unittest

class TestAddingColumns(unittest.TestCase):
    def setUp(self):
        self.df = pd.DataFrame({
            'price': [100, 200, 300],
            'quantity': [2, 3, 1]
        })

    def test_add_constant_basic(self):
        result = add_constant_column(self.df, 'currency', 'USD')
        self.assertIn('currency', result.columns)
        self.assertTrue(all(result['currency'] == 'USD'))

    def test_add_constant_numeric(self):
        result = add_constant_column(self.df, 'tax', 0.1)
        self.assertEqual(result['tax'].iloc[0], 0.1)

    def test_add_computed_multiply(self):
        result = add_computed_column(self.df, 'total', 'price', 'quantity', 'multiply')
        self.assertEqual(result['total'].tolist(), [200, 600, 300])

    def test_add_computed_add(self):
        result = add_computed_column(self.df, 'sum', 'price', 'quantity', 'add')
        self.assertEqual(result['sum'].tolist(), [102, 203, 301])

    def test_add_computed_divide(self):
        result = add_computed_column(self.df, 'unit', 'price', 'quantity', 'divide')
        self.assertEqual(result['unit'].iloc[0], 50.0)

    def test_apply_function_basic(self):
        result = apply_function(self.df, 'price', lambda x: x * 2)
        self.assertEqual(result['price'].tolist(), [200, 400, 600])

    def test_apply_function_string(self):
        df = pd.DataFrame({'name': ['alice', 'bob']})
        result = apply_function(df, 'name', str.upper)
        self.assertEqual(result['name'].tolist(), ['ALICE', 'BOB'])

    def test_rename_columns_basic(self):
        result = rename_columns(self.df, {'price': 'unit_price'})
        self.assertIn('unit_price', result.columns)
        self.assertNotIn('price', result.columns)

    def test_rename_columns_multiple(self):
        result = rename_columns(self.df, {'price': 'p', 'quantity': 'q'})
        self.assertEqual(list(result.columns), ['p', 'q'])

    def test_no_modify_original(self):
        _ = add_constant_column(self.df, 'new', 1)
        self.assertNotIn('new', self.df.columns)
`,

	hint1: 'Use df["new_col"] = value or df.assign()',
	hint2: 'Use df.rename(columns={"old": "new"}) for renaming',

	whyItMatters: `Column manipulation is core to feature engineering:

- **Feature creation**: Derive new features from existing
- **Data normalization**: Scale or transform values
- **Encoding**: Convert categories to numbers
- **Cleaning**: Fix column names for consistency

Most ML improvements come from better features, not better models.`,

	translations: {
		ru: {
			title: 'Добавление и изменение столбцов',
			description: `# Добавление и изменение столбцов

Создание новых столбцов из существующих данных — основа feature engineering.

## Задача

Реализуйте четыре функции:
1. \`add_constant_column(df, name, value)\` - Добавить столбец с константным значением
2. \`add_computed_column(df, name, col1, col2, operation)\` - Добавить столбец вычисленный из двух других
3. \`apply_function(df, column, func)\` - Применить функцию к столбцу
4. \`rename_columns(df, mapping)\` - Переименовать столбцы используя словарь

## Пример

\`\`\`python
df = pd.DataFrame({'price': [100, 200], 'quantity': [2, 3]})

add_constant_column(df, 'currency', 'USD')  # Add 'USD' to all rows
add_computed_column(df, 'total', 'price', 'quantity', 'multiply')  # 200, 600
apply_function(df, 'price', lambda x: x * 1.1)  # Apply 10% increase
rename_columns(df, {'price': 'unit_price'})  # Rename price -> unit_price
\`\`\``,
			hint1: 'Используйте df["new_col"] = value или df.assign()',
			hint2: 'Используйте df.rename(columns={"old": "new"}) для переименования',
			whyItMatters: `Манипуляция столбцами — основа feature engineering:

- **Создание признаков**: Вывод новых признаков из существующих
- **Нормализация данных**: Масштабирование или преобразование значений
- **Кодирование**: Конвертация категорий в числа
- **Очистка**: Исправление имён столбцов`,
		},
		uz: {
			title: "Ustunlarni qo'shish va o'zgartirish",
			description: `# Ustunlarni qo'shish va o'zgartirish

Mavjud ma'lumotlardan yangi ustunlarni yaratish feature engineering ning asosidir.

## Topshiriq

To'rtta funksiyani amalga oshiring:
1. \`add_constant_column(df, name, value)\` - Doimiy qiymat bilan ustun qo'shish
2. \`add_computed_column(df, name, col1, col2, operation)\` - Boshqa ikkitadan hisoblangan ustun qo'shish
3. \`apply_function(df, column, func)\` - Ustun qiymatlariga funksiya qo'llash
4. \`rename_columns(df, mapping)\` - Xaritalash dict yordamida ustunlarni qayta nomlash

## Misol

\`\`\`python
df = pd.DataFrame({'price': [100, 200], 'quantity': [2, 3]})

add_constant_column(df, 'currency', 'USD')  # Add 'USD' to all rows
add_computed_column(df, 'total', 'price', 'quantity', 'multiply')  # 200, 600
apply_function(df, 'price', lambda x: x * 1.1)  # Apply 10% increase
rename_columns(df, {'price': 'unit_price'})  # Rename price -> unit_price
\`\`\``,
			hint1: "df['new_col'] = value yoki df.assign() dan foydalaning",
			hint2: "Qayta nomlash uchun df.rename(columns={'old': 'new'}) dan foydalaning",
			whyItMatters: `Ustun manipulyatsiyasi feature engineering ning markazidir:

- **Xususiyat yaratish**: Mavjudlardan yangi xususiyatlar chiqarish
- **Ma'lumotlarni normalizatsiya qilish**: Qiymatlarni masshtablash yoki o'zgartirish
- **Practixsh**: Kategoriyalarni raqamlarga aylantirish`,
		},
	},
};

export default task;
