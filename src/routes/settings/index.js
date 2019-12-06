import { h, Component } from 'preact';
import { ymd } from '../../utils/date';
import { slugify } from '../../utils/slugify';
import { QuestionList } from '../../components/QuestionList';
import { AddQuestion } from '../../components/AddQuestion';
import { ScaryButton } from '../../components/ScaryButton';
import { getDefaultTheme, prefersAnimation } from '../../utils/theme';
import { actions } from '../../store/actions';
import { connect } from 'unistore/preact';
import { getTrackingQuestions } from '../../utils/questions';
import { TrackingQuestionList } from '../../components/TrackingQuestionList';
import { Link } from 'preact-router';

class Settings extends Component {
  state = {
    questions: [],
    exporting: 0,
    importing: false,
    files: [],
    trackingQuestions: [],
  };

  async componentWillMount() {
    const keys = await this.props.db.keys('questions');
    const questions = await Promise.all(
      keys.map(x => this.props.db.get('questions', x))
    );
    questions.sort((a, b) => a.createdAt - b.createdAt);

    const trackingQuestions = await getTrackingQuestions(this.props.db);

    this.setState({ questions, trackingQuestions });
  }

  updateSetting = key => {
    return event => {
      this.props.updateSetting({ key, value: event.target.value });
    };
  };

  updateQuestion = (slug, value, attribute = 'text') => {
    const questions = [...this.state.questions];
    const question = questions.find(x => x.slug === slug);
    if (!question) {
      return;
    }

    question[attribute] = value;
    this.props.db.set('questions', slug, question);

    this.setState({ questions });
  };

  updateQuestionStatus = (slug, value) => {
    this.updateQuestion(slug, value, 'status');
  };

  updateTrackingQuestion = (
    id,
    value,
    attribute = 'text',
    settings = false
  ) => {
    const trackingQuestions = [...this.state.trackingQuestions];
    const question = trackingQuestions.find(x => x.id === id);

    if (!question) {
      return;
    }

    if (settings) {
      question.settings[attribute] = value;
    } else {
      question[attribute] = value;
    }
    this.props.db.set('trackingQuestions', id, question);

    this.setState({ trackingQuestions });
  };

  updateTrackingOption = (id, value, index, remove = false) => {
    const trackingQuestions = [...this.state.trackingQuestions];
    const question = trackingQuestions.find(x => x.id === id);

    if (!question) {
      return;
    }

    if (remove) {
      question.settings.options.splice(index, 1);
    } else {
      question.settings.options[index] = value;
    }

    this.props.db.set('trackingQuestions', id, question);

    this.setState({ trackingQuestions });
  };

  addQuestion = async event => {
    event.preventDefault();
    const text = event.target.question.value;
    const slug = slugify(text);
    const question = { slug, text, status: 'live', createdAt: Date.now() };

    await this.props.db.set('questions', slug, question);

    localStorage.setItem('journalbook_onboarded', true);
    const questions = [...this.state.questions];
    questions.push(question);
    this.setState({ questions });
    event.target.reset();
  };

  getData = async () => {
    try {
      const questionValues = await this.props.db.getAll('questions');
      const questions = questionValues.reduce((current, value, index) => {
        current[value.slug] = value;
        return current;
      }, {});

      const entries = await this.props.db.getObject('entries');
      const highlights = await this.props.db.keys('highlights');
      const settings = await this.props.db.getObject('settings');
      const trackingEntries = await this.props.db.getObject('trackingEntries');
      const trackingQuestions = await this.props.db.getObject(
        'trackingQuestions'
      );

      return {
        questions,
        entries,
        highlights,
        settings,
        trackingEntries,
        trackingQuestions,
      };
    } catch (e) {
      return {
        questions: {},
        entries: {},
        highlights: [],
        settings: {},
        trackingEntries: {},
        trackingQuestions: {},
      };
    }
  };

  clean = () => {
    if (this.state.files.length) {
      this.state.files.forEach(({ data }) => {
        window.URL.revokeObjectURL(data);
      });
    }
  };

  prepareExport = async () => {
    try {
      const MIME_TYPE = 'text/json;charset=utf-8';

      this.clean();

      this.setState({ exporting: 1, files: [] });

      const data = await this.getData();
      const blob = new Blob([JSON.stringify(data)], { type: MIME_TYPE });

      const file = {
        name: `journalbook_${ymd()}.json`,
        data: window.URL.createObjectURL(blob),
      };
      this.setState({ files: [file], exporting: 2 });
    } catch (e) {
      console.error(e);
      this.setState({ files: [], exporting: 0 });
    }
  };

  importData = async event => {
    const reader = new FileReader();
    const file = event.target.files[0];
    this.setState({ importing: true });

    reader.onload = (() => async e => {
      const {
        entries,
        questions,
        highlights = [],
        settings = {},
        trackingQuestions = {},
        trackingEntries = {},
      } = JSON.parse(e.target.result);
      if (!entries || !questions || !Array.isArray(highlights)) {
        return;
      }

      const questionKeys = Object.keys(questions);
      questionKeys.map(async key => {
        const current = await this.props.db.get('questions', key);
        if (!current) {
          await this.props.db.set('questions', key, questions[key]);
        }
      });

      const entryKeys = Object.keys(entries);
      await Promise.all(
        entryKeys.map(async key => {
          const current = await this.props.db.get('entries', key);
          if (!current) {
            return this.props.db.set('entries', key, entries[key]);
          }
        })
      );

      const trackingQuestionKeys = Object.keys(trackingQuestions);
      await Promise.all(
        trackingQuestionKeys.map(async key => {
          const current = await this.props.db.get('trackingQuestions', key);
          if (!current) {
            return this.props.db.set(
              'trackingQuestions',
              key,
              trackingQuestions[key]
            );
          }
        })
      );

      const trackingEntryKeys = Object.keys(trackingEntries);
      await Promise.all(
        trackingEntryKeys.map(async key => {
          const current = await this.props.db.get('trackingEntries', key);
          if (!current) {
            return this.props.db.set(
              'trackingEntries',
              key,
              trackingEntries[key]
            );
          }
        })
      );

      const settingKeys = Object.keys(settings);
      await Promise.all(
        settingKeys.map(async key => {
          const current = await this.props.db.get('settings', key);
          if (!current) {
            return this.props.db.set('settings', key, settings[key]);
          }
        })
      );

      await Promise.all(
        highlights.map(async key => this.props.db.set('highlights', key, true))
      );

      localStorage.setItem('journalbook_onboarded', true);
      localStorage.setItem('journalbook_dates_migrated', true);

      window.location.reload();
    })();

    reader.readAsText(file);
  };

  deleteData = async () => {
    await this.props.db.clear('entries');
    await this.props.db.clear('questions');
    await this.props.db.clear('highlights');
    await this.props.db.clear('highlights');
    await this.props.db.clear('settings');
    await this.props.db.clear('trackingEntries');
    await this.props.db.clear('trackingQuestions');
    localStorage.removeItem('journalbook_onboarded');
    localStorage.removeItem('journalbook_dates_migrated');
    window.location.href = '/';
  };

  render(
    { settings = {} },
    { questions, exporting, files, importing, trackingQuestions }
  ) {
    const theme = settings.theme || getDefaultTheme(settings);
    const animation = settings.animation || prefersAnimation(settings);

    return (
      <div class="wrap lift-children">
        <div>
          <h2>Manage your data</h2>

          {exporting === 2 && files.length ? (
            <a
              class="button button--space"
              download={files[0].name}
              href={files[0].data}
              onClick={() => {
                setTimeout(() => {
                  this.clean();
                  this.setState({ exporting: 0 });
                }, 1500);
              }}
            >
              Click to Download
            </a>
          ) : (
            <button
              type="button"
              class={`button button--space button--grey`}
              onClick={this.prepareExport}
            >
              {['Backup', 'Backing up'][exporting]}
            </button>
          )}

          <input
            type="file"
            class="screen-reader-only"
            id="import"
            onChange={this.importData}
            accept="application/json"
          />
          <label for="import" class="button button--grey">
            {importing ? 'Importing...' : 'Import'}
          </label>

          <hr />
        </div>

        <div>
          <h2 class="mb20">Your journaling questions</h2>
          <QuestionList
            questions={questions}
            updateQuestion={this.updateQuestion}
            updateQuestionStatus={this.updateQuestionStatus}
          />
          <Link class="button button--grey" href="/add-journal-question/">
            Add {questions.length ? 'another' : 'a'} question
          </Link>

          <hr />
        </div>

        <div>
          <h2 class="mb20">Your personal statistics</h2>
          <TrackingQuestionList
            trackingQuestions={trackingQuestions}
            updateTrackingQuestion={this.updateTrackingQuestion}
            updateTrackingOption={this.updateTrackingOption}
          />
          <Link class="button button--grey" href="/add-statistic-question/">
            Add {trackingQuestions.length ? 'another' : 'a'} question
          </Link>
          <hr />
        </div>

        <div className="mb40">
          <p>
            <label for="theme">Theme</label>
            <select
              id="theme"
              onChange={this.updateSetting('theme')}
              value={theme}
            >
              <option value="">Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="rose">Rose</option>
            </select>
          </p>

          <p>
            <label for="animation">Animation</label>
            <select
              id="animation"
              onChange={this.updateSetting('animation')}
              value={animation}
            >
              <option value="">Default</option>
              <option value="on">On</option>
              <option value="off">Off</option>
            </select>
          </p>

          <ScaryButton onClick={this.deleteData}>Delete your data</ScaryButton>
        </div>
      </div>
    );
  }
}

export default connect(
  'settings, db',
  actions
)(Settings);
