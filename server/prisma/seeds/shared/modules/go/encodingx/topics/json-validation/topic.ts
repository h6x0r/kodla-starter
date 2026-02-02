import { Topic } from '../../../../types';
import { tasks } from './tasks';

export const topic: Topic = {
	title: 'JSON Validation',
	description: 'Master strict JSON parsing with unknown field rejection, business validation, and security-hardened encoding/decoding patterns.',
	difficulty: 'medium',
	estimatedTime: '35m',
	order: 0,
	tasks,
	translations: {
		ru: {
			title: 'Валидация JSON',
			description: 'Освоение строгого парсинга JSON с отклонением неизвестных полей, бизнес-валидацией и защищенными паттернами кодирования/декодирования.'
		},
		uz: {
			title: 'JSON validatsiyasi',
			description: 'Noma\'lum maydonlarni rad etish, biznes validatsiyasi va xavfsizlik bilan mustahkamlangan practixsh/depractixsh patternlari bilan qat\'iy JSON tahlilini o\'rganish.'
		}
	}
};
