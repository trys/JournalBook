import createStore from 'unistore';

const store = {
  settings: {
    theme: '',
    animation: '',
    storageAdapter: '',
  },
  db: null,
};

export default createStore(store);
