import { CourseMeta } from '../../types';

export const courseMeta: CourseMeta = {
	slug: 'c_app_security',
	title: 'Application Security',
	description: 'Master application security: CIA Triad, OWASP Top 10, Authentication/Authorization, Cryptography, Secure Coding, and Interview Preparation. Protect your applications from real-world threats.',
	category: 'cs',
	icon: '🔐',
	estimatedTime: '35h',
	order: 21,
	translations: {
		ru: {
			title: 'Безопасность приложений',
			description: 'Освойте безопасность приложений: триада CIA, OWASP Top 10, аутентификация/авторизация, криптография, безопасное программирование и подготовка к собеседованиям. Защитите свои приложения от реальных угроз.'
		},
		uz: {
			title: 'Ilova xavfsizligi',
			description: 'Ilova xavfsizligini o\'rganing: CIA Triad, OWASP Top 10, Autentifikatsiya/Avtorizatsiya, Kriptografiya, Xavfsiz practixsh va Intervyuga tayyorgarlik. Ilovalaringizni haqiqiy tahdidlardan himoya qiling.'
		}
	}
};
