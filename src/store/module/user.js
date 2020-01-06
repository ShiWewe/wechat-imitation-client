let user = localStorage.getExpire('userInfo')

export default {
  state: {
    // 用户信息
    userInfo: {
      username: user ? user.username : '',
      avatar: user ? user.avatar : ''
    }
  },
  actions: {
    // 登录
    handleLogin ({ commit }, data) {
      return new Promise((resolve, reject) => {
        if (data) {
          resolve(data)
        } else {
          reject(data)
        }
        commit('setUserInfo', data)
      })
    },
    // 退出登录
    logOut ({ commit }) {
    }
  },
  mutations: {
    setUserInfo (state, data) {
      localStorage.setExpire('userInfo', data, 3600 * 1000)  // 1h
      // localStorage.setExpire('userInfo', data, 3 * 1000)  // 3s
      state.userInfo.username = data.username
      state.userInfo.avatar = data.avatar
    }
  }
}
