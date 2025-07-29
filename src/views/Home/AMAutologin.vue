<template>
  <div class="container-fluid login-container no-padding">
    <div class="row center-block">
      <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6 no-padding">
      </div>
      <div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">
        <div id="center" class="box pull-right animated slideInRight">
          <div class="box-icon">
            <span class="fa fa-4x fa-user"></span>
          </div>
          <div id="form" class="info">
            <form 
              id="loginform" 
              ref="form1"
              action="http://www.amvig.com.cn:2300/logincheck.php" 
              method="post" 
              autocomplete="off" 
              @submit="handleSubmit"
              role="form" 
              class="form-signin"
            >
              <div class="row row-margin">
                <div class="col-md-12">
                  <div class="form-group has-warning">
                    <div class="input-group">
                      <span class="input-group-addon"><i class="fa fa-at"></i></span>
                      <input 
                        type="text" 
                        class="form-control empty" 
                        name="UNAME" 
                        maxlength="20" 
                        v-model="formData.username"
                        @mouseover="$event.target.focus()" 
                        @focus="$event.target.select()" 
                        placeholder="这里输入用户名"
                      />
                    </div>
                  </div>
                  <div class="form-group has-warning">
                    <div class="input-group">
                      <span class="input-group-addon"><i class="fa fa-lock"></i></span>
                      <input 
                        id="password" 
                        type="text" 
                        class="form-control empty" 
                        name="PASSWORD" 
                        v-model="formData.password"
                        ref="passwordInput"
                        @mouseover="$event.target.focus()" 
                        @focus="$event.target.select()" 
                        placeholder="这里输入密码"
                      />
                    </div>
                  </div>
                  <div class="form-group has-warning">
                    <input type="hidden" name="encode_type" value="1"/>
                    <input 
                      id="loginbtn" 
                      type="submit" 
                      class="btn btn-warning center-block" 
                      title="登录" 
                      value="登录" 
                    />
                    <div 
                      id="encrypted-password" 
                      v-show="showEncryptedPassword"
                      style="margin-top: 10px; padding: 10px; background-color: #f5f5f5; border: 1px solid #ddd; word-break: break-all; font-family: monospace; font-size: 12px;"
                    >
                      {{ encryptedPassword }}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'

// 响应式数据
const isCommitted = ref(false)
const showEncryptedPassword = ref(false)
const encryptedPassword = ref('')
const passwordInput = ref(null)
const form1 = ref(null)
const route = useRoute() // 路由
// 表单数据
const formData = reactive({
  username: 'wwzhang',
  password: ''
})

// RSA加密相关常量
const RSA_MODULUS = "B87A3BE2184FED0973FFB0B02A862DCAD15A1A29172EC8FF67E841FE26749A6AA04E48E9B02D963ED81DCE2B0086C034F7D47CCBACF8539C36B9445ABA5EF484F3CA32593762641B4C9683C79801D087198370D5719BB4E422FADAA4D883D13874DE67D8B6E883EBAACC53A8480F41EE8BE70D2F70BECF3CB7F1023D2C901CC3"
const RSA_EXPONENT = "10001"

// 表单提交处理
const handleSubmit = (event) => {
  event.preventDefault()
  
  if (checkForm()) {
    // 如果验证通过，提交表单
    form1.value.submit()
  }
}

// 表单验证函数（对应原来的CheckForm）
const checkForm = () => {
  if (isCommitted.value === false) {
    isCommitted.value = true
    const psw = formData.password
    
    if (psw.length > 300) {
      alert("密码太长，请重新输入")
      isCommitted.value = false
      return false
    }
    
    // RSA加密
    const rsa = new RSAKey()
    rsa.setPublic(RSA_MODULUS, RSA_EXPONENT)
    const encryptedPsw = rsa.encrypt(psw)
    
    console.log(encryptedPsw, 'dddddddd')
    
    // 更新表单中的密码值
    formData.password = encryptedPsw
    encryptedPassword.value = encryptedPsw
    showEncryptedPassword.value = true
    
    console.log(formData.password, '111111111111')
    return true
  } else {
    return false
  }
}
// 加载函数
function onLoad() {
  // 通过url获取值
  const params = route.query.logininfo
  
  // 解码 base64 字符串
  if (params) {
    try {
      // 第一步：base64 解码
      const decodedString = atob(params)
      console.log('解码后的字符串:', decodedString)
      
      // 第二步：JSON 解析为对象
      const loginInfo = JSON.parse(decodedString)
      console.log('解析后的对象:', loginInfo)
      
      // 现在你可以使用这个对象了
      // 例如：设置表单数据
      if (loginInfo.u) {
        formData.username = loginInfo.u
      }
      if (loginInfo.p) {
        formData.password = loginInfo.p
      }
    } catch (error) {
      console.error('解码失败:', error)
    }
  }
}

onMounted(() => {
  nextTick(() => {
    onLoad()
  })
})
</script>

<style scoped>
</style>