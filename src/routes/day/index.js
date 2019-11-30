import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import { ymd, url, format } from '../../utils/date';
import { getTrackingQuestions } from '../../utils/questions';
import Traverse from '../../components/Traverse';
import { connect } from 'unistore/preact';
import { QuestionTextarea } from '../../components/QuestionTextarea';
import { StarPicker } from '../../components/StarPicker';
import { NumberPicker } from '../../components/NumberPicker';
import { SelectPicker } from '../../components/SelectPicker';
import { CheckboxPicker } from '../../components/CheckboxPicker';
import { TogglePicker } from '../../components/TogglePicker/Index';

class Day extends Component {
  state = {
    date: null,
    questions: null,
    trackingQuestions: [],
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

    if (date.toString() === 'Invalid Date') {
      window.location.href = url();
      return;
    }

    const keys = await db.keys('questions');
    const questions = await Promise.all(keys.map(x => db.get('questions', x)));

    questions.sort((a, b) => a.createdAt - b.createdAt);

    const answers = await Promise.all(
      questions.map(({ slug }) => db.get('entries', `${key}_${slug}`))
    );
    questions.forEach((question, index) => {
      question.answer = answers[index] || '';
      question.visible = !!answers[index] || question.status === 'live';
    });

    const highlighted = await db.get('highlights', key);

    const trackingQuestions = await getTrackingQuestions();
    const trackingAnswers = await Promise.all(
      trackingQuestions.map(({ id }) =>
        db.get('trackingEntries', `${key}_${id}`)
      )
    ).then(results => results.filter(Boolean));

    trackingQuestions.forEach(question => {
      question.answer = trackingAnswers.find(x => x.questionId === question.id);
    });

    this.setState(
      {
        date,
        questions,
        trackingQuestions,
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

    this.setState({ highlighted, clicked: highlighted });
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

  updateTrackingAnswer = (questionId, value) => {
    const { key } = this.state;
    const trackingQuestions = [...this.state.trackingQuestions];
    const question = trackingQuestions.find(x => x.id === questionId);
    if (!question) {
      return;
    }

    const id = `${key}_${questionId}`;
    const answer = question.answer || {
      id,
      questionId,
      createdAt: Date.now(),
      dateString: key,
      value,
      notes: '',
    };

    question.answer = { ...answer, value };
    this.props.db.set('trackingEntries', id, question.answer);

    this.setState({ trackingQuestions });
  };

  /**
   * TODO: REFACTOR YOU SHOULD BE ASLEEP
   */
  toggleTrackingOption = (questionId, value) => {
    const { key } = this.state;
    const trackingQuestions = [...this.state.trackingQuestions];
    const question = trackingQuestions.find(x => x.id === questionId);
    if (!question) {
      return;
    }

    const id = `${key}_${questionId}`;
    let val = [];

    const answer = question.answer || {
      id,
      questionId,
      createdAt: Date.now(),
      dateString: key,
      value: question.settings.default || [],
      notes: '',
    };

    if (question.settings.type === 'checkbox') {
      const included = answer.value.includes(value);
      if (included) {
        val = answer.value.filter(x => x !== value);
      } else {
        val = [...answer.value, ...value];
      }
    } else {
      val = [value];
    }

    question.answer = { ...answer, value: val };
    this.props.db.set('trackingEntries', id, question.answer);

    this.setState({ trackingQuestions });
  };

  updateTrackingNotes = (questionId, notes) => {
    const { key } = this.state;
    const trackingQuestions = [...this.state.trackingQuestions];
    const question = trackingQuestions.find(x => x.id === questionId);
    if (!question) {
      return;
    }

    const id = `${key}_${questionId}`;
    const answer = question.answer || {
      id,
      questionId,
      createdAt: Date.now(),
      dateString: key,
      value: question.settings.default || null,
      notes,
    };

    question.answer = { ...answer, notes };
    this.props.db.set('trackingEntries', id, question.answer);

    this.setState({ trackingQuestions });
  };

  render(props, { date, questions, highlighted, trackingQuestions }) {
    if (date === null) {
      return null;
    }

    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);

    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return (
      <div class="wrap lift-children">
        <Traverse
          title={format(date)}
          lastLink={url(yesterday)}
          nextLink={url(tomorrow)}
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

        {/* {questions === null ? null : questions.length ? (
          questions
            .filter(x => x.visible)
            .map(({ slug, text, answer = '' }) => (
              <QuestionTextarea
                id={slug}
                label={text}
                value={answer}
                onInput={v => this.updateAnswer(slug, v)}
              />
            ))
        ) : (
          <div class="center lift mt40">
            <Link href="/get-started/" class="button">
              Write your first question
            </Link>
          </div>
        )} */}

        {trackingQuestions.map(question => (
          <div key={question.slug}>
            <label for={question.id} dir="auto">
              {question.title}
            </label>

            {question.settings.type === 'checkbox' ||
            question.settings.type === 'radio' ? (
              <CheckboxPicker
                id={question.id}
                type={question.settings.type}
                value={
                  question.answer
                    ? question.answer.value
                    : question.settings.default
                }
                options={question.settings.options}
                onChange={v => this.toggleTrackingOption(question.id, v)}
              />
            ) : null}

            {question.settings.type === 'lightswitch' ? (
              <TogglePicker
                id={question.id}
                value={
                  question.answer
                    ? question.answer.value
                    : question.settings.default
                }
                onChange={v => this.updateTrackingAnswer(question.id, v)}
              />
            ) : null}

            {question.settings.type === 'select' ? (
              <SelectPicker
                id={question.id}
                value={
                  question.answer
                    ? question.answer.value[0] || question.settings.default
                    : question.settings.default
                }
                options={question.settings.options}
                onChange={v => this.toggleTrackingOption(question.id, v)}
              />
            ) : null}

            {question.settings.type === 'star' ? (
              <StarPicker
                id={question.id}
                value={
                  question.answer
                    ? question.answer.value
                    : question.settings.default || [null]
                }
                onChange={v => this.updateTrackingAnswer(question.id, v)}
              />
            ) : null}

            {question.settings.type === 'number' ? (
              <NumberPicker
                id={question.id}
                value={
                  question.answer
                    ? question.answer.value
                    : question.settings.default || [null]
                }
                settings={question.settings}
                onChange={v => this.updateTrackingAnswer(question.id, v)}
              />
            ) : null}

            {question.notes && (
              <QuestionTextarea
                id={`${question.id}_notes`}
                label={
                  question.notes === true ? 'Additional notes' : question.notes
                }
                value={question.answer ? question.answer.notes || '' : ''}
                onInput={v => this.updateTrackingNotes(question.id, v)}
              />
            )}
          </div>
        ))}
      </div>
    );
  }
}

export default connect('db')(Day);
