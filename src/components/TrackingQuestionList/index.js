import { h } from 'preact';
import { Toggle } from '../Toggle';

const TrackingQuestionList = ({
  trackingQuestions,
  updateTrackingQuestion,
  updateTrackingOption,
  hideActive,
}) => (
  <div>
    {trackingQuestions.map(question => (
      <div class="edit-tracking-question">
        <p class="edit-question">
          <label for={`${question.id}_title`}>Question</label>
          <input
            id={`${question.id}_title`}
            type="text"
            dir="auto"
            value={question.title}
            onInput={e =>
              updateTrackingQuestion(question.id, e.target.value, 'title')
            }
          />
          {!hideActive && (
            <Toggle
              label="Active"
              on={question.status === 'live'}
              onToggle={() =>
                updateTrackingQuestion(
                  question.id,
                  question.status === 'live' ? 'draft' : 'live',
                  'status'
                )
              }
            />
          )}
        </p>
        <p>
          <div class="c-checkbox">
            <input
              id={`${question.id}_showNotes`}
              type="checkbox"
              checked={!!question.notes}
              onChange={() => {
                updateTrackingQuestion(question.id, !question.notes, 'notes');
              }}
            />
            <label for={`${question.id}_showNotes`}>
              Allow additional notes?
            </label>
          </div>
        </p>
        {question.notes && (
          <p>
            <label for={`${question.id}_notes`}>Custom notes label</label>
            <input
              id={`${question.id}_notes`}
              type="text"
              dir="auto"
              value={question.notes === true ? '' : question.notes}
              placeholder="e.g. What happenend?"
              onInput={e => {
                updateTrackingQuestion(
                  question.id,
                  e.target.value || true,
                  'notes'
                );
              }}
            />
          </p>
        )}

        <p>
          <label for={`${question.id}_type`}>Type</label>
          <select
            id={`${question.id}_type`}
            value={question.settings.type}
            onInput={e => {
              updateTrackingQuestion(question.id, e.target.value, 'type', true);
            }}
          >
            {question.type === 'number' && (
              <option value="number">Number</option>
            )}
            {question.type === 'number' && (
              <option value="plus">Number with +/-</option>
            )}
            {question.type === 'number' && (
              <option value="star">Star rating</option>
            )}
            {question.type === 'number' && (
              <option value="range">Range slider</option>
            )}
            {question.type === 'options' && (
              <option value="select">Dropdown</option>
            )}
            {question.type === 'options' && (
              <option value="checkbox">Checkboxes</option>
            )}
            {question.type === 'options' && (
              <option value="lightswitch">Yes/No switch</option>
            )}
          </select>
        </p>

        {question.type === 'options' &&
        question.settings.type !== 'lightswitch' ? (
          <p>
            <label>Options</label>
            {question.settings.options.map((option, i) => {
              return (
                <div class="mb10 u-flex" key={i}>
                  <input
                    class="c-input-mini"
                    type="text"
                    dir="auto"
                    value={option}
                    onInput={e =>
                      updateTrackingOption(question.id, e.target.value, i)
                    }
                  />
                  <button
                    type="button"
                    aria-label="Remove option"
                    class="button--reset px10"
                    onClick={() => {
                      updateTrackingOption(question.id, '', i, true);
                    }}
                  >
                    &times;
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              class="right button--reset"
              onClick={() => {
                updateTrackingOption(
                  question.id,
                  '',
                  question.settings.options.length
                );
              }}
            >
              Add {question.settings.options.length ? 'another' : 'an'} option
            </button>
          </p>
        ) : null}

        <p>
          <label for={`${question.id}_calculation`}>
            Statistic calculation
          </label>
          <select
            id={`${question.id}_calculation`}
            value={question.settings.calculation}
            onInput={e => {
              updateTrackingQuestion(
                question.id,
                e.target.value,
                'calculation',
                true
              );
            }}
          >
            <option value="">Select a calculation</option>
            {question.type === 'number' && (
              <option value="total">Total/Sum</option>
            )}
            {question.type === 'number' && (
              <option value="average">Average</option>
            )}
            {question.type === 'options' && (
              <option value="count">Count</option>
            )}
          </select>
        </p>
      </div>
    ))}
  </div>
);

export { TrackingQuestionList };
