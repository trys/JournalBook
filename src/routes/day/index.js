import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import { ymd, url, format, compare } from '../../utils/date';
import { DB } from '../../utils/db';

export default class Day extends Component {
  state = {
    date: null,
    db: null,
    questions: null,
    key: '',
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

    if (date.toString() === 'Invalid Date' || compare(date, new Date()) === 1) {
      window.location.href = url();
      return;
    }

    const db = new DB();

    db.keys('questions').then(keys => {
      Promise.all(keys.map(x => db.get('questions', x)))
        .then(results => results.filter(x => x.status === 'live'))
        .then(questions => {
          Promise.all(
            questions.map(({ slug }) => db.get('entries', `${key}_${slug}`))
          ).then(answers => {
            questions.forEach((question, index) => {
              question.answer = answers[index] || '';
            });

            this.setState({ date, db, questions, key }, () => {
              this.setTextareaHeights();
            });
          });
        });
    });
  };

  setTextareaHeights() {
    [].forEach.call(document.querySelectorAll('textarea'), el => {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    });
  }

  updateAnswer = (slug, answer) => {
    const questions = [...this.state.questions];
    const question = questions.find(x => x.slug === slug);
    if (!question) {
      return;
    }

    const { key } = this.state;
    question.answer = answer;
    this.state.db.set('entries', `${key}_${slug}`, answer);

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
      <div class="wrap wrap--padding">
        <header class="traverse">
          <Link href={url(yesterday)}>
            <svg width="8" height="14" xmlns="http://www.w3.org/2000/svg">
              <title>Yesterday</title>
              <path
                d="M2.4 7l5.3-5.3c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0l-6 6c-.4.4-.4 1 0 1.4l6 6c.2.2.5.3.7.3.2 0 .5-.1.7-.3.4-.4.4-1 0-1.4L2.4 7z"
                fill="#4951A3"
                fill-rule="nonzero"
              />
            </svg>
          </Link>
          <h1>{format(date)}</h1>
          <Link disabled={isToday} href={isToday ? '' : url(tomorrow)}>
            <svg width="8" height="14" xmlns="http://www.w3.org/2000/svg">
              <title>Tomorrow</title>
              <path
                d="M7.7 6.3l-6-6C1.3-.1.7-.1.3.3c-.4.4-.4 1 0 1.4L5.6 7 .3 12.3c-.4.4-.4 1 0 1.4.2.2.4.3.7.3.3 0 .5-.1.7-.3l6-6c.4-.4.4-1 0-1.4z"
                fill="#4951A3"
                fill-rule="nonzero"
              />
            </svg>
          </Link>
        </header>

        {questions === null ? null : questions.length ? (
          questions.map(({ slug, text, answer = '' }, index) => (
            <div
              key={slug}
              class="question"
              style={`animation-delay: ${(index + 1) * 300}ms`}
            >
              <label for={slug}>{text}</label>
              <textarea
                id={slug}
                value={answer}
                onInput={event => {
                  event.target.style.height = 'auto';
                  event.target.getBoundingClientRect();
                  event.target.style.height = event.target.scrollHeight + 'px';
                  this.updateAnswer(slug, event.target.value);
                }}
              />
            </div>
          ))
        ) : (
          <div class="center lift">
            <br />
            <Link href="/get-started/" class="button">
              Write your first question
            </Link>
          </div>
        )}
      </div>
    );
  }
}
