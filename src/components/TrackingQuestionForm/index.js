import { h } from 'preact';

const TrackingQuestionForm = ({ onSubmit }) => (
  <form onSubmit={onSubmit}>
    <div>
      <label for="tracking-title">Add tracking question</label>
      <input
        id="tracking-title"
        type="text"
        dir="auto"
        name="question"
        required
        placeholder="e.g. What are you grateful for?"
      />
    </div>
    <button type="submit" class="button">
      Add question
    </button>
  </form>
);

export { TrackingQuestionForm };
