import { h, Component } from 'preact';
import { DB } from '../../utils/db';
import { slugify } from '../../utils/slugify';
import { QuestionList } from '../../components/QuestionList';
import { AddQuestion } from '../../components/AddQuestion';
import { ScaryButton } from '../../components/ScaryButton';

export default class Questions extends Component {
  state = {
    db: null,
    questions: []
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

    const { key } = this.state;
    question[attribute] = value;
    this.state.db.set('questions', slug, question);

    this.setState({ questions });
  };

  updateQuestionStatus = (slug, value) => {
    this.updateQuestion(slug, value, 'status');
  };

  addQuestion = event => {
    event.preventDefault();
    const text = event.target.question.value;
    const slug = slugify(text);
    const question = { slug, text, status: 'live', createdAt: Date.now() };

    this.state.db.set('questions', slug, question).then(x => {
      localStorage.setItem('journalbook_onboarded', true);
      const questions = [...this.state.questions];
      questions.push(question);
      this.setState({ questions });
      event.target.reset();
    });
  };

  deleteData = async () => {
    await this.state.db.clear('questions');
    await this.state.db.clear('questions');
    localStorage.removeItem('journalbook_onboarded');
    window.location.href = '/';
  };

  render(props, { questions }) {
    return (
      <div class="wrap lift-children">
        <QuestionList
          questions={questions}
          updateQuestion={this.updateQuestion}
          updateQuestionStatus={this.updateQuestionStatus}
        />

        <AddQuestion addQuestion={this.addQuestion} />

        <hr />

        <ScaryButton onClick={this.deleteData}>Delete your data</ScaryButton>
      </div>
    );
  }
}
