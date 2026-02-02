import { Task } from '../../../../../../../types';

const task: Task = {
	slug: 'catboost-basics',
	title: 'CatBoost',
	difficulty: 'medium',
	tags: ['catboost', 'boosting', 'ml'],
	estimatedTime: '15m',
	isPremium: false,
	order: 4,
	description: `# CatBoost

Master CatBoost - best for categorical features and GPU training.

## Task

Implement three functions:
1. \`train_catboost_classifier(X, y, cat_features)\` - Train with categorical features
2. \`train_catboost_regressor(X, y)\` - Train CatBoostRegressor
3. \`train_with_gpu(X, y)\` - Train using GPU acceleration

## Example

\`\`\`python
from catboost import CatBoostClassifier, CatBoostRegressor

# CatBoost handles categorical features automatically
model = train_catboost_classifier(X, y, cat_features=[0, 2, 5])
predictions = model.predict(X_test)
\`\`\``,

	initialCode: `import numpy as np
from catboost import CatBoostClassifier, CatBoostRegressor

def train_catboost_classifier(X: np.ndarray, y: np.ndarray, cat_features: list = None):
    """Train CatBoostClassifier with categorical features. Return fitted model."""
    # Your code here
    pass

def train_catboost_regressor(X: np.ndarray, y: np.ndarray):
    """Train CatBoostRegressor. Return fitted model."""
    # Your code here
    pass

def train_with_gpu(X: np.ndarray, y: np.ndarray):
    """Train CatBoostClassifier with GPU (if available). Return fitted model."""
    # Your code here
    pass
`,

	solutionCode: `import numpy as np
from catboost import CatBoostClassifier, CatBoostRegressor

def train_catboost_classifier(X: np.ndarray, y: np.ndarray, cat_features: list = None):
    """Train CatBoostClassifier with categorical features. Return fitted model."""
    model = CatBoostClassifier(iterations=100, random_state=42, verbose=False)
    model.fit(X, y, cat_features=cat_features)
    return model

def train_catboost_regressor(X: np.ndarray, y: np.ndarray):
    """Train CatBoostRegressor. Return fitted model."""
    model = CatBoostRegressor(iterations=100, random_state=42, verbose=False)
    model.fit(X, y)
    return model

def train_with_gpu(X: np.ndarray, y: np.ndarray):
    """Train CatBoostClassifier with GPU (if available). Return fitted model."""
    try:
        model = CatBoostClassifier(iterations=100, task_type='GPU',
                                   random_state=42, verbose=False)
        model.fit(X, y)
    except Exception:
        model = CatBoostClassifier(iterations=100, random_state=42, verbose=False)
        model.fit(X, y)
    return model
`,

	testCode: `import numpy as np
import unittest

class TestCatBoost(unittest.TestCase):
    def setUp(self):
        np.random.seed(42)
        self.X = np.random.randn(100, 5)
        self.y_class = np.array([0]*50 + [1]*50)
        self.y_reg = np.random.randn(100)

    def test_classifier_no_cat(self):
        model = train_catboost_classifier(self.X, self.y_class)
        self.assertIsNotNone(model)

    def test_classifier_with_cat(self):
        X_cat = np.column_stack([self.X, np.random.randint(0, 3, 100)])
        model = train_catboost_classifier(X_cat, self.y_class, cat_features=[5])
        preds = model.predict(X_cat[:5])
        self.assertEqual(len(preds), 5)

    def test_regressor(self):
        model = train_catboost_regressor(self.X, self.y_reg)
        preds = model.predict(self.X[:5])
        self.assertEqual(len(preds), 5)

    def test_gpu_fallback(self):
        model = train_with_gpu(self.X, self.y_class)
        self.assertIsNotNone(model)

    def test_classifier_has_predict_proba(self):
        model = train_catboost_classifier(self.X, self.y_class)
        probs = model.predict_proba(self.X[:5])
        self.assertEqual(probs.shape[0], 5)

    def test_classifier_has_feature_importances(self):
        model = train_catboost_classifier(self.X, self.y_class)
        imp = model.get_feature_importance()
        self.assertEqual(len(imp), 5)

    def test_regressor_can_predict(self):
        model = train_catboost_regressor(self.X, self.y_reg)
        preds = model.predict(self.X[:5])
        self.assertEqual(len(preds), 5)

    def test_gpu_fallback_can_predict(self):
        model = train_with_gpu(self.X, self.y_class)
        preds = model.predict(self.X[:5])
        self.assertEqual(len(preds), 5)

    def test_classifier_cat_can_predict_proba(self):
        X_cat = np.column_stack([self.X, np.random.randint(0, 3, 100)])
        model = train_catboost_classifier(X_cat, self.y_class, cat_features=[5])
        probs = model.predict_proba(X_cat[:5])
        self.assertEqual(probs.shape[0], 5)
`,

	hint1: 'CatBoostClassifier(iterations=100).fit(X, y, cat_features=[...])',
	hint2: 'For GPU: CatBoostClassifier(task_type="GPU")',

	whyItMatters: `CatBoost stands out for:

- **Categorical handling**: Best-in-class without manual encoding
- **Ordered boosting**: Reduces overfitting on small datasets
- **GPU support**: Easy GPU acceleration
- **Robust defaults**: Works well out-of-the-box

Ideal when you have many categorical features.`,

	translations: {
		ru: {
			title: 'CatBoost',
			description: `# CatBoost

Освойте CatBoost - лучший для категориальных признаков и GPU обучения.

## Задача

Реализуйте три функции:
1. \`train_catboost_classifier(X, y, cat_features)\` - Обучить с категориальными
2. \`train_catboost_regressor(X, y)\` - Обучить CatBoostRegressor
3. \`train_with_gpu(X, y)\` - Обучить с GPU ускорением

## Пример

\`\`\`python
from catboost import CatBoostClassifier, CatBoostRegressor

# CatBoost handles categorical features automatically
model = train_catboost_classifier(X, y, cat_features=[0, 2, 5])
predictions = model.predict(X_test)
\`\`\``,
			hint1: 'CatBoostClassifier(iterations=100).fit(X, y, cat_features=[...])',
			hint2: 'Для GPU: CatBoostClassifier(task_type="GPU")',
			whyItMatters: `CatBoost выделяется:

- **Категориальные признаки**: Лучший в классе без ручного кодирования
- **Ordered boosting**: Уменьшает переобучение на малых данных
- **GPU поддержка**: Простое GPU ускорение`,
		},
		uz: {
			title: 'CatBoost',
			description: `# CatBoost

CatBoostni o'rganing - kategorik xususiyatlar va GPU o'qitish uchun eng yaxshi.

## Topshiriq

Uchta funksiyani amalga oshiring:
1. \`train_catboost_classifier(X, y, cat_features)\` - Kategorik xususiyatlar bilan o'rgatish
2. \`train_catboost_regressor(X, y)\` - CatBoostRegressor ni o'rgatish
3. \`train_with_gpu(X, y)\` - GPU tezlashtirish bilan o'rgatish

## Misol

\`\`\`python
from catboost import CatBoostClassifier, CatBoostRegressor

# CatBoost handles categorical features automatically
model = train_catboost_classifier(X, y, cat_features=[0, 2, 5])
predictions = model.predict(X_test)
\`\`\``,
			hint1: "CatBoostClassifier(iterations=100).fit(X, y, cat_features=[...])",
			hint2: 'GPU uchun: CatBoostClassifier(task_type="GPU")',
			whyItMatters: `CatBoost quyidagilarda ajralib turadi:

- **Kategorik ishlov berish**: Qo'lda practixshsiz sinfda eng yaxshi
- **Ordered boosting**: Kichik ma'lumotlarda ortiqcha moslanishni kamaytiradi
- **GPU qo'llab-quvvatlash**: Oson GPU tezlashtirish`,
		},
	},
};

export default task;
