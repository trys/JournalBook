import { h, Component } from 'preact';
import Traverse from '../../components/Traverse';
import { Link } from 'preact-router/match';
import { parse, ymd, url, sortDates, shortDate } from '../../utils/date';
import { connect } from 'unistore/preact';

class Highlights extends Component {
  state = {
    years: {},
  };

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const highlights = await this.props.db.keys('highlights');
    const years = highlights.reduce((current, date) => {
      const year = date.substring(0, 4);
      if (!current[year]) current[year] = [];
      current[year].push(parse(date));
      return current;
    }, {});

    Object.keys(years).forEach(year => {
      years[year].sort(sortDates);
    });

    this.setState({ years });
  };

  render(props, { years }) {
    const keys = Object.keys(years);
    keys.sort((a, b) => Number(b) - Number(a));

    return (
      <div class="wrap lift-children">
        <Traverse title="Highlights" className="traverse--center" />
        <p class="center mt20">
          Take a look back on the year, and reflect on your top moments.
        </p>
        {keys.length ? (
          keys.map(year => (
            <div key={year} class="center mt20">
              <h2>{year}</h2>
              <ul class="year-overview year-overview--center">
                {years[year].map(date => {
                  return (
                    <li key={ymd(date)}>
                      <Link href={url(date)} class="button">
                        {shortDate(date)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        ) : (
          <p class="center">
            No highlights just yet? Not to worry, keep your chin up, and keep
            writing! 😊
          </p>
        )}
      </div>
    );
  }
}

export default connect('db')(Highlights);
