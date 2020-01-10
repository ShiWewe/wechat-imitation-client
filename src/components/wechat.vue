<template>
  <div class="wechat-container">
    <div class="box-setting-list">
      <div class="setting-avatar">
        <img :src="userInfo[0] && userInfo[0]['avatar']">
      </div>
      <div class="setting-icon-list">
        <i v-for="(item, idx) in iconClassList" :key="idx" :class="['iconfont icon-' + item , {'iconActived' : idx == iconActived}]" @click.stop="handleIconClass(idx)"></i>
      </div>
      <div class="setting-shezhi">
        <i title="设置" class="iconfont icon-shezhi" @click.stop="handleSetting"></i>
      </div>
    </div>
    <div class="box-user-list">
      <div class="box-user-item" v-for="(item, idx) in userList" :key="idx" :class="item.userId == userId ? 'actived': ''">
        <img :src="item.avatar">
        <div>
          <span :title="item.username">{{item.username}}</span>
          <span v-html="item.latestNew"></span>
        </div>
      </div>
    </div>
    <div class="box-content-list" ref="boxContentListRef">
      <div class="box-left" ref="boxLeftRef">
        <div v-for="(item, idx) in wechatList" :key="idx" :class="item.userId == userId ? 'mine': 'other'">
          <template v-if="item.type && item.type == 'activityinfo'">
            <div class="join-class">
              <span v-if="item.event == 'join'">{{item.userInfo[0]['username']}} 加入群聊</span>
              <span v-else-if="item.event == 'out'">{{item.userInfo[0]['username']}} 退出群聊</span>
            </div>
          </template>
          <template v-else>
            <div class="user-id">
              <img :src="item.avatar">
            </div>
            <div class="user-msg">
              <div class="wap">
                <div class="main" v-if="item.type == 'txt'" v-html="item.content"></div>
                <div class="main" v-else-if="item.type == 'img'">
                  <img :class="'diy-img-' + idx" :src="item.content" @click.stop="handleClickImg(item)">
                </div>
                <div title="文件" class="main zip" v-else>
                  <img src="../assets/zip.png" @click.stop="handleClickZip(item)">
                </div>
                <div class="arrow"></div>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="divider" ref="dividerRef" @mousedown="handleDividerDown"></div>
      <div class="box-right" ref="boxRightRef">
        <div class="icon">
          <!-- 原表情包 -->
          <!-- <emjoy v-if="isShowEmjoy" class="icon-emjoy" @emojiData="getEmojiData"></emjoy> -->
          <!-- qq表情包 -->
          <qq-emjoy v-if="isShowEmjoy" class="icon-qq-emjoy" @handleSelectImg="handleSelectImg"></qq-emjoy>
          <i title="表情" class="iconfont icon-biaoqing" @click.stop="handleEmjoy"></i>
          <i title="文件" class="iconfont icon-wenjian" @click.stop="handleUpload"></i>
          <input class="file-upload" type="file" accept="" @change="handleFileChange" v-show="false">
        </div>
        <div ref="msgContentRef" class="msg-content" contenteditable="true" v-html="msgVal"></div>

        <!-- <el-input ref="elInputRef" style="margin-bottom:10px;resize:none;" type="textarea" placeholder="请输入内容" v-model="msgVal" @keydown.native.enter="handleSend" @focus="handleFocus" resize="none"></el-input> -->
        <div class="send-btn">
          <el-button size="small" plain @click.stop="handleSend">发送</el-button>
        </div>
      </div>
    </div>
    <setting :formData="setFormData"></setting>
  </div>
</template>

<script>
import Vue from 'vue'
import VueSocketio from 'vue-socket.io';
import { mapGetters } from 'vuex';
import { deepClone, genId, isImage } from '@/libs/tools'
import emjoy from '@/components/emjoy'
import qqEmjoy from '@/components/qq-emjoy'
import setting from '@/components/setting'

Vue.use(new VueSocketio({
  debug: false,
  connection: 'http://192.168.1.144:3000'
}));

export default {
  components: {
    emjoy,
    qqEmjoy,
    setting
  },
  data () {
    return {
      loading: null,
      // icon的class
      iconClassList: ['weixin'],
      iconActived: 0,
      // 最上层marginTop
      cha: 30,
      // 最低和最高top
      minTop: 100,
      maxTop: 0,
      // 分割线的坐标(x,y)
      dividerX: 0,
      dividerY: 0,
      // 自己的用户信息
      userInfo: [],
      // 自己的用户id
      userId: '',
      // 发送的聊天内容
      msgVal: '',
      // 所有的聊天信息
      wechatList: [],
      // 所有的用户信息
      userList: [],
      // 表情包
      isShowEmjoy: false,
      // 图片预览列表
      imagesList: [],
      // 默认缩放大小
      cssZoom: 100,
      // 缩放图片的dom
      zoomElem: null,
      // 设置功能模态框数据
      setFormData: {
        visible: false,
        data: null
      }
    }
  },
  created () {
    this.userId = genId()
  },
  mounted () {
    let user = this.$store.state.user.userInfo
    // console.warn(user)

    if (this.handleCheckUserInfo()) {
      return
    } else {
      this.formatterBoxHeight()
      this.handleDocRecordCursor()
      this.handleClickDocument()
      this.userInfo = [{
        userId: this.userId,
        username: user.username,
        avatar: user.avatar
      }]
      // 客户端加入群聊，发送登陆信息给服务器
      this.$socket.emit('join', {
        userId: this.userId,
        username: this.userInfo[0].username,
        avatar: this.userInfo[0].avatar
      })
      // 收到服务器返回的用户信息
      this.sockets.subscribe('broadcastJoin', (data) => {
        this.userList = data
        this.wechatList.push({
          type: 'activityinfo',
          event: 'join',
          userInfo: [data[data.length - 1]]
        })
        this.scrollBottom()
      });
      // 收到服务器返回的聊天信息
      this.sockets.subscribe('broadcast', (data) => {
        this.wechatList.push(data)
        let arr = deepClone(this.wechatList).reverse()
        let idx = arr.findIndex(item => item.userId == data.userId)
        let content;
        if (arr[idx] && arr[idx]['type'] == 'img') {
          content = '[图片]'
        } else if (arr[idx] && arr[idx]['type'] == 'txt') {
          content = arr[idx]['content']
        } else {
          content = '[文件]'
        }
        if (this.userList.length) {
          let i = this.userList.findIndex(item => item.userId == data.userId)
          if (i > -1) {
            this.userList[i]['latestNew'] = content
          }
        }
        this.msgVal = ''
        if (data.type == 'img') {
          this.scrollImg()
        } else {
          this.scrollBottom()
        }
      });
      // 收到服务器返回的该用户已经登陆的消息
      this.sockets.subscribe('mine-broadcast', (data) => {
        this.$message.error(`${data.info.username}用户已经登陆过了`);
        this.$router.replace({ name: "login" })
      });
      // 收到服务器返回的断开链接，退出群聊
      this.sockets.subscribe('broadcastOut', (data) => {
        let idx = this.userList.findIndex(item => item.userId == data[0].userId)
        if (idx > -1) {
          let result = this.userList.splice(idx, 1)
          this.wechatList.push({
            type: 'activityinfo',
            event: 'out',
            userInfo: result
          })
          this.scrollBottom()
        }
      });
    }
  },
  methods: {
    handleSend () {
      if (this.handleCheckUserInfo()) {
        return
      } else {
        // let content = this.msgVal.replace(/[\r\n](^\s*)|(\s*$)/g, "") // 旧版（textarea）
        let content = this.$refs.msgContentRef.innerHTML.split('<div><br></div>').join('')
        if (content) {
          this.$socket.emit('joinGroup', {
            userId: this.userInfo[0]['userId'],
            username: this.userInfo[0]['username'],
            avatar: this.userInfo[0]['avatar'],
            type: 'txt',
            content
          });
          this.isShowEmjoy && (this.isShowEmjoy = false)
        } else {
          this.$message({
            message: '请输入内容 ！',
            type: 'warning',
            duration: 1000
          });
        }
        // 清空
        // this.msgVal = ''
        this.$refs.msgContentRef.innerHTML = ''
      }
    },
    handleFocus () {
      this.isShowEmjoy && (this.isShowEmjoy = false)
    },
    handleUpload () {
      this.isShowEmjoy && (this.isShowEmjoy = false)
      let file = document.querySelector('.file-upload')
      file.click()
    },
    handleFileChange (file) {
      if (this.handleCheckUserInfo()) {
        return
      } else {
        let reads = new FileReader();
        let type = file.target.files[0]['type']
        if (/image/.test(type)) {
          reads.readAsDataURL(file.target.files[0]);
          reads.onload = () => {
            this.$socket.emit('joinGroup', {
              userId: this.userInfo[0]['userId'],
              username: this.userInfo[0]['username'],
              avatar: this.userInfo[0]['avatar'],
              type: 'img',
              content: reads.result
            });
            let file = document.querySelector('.file-upload')
            file.value = null
          }
        } else {
          reads.readAsArrayBuffer(file.target.files[0], 'utf-8');
          let name = file.target.files[0]['name']
          let fileId = Date.now()
          reads.onload = () => {
            this.$socket.emit('joinGroup', {
              userId: this.userInfo[0]['userId'],
              username: this.userInfo[0]['username'],
              avatar: this.userInfo[0]['avatar'],
              type: `file,${fileId}_${name}`,
              fileId,
              content: reads.result
            });
            let file = document.querySelector('.file-upload')
            file.value = null
          }
        }
      }
    },
    // 点击左侧icon
    handleIconClass (idx) {
      this.iconActived = idx
    },
    // 设置功能
    handleSetting () {
      this.setFormData.visible = true
      this.setFormData.data = {
        info: this.userInfo
      }
    },
    // 表情包
    handleEmjoy () {
      this.isShowEmjoy = !this.isShowEmjoy
    },
    getEmojiData (e) {
      // this.msgVal += e
    },
    handleSelectImg (e) {
      let img = `<img title="${e.faceName}" src="${e.facePath}" alt="${e.faceName}" />`
      this.$refs.msgContentRef.innerHTML += img
    },
    // 点击文件
    handleClickZip (item) {
      let str = '/download?name='
      let idx = item.type.indexOf(',') + 1
      let name = item.type.slice(idx)
      let protocol = location.protocol + '//'
      let host = location.hostname + ':3000'
      let href = protocol + host + str + name
      window.open(href)
    },
    // 图片缩放
    handleClickImg (item) {
      this.cssZoom = 100
      let img = `<img style="width:100%;height:auto" src="${item.content}" alt="">`
      this.$alert(img, '', {
        dangerouslyUseHTMLString: true,
        showConfirmButton: false,
        closeOnClickModal: true,
        closeOnPressEscape: true,
        callback: () => {
          this.zoomElem.removeEventListener('mousewheel', this.handleZoomImg)
          this.zoomElem = null
        }
      })
      this.zoomElem = document.querySelector('.el-message-box')
      this.zoomElem.style.zoom = this.cssZoom + '%'
      this.zoomElem.addEventListener('mousewheel', this.handleZoomImg, false)
    },
    handleZoomImg (e) {
      let max = 200
      let min = 50
      let zoom = e.wheelDelta / 12
      this.cssZoom += zoom
      if (this.cssZoom >= max) {
        this.cssZoom = max
      } else if (this.cssZoom <= min) {
        this.cssZoom = min
      }
      this.zoomElem.style.zoom = this.cssZoom + '%'
    },
    // 滚动到底部
    scrollBottom () {
      this.$nextTick(() => {
        let a = this.$refs.boxLeftRef.scrollHeight
        let b = this.$refs.boxLeftRef.clientHeight
        this.$refs.boxLeftRef.scrollTop = a - b;
      })
    },
    // 图片加载完成，滚动到底部
    scrollImg () {
      this.$nextTick(() => {
        let len = this.wechatList.length - 1
        let img = document.querySelector('.diy-img-' + len)
        if (img) {
          img.onload = () => {
            let a = this.$refs.boxLeftRef.scrollHeight
            let b = this.$refs.boxLeftRef.clientHeight
            this.$refs.boxLeftRef.scrollTop = a - b;
          }
        }
      })
    },
    // 计算盒子高度
    formatterBoxHeight () {
      this.$nextTick(() => {
        let boxContentHeight = this.$refs.boxContentListRef.clientHeight
        let boxRightHeight = this.$refs.boxRightRef.clientHeight
        let h = boxContentHeight - boxRightHeight - 1
        this.$refs.boxLeftRef.style.height = h + 'px'
        this.maxTop = h
        this.$refs.dividerRef.style.top = this.maxTop - 1 + 'px'
        let h2 = this.$refs.boxRightRef.offsetHeight
        this.$refs.boxRightRef.style.height = h2 - 18 + 'px'
      })
    },
    // 注册页面光标事件和div键盘事件
    handleDocRecordCursor () {
      document.addEventListener('selectionchange', this.handleRecordCursor, false)
      let elem = this.$refs.msgContentRef
      elem && elem.addEventListener('keyup', this.handleDIVKeyEvent, false)
    },
    // 记录页面光标的位置
    handleRecordCursor (self) {
      let sel = getSelection();
      if (!sel) {
        return;
      }
      let node = sel.anchorNode;
      let isIn = false;
      // 判断光标是否在div中
      while (node && node.nodeType != node.DOCUMENT_NODE) {
        let cls = node.classList;
        if (cls && cls.contains("msg-content")) {
          isIn = true;
          break;
        }
        node = node.parentNode
      }
      if (!isIn) return;
      console.log("getCursor");
      self.select = sel;
      self.lastRange = sel.getRangeAt(0);
    },
    // div键盘回车事件
    handleDIVKeyEvent (e) {
      if (e.keyCode == 13) {
        this.handleSend()
      }
    },
    // 注册页面点击事件
    handleClickDocument () {
      document.addEventListener('click', this.handleClickDoc, false)
    },
    // 页面点击事件
    handleClickDoc (e) {
      if (e.target.className == 'grid-emojis' || e.target.className == 'emoji') {
        return
      } else {
        this.isShowEmjoy && (this.isShowEmjoy = false)
      }
    },
    // 移动分割线
    handleDividerDown (e) {
      document.addEventListener('mousemove', this.handleDividerMove, false)
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', this.handleDividerMove)
      }, false)
    },
    // 计算分割线top值
    handleDividerMove (e) {
      let elem = this.$refs.dividerRef
      let newTop = e.y - this.cha
      if (newTop <= this.minTop) {
        newTop = this.minTop
        elem.style.top = newTop + 'px'
      } else if (newTop >= this.maxTop) {
        newTop = this.maxTop
        elem.style.top = newTop - 1 + 'px'
      } else {
        elem.style.top = newTop - 1 + 'px'
      }
      this.$nextTick(() => {
        let boxContentHeight = this.$refs.boxContentListRef.clientHeight + this.cha
        this.$refs.boxLeftRef.style.height = newTop + 'px'
        this.$refs.boxRightRef.style.height = boxContentHeight - this.cha - newTop - 18 + 'px'
        this.scrollBottom()
      })
    },
    // 判断是否用户名失效（失效则跳转到登录页）
    handleCheckUserInfo () {
      let val = localStorage.getExpire('userInfo')
      if (!val) {
        this.$message({
          message: '用户名失效',
          type: 'warning',
          duration: 1000
        });
        this.$router.replace({ name: "login" })
        return true
      }
    }
  },
  beforeDestroy () {
    this.sockets.unsubscribe('broadcastJoin');
    this.sockets.unsubscribe('broadcast');
    this.sockets.unsubscribe('mine-broadcast');
    this.sockets.unsubscribe('broadcastOut');
    document.removeEventListener('click', this.handleClickDoc)
    let elem = this.$refs.msgContentRef
    elem && elem.removeEventListener('keyup', this.handleDIVKeyEvent)
  }
}
</script>	

<style lang="less" scoped>
.wechat-container {
  display: flex;
  width: 1200px;
  height: 800px;
  margin: 30px auto 0;
  border-radius: 5px;
}
.wechat-container > .box-setting-list {
  display: inline-block;
  position: relative;
  width: 60px;
  background: #27282c;
  .setting-avatar {
    padding-top: 10px;
    img {
      display: block;
      margin: 0 auto;
      width: 40px;
      height: 40px;
      border-radius: 5px;
      vertical-align: bottom;
    }
  }
  .setting-icon-list {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    i {
      color: #fff;
      margin: 8px 0;
    }
    i.iconActived {
      color: #09bb07;
    }
  }
  .setting-shezhi {
    position: absolute;
    bottom: 10px;
    width: 100%;
    text-align: center;
    i {
      color: #fff;
    }
  }
}
.wechat-container > div.box-user-list {
  width: 250px;
  background: #eeebe8;
  overflow: auto;
  &::-webkit-scrollbar {
    width: 10px;
    height: 1px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: #d2d2d2;
  }
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background: #ededed;
  }
  .box-user-item {
    display: flex;
    padding: 10px;
    height: 50px;
    img {
      width: 50px;
      height: 50px;
      border-radius: 5px;
      vertical-align: bottom;
    }
  }
  .box-user-item.actived {
    background: #c3c3c4;
  }
  .box-user-item > div {
    padding: 0 5px;
    flex: 1;
    display: flex;
    flex-direction: column;
    span {
      font-size: 14px;
      display: inline-block;
      flex: 1;
      width: 170px;
      line-height: 25px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    span:last-child {
      color: #999;
    }
  }
}
.wechat-container > div.box-content-list {
  position: relative;
  width: 890px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.msg-content {
  padding: 10px;
  margin-bottom: 15px;
  width: calc(~"100% - 20px");
  height: 100%;
  min-height: 120px;
  border: 1px solid rgba(64, 158, 255, 0.7);
  border-radius: 5px;
  outline: none;
  overflow-y: auto;
}
.divider {
  position: absolute;
  width: 100%;
  height: 1px;
  background: #efefef;
  cursor: s-resize;
}
.box-right {
  padding: 10px;
  display: flex;
  flex-direction: column;
  background: #fff;
  .icon {
    position: relative;
    .icon-emjoy {
      position: absolute;
      left: 15px;
      bottom: 40px;
    }
    .icon-qq-emjoy {
      position: absolute;
      top: -93px;
    }
  }
  /deep/.el-textarea {
    flex: 1;
  }
  /deep/.el-textarea__inner {
    min-height: 100px !important;
    height: 100%;
  }
}
.box-right div.send-btn {
  text-align: right;
}
.box-left {
  padding-top: 0;
  display: inline-block;
  overflow: auto;
  background: #f5f5f5;
  &::-webkit-scrollbar {
    width: 10px;
    height: 1px;
  }
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    background: #d2d2d2;
  }
  &::-webkit-scrollbar-track {
    box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    background: #ededed;
  }
}
.join-class {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-size: 12px;
  color: gray;
  span {
    padding: 5px;
  }
}
.box-left > div {
  display: flex;
  width: 100%;
  padding: 10px 0;
  word-wrap: break-word;
  word-break: break-all;
}
.user-id {
  padding: 5px 10px;
  img {
    width: 40px;
    height: 40px;
    vertical-align: bottom;
  }
}
.user-msg {
  padding-top: 10px;
}
.box-left > div.mine {
  display: flex;
  flex-direction: row-reverse;
}
.box-left > div.mine,
.box-left > div.other {
  .wap {
    position: relative;
    max-width: 300px;
  }
  .main {
    display: block;
    border: 1px solid #98fb98;
    border-radius: 5px;
    position: relative;
    padding: 10px;
    background: #98fb98;
    img {
      width: 100%;
      height: auto;
      cursor: pointer;
    }
  }
  .arrow {
    width: 0;
    height: 0;
    border-top: 5px solid transparent;
    border-left: 5px solid #98fb98;
    border-bottom: 5px solid transparent;
    position: absolute;
    top: 15px;
    right: -4.5px;
  }
}
.box-left > div.other {
  .main {
    border: 1px solid #fff;
    background: #fff;
  }
  .arrow {
    border-top: 5px solid transparent;
    border-right: 5px solid #fff;
    border-left: 0;
    border-bottom: 5px solid transparent;
    left: -4.5px;
  }
}
</style>