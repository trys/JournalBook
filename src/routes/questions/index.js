import { h, Component } from 'preact';
import idb from 'idb';

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
    const dbPromise = idb.open('entries-store');

    const db = {
      get(key) {
        return dbPromise.then(db => {
          return db
            .transaction('questions')
            .objectStore('questions')
            .get(key);
        });
      },
      set(key, val) {
        return dbPromise.then(db => {
          const tx = db.transaction('questions', 'readwrite');
          tx.objectStore('questions').put(val, key);
          return tx.complete;
        });
      },
      keys() {
        return dbPromise.then(db => {
          const tx = db.transaction('questions');
          const keys = [];
          const store = tx.objectStore('questions');

          // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
          // openKeyCursor isn't supported by Safari, so we fall back
          (store.iterateKeyCursor || store.iterateCursor).call(
            store,
            cursor => {
              if (!cursor) return;
              keys.push(cursor.key);
              cursor.continue();
            }
          );

          return tx.complete.then(() => keys);
        });
      }
    };

    db.keys().then(keys => {
      Promise.all(keys.map(x => db.get(x))).then(results => {
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
    this.state.db.set(slug, value);

    this.setState({ questions });
  };

  addQuestion = event => {
    event.preventDefault();
    const question = event.target.question.value;
    const slug = slugify(question);
    this.state.db.set(slug, question).then(x => {
      const questions = [...this.state.questions];
      questions.push({ slug, question });
      this.setState({ questions });
      event.target.reset();
    });
  };

  render(props, { questions }) {
    return (
      <div>
        <h1>Questions</h1>
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
