import { h } from 'preact';
import { Toggle } from '../Toggle';

const QuestionList = ({
  questions,
  updateQuestion,
  updateQuestionStatus,
  deleteQuestion,
}) =>
  !questions.length ? null : (
    <div>
      <h2 class="center">Your questions</h2>
      {questions.map((question, index) => (
        <p class="edit-question">
          <div class="edit-question-controls">
            <label>Q{index + 1}</label>
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
            {deleteQuestion && (
              <a onClick={() => deleteQuestion(question.slug)}>&times;</a>
            )}
          </div>

          <input
            type="text"
            value={question.text}
            onInput={event => updateQuestion(question.slug, event.target.value)}
          />
        </p>
      ))}
    </div>
  );

export { QuestionList };
