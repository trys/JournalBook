import { h, Component } from 'preact';
import { connect } from 'unistore/preact';
import { Link } from 'preact-router/match';
import Traverse from '../../components/Traverse';
import { pluralise } from '../../utils/pluralise';
import { url } from '../../utils/date';
import { stopWords } from '../../utils/stat';
import { getTrackingQuestions } from '../../utils/questions';

const today = url();

class Stats extends Component {
  state = {
    totalEntries: 0,
    uniqueDates: 0,
    wordCount: 0,
    totalHighlights: 0,
    popularWords: [],
    showPopularWords: false,
    showStopWords: false,
    trackingQuestions: [],
  };

  componentDidMount() {
    this.getData();
  }

  componentWillReceiveProps() {
    this.getData();
  }

  getData = async () => {
    try {
      const keysData = await this.props.db.keys('entries');
      const totalEntries = keysData.length;

      if (!totalEntries) {
        throw new Error();
      }

      // Prepare the keys
      const keys = keysData.map(key => Number(key.split('_').shift()));
      keys.sort((a, b) => a - b);

      const unique = keys.reduce(this.removeDuplicates, []);

      // Highlights
      const highlights = await this.props.db.getAll('highlights');
      const totalHighlights = highlights.length;

      const [wordCount, popularWords] = await this.getPopularWords();

      const trackingQuestions = await this.getTrackingStats();

      this.setState({
        totalEntries,
        uniqueDates: unique.length,
        wordCount,
        totalHighlights,
        popularWords,
        trackingQuestions,
      });
    } catch (e) {
      // console.error(e);
    }
  };

  getTrackingStats = async () => {
    const questions = await getTrackingQuestions();
    const answers = await this.props.db.getAll('trackingEntries');

    questions.forEach(question => {
      question.answers = answers
        .filter(x => x.questionId === question.id)
        .filter(x => x.value !== question.default);

      switch (question.settings.calculation) {
        case 'average':
          question.stat =
            Math.round(
              (question.answers.reduce((c, x) => c + x.value, 0) /
                question.answers.length) *
                1000
            ) / 1000;
          break;
        case 'total':
          question.stat =
            Math.round(
              question.answers.reduce((c, x) => c + x.value, 0) * 1000
            ) / 1000;
          break;
      }
    });

    return questions.filter(x => x.stat !== undefined);
  };

  getPopularWords = async () => {
    // Word count
    const theWords = {};
    const entries = await this.props.db.getAll('entries');
    const wordCount = entries.reduce((c, entry) => {
      const words = entry
        .split(/[.\s,]+/)
        .map(x => x.toLowerCase())
        .filter(Boolean);

      words
        .filter(x => this.state.showStopWords || !stopWords.includes(x))
        .forEach(w => (theWords[w] = theWords[w] ? theWords[w] + 1 : 1));

      return c + words.length;
    }, 0);

    const highestValues = Array.from(
      new Set(Object.values(theWords).sort((a, b) => b - a))
    );
    const popularWords = highestValues.slice(0, 50).map(v => [
      v,
      Object.keys(theWords)
        .filter(k => theWords[k] === v)
        .join(', '),
    ]);

    return [wordCount, popularWords];
  };

  removeDuplicates(c, date) {
    return c.indexOf(date) === -1 ? [...c, date] : c;
  }

  keyToDate(date) {
    const d = date.toString();
    const dateString = `${d.substring(0, 4)}-${d.substring(4, 6)}-${d.substring(
      6,
      8
    )}`;

    return new Date(dateString);
  }

  render(
    {},
    {
      totalEntries,
      uniqueDates,
      wordCount,
      totalHighlights,
      popularWords,
      showPopularWords,
      showStopWords,
      trackingQuestions,
    }
  ) {
    const stats = (
      <div>
        <p>
          You've written <strong>{wordCount}</strong>{' '}
          {pluralise('word', wordCount)} in{' '}
          <strong>
            {totalEntries} {pluralise('entry', totalEntries, 'entries')}
          </strong>{' '}
          over{' '}
          <strong>
            {uniqueDates} {pluralise('day', uniqueDates)}
          </strong>
          !
        </p>
        {totalHighlights ? (
          <p>
            You've also highlighted <strong>{totalHighlights}</strong>{' '}
            {pluralise('day', totalHighlights)}. Check{' '}
            {pluralise('it', totalHighlights, 'them')} out{' '}
            <Link href="/highlights/">here</Link>
          </p>
        ) : null}

        <p>Well done! 👏</p>

        {showPopularWords && popularWords.length ? (
          <div>
            <p>Your most popular words are:</p>
            <table class="left">
              <tbody>
                {popularWords.map(([v, k]) => (
                  <tr key={k}>
                    <th>{v}</th>
                    <td class="capitalize">{k}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <br />
            {!showStopWords ? (
              <button
                type="button"
                class="button button--grey"
                onClick={() => {
                  this.setState({ showStopWords: true });
                  this.getData();
                }}
              >
                Include stop words
              </button>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            class="button button--grey"
            onClick={() => this.setState({ showPopularWords: true })}
          >
            Show popular words
          </button>
        )}

        {trackingQuestions.length ? (
          <div>
            <hr />
            <h2>Tracking Statistics</h2>

            {trackingQuestions.map(question => (
              <p>
                <strong>{question.title}</strong>: {question.stat}
                <small> ({question.settings.calculation})</small>
              </p>
            ))}
          </div>
        ) : null}
      </div>
    );

    const empty = (
      <p>
        There's not quite enough data to get gather stats -{' '}
        <Link href={today}>keep writing</Link>!
      </p>
    );

    const isEmpty = Math.min(totalEntries, uniqueDates, wordCount) === 0;

    return (
      <div class="wrap lift-children">
        <Traverse title="Statistics" className="traverse--center" />
        <div className="pt20 center">{isEmpty ? empty : stats}</div>
      </div>
    );
  }
}

export default connect('db')(Stats);
