import { Module } from '../../../../types';
import { topics } from './topics';

export const module: Module = {
    slug: 'java-error-handling-patterns',
    title: 'Error Handling Patterns',
    description: 'Master advanced error handling patterns: Result types, validation, error codes, and recovery strategies.',
    order: 31,
    topics,
    translations: {
        ru: {
            title: 'Паттерны обработки ошибок',
            description: 'Освойте продвинутые паттерны обработки ошибок: типы результатов, валидация, коды ошибок и стратегии восстановления.',
        },
        uz: {
            title: 'Xatolarni qayta ishlash naqshlari',
            description: 'Ilg\'or xatolarni qayta ishlash naqshlarini o\'rganing: natija turlari, validatsiya, xato practixri va tiklanish strategiyalari.',
        },
    },
};
