import { h, Component } from 'preact';
import { slugify } from '../../utils/slugify';
import { AddQuestion } from '../../components/AddQuestion';
import Traverse from '../../components/Traverse';
import { actions } from '../../store/actions';
import { connect } from 'unistore/preact';

class AddJournalQuestion extends Component {
  addQuestion = async event => {
    event.preventDefault();
    const text = event.target.question.value;
    const slug = slugify(text);
    const question = { slug, text, status: 'live', createdAt: Date.now() };

    await this.props.db.set('questions', slug, question);

    localStorage.setItem('journalbook_onboarded', true);

    window.location.href = '/settings/';
  };

  render() {
    return (
      <div class="wrap lift-children">
        <Traverse
          title="Add a journaling question"
          className="traverse--center"
        />
        <AddQuestion addQuestion={this.addQuestion} />
      </div>
    );
  }
}

export default connect(
  'settings, db',
  actions
)(AddJournalQuestion);
