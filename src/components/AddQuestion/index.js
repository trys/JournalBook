import { h } from 'preact';

const AddQuestion = ({ addQuestion, label = 'Write your own questions' }) => (
  <form onSubmit={addQuestion} class="add-question">
    <div>
      <label for="add-question">{label}</label>
      <input
        id="add-question"
        type="text"
        name="question"
        required
        placeholder="e.g. What are you grateful for?"
      />
    </div>
    <button type="submit">
      <svg width="14" height="14" xmlns="http://www.w3.org/2000/svg">
        <title>Add Question</title>
        <path
          d="M13.13 6.13H7.87V.88C7.88.34 7.54 0 7 0s-.88.35-.88.88v5.25H.88C.35 6.13 0 6.46 0 7s.35.88.88.88h5.25v5.25c0 .52.34.87.87.87s.88-.35.88-.88V7.88h5.25c.52 0 .87-.35.87-.88s-.35-.88-.88-.88z"
          fill="currentColor"
          fill-rule="nonzero"
        />
      </svg>
    </button>
  </form>
);

export { AddQuestion };
