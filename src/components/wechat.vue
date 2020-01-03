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
          <span :title="item.userId">{{item.userId}}</span>
          <span :title="item.latestNew">{{item.latestNew}}</span>
        </div>
      </div>
    </div>
    <div class="box-content-list" ref="boxContentListRef">
      <div class="box-left" ref="boxLeftRef">
        <div v-for="(item, idx) in wechatList" :key="idx" :class="item.userId == userId ? 'mine': 'other'">
          <template v-if="item.type && item.type == 'activityinfo'">
            <div class="join-class">
              <span v-if="item.event == 'join'">{{item.userInfo[0]['userId']}} 加入群聊</span>
              <span v-else-if="item.event == 'out'">{{item.userInfo[0]['userId']}} 退出群聊</span>
            </div>
          </template>
          <template v-else>
            <div class="user-id">
              <img :src="item.avatar">
            </div>
            <div class="user-msg">
              <div class="wap">
                <div :title="item.content" class="main" v-if="item.type == 'txt'"> {{ item.content }}</div>
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
          <emjoy v-if="isShowEmjoy" class="icon-emjoy" @emojiData="getEmojiData"></emjoy>
          <i title="表情" class="iconfont icon-biaoqing" @click.stop="handleEmjoy"></i>
          <i title="图片" class="iconfont icon-tupian" @click.stop="handleUpload"></i>
          <!-- image/* -->
          <input class="file-upload" type="file" accept="" @change="handleFileChange" v-show="false">
        </div>
        <el-input ref="elInputRef" style="margin-bottom:10px;resize:none;" type="textarea" placeholder="请输入内容" v-model="msgVal" @keydown.native.enter="handleSend" @focus="handleFocus" resize="none"></el-input>
        <div class="send-btn">
          <el-button size="small" plain @click.stop="handleSend">发送</el-button>
        </div>
      </div>
    </div>
    <setting :formData="setFormData"></setting>
  </div>
</template>

<script>
import { deepClone, genId, isImage } from '@/libs/tools'
import Vue from 'vue'
import emjoy from '@/components/emjoy'
import setting from '@/components/setting'

export default {
  components: {
    emjoy,
    setting
  },
  data () {
    return {
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
      // 头像图片(随机)
      avatarList: [{
        imgUrl: require('@/assets/images/avatar1.png')
      },
      {
        imgUrl: require('@/assets/images/avatar2.png')
      },
      {
        imgUrl: require('@/assets/images/avatar3.png')
      },
      {
        imgUrl: require('@/assets/images/avatar4.png')
      },
      {
        imgUrl: require('@/assets/images/avatar5.png')
      }],
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

    this.formatterBoxHeight()

    let idx = Math.floor(Math.random() * 4 + 1)
    this.userInfo = [{
      userId: this.userId,
      avatar: this.avatarList[idx]['imgUrl']
    }]
    // 客户端加入群聊，发送登陆信息给服务器
    this.$socket.emit('join', {
      userId: this.userId,
      avatar: this.avatarList[idx]['imgUrl']
    });
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
      this.$message.error(`该${data.info.userId}用户已经登陆过了`);
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

  },
  methods: {
    handleSend () {
      let content = this.msgVal
      // 去掉首尾空格
      this.msgVal = this.msgVal.replace(/[\r\n](^\s*)|(\s*$)/g, "")
      if (this.msgVal) {
        this.$socket.emit('joinGroup', {
          userId: this.userInfo[0]['userId'],
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
      this.msgVal = ''
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
      let reads = new FileReader();
      let type = file.target.files[0]['type']
      if (/image/.test(type)) {
        reads.readAsDataURL(file.target.files[0]);
        reads.onload = () => {
          this.$socket.emit('joinGroup', {
            userId: this.userInfo[0]['userId'],
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
            avatar: this.userInfo[0]['avatar'],
            type: `file,${fileId}_${name}`,
            fileId,
            content: reads.result
          });
          let file = document.querySelector('.file-upload')
          file.value = null
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
      this.msgVal += e
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
      // http://192.168.1.140:3000/download?name=1578036445748_quotatemplate.xlsx
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
    formatterBoxHeight () {
      this.$nextTick(() => {
        let boxContentHeight = this.$refs.boxContentListRef.clientHeight
        let boxRightHeight = this.$refs.boxRightRef.clientHeight
        let h = boxContentHeight - boxRightHeight - 1
        this.$refs.boxLeftRef.style.height = h + 'px'
        this.maxTop = h
        this.$refs.dividerRef.style.top = this.maxTop + 'px'
      })
    },
    handleDividerDown (e) {
      document.addEventListener('mousemove', this.handleDividerMove, false)
      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', this.handleDividerMove)
      }, false)
    },
    handleDividerMove (e) {
      let elem = this.$refs.dividerRef
      let newTop = e.y - this.cha
      if (newTop <= this.minTop) {
        newTop = this.minTop
        elem.style.top = newTop + 'px'
      } else if (newTop >= this.maxTop) {
        newTop = this.maxTop
        elem.style.top = newTop + 'px'
      } else {
        elem.style.top = newTop + 'px'
      }
      this.$nextTick(() => {
        let boxContentHeight = this.$refs.boxContentListRef.clientHeight + this.cha
        this.$refs.boxLeftRef.style.height = newTop + 'px'
        // 减去padding上下各10，分割线（否则点不到线）
        this.$refs.boxRightRef.style.height = boxContentHeight - this.cha - newTop - 1 - 20 + 'px'
        this.scrollBottom()
      })
    },
  },
  beforeDestroy () {
    this.sockets.unsubscribe('broadcastJoin');
    this.sockets.unsubscribe('broadcast');
    this.sockets.unsubscribe('mine-broadcast');
    this.sockets.unsubscribe('broadcastOut');
  }
}
</script>	

<style lang="less" scoped>
.wechat-container {
  display: flex;
  width: 1200px;
  height: 800px;
  margin: 30px auto 0;
  border: 1px solid #efefef;
  border-radius: 5px;
}
.wechat-container > .box-setting-list {
  position: relative;
  width: 60px;
  background: #27282c;
  // border: 1px solid red;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #efefef;
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
  border-top: 1px solid #efefef;
  .icon {
    position: relative;
    .icon-emjoy {
      position: absolute;
      left: 15px;
      bottom: 40px;
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