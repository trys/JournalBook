import { h, Component } from 'preact';
import { filledArray, months as monthNames, pad } from '../../utils/date';
import { DB } from '../../utils/db';
import Traverse from '../../components/Traverse';
import { Link } from 'preact-router/match';

export default class Month extends Component {
  state = {
    months: filledArray(),
  };

  componentDidMount() {
    this.getData(this.props);
  }

  componentWillReceiveProps(props) {
    this.getData(props);
  }

  getData = ({ year, month }) => {
    month = Number(month) - 1;
    const date = new Date(year, month, 1);

    if (date.toString() === 'Invalid Date') {
      window.location.href = `/${new Date().getFullYear()}`;
      return;
    }

    const db = new DB();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = filledArray(0, daysInMonth + 1);

    db.keys('entries')
      .then(keys => keys.map(x => x.split('_').shift()))
      .then(dates => {
        dates
          .filter(x => x.indexOf(String(year) + pad(month + 1)) === 0)
          .forEach(date => {
            const day = Number(date.substring(6, 8));
            days[day]++;
          });

        this.setState({ days });
      });
  };

  render({ year, month }, { days = [] }) {
    month = Number(month - 1);
    const today = new Date();
    const lastMonth = new Date(year, month, 1);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const nextMonth = new Date(year, month, 1);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const isThisMonth =
      today.getMonth() === month && today.getFullYear() === Number(year);

    return (
      <div class="wrap lift-children">
        <Traverse
          title={
            <span>
              {monthNames[month]} <Link href={`/${year}`}>{year}</Link>
            </span>
          }
          lastLink={`/${lastMonth.getFullYear()}/${pad(
            lastMonth.getMonth() + 1
          )}`}
          nextLink={
            isThisMonth
              ? ''
              : `/${nextMonth.getFullYear()}/${pad(nextMonth.getMonth() + 1)}`
          }
          disableNext={isThisMonth}
        />
        <ul class="year-overview">
          {days
            .filter((x, i) => !!i)
            .map((count, day) => (
              <li key={day}>
                <Link
                  href={`/${year}/${pad(month + 1)}/${pad(day + 1)}`}
                  class={`button button--${count ? 'active' : 'inactive'}`}
                >
                  {monthNames[month]} {day + 1}{' '}
                  <strong>
                    <b>{count}</b>
                  </strong>
                </Link>
              </li>
            ))}
        </ul>
      </div>
    );
  }
}
