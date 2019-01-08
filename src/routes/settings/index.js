import { h, Component } from 'preact';
import { DB } from '../../utils/db';
import { ymd } from '../../utils/date';
import { slugify } from '../../utils/slugify';
import { QuestionList } from '../../components/QuestionList';
import { AddQuestion } from '../../components/AddQuestion';
import { ScaryButton } from '../../components/ScaryButton';
import { getDefaultTheme } from '../../utils/theme';

export default class Questions extends Component {
  state = {
    db: null,
    questions: [],
    exporting: 0,
    importing: false,
    files: [],
    theme: getDefaultTheme(),
  };

  async componentDidMount() {
    const db = new DB();
    const keys = await db.keys('questions');
    const questions = await Promise.all(keys.map(x => db.get('questions', x)));
    this.setState({ db, questions });
  }

  updateTheme = event => {
    const theme = event.target.value;
    localStorage.setItem('journalbook_theme', theme);
    document.querySelector('#app').dataset.theme = theme;
    this.setState({ theme });
  };

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

  addQuestion = async event => {
    event.preventDefault();
    const text = event.target.question.value;
    const slug = slugify(text);
    const question = { slug, text, status: 'live', createdAt: Date.now() };

    await this.state.db.set('questions', slug, question);

    localStorage.setItem('journalbook_onboarded', true);
    const questions = [...this.state.questions];
    questions.push(question);
    this.setState({ questions });
    event.target.reset();
  };

  getData = async () => {
    try {
      const questionValues = await this.state.db.getAll('questions');
      const questions = questionValues.reduce((current, value, index) => {
        current[value.slug] = value;
        return current;
      }, {});

      const entryKeys = await this.state.db.keys('entries');
      const entryValues = await Promise.all(
        entryKeys.map(key => this.state.db.get('entries', key))
      );

      const entries = entryValues.reduce((current, entry, index) => {
        current[entryKeys[index]] = entry;
        return current;
      }, {});

      const highlights = await this.state.db.keys('highlights');

      return { questions, entries, highlights };
    } catch (e) {
      return {
        questions: {},
        entries: {},
        highlights: [],
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
      const { entries, questions, highlights = [] } = JSON.parse(
        e.target.result
      );
      if (!entries || !questions || !Array.isArray(highlights)) {
        return;
      }

      const questionKeys = Object.keys(questions);
      questionKeys.map(async key => {
        const current = await this.state.db.get('questions', key);
        if (!current) {
          await this.state.db.set('questions', key, questions[key]);
        }
      });

      const entryKeys = Object.keys(entries);
      await Promise.all(
        entryKeys.map(async key => {
          const current = await this.state.db.get('entries', key);
          if (!current) {
            return this.state.db.set('entries', key, entries[key]);
          }
        })
      );

      await Promise.all(
        highlights.map(async key => {
          return this.state.db.set('highlights', key, true);
        })
      );

      localStorage.setItem('journalbook_onboarded', true);
      localStorage.setItem('journalbook_dates_migrated', true);

      window.location.reload();
    })();

    reader.readAsText(file);
  };

  deleteData = async () => {
    await this.state.db.clear('entries');
    await this.state.db.clear('questions');
    localStorage.removeItem('journalbook_onboarded');
    window.location.href = '/';
  };

  render(props, { questions, exporting, files, importing, theme = '' }) {
    return (
      <div class="wrap lift-children">
        <QuestionList
          questions={questions}
          updateQuestion={this.updateQuestion}
          updateQuestionStatus={this.updateQuestionStatus}
        />

        <AddQuestion addQuestion={this.addQuestion} />

        <div>
          <hr />

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
              {['Export', 'Exporting'][exporting]}
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

          <ScaryButton onClick={this.deleteData}>Delete your data</ScaryButton>
        </div>

        <div>
          <hr />
          <label for="theme">Theme</label>
          <select id="theme" onChange={this.updateTheme} value={theme}>
            <option value="">Default</option>
            <option value="dark">Dark</option>
          </select>

          <br />
          <br />
        </div>
      </div>
    );
  }
}
