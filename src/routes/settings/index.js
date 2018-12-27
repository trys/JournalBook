import { h, Component } from 'preact';
import { DB } from '../../utils/db';

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

export default class Questions extends Component {
  state = {
    db: null,
    questions: []
  };

  async componentDidMount() {
    const db = new DB();

    db.keys('questions').then(keys => {
      Promise.all(keys.map(x => db.get('questions', x))).then(results => {
        const questions = results.map((question, index) => ({
          slug: keys[index],
          question
        }));
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
    question.question = value;
    this.state.db.set('questions', slug, value);

    this.setState({ questions });
  };

  addQuestion = event => {
    event.preventDefault();
    const question = event.target.question.value;
    const slug = slugify(question);

    this.state.db.set('questions', slug, question).then(x => {
      const questions = [...this.state.questions];
      questions.push({ slug, question });
      this.setState({ questions });
      event.target.reset();
    });
  };

  render(props, { questions }) {
    return (
      <div class="wrap">
        <h1>Settings</h1>

        <form onSubmit={this.addQuestion}>
          <input type="text" name="question" />
          <input type="submit" value="Add question" />
        </form>

        {questions.map(question => (
          <div>
            <input
              type="text"
              value={question.question}
              onInput={event =>
                this.updateQuestion(question.slug, event.target.value)
              }
            />
          </div>
        ))}
      </div>
    );
  }
}
