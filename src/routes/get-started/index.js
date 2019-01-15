import { h, Component } from 'preact';
import { DB } from '../../utils/db';
import { slugify } from '../../utils/slugify';
import { Link } from 'preact-router/match';
import { url } from '../../utils/date';
import { QuestionList } from '../../components/QuestionList';
import { AddQuestion } from '../../components/AddQuestion';
import { DBError } from '../../components/DBError';

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
    dbError: false,
  };

  async componentDidMount() {
    try {
      const db = await new DB();
      const keys = await db.keys('questions');
      const questions = await Promise.all(
        keys.map(x => db.get('questions', x))
      );
      this.setState({ db, questions });
    } catch (e) {
      this.setState({ dbError: true });
    }
  }

  onboard() {
    localStorage.setItem('journalbook_onboarded', true);
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

  addQuestionToDB = async (text, callback = () => null) => {
    const slug = slugify(text);
    const question = { slug, text, status: 'live', createdAt: Date.now() };

    await this.state.db.set('questions', slug, question);

    this.onboard();
    const questions = [...this.state.questions];
    questions.push(question);
    this.setState({ questions });
    callback();
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

  render(props, { questions, defaultQuestions, dbError }) {
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
          <div class="center lift--without-delay mt20">
            <Link href={today} class="button">
              Start writing!
            </Link>
          </div>
        ) : null}

        <AddQuestion
          addQuestion={this.addQuestion}
          label="Or write your own!"
        />

        <div className="mb40">
          <a onClick={this.onboard} href="/settings">
            Import an existing JournalBook
          </a>
        </div>

        <QuestionList
          questions={questions}
          updateQuestion={this.updateQuestion}
          updateQuestionStatus={this.updateQuestionStatus}
        />

        {questions && questions.length ? (
          <div class="center lift--without-delay mt20 mb40">
            <Link href={today} class="button">
              Start writing!
            </Link>
          </div>
        ) : null}

        {dbError && (
          <DBError toggle={() => this.setState({ dbError: false })} />
        )}
      </div>
    );
  }
}
