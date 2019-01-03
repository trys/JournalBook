import { h, Component } from 'preact';
import { Link } from 'preact-router/match';
import { ymd, url, format, compare } from '../../utils/date';
import { DB } from '../../utils/db';

export default class Year extends Component {
  componentDidMount() {
    this.getData(this.props);
  }

  componentWillReceiveProps(props) {
    this.getData(props);
  }

  getData = ({ year }) => {
    const date = new Date(year, 0, 1);

    if (date.toString() === 'Invalid Date') {
      window.location.href = `/${new Date().getFullYear()}`;
      return;
    }

    const db = new DB();
    const monthCount = new Array(12).fill(0);

    db.keys('entries')
      .then(keys => keys.map(x => x.split('_').shift()))
      .then(dates => {
        dates
          .filter(x => x.indexOf(String(year)) === 0)
          .forEach(date => {
            const monthDate = date.substring(4, 8);

            // monthCount[month]++;
          });

        // console.log(monthCount);
      });
  };

  render({ year }) {
    const today = new Date();
    const lastYear = new Date(year, 0, 1);
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    const nextYear = new Date(year, 0, 1);
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const isThisYear = today.getFullYear() === Number(year);

    return (
      <div class="wrap wrap--padding">
        <header class="traverse">
          <Link href={`/${lastYear.getFullYear()}`}>
            <svg width="8" height="14" xmlns="http://www.w3.org/2000/svg">
              <title>Last Year</title>
              <path
                d="M2.4 7l5.3-5.3c.4-.4.4-1 0-1.4-.4-.4-1-.4-1.4 0l-6 6c-.4.4-.4 1 0 1.4l6 6c.2.2.5.3.7.3.2 0 .5-.1.7-.3.4-.4.4-1 0-1.4L2.4 7z"
                fill="#4951A3"
                fill-rule="nonzero"
              />
            </svg>
          </Link>
          <h1>{year}</h1>
          <Link
            disabled={isThisYear}
            href={isThisYear ? '' : `/${nextYear.getFullYear()}`}
          >
            <svg width="8" height="14" xmlns="http://www.w3.org/2000/svg">
              <title>Next Year</title>
              <path
                d="M7.7 6.3l-6-6C1.3-.1.7-.1.3.3c-.4.4-.4 1 0 1.4L5.6 7 .3 12.3c-.4.4-.4 1 0 1.4.2.2.4.3.7.3.3 0 .5-.1.7-.3l6-6c.4-.4.4-1 0-1.4z"
                fill="#4951A3"
                fill-rule="nonzero"
              />
            </svg>
          </Link>
        </header>
      </div>
    );
  }
}
