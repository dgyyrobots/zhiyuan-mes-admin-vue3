<template>
  <div class="container">
    <h1>正在登录</h1>
    <div class="spinner"></div>
    <p class="message">请稍候，正在为您跳转到登录页面...</p>
  </div>
  <!-- 修改表单，移除target属性，改为通过JS控制提交 -->
  <form id="myForm" action="http://www.amvig.com.cn:9000/Authentication/Validate" method="POST" style="display: none;">
    <input id="encId" type="hidden" name="_"/>
  </form>
</template>

<script setup>
import { onMounted, ref } from 'vue';

// 创建ref存储状态
const loading = ref(true);
const message = ref('请稍候，正在为您跳转到登录页面...');

// 页面加载完成时执行
onMounted(() => {
  onLoad();
});

// 加载函数
function onLoad() {
  // 通过url获取值
  const params = new URLSearchParams(window.location.search);
  console.log(params);
  const encJsonData = params.get("encJsonData");
  console.log(encJsonData);
  document.getElementById("encId").value = encJsonData || "";
  console.log(document.getElementById("encId").value);
  handleFormSubmit();
}

// 清除cookies方法
function clearCookiesByDomain(domain) {
  const cookies = document.cookie.split("; ");
  const pattern = new RegExp("^(.*; )" + "domain=" + window.location.host.replace(/\./g, "\\.") + "[^;]*(;.*)?$");
  for (let i = 0; i < cookies.length; i++) {
    if (pattern.test(cookies[i])) {
      document.cookie = cookies[i].split("=")[0] + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  }
}

// 处理表单提交
async function handleFormSubmit() {
  try {
    // 首先清除cookie
    await clearCookiesByDomain("www.amvig.com.cn");
    
    // 方法1：尝试使用window.open创建隐藏窗口
    const hiddenWindow = window.open('about:blank', '_blank', 'popup=yes,width=1,height=1,left=-10000,top=-10000,toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no,status=no,titlebar=no,dialog=yes');
    
    // 检查窗口是否成功创建
    if (hiddenWindow) {
      console.log('隐藏窗口创建成功');
      
      // 尝试移动窗口到屏幕外并调整大小
      try {
        hiddenWindow.moveTo(-10000, -10000);
        hiddenWindow.resizeTo(1, 1);
      } catch (e) {
        console.log('无法调整窗口位置和大小');
      }
      
      hiddenWindow.document.write(`
        <html>
        <body>
          <form id="hiddenForm" method="POST" action="http://www.amvig.com.cn:9000/Authentication/Validate">
            <input type="hidden" name="_" value="${document.querySelector('input[name="_"]').value}">
          </form>
          <script>
            document.getElementById('hiddenForm').submit();
            // 通知父窗口表单已提交
            window.opener && window.opener.postMessage('formSubmitted', '*');
          <\/script>
        </body>
        </html>
      `);
      
      // 监听来自子窗口的消息
      window.addEventListener('message', (event) => {
        if (event.data === 'formSubmitted') {
          console.log('表单已在隐藏窗口中提交');
          // 延迟关闭窗口，确保表单有足够时间提交
          setTimeout(() => {
            if (hiddenWindow && !hiddenWindow.closed) {
              hiddenWindow.close();
              console.log('隐藏窗口已关闭');
            }
          }, 1000);
        }
      });
      
      // 延迟后跳转到主页面
      setTimeout(() => {
        // 确保窗口关闭
        if (hiddenWindow && !hiddenWindow.closed) {
          hiddenWindow.close();
        }
        window.location.href = 'http://www.amvig.com.cn:9000/';
      }, 1500);
    } 
  } catch (error) {
    console.error('表单提交过程中发生错误:', error);
    message.value = '登录过程中发生错误，将重定向到主页...';
    
    // 出错时也跳转到主页
    setTimeout(() => {
      window.location.href = 'http://www.amvig.com.cn:9000/';
    }, 1500);
  }
  
  return false; // 阻止表单默认提交
}
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