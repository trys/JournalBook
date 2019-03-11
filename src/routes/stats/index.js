import { h, Component } from 'preact';
import { connect } from 'unistore/preact';
import Traverse from '../../components/Traverse';

class Stats extends Component {
  state = {
    totalEntries: 0,
    uniqueDates: 0,
    wordCount: 0,
  };

  componentDidMount() {
    this.getData();
  }

  componentWillReceiveProps() {
    this.getData();
  }

  getData = async () => {
    try {
      const keys = await this.props.db.keys('entries');
      const totalEntries = keys.length;

      const uniqueDates = keys
        .map(key => {
          return key.split('_').shift();
        })
        .reduce((c, date) => {
          if (c.indexOf(date) === -1) {
            c.push(date);
          }

          return c;
        }, []);

      const entries = await this.props.db.getAll('entries');
      const wordCount = entries.reduce((c, entry) => {
        return c + entry.split(' ').length + 1;
      }, 0);

      this.setState({
        totalEntries,
        uniqueDates: uniqueDates.length,
        wordCount,
      });
    } catch (e) {
      console.error(e);
    }
  };

  render({}, { totalEntries, uniqueDates, wordCount }) {
    const stats = (
      <div>
        <p>
          You've written <strong>{wordCount}</strong> words in{' '}
          <strong>{totalEntries} entries</strong> over{' '}
          <strong>{uniqueDates} days</strong>!
        </p>
        <p>Nicely done! 👏</p>
      </div>
    );

    const empty = (
      <p>There's not quite enough data to get gather stats - keep writing!</p>
    );

    const isEmpty = Math.min(totalEntries, uniqueDates, wordCount) === 0;

    return (
      <div class="wrap lift-children">
        <Traverse title="Stats" className="traverse--center" />

        {isEmpty ? empty : stats}
      </div>
    );
  }
}

export default connect('db')(Stats);
