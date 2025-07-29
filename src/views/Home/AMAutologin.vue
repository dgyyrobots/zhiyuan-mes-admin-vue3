<template>
  <div class="container">
    <h1>正在登录</h1>
    <div class="spinner"></div>
    <p class="message">请稍候，正在为您跳转到登录页面...</p>
  </div>
  <div style="display: none;">
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
  console.log(params,'ddd')  // eyJwIjoiYWRtaW4xMjMiLCJ1IjoiYWRtaW4ifQ==
  
  // 解码 base64 字符串
  if (params) {
    try {
      // 第一步：base64 解码
      const decodedString = atob(params)
      console.log('解码后的字符串:', decodedString)
      
      // 第二步：JSON 解析为对象
      const loginInfo = JSON.parse(decodedString)
      console.log('解析后的对象:', loginInfo)
      
      // 设置表单数据
      if (loginInfo.u) {
        formData.username = loginInfo.u
      }
      if (loginInfo.p) {
        formData.password = loginInfo.p
      }
      
      // 等待DOM更新后自动提交表单
      nextTick(() => {
        // 自动触发登录
        if (checkForm()) {
          form1.value.submit()
        }
      })
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
body {
  margin: 0;
  padding: 0;
  background: linear-gradient(135deg, #74ebd5, #ACB6E5);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  font-family: "Helvetica Neue", sans-serif;
  color: #333;
}

.container {
  text-align: center;
  background: white;
  padding: 40px 60px;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  animation: fadeIn 1s ease-in-out;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 400px;
}

.spinner {
  border: 6px solid #f3f3f3;
  border-top: 6px solid #3498db;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  margin: 20px auto;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.9) translate(-50%, -50%); }
  to { opacity: 1; transform: scale(1) translate(-50%, -50%); }
}

.message {
  font-size: 1.2em;
  margin-top: 10px;
}
</style> 