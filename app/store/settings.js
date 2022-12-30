import axios from 'axios';
import { mapValues, get, orderBy } from 'lodash';
import globalStore from './global';

const actionTypes = {
  LOAD_CONFIG: 'loadConfig',
  SAVE_CONFIG: 'saveConfig',
  LOAD_SERVICE_INFO: 'loadServiceInfo',
  RESTART_SERVICE: 'restartService'
};
const mutationTypes = {
  STORE_CONFIG: 'storeConfig',
  SET_SERVICE_INFO: 'setServiceInfo'
};

const state = () => ({
  config: {},
  service: {}
});

const catchAndHandleError = async (context, executable) => {
  try {
    context.commit(globalStore.mutationTypes.RESET_ERROR, null, { root: true });
    await executable();
  } catch (error) {
    if (error.response) {
      const message = get(error, 'response.data.error', error.message);
      context.commit(globalStore.mutationTypes.ERROR, message, { root: true });
    } else {
      context.commit(globalStore.mutationTypes.ERROR, error.message, { root: true });
    }

    throw error;
  }
};

const url = (endpoint) => `/admin/express/plugins/message_center/api/${endpoint}`;

const actions = {
  async [actionTypes.LOAD_CONFIG](context) {
    return catchAndHandleError(context, async () => {
      const response = await axios.get(url('config'));
      context.commit(mutationTypes.STORE_CONFIG, response.data);
    });
  },
  async [actionTypes.SAVE_CONFIG](context) {
    return catchAndHandleError(context, async () => {
      const response = await axios.put(url('config'), context.state.config);
      context.commit(mutationTypes.STORE_CONFIG, response.data);
    });
  },
  async [actionTypes.RESTART_SERVICE](context) {
    return catchAndHandleError(context, async () => {
      await axios.post(url('restart-service'));
    });
  },
  async [actionTypes.LOAD_SERVICE_INFO](context) {
    return catchAndHandleError(context, async () => {
      const response = await axios.get(url('service-info'));
      context.commit(mutationTypes.SET_SERVICE_INFO, response.data);
    });
  }
};
const mutations = {
  [mutationTypes.STORE_CONFIG](state, config) {
    state.config = config;
  },
  [mutationTypes.SET_SERVICE_INFO](state, service) {
    state.service = service;
  }
};

export default {
  name: 'Settings',
  namespaced: true,
  state,
  actions,
  mutations,
  mutationTypes: mapValues(mutationTypes, (type) => `Settings/${type}`),
  actionTypes: mapValues(actionTypes, (type) => `Settings/${type}`)
};
