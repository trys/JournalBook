import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import { ymd, url, format, parseToUrl } from '../../utils/date';
import { getTrackingQuestions, isAnswerValid } from '../../utils/questions';
import Traverse from '../../components/Traverse';
import { connect } from 'unistore/preact';
import { QuestionTextarea } from '../../components/QuestionTextarea';
import { StarPicker } from '../../components/StarPicker';
import { NumberPicker } from '../../components/NumberPicker';
import { SelectPicker } from '../../components/SelectPicker';
import { CheckboxPicker } from '../../components/CheckboxPicker';
import { TogglePicker } from '../../components/TogglePicker/Index';
import { RangePicker } from '../../components/RangePicker';
import { PlusPicker } from '../../components/PlusPicker/PlusPicker';

class Day extends Component {
  state = {
    date: null,
    questions: null,
    trackingQuestions: [],
    highlighted: false,
    clicked: false,
    yesterday: null,
    tomorrow: null,
    key: '',
  };

  componentDidMount() {
    this.getData(this.props);
  }

  componentWillReceiveProps(props) {
    this.getData(props);
  }

  getData = async props => {
    const { day, month, year, db, set } = props;
    const date = new Date(year, Number(month) - 1, day);
    const key = ymd(date);

    if (date.toString() === 'Invalid Date') {
      window.location.href = url();
      return;
    }

    const keys = await db.keys('questions');
    const questions = await Promise.all(keys.map(x => db.get('questions', x)));
    const trackingQuestions = await getTrackingQuestions(db);

    questions.sort((a, b) => a.createdAt - b.createdAt);

    const answers = await Promise.all(
      questions.map(({ slug }) => db.get('entries', `${key}_${slug}`))
    );
    questions.forEach((question, index) => {
      question.answer = answers[index] || '';
      question.visible = !!answers[index] || question.status === 'live';
    });

    const highlighted = await db.get('highlights', key);

    let yesterday = null;
    let tomorrow = null;
    let setIndex = -1;
    let dataset = [];
    if (set === 'highlights') {
      dataset = await db.keys('highlights').then(keys => {
        return keys.map(x => Number(x)).sort((a, b) => a - b);
      });
    } else if (set) {
      // TODO: Take out defaults? Or remove the instance at day/answer level when the reset back to default
      dataset = await db
        .getAll('trackingEntries')
        .then(entries => {
          return entries
            .filter(x => x.questionId === set)
            .filter(isAnswerValid)
            .map(x => x.dateString);
        })
        .then(x => x.map(x => Number(x)).sort((a, b) => a - b));
    }

    if (dataset.length) {
      const goal = Number(key);
      const closest = dataset.reduce((prev, curr) => {
        return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
      });

      setIndex = dataset.indexOf(closest);
    }

    if (setIndex !== -1) {
      tomorrow = dataset[setIndex + 1] || false;
      yesterday = dataset[setIndex - 1] || false;

      if (tomorrow) tomorrow = parseToUrl(tomorrow.toString(), set);
      if (yesterday) yesterday = parseToUrl(yesterday.toString(), set);
    }

    const trackingAnswers = await Promise.all(
      trackingQuestions.map(({ id }) =>
        db.get('trackingEntries', `${key}_${id}`)
      )
    ).then(results => results.filter(Boolean));

    trackingQuestions.forEach(question => {
      question.answer = trackingAnswers.find(x => x.questionId === question.id);
      question.showNotes = question.answer && !!question.answer.notes;
      question.visible = !!question.answer || question.status === 'live';
    });

    this.setState(
      {
        date,
        questions: questions.filter(x => x.visible),
        trackingQuestions: trackingQuestions.filter(x => x.visible),
        key,
        highlighted: !!highlighted,
        clicked: false,
        yesterday,
        tomorrow,
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

    if (typeof question.notes === 'string' && !question.showNotes) {
      question.showNotes = true;
    }

    question.answer = { ...answer, value };
    this.props.db.set('trackingEntries', id, question.answer);

    this.setState({ trackingQuestions });
  };

  /**
   * TODO: REFACTOR YOU SHOULD BE ASLEEP YOU FOOL
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

  showNotes = questionId => {
    const trackingQuestions = [...this.state.trackingQuestions];
    const question = trackingQuestions.find(x => x.id === questionId);
    if (!question) {
      return;
    }

    question.showNotes = !question.showNotes;

    this.setState({ trackingQuestions });
  };

  render(
    props,
    { date, questions, highlighted, trackingQuestions, yesterday, tomorrow }
  ) {
    if (date === null) {
      return null;
    }

    const yesterdayDate = new Date(date);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayUrl = yesterday === null ? url(yesterdayDate) : yesterday;

    const tomorrowDate = new Date(date);
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrowUrl = tomorrow === null ? url(tomorrowDate) : tomorrow;

    return (
      <div class="wrap lift-children">
        <Traverse
          title={format(date)}
          lastLink={yesterdayUrl}
          nextLink={tomorrowUrl}
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

        {questions === null
          ? null
          : questions.length
          ? questions.map(({ slug, text, answer = '' }) => (
              <QuestionTextarea
                id={slug}
                label={text}
                value={answer}
                onInput={v => this.updateAnswer(slug, v)}
              />
            ))
          : null}

        {trackingQuestions.map(question => (
          <div
            key={question.slug}
            class="tracking-question"
            data-question-type={question.settings.type}
          >
            <header class="tracking-question__header">
              <label for={question.id} dir="auto">
                {question.title}
              </label>
              {question.notes === false ? null : (
                <button
                  type="button"
                  class="button--reset"
                  aria-label="Add notes"
                  onClick={() => this.showNotes(question.id)}
                >
                  <svg
                    width="20"
                    height="20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g
                      stroke-width="2"
                      fill="none"
                      fill-rule="evenodd"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M19 13a2 2 0 01-2 2H5l-4 4V3c0-1.1.9-2 2-2h14a2 2 0 012 2v10z"
                        fill={question.showNotes ? '#B9BCC6' : null}
                        stroke="#B9BCC6"
                      />
                      <path
                        stroke={question.showNotes ? '#FFF' : '#B9BCC6'}
                        d="M9.8 5v6.5M6.5 8.5H13"
                      />
                    </g>
                  </svg>
                </button>
              )}
            </header>

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
                    : question.settings.default || null
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
                    : question.settings.default || null
                }
                settings={question.settings}
                onChange={v => this.updateTrackingAnswer(question.id, v)}
              />
            ) : null}

            {question.settings.type === 'plus' ? (
              <PlusPicker
                id={question.id}
                value={
                  question.answer
                    ? question.answer.value
                    : question.settings.default || null
                }
                settings={question.settings}
                onChange={v => this.updateTrackingAnswer(question.id, v)}
              />
            ) : null}

            {question.settings.type === 'range' ? (
              <RangePicker
                id={question.id}
                value={
                  question.answer
                    ? question.answer.value
                    : question.settings.default || null
                }
                settings={question.settings}
                onChange={v => this.updateTrackingAnswer(question.id, v)}
              />
            ) : null}

            {question.showNotes && (
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

        {!questions.length && !trackingQuestions.length ? (
          <div class="center lift mt40">
            <Link href="/get-started/" class="button">
              Write your first question
            </Link>
          </div>
        ) : null}
      </div>
    );
  }
}

export default connect('db')(Day);
