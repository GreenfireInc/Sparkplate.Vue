import { ActivityService } from '../service/ActivityService'
const activityService = new ActivityService()
const initState = () => ({})

export default {
  namespaced: true,
  state: initState,
  getters: {
    value: (state) => {
      return state.value
    }
  },
  mutations: {
    setActivityList(state, payload) {
      state.activities = payload
    },
    resetActivitiesState(state) {
      Object.assign(state, initState())
    }
  },
  actions: {
    async addLoginActivity({ commit }, payload) {
      // console.log('addLoginActivity payload >>> ', payload)
      await activityService.addActivity(payload)
      const activityList = await activityService.getActivities(payload.userId)
      commit('setActivityList', activityList)
    },
    async fetchActivities({ commit }, id) {
      const activities = await activityService.getActivities(id)
      commit('setActivityList', activities)
    }
  }
}
