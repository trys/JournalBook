import createStore from 'unistore';

const store = {
  settings: {
    theme: '',
    animation: '',
  },
  db: null,
};

export default createStore(store);
