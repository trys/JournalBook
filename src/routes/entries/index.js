import { h, Component } from 'preact';
import Traverse from '../../components/Traverse';
import { Link } from 'preact-router/match';
import { parse, ymd, url, sortDates, shortDate } from '../../utils/date';
import { connect } from 'unistore/preact';
import { getTrackingQuestions, isAnswerValid } from '../../utils/questions';

class Entries extends Component {
  state = {
    years: {},
    question: {},
  };

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const { questionId, db } = this.props;
    if (!questionId) return;

    const questions = await getTrackingQuestions(db);
    const entries = await db.getAll('trackingEntries');
    const question = questions.find(x => x.id === questionId);

    if (!question) return;

    const years = entries
      .filter(x => x.questionId === this.props.questionId)
      .filter(isAnswerValid)
      .reduce((current, entry) => {
        const date = entry.dateString;
        const year = date.substring(0, 4);
        if (!current[year]) current[year] = [];
        current[year].push(parse(date));
        return current;
      }, {});

    Object.keys(years).forEach(year => {
      years[year].sort(sortDates);
    });

    this.setState({ years, question });
  };

  render({ questionId }, { years, question }) {
    const keys = Object.keys(years);
    keys.sort((a, b) => Number(b) - Number(a));

    return (
      <div class="wrap lift-children">
        <Traverse
          title={question.title || 'Personal stats'}
          className="traverse--center"
        />
        {keys.length
          ? keys.map(year => (
              <div key={year} class="center mt20">
                <h2>{year}</h2>
                <ul class="year-overview year-overview--center">
                  {years[year].map(date => (
                    <li key={ymd(date)}>
                      <Link href={url(date, questionId)} class="button">
                        {shortDate(date)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          : null}
      </div>
    );
  }
}

export default connect('db')(Entries);
