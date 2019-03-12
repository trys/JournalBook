import { h, Component } from 'preact';
import storage from '../../utils/storage';

class Auth extends Component {
  constructor(props) {
    super();
    const { provider } = props;
    const msg = storage.requestAuth(provider);
    this.state = { msg };
  }

  render({}, { msg }) {
    return <div>{msg}</div>;
  }
}

export default Auth;
