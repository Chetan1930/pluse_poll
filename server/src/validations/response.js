export const submitResponseSchema = {
  answers: (v) => {
    if (!Array.isArray(v) || v.length < 1) return 'Answers array is required';

    for (let i = 0; i < v.length; i++) {
      const a = v[i];
      if (!a.questionId) return `Answer ${i + 1}: questionId is required`;
      if (!a.selectedOption) return `Answer ${i + 1}: selectedOption is required`;
    }

    return null;
  },
};
