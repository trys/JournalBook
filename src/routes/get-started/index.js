import { h, Component } from 'preact';
import { DB } from '../../utils/db';
import { slugify } from '../../utils/slugify';
import { Link } from 'preact-router/match';
import { url } from '../../utils/date';
import { QuestionList } from '../../components/questionList';

const today = url(new Date());

export default class GetStarted extends Component {
  state = {
    db: null,
    questions: [],
    defaultQuestions: [
      "What's happened today?",
      'What are you thankful for?',
      'What would you change about today?',
      'Notes and musings'
    ]
  };

  async componentDidMount() {
    const db = new DB();

    db.keys('questions').then(keys => {
      Promise.all(keys.map(x => db.get('questions', x))).then(questions => {
        this.setState({ db, questions });
      });
    });
  }

  updateQuestion = (slug, value) => {
    const questions = [...this.state.questions];
    const question = questions.find(x => x.slug === slug);
    if (!question) {
      return;
    }

    const { key } = this.state;
    question.text = value;
    this.state.db.set('questions', slug, question);

    this.setState({ questions });
  };

  addQuestionToDB = (text, callback = () => null) => {
    const slug = slugify(text);
    const question = { slug, text, status: 'live', createdAt: Date.now() };

    this.state.db.set('questions', slug, question).then(x => {
      localStorage.setItem('journalbook_onboarded', true);
      const questions = [...this.state.questions];
      questions.push(question);
      this.setState({ questions });
      callback();
    });
  };

  addDefaultQuestion = event => {
    this.addQuestionToDB(event.target.textContent);
  };

  addQuestion = event => {
    event.preventDefault();
    this.addQuestionToDB(event.target.question.value, () => {
      event.target.reset();
    });
  };

  render(props, { questions, defaultQuestions }) {
    return (
      <div class="wrap">
        <img src="/assets/images/welcome.svg" class="home-image" alt="" />

        <h1 class="center h1">
          Here are a few popular daily questions to get you started:
        </h1>

        <div class="default-questions">
          {defaultQuestions.map(q => (
            <button
              type="button"
              class="default-question"
              disabled={questions.find(x => x.text === q)}
              onClick={this.addDefaultQuestion}
            >
              {q}
            </button>
          ))}
        </div>

        {questions && questions.length ? (
          <div class="center">
            <br />
            <Link href={today} class="button">
              Start writing!
            </Link>
          </div>
        ) : null}

        <form onSubmit={this.addQuestion} class="add-question">
          <div>
            <label for="add-question">Or write your own!</label>
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
                fill="#4951A3"
                fill-rule="nonzero"
              />
            </svg>
          </button>
        </form>

        <br />
        <br />

        <QuestionList
          questions={questions}
          updateQuestion={this.updateQuestion}
        />

        {questions && questions.length ? (
          <div class="center">
            <br />
            <Link href={today} class="button">
              Start writing!
            </Link>
          </div>
        ) : null}
      </div>
    );
  }
}
