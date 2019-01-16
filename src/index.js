import './style';
import App from './components/app';
import { Provider } from 'unistore/preact';
import store from './store';

export default () => (
  <Provider store={store}>
    <App />
  </Provider>
);
