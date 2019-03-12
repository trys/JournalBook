import { h, Component } from 'preact';
import { ymd } from '../../utils/date';
import { Link } from 'preact-router/match';
import { slugify } from '../../utils/slugify';
import { QuestionList } from '../../components/QuestionList';
import { AddQuestion } from '../../components/AddQuestion';
import { ScaryButton } from '../../components/ScaryButton';
import { getDefaultTheme, prefersAnimation } from '../../utils/theme';
import { actions } from '../../store/actions';
import { connect } from 'unistore/preact';
import storage from '../../utils/storage';

class Settings extends Component {
  state = {
    questions: [],
    exporting: 0,
    importing: false,
    files: [],
  };

  async componentDidMount() {
    const keys = await this.props.db.keys('questions');
    const questions = await Promise.all(
      keys.map(x => this.props.db.get('questions', x))
    );
    questions.sort((a, b) => a.createdAt - b.createdAt);

    this.setState({ questions });
  }

  updateSetting = key => event => {
    this.props.updateSetting({ key, value: event.target.value });
  };

  updateStorageAdapter = event => {
    const adapter = event.target.value;
    this.props.updateSetting({ key: 'storageAdapter', value: adapter });
    storage.setAdapter(adapter);
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

      return { questions, entries, highlights, settings };
    } catch (e) {
      return {
        questions: {},
        entries: {},
        highlights: [],
        settings: {},
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

  deleteData = async () => {
    await this.props.db.clear('entries');
    await this.props.db.clear('questions');
    await this.props.db.clear('highlights');
    localStorage.removeItem('journalbook_onboarded');
    window.location.href = '/';
  };

  export = async () => {
    this.clean();

    this.setState({ exporting: 1, files: [] });
    try {
      const files = await storage.adapter.export();
      this.setState({ files, exporting: 2 }, () =>
        setTimeout(() => this.setState({ exporting: 0 }), 1500)
      );
    } catch (e) {
      console.error(e);
      this.setState({ files: [], exporting: 0 });
    }
  };

  import = async () => {
    this.setState({ importing: true });
    await storage.adapter.import();
    localStorage.setItem('journalbook_onboarded', true);
    localStorage.setItem('journalbook_dates_migrated', true);
    this.setState({ importing: false });
    window.location.reload();
  };

  logout = async () => {
    storage.adapter.logout();
    storage.setAdapter('file');
    this.updateStorageAdapter({ target: { value: 'file' } });
    window.location.reload();
  };

  render({ settings = {} }, { questions, exporting, files, importing }) {
    const theme = settings.theme || getDefaultTheme(settings);
    const storageAdapter = settings.storageAdapter || storage.getAdapter();
    const animation = settings.animation || prefersAnimation(settings);

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

          <label for="storage">Storage</label>
          <fieldset id="storage">
            <label for="file">
              <input
                type="radio"
                id="file"
                name="storage"
                value="file"
                checked={storageAdapter === 'file'}
                onChange={this.updateStorageAdapter}
              />
              <span class="button button--space button--grey">Local File</span>
            </label>
            <label for="dropbox">
              <input
                type="radio"
                id="dropbox"
                name="storage"
                value="dropbox"
                checked={storageAdapter === 'dropbox'}
                onChange={this.updateStorageAdapter}
              />
              <span class="button button--space button--grey">Dropbox</span>
            </label>
          </fieldset>

          {storageAdapter === 'file' && (
            <div>
              <label>Local File</label>
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
                  onClick={this.export}
                >
                  {['Export', 'Exporting'][exporting]}
                </button>
              )}

              <input
                type="file"
                class="screen-reader-only"
                id="import"
                onChange={this.import}
                accept="application/json"
              />
              <label for="import" class="button button--grey">
                {importing ? 'Importing...' : 'Import'}
              </label>
            </div>
          )}

          {storageAdapter === 'dropbox' && (
            <div>
              <label>Dropbox</label>
              {storage.adapters.dropbox.isAuthenticated() ? (
                <div>
                  <button
                    type="button"
                    class={`button button--space button--grey`}
                    onClick={this.export}
                  >
                    {['Export', 'Exporting', 'Exported!'][exporting]}
                  </button>
                  <button
                    type="button"
                    class={`button button--grey`}
                    onClick={this.import}
                  >
                    {importing ? 'Importing...' : 'Import'}
                  </button>
                  <ScaryButton onClick={this.logout}>Sign Out</ScaryButton>
                </div>
              ) : (
                <Link href="/auth/dropbox" class="button">
                  Login with Dropbox
                </Link>
              )}
            </div>
          )}

          <label for="delete">Browser data</label>
          <ScaryButton onClick={this.deleteData}>Delete your data</ScaryButton>
        </div>

        <div className="mb40">
          <hr />
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
        </div>
      </div>
    );
  }
}

export default connect(
  'settings, db',
  actions
)(Settings);
