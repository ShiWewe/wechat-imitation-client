<template>
  <el-dialog class="dialog-setting" title="设置" :visible.sync="formData.visible" width="550px" append-to-body>
    <el-tabs tab-position="left">
      <el-tab-pane label="帐号设置" style="height:450px">
        <div class="setting-account">
          <el-avatar :size="100" shape="square" :src="userInfo && userInfo[0] && userInfo[0]['avatar']"></el-avatar>
          <div class="setting-user-id">
            <span>用户昵称：{{userInfo && userInfo[0] && userInfo[0]['username']}}</span>
          </div>
          <div class="setting-user-id">
            <span>用户id：{{userInfo && userInfo[0] && userInfo[0]['userId']}}</span>
          </div>
          <div class="setting-login-out">
            <span>退出登陆</span>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="通用设置" style="height:450px">通用设置</el-tab-pane>
      <el-tab-pane label="快捷按键" style="height:450px">快捷按键</el-tab-pane>
      <el-tab-pane label="关于微信" style="height:450px">关于微信</el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<script>
export default {
  props: {
    formData: Object
  },
  data () {
    return {
      userInfo: null
    }
  },
  watch: {
    formData: {
      handler (val) {
        if (val.visible) {
          this.userInfo = val.data.info
          console.dir(this.userInfo)
        }
      },
      deep: true
    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>
.dialog-setting {
  /deep/.el-dialog {
    background: #f5f5f5;
  }
  /deep/.el-dialog__title {
    color: gray;
  }
  /deep/.el-dialog__body {
    padding: 10px;
  }
  /deep/.el-tabs__active-bar {
    background-color: #09bb07;
  }
  /deep/.el-tabs__item:hover,
  /deep/.el-tabs__item.is-active {
    color: #09bb07;
  }
  .setting-account {
    padding-top: 20px;
    text-align: center;
    .setting-user-id {
      padding-top: 20px;
      color: #333;
    }
    .setting-login-out {
      padding: 40px 0 20px 0;
      color: #333;
      span {
        padding: 3px 30px;
        border: 1px solid #e7e7e7;
        background: #fff;
      }
    }
  }
}
</style>