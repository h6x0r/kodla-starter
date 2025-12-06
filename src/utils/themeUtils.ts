
// This utility maps data IDs to visual presentation styles.
// This allows the backend to be agnostic of the UI design system (Tailwind).

interface CourseTheme {
  from: string;
  to: string;
}

export const getCourseTheme = (courseId: string): CourseTheme => {
  switch (courseId) {
    case 'c_go':
      return { from: 'from-cyan-500', to: 'to-blue-600' };
    case 'c_java':
      return { from: 'from-orange-500', to: 'to-red-600' };
    case 'c_algo':
      return { from: 'from-emerald-400', to: 'to-green-600' };
    case 'c_sys':
      return { from: 'from-purple-500', to: 'to-indigo-600' };
    default:
      return { from: 'from-gray-500', to: 'to-gray-700' };
  }
};
