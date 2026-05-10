import Response from '../models/Response.js';

/**
 * Builds comprehensive analytics for a given poll.
 * Returns data structured for frontend chart consumption.
 *
 * @param {import('../models/Poll.js').default} poll  - Populated poll document
 * @returns {Promise<object>}
 */
export const buildAnalytics = async (poll) => {
  const responses = await Response.find({ pollId: poll._id }).lean();

  const totalResponses = responses.length;

  const questionSummaries = poll.questions.map((question) => {
    // Tally votes per option for this question
    const optionCounts = {};
    question.options.forEach((opt) => {
      optionCounts[opt._id.toString()] = 0;
    });

    responses.forEach((response) => {
      const answer = response.answers.find(
        (a) => a.questionId.toString() === question._id.toString()
      );
      if (answer) {
        const key = answer.selectedOption.toString();
        if (key in optionCounts) {
          optionCounts[key] += 1;
        }
      }
    });

    const answeredCount = Object.values(optionCounts).reduce((sum, c) => sum + c, 0);

    const options = question.options.map((opt) => {
      const votes = optionCounts[opt._id.toString()] || 0;
      const percentage = answeredCount > 0 ? Math.round((votes / answeredCount) * 100) : 0;
      return {
        optionId: opt._id,
        text: opt.text,
        votes,
        percentage,
      };
    });

    // Option with the highest vote count
    const mostSelected = options.reduce(
      (best, opt) => (opt.votes > best.votes ? opt : best),
      options[0]
    );

    return {
      questionId: question._id,
      text: question.text,
      required: question.required,
      totalAnswered: answeredCount,
      options,
      mostSelected: mostSelected || null,
    };
  });

  // Participation rate — respondents who answered every non-optional question
  const requiredQuestionIds = poll.questions
    .filter((q) => q.required)
    .map((q) => q._id.toString());

  let fullParticipants = 0;
  if (requiredQuestionIds.length > 0) {
    fullParticipants = responses.filter((r) => {
      const answeredIds = r.answers.map((a) => a.questionId.toString());
      return requiredQuestionIds.every((id) => answeredIds.includes(id));
    }).length;
  } else {
    fullParticipants = totalResponses;
  }

  const participationRate =
    totalResponses > 0 ? Math.round((fullParticipants / totalResponses) * 100) : 0;

  return {
    pollId: poll._id,
    pollTitle: poll.title,
    totalResponses,
    fullParticipants,
    participationRate,
    questionSummaries,
    generatedAt: new Date().toISOString(),
  };
};
