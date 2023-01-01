<template>

  <div class="row">
    <div class="col-5 col-md-4 col-lg-3 content-between">
      <div class="column justify-between h-100">
        <div class="col-2">
          <div class="text-h5 self-end">{{ $t('MESSAGE.BACKGROUND_SERVICE') }}</div>
          <q-separator spaced />
        </div>
        <div class="col-8">
          <div class="row">
            <div class="col-4 q-my-md">
              <q-badge rounded v-if="service.status === 'online'" color="light-green-7" :label="$t('MESSAGE.ONLINE')" class="q-px-md q-py-xs q-ma-sm" />
              <q-badge v-else color="negative" :label="$t('MESSAGE.OFFLINE')" class="q-px-md q-py-xs" />
            </div>
            <div class="col-8 q-my-md self-end">
              <q-btn :disable="logUrl === undefined" push color="light-green-7" icon="text_snippet" size="sm" :label="$t('COMMON.OPEN_LOG')" class="float-right q-ma-md" :href="`/admin/system/tools/logfile.cgi?logfile=${logUrl}&amp;header=html&amp;format=template&amp;only=once`" target=" _blank" />
            </div>
          </div>
        </div>
        <div class="col-2 self-end">
          <q-btn :loading="isLoading" :disable="isLoading" push color="blue-grey-13" icon="restart_alt" size="sm" :label="$t('COMMON.RESTART')" class="align-right q-mx-md" @click="restartService" />
        </div>

      </div>
    </div>
    <div class="col-1">
    </div>
    <div class="col-6 col-md-7 col-lg-8">
      <div class="row">
        <div class="col-12">
          <div class="text-h5 self-end">{{ $t('MESSAGE.PLUGIN_SETTINGS') }}</div>
          <q-separator spaced />
        </div>
        <div class="col-12 q-my-md">
          <q-input v-if="hasMqtt" name="topic" :ref="formFields.topic" :disable="isSaving || isLoading" :loading="isLoading" v-model="config.topic" :label="$t('MESSAGE.TOPIC')" :hint="$t('MESSAGE.TOPIC_HINT')" :rules="validationRules.topic" data-role="none" />
          <q-banner v-else rounded class="bg-red text-white q-mt-md">
            {{$t('MESSAGE.NEED_MQTT')}}
          </q-banner>
          <q-input name="interval" :ref="formFields.interval" :disable="isSaving || isLoading" :loading="isLoading" v-model="config.interval" :label="$t('MESSAGE.INTERVAL')" :hint="$t('MESSAGE.INTERVAL_HINT')" :rules="validationRules.interval" data-role="none" />
          <q-input name="message-center-id" :readonly="true" v-model="config.messageCenterId" :label="$t('MESSAGE.MESSAGE_CENTER_ID')" data-role="none" />
        </div>

        <div class="col-12 q-my-md">
          <q-btn :loading="isSaving" :disable="!isSaving && isLoading" push color="light-green-7" icon="save" size="md" :label="$t('COMMON.SAVE_BTN')" @click="saveSettings" />
        </div>
      </div>
    </div>
  </div>

  <div class="row q-pt-md">
    <div class="col-12">
      <div class="text-h6 self-end">
        {{ $t('MESSAGE.EXPLANATION') }}
        <q-separator spaced />
      </div>
      <p>
        {{ $t('EXPLANATION.HOWTO') }}
      </p>
    </div>
    <div class="col-6 col-md-5 col-lg-4 text-bold">{{ topicString }}_entryUuid</div>
    <div class="col-6 col-md-7 col-lg-8">{{ $t('EXPLANATION.ENTRY_UUID') }}</div>
    <div class="col-6 col-md-5 col-lg-4 text-bold">{{ topicString }}_affectedName</div>
    <div class="col-6 col-md-7 col-lg-8">{{ $t('EXPLANATION.AFFECTED_NAME') }}</div>
    <div class="col-6 col-md-5 col-lg-4 text-bold">{{ topicString }}_desc</div>
    <div class="col-6 col-md-7 col-lg-8">{{ $t('EXPLANATION.DESC') }}</div>
    <div class="col-6 col-md-5 col-lg-4 text-bold">{{ topicString }}_severity</div>
    <div class="col-6 col-md-7 col-lg-8">{{ $t('EXPLANATION.SEVERITY') }}</div>
    <div class="col-6 col-md-5 col-lg-4 text-bold">{{ topicString }}_title</div>
    <div class="col-6 col-md-7 col-lg-8">{{ $t('EXPLANATION.TITLE') }}</div>
    <div class="col-6 col-md-5 col-lg-4 text-bold">{{ topicString }}_hasConfirmAction</div>
    <div class="col-6 col-md-7 col-lg-8">{{ $t('EXPLANATION.HAS_CONFIRM_ACTION') }}</div>
  </div>
  <div class="row q-pt-md">
    <div class="col-12">
      <div class="text-h6 self-end">
        {{ $t('MESSAGE.AUTOMATIC_RESOLVE') }}
        <q-separator spaced />
      </div>
      <p>
        {{ $t('EXPLANATION.MARK_MESSAGE') }}
      </p>
    </div>
    <div class="col-6 col-md-5 col-lg-4 text-bold">{{ $t('EXPLANATION.READ_URL') }}</div>
    <div class="col-6 col-md-7 col-lg-8">
      POST <span class="text-bold">{{loxberryAddress}}/admin/express/plugins/message_center/message/mark-as-read/<q-badge outline color="primary">enteryUuid</q-badge></span>
    </div>
    <div class="col-6 col-md-5 col-lg-4 text-bold">{{ $t('EXPLANATION.CONFIRM_URL') }}</div>
    <div class="col-6 col-md-7 col-lg-8">
      POST <span class="text-bold">{{loxberryAddress}}/admin/express/plugins/message_center/message/mark-as-confirmed/<q-badge outline color="primary">entryUuid</q-badge></span>
    </div>
    <div class="col-12 q-my-md">
      <q-btn push color="light-green-7" icon="save" size="sm" :label="$t('EXPLANATION.DOWNLOAD_OUTPUTS')" href="/admin/express/plugins/message_center/getOutputs" target="_blank" />
      <a class="q-mx-md" :href="$t('EXPLANATION.LOXONE_TEMPLATE_URL')" target="_blank"> {{ $t('EXPLANATION.TEMPLATE_HELP') }}</a>
    </div>
  </div>

</template>
<style lang="scss">
.row.spaced {
  margin-bottom: 20px;
}

.h-100 {
  height: 100%;
}
</style>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import actionStore from '../store/actions';
import validationRules from '../utils/validationRules';

export default {
  name: 'Settings',
  components: {},
  setup() {
    const { t } = useI18n({ useScope: 'global' });
    const store = useStore();
    store.dispatch(actionStore.actionTypes.LOAD_SETTINGS);

    const config = computed(() => store.state.Settings.config);
    const isLoading = computed(() => store.state.Global.loading);
    const service = computed(() => store.state.Settings.service);
    const hasMqtt = computed(() => config.value.mqtt);
    const isSaving = ref(false);
    const logUrl = computed(() => (service.value && service.value.log ? encodeURIComponent(service.value.log.out) : undefined));
    const topicString = computed(() => (config.value && config.value.topic ? config.value.topic.replaceAll('/', '_') : ''));
    
    const formFields = {
      interval: ref(null),
      topic: ref(null)
    };
    const saveSettings = async () => {
      const fields = Object.values(formFields).filter((field) => field.value && field.value.validate);

      fields.forEach((field) => field.value.validate());
      const errorField = fields.find((field) => field.value.hasError);

      if (errorField === undefined) {
        isSaving.value = true;
        try {
          await store.dispatch(actionStore.actionTypes.SAVE_SETTINGS);
        } finally {
          isSaving.value = false;
        }
      }
    };

    const restartService = async () => {
      await store.dispatch(actionStore.actionTypes.RESTART_SERVICE);
    };

    return {
      config,
      isLoading,
      validationRules: validationRules(t),
      formFields,
      isSaving,
      service,
      hasMqtt,
      logUrl,
      topicString,
      saveSettings,
      restartService,
      loxberryAddress: document.location.origin
    };
  }
};
</script>