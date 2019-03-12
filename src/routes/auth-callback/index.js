import { h, Component } from 'preact';
import { route } from 'preact-router';
import storage from '../../utils/storage';

class AuthCallback extends Component {
  constructor(props) {
    super();
    const { provider, ...query } = props;
    const msg = storage.authCallback(provider, query, () =>
      route('/settings', true)
    );
    this.state = {
      msg,
    };
  }
  render({}, { msg }) {
    return <div>{msg}</div>;
  }
}

export default AuthCallback;
