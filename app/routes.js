import Settings from './components/Settings.vue';
import NotFound from './components/NotFound.vue';
export default [
  {
    base: '/admin/plugins/message_center/express',
    name: 'settings',
    path: '/',
    component: Settings
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
];
