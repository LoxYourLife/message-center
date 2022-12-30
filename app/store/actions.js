import { mapValues, isEmpty, set } from 'lodash';
import settingsStore from './settings';
import globalStore from './global';

const state = () => ({});
const mutationTypes = {};
const actionTypes = {
  LOAD_SETTINGS: 'LOAD_SETTINGS',
  SAVE_SETTINGS: 'SAVE_SETTINGS',
  RESTART_SERVICE: 'RESTART_SERVICE'
};

const withLoading = async (context, continuation) => {
  context.commit(globalStore.mutationTypes.LOADING, true, { root: true });
  try {
    await continuation();
  } finally {
    context.commit(globalStore.mutationTypes.LOADING, false, { root: true });
  }
};

const actions = {
  async [actionTypes.LOAD_SETTINGS](context) {
    return withLoading(context, async () => {
      await context.dispatch(settingsStore.actionTypes.LOAD_CONFIG, null, { root: true });
      await context.dispatch(settingsStore.actionTypes.LOAD_SERVICE_INFO, null, { root: true });
    });
  },
  async [actionTypes.SAVE_SETTINGS](context) {
    return withLoading(context, async () => {
      await context.dispatch(settingsStore.actionTypes.SAVE_CONFIG, null, { root: true });
    });
  },
  async [actionTypes.RESTART_SERVICE](context) {
    await context.dispatch(settingsStore.actionTypes.RESTART_SERVICE, null, { root: true });
    return context.dispatch(settingsStore.actionTypes.LOAD_SERVICE_INFO, null, { root: true });
  }
};
const mutations = {};

export default {
  name: 'Actions',
  namespaced: true,
  actions,

  actionTypes: mapValues(actionTypes, (type) => `Actions/${type}`),
  mutationTypes: mapValues(mutationTypes, (type) => `Actions/${type}`)
};
