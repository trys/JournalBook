import { h, Component } from 'preact';
import {
  filledArray,
  months as monthNames,
  pad,
  shortDate,
} from '../../utils/date';
import Traverse from '../../components/Traverse';
import { Link } from 'preact-router/match';
import { connect } from 'unistore/preact';

class Month extends Component {
  state = {
    months: filledArray(),
  };

  componentDidMount() {
    this.getData(this.props);
  }

  componentWillReceiveProps(props) {
    this.getData(props);
  }

  getData = async ({ year, month }) => {
    month = Number(month) - 1;
    const date = new Date(year, month, 1);

    if (date.toString() === 'Invalid Date') {
      window.location.href = `/${new Date().getFullYear()}`;
      return;
    }

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates = await this.props.db.keys('entries');

    const days = dates
      .map(x => x.split('_').shift())
      .filter(x => x.indexOf(String(year) + pad(month + 1)) === 0)
      .reduce((current, date) => {
        const day = Number(date.substring(6, 8));
        current[day]++;
        return current;
      }, filledArray(0, daysInMonth + 1));

    this.setState({ days });
  };

  render({ year, month }, { days = [] }) {
    month = Number(month - 1);
    const lastMonth = new Date(year, month, 1);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const nextMonth = new Date(year, month, 1);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

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
          nextLink={`/${nextMonth.getFullYear()}/${pad(
            nextMonth.getMonth() + 1
          )}`}
        />
        <ul class="year-overview">
          {days
            .filter((x, i) => !!i)
            .map((count, day) => {
              const date = new Date(year, month, day + 1);

              return (
                <li key={day}>
                  <Link
                    href={`/${year}/${pad(month + 1)}/${pad(day + 1)}`}
                    class={`button button--${count ? 'active' : 'inactive'}`}
                  >
                    {shortDate(date)}
                    <strong>
                      <b>{count}</b>
                    </strong>
                  </Link>
                </li>
              );
            })}
        </ul>
      </div>
    );
  }
}

export default connect('db')(Month);
