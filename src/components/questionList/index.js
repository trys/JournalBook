import { h } from 'preact';

const QuestionList = ({ questions, updateQuestion }) => {
  return !questions.length ? null : (
    <div>
      <h2 class="center">Your questions</h2>
      {questions.map((question, index) => (
        <p>
          <label>Q{index + 1}</label>
          <input
            type="text"
            value={question.text}
            onInput={event => updateQuestion(question.slug, event.target.value)}
          />
        </p>
      ))}
    </div>
  );
};

export { QuestionList };
