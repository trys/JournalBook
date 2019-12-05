import { h } from 'preact';
import { Toggle } from '../Toggle';
import { Link } from 'preact-router';

const QuestionList = ({ questions, updateQuestion, updateQuestionStatus }) => (
  <div>
    {questions.map((question, index) => (
      <p class="edit-question">
        <label for={`${question.slug}_title`}>Q{index + 1}</label>
        <input
          id={`${question.slug}_title`}
          type="text"
          dir="auto"
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

export { QuestionList };
