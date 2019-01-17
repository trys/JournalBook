import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import { ymd, url, format, compare } from '../../utils/date';
import Traverse from '../../components/Traverse';
import { connect } from 'unistore/preact';

class Day extends Component {
  state = {
    date: null,
    questions: null,
    highlighted: false,
    clicked: false,
    key: '',
  };

  componentDidMount() {
    this.getData(this.props);
  }

  componentWillReceiveProps(props) {
    this.getData(props);
  }

  getData = async props => {
    const { day, month, year, db } = props;
    const date = new Date(year, Number(month) - 1, day);
    const key = ymd(date);

    if (date.toString() === 'Invalid Date' || compare(date, new Date()) === 1) {
      window.location.href = url();
      return;
    }

    const keys = await db.keys('questions');
    const questions = await Promise.all(
      keys.map(x => db.get('questions', x))
    ).then(results => results.filter(x => x.status === 'live'));

    const answers = await Promise.all(
      questions.map(({ slug }) => db.get('entries', `${key}_${slug}`))
    );
    questions.forEach((question, index) => {
      question.answer = answers[index] || '';
    });

    const highlighted = await db.get('highlights', key);

    this.setState(
      {
        date,
        questions,
        key,
        highlighted: !!highlighted,
        clicked: false,
      },
      () => {
        this.setTextareaHeights();
      }
    );
  };

  setTextareaHeights() {
    [].forEach.call(document.querySelectorAll('textarea'), el => {
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    });
  }

  highlightDay = () => {
    const highlighted = !this.state.highlighted;
    const { key } = this.state;

    if (highlighted) {
      this.props.db.set('highlights', key, true);
    } else {
      this.props.db.delete('highlights', key);
    }

    this.setState({ highlighted: highlighted, clicked: highlighted });
  };

  updateAnswer = (slug, answer) => {
    const questions = [...this.state.questions];
    const question = questions.find(x => x.slug === slug);
    if (!question) {
      return;
    }

    const { key } = this.state;
    question.answer = answer;
    this.props.db.set('entries', `${key}_${slug}`, answer);

    this.setState({ questions });
  };

  render(props, { date, questions, highlighted, clicked }) {
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
      <div class="wrap lift-children">
        <Traverse
          title={format(date)}
          lastLink={url(yesterday)}
          nextLink={isToday ? '' : url(tomorrow)}
          disableNext={isToday}
          actions={
            <button
              type="button"
              class="button--reset"
              onClick={this.highlightDay}
            >
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 22 22"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke={highlighted ? 'currentColor' : 'var(--line)'}
                  stroke-width="2"
                  d="M11 1l3 6.3 7 1-5 4.8 1.2 7-6.2-3.3L4.8 20 6 13.1 1 8.3l7-1z"
                  fill={highlighted ? 'currentColor' : 'none'}
                  fill-rule="evenodd"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          }
        />

        {questions === null ? null : questions.length ? (
          questions.map(({ slug, text, answer = '' }, index) => (
            <div key={slug} class="question">
              <label for={slug} dir="auto">
                {text}
              </label>
              <textarea
                id={slug}
                dir="auto"
                value={answer}
                placeholder="Start writing..."
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
          <div class="center lift mt40">
            <Link href="/get-started/" class="button">
              Write your first question
            </Link>
          </div>
        )}
      </div>
    );
  }
}

export default connect('db')(Day);
