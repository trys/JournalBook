import { h, Component } from 'preact';
import { connect } from 'unistore/preact';
import { Link } from 'preact-router/match';
import Traverse from '../../components/Traverse';
import { pluralise } from '../../utils/pluralise';
import { url } from '../../utils/date';

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

      // const dates = unique.map(this.keyToDate);

      const theWords = {};
      const stopWords = [
        'i',
        'a',
        'and',
        'the',
        'in',
        'of',
        'to',
        'then',
        'they',
        'was',
        'for',
        'with',
        'it',
        'we',
        'on',
        'an',
        'but',
        'at',
        'had',
        'so',
        'went',
        'up',
        'some',
        'got',
        'my',
        'be',
        'that',
        'this',
        "i'm",
        'made',
        'out',
        "it's",
        'is',
        'did',
        'me',
        'too',
        'how',
        'off',
        'as',
      ];

      // Word count
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

      // Highlights
      const highlights = await this.props.db.getAll('highlights');
      const totalHighlights = highlights.length;

      this.setState({
        totalEntries,
        uniqueDates: unique.length,
        wordCount,
        totalHighlights,
        popularWords,
      });
    } catch (e) {
      // console.error(e);
    }
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
        <p>Well done! 👏</p>
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
        <Traverse title="Stats" className="traverse--center" />
        <div className="pt20 center">{isEmpty ? empty : stats}</div>
      </div>
    );
  }
}

export default connect('db')(Stats);
