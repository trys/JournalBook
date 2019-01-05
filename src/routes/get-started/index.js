import { h, Component } from 'preact';
import { DB } from '../../utils/db';
import { slugify } from '../../utils/slugify';
import { Link } from 'preact-router/match';
import { url } from '../../utils/date';
import { QuestionList } from '../../components/QuestionList';
import { AddQuestion } from '../../components/AddQuestion';

const today = url();

export default class GetStarted extends Component {
  state = {
    db: null,
    questions: [],
    defaultQuestions: [
      "What's happened today?",
      'What are you thankful for?',
      'What would you change about today?',
      'Notes and musings',
    ],
  };

  async componentDidMount() {
    const db = new DB();

    db.keys('questions').then(keys => {
      Promise.all(keys.map(x => db.get('questions', x))).then(questions => {
        this.setState({ db, questions });
      });
    });
  }

  updateQuestion = (slug, value, attribute = 'text') => {
    const questions = [...this.state.questions];
    const question = questions.find(x => x.slug === slug);
    if (!question) {
      return;
    }

    question[attribute] = value;
    this.state.db.set('questions', slug, question);

    this.setState({ questions });
  };

  updateQuestionStatus = (slug, value) => {
    this.updateQuestion(slug, value, 'status');
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
      <div class="wrap lift-children">
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
          <div class="center lift--without-delay">
            <br />
            <Link href={today} class="button">
              Start writing!
            </Link>
          </div>
        ) : null}

        <AddQuestion
          addQuestion={this.addQuestion}
          label="Or write your own!"
        />

        <div>
          <Link href="/settings">Import an existing JournalBook</Link>
          <br />
          <br />
        </div>

        <QuestionList
          questions={questions}
          updateQuestion={this.updateQuestion}
          updateQuestionStatus={this.updateQuestionStatus}
        />

        {questions && questions.length ? (
          <div class="center lift--without-delay">
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
