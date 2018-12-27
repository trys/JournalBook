import { h } from 'preact';
import { Toggle } from '../Toggle';

const QuestionList = ({ questions, updateQuestion, updateQuestionStatus }) => {
  return !questions.length ? null : (
    <div>
      <h2 class="center">Your questions</h2>
      {questions.map((question, index) => (
        <p class="edit-question">
          <label>Q{index + 1}</label>
          <input
            type="text"
            value={question.text}
            onInput={event => updateQuestion(question.slug, event.target.value)}
          />
          {updateQuestionStatus && (
            <Toggle
              label="Active"
              on={question.status === 'live'}
              onToggle={() =>
                updateQuestionStatus(
                  question.slug,
                  question.status === 'live' ? 'draft' : 'live'
                )
              }
            />
          )}
        </p>
      ))}
    </div>
  );
};

export { QuestionList };
