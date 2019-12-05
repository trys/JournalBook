import { h, Component } from 'preact';
import { slugify } from '../../utils/slugify';
import { pluralise } from '../../utils/pluralise';
import Traverse from '../../components/Traverse';
import { actions } from '../../store/actions';
import { connect } from 'unistore/preact';
import { TrackingQuestionList } from '../../components/TrackingQuestionList';
import { getPresetQuestions } from '../../utils/questions';

class AddStatisticQuestion extends Component {
  state = {
    trackingQuestions: [],
    preset: '',
  };

  onSubmit = e => {
    e.preventDefault();

    this.state.trackingQuestions.forEach(question => {
      this.props.db.set('trackingQuestions', question.id, question);
    });

    localStorage.setItem('journalbook_onboarded', true);

    window.location.href = '/settings/';
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

    this.setState({ trackingQuestions });
  };

  createPreset = preset => {
    let trackingQuestions = [];
    const presets = getPresetQuestions();

    if (presets[preset]) {
      trackingQuestions = [...presets[preset]];
      const groupId = slugify();
      trackingQuestions.forEach((question, index) => {
        question.id = slugify();
        question.groupId = groupId;
        question.createdAt += index;
      });
    }

    this.setState({ preset, trackingQuestions });
  };

  render(props, { trackingQuestions, preset }) {
    const buttons = [
      ['Sleep tracking', 'sleep'],
      ['Medicine log', 'medicine'],
      ['Panic attack', 'panic'],
      ['Musical instrument', 'musical'],
      ['Running', 'running'],
      ['Asthma log', 'asthma'],
      ['Mood', 'mood'],
      ['Discomfort', 'discomfort'],
      ['Workout', 'workout'],
      ['Custom numerical', 'number'],
      ['Custom choices', 'choices'],
      ['Yes/No switch', 'tickbox'],
    ];

    return (
      <div class="wrap lift-children">
        <Traverse
          title="Add a personal statistic to track"
          className="traverse--center mb20"
        />

        <p>Choose a preset, or create a custom statistic:</p>
        <div class="year-overview year-overview--center">
          {buttons.map(([label, value]) => (
            <button
              type="button"
              class="button button--grey"
              disabled={preset && preset !== value}
              onClick={() => this.createPreset(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {preset ? (
          <form onSubmit={e => this.onSubmit(e)}>
            <TrackingQuestionList
              trackingQuestions={trackingQuestions}
              updateTrackingQuestion={this.updateTrackingQuestion}
              updateTrackingOption={this.updateTrackingOption}
              hideActive
            />

            {trackingQuestions.length ? (
              <input
                type="submit"
                class="button mr20"
                value={pluralise('Add question', trackingQuestions.length)}
              />
            ) : null}

            <button
              type="button"
              class="button--reset"
              onClick={() => this.createPreset('')}
            >
              Reset
            </button>
          </form>
        ) : null}
      </div>
    );
  }
}

export default connect(
  'settings, db',
  actions
)(AddStatisticQuestion);
