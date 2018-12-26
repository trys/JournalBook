import { h, Component } from 'preact';
import idb from 'idb';
import { Link } from 'preact-router/match';
import { ymd, url, format } from '../../utils/date';

export default class Day extends Component {
  state = {
    date: null,
    db: null,
    questions: null,
    key: ''
  };

  componentDidMount() {
    this.getData(this.props);
  }

  componentWillReceiveProps(props) {
    this.getData(props);
  }

  getData = props => {
    const { day, month, year } = props;
    const date = new Date(year, Number(month) - 1, day);
    const key = ymd(date);

    if (date.toString() === 'Invalid Date') {
      window.location.href = '/';
      return;
    }

    const dbPromise = idb.open('entries-store');

    const db = {
      get(key, table = 'entries') {
        return dbPromise.then(db => {
          return db
            .transaction(table)
            .objectStore(table)
            .get(key);
        });
      },
      set(key, val, table = 'entries') {
        return dbPromise.then(db => {
          const tx = db.transaction(table, 'readwrite');
          tx.objectStore(table).put(val, key);
          return tx.complete;
        });
      },
      keys(table = 'questions') {
        return dbPromise.then(db => {
          const tx = db.transaction(table);
          const keys = [];
          const store = tx.objectStore(table);

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
      Promise.all(keys.map(x => db.get(x, 'questions'))).then(results => {
        const questions = results.map((question, index) => ({
          slug: keys[index],
          question
        }));

        Promise.all(questions.map(({ slug }) => db.get(`${key}_${slug}`))).then(
          answers => {
            questions.forEach((question, index) => {
              question.answer = answers[index] || '';
            });

            this.setState({ date, db, questions, key });
          }
        );
      });
    });
  };

  updateAnswer = (slug, answer) => {
    const questions = [...this.state.questions];
    const question = questions.find(x => x.slug === slug);
    if (!question) {
      return;
    }

    const { key } = this.state;
    question.answer = answer;
    this.state.db.set(`${key}_${slug}`, answer);

    this.setState({ questions });
  };

  render(props, { date, questions }) {
    if (date === null) {
      return null;
    }

    const today = new Date();
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = ymd(today) === ymd(date);

    return (
      <div class="wrap">
        <h1 class="day-title">
          {format(date)}
          <Link href={url(yesterday)}>
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <title>Yesterday</title>
              <path d="M10.4 12l5.3-5.3c0.4-0.4 0.4-1 0-1.4s-1-0.4-1.4 0l-6 6c-0.4 0.4-0.4 1 0 1.4l6 6c0.2 0.2 0.5 0.3 0.7 0.3s0.5-0.1 0.7-0.3c0.4-0.4 0.4-1 0-1.4l-5.3-5.3z" />
            </svg>
          </Link>
          <Link disabled={isToday} href={isToday ? '' : url(tomorrow)}>
            <svg
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <title>Tomorrow</title>
              <path d="M15.7 11.3l-6-6c-0.4-0.4-1-0.4-1.4 0s-0.4 1 0 1.4l5.3 5.3-5.3 5.3c-0.4 0.4-0.4 1 0 1.4 0.2 0.2 0.4 0.3 0.7 0.3s0.5-0.1 0.7-0.3l6-6c0.4-0.4 0.4-1 0-1.4z" />
            </svg>
          </Link>
        </h1>

        {questions === null ? null : questions.length ? (
          questions.map(({ slug, question, answer = '' }, index) => (
            <div
              key={slug}
              class="question"
              style={`animation-delay: ${index * 300}ms`}
            >
              <label for={slug}>{question}</label>
              <textarea
                id={slug}
                value={answer}
                onInput={event => this.updateAnswer(slug, event.target.value)}
              />
            </div>
          ))
        ) : (
          <Link href="/settings/">Write your first question</Link>
        )}
      </div>
    );
  }
}
