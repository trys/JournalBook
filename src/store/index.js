import createStore from 'unistore';

const store = {
  settings: {
    theme: '',
  },
  db: null,
};

export default createStore(store);
