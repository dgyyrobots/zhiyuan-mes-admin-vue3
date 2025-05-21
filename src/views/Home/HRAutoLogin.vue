<template>
  <div class="container">
    <h1>正在登录</h1>
    <div class="spinner"></div>
    <p class="message">请稍候，正在为您跳转到登录页面...</p>
  </div>
  <!-- 修改表单，移除target属性，改为通过JS控制提交 -->
  <form id="myForm" action="http://www.amvig.com.cn:9000/Authentication/Validate" method="POST" style="display: none;">
    <input id="encId" type="hidden" name="_"/>
    <!-- <input type="submit" id="submit_input" value="提交表单"> -->
  </form>
</template>

<script setup>
import { onMounted } from 'vue';

// 组件加载完成时执行
onMounted(() => {
  onLoad();
});

// 页面加载时执行的方法
function onLoad() {
  //通过url获取值
  const params = new URLSearchParams(window.location.search);
  console.log(params);
  const encJsonData = params.get("encJsonData");
  console.log(encJsonData);
  document.getElementById("encId").value = encJsonData || "";
  console.log(document.getElementById("encId").value,'value11111');
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
  // 首先清除cookie
  await clearCookiesByDomain("www.amvig.com.cn");
 const hiddenWindow = window.open('about:blank', '_blank', 'popup=yes,width=1,height=1,toolbar=no,menubar=no,scrollbars=no,resizable=no,status=no');
    
  try {
    // 改为创建小窗口而非隐藏窗口

    // 检查窗口是否成功创建
    // if (!hiddenWindow) {
    //   console.error('弹窗被拦截，尝试直接提交表单');
    //   // 如果弹窗被拦截，直接在当前页面提交表单
    //   document.getElementById('myForm').action = "http://www.amvig.com.cn:9000/Authentication/Validate";
    //   document.getElementById('myForm').submit();
      
    //   // 延迟后跳转到主页面
    //   setTimeout(() => {
    //     window.location.href = 'http://www.amvig.com.cn:9000/';
    //   }, 1500);
    //   return false;
    // }
    
    // 获取表单数据
    const formData = new FormData(document.getElementById('myForm'));
    
    // 以下是原有的弹窗处理逻辑
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
  } catch (error) {
    // 添加catch子句处理可能的错误
    console.error('表单提交过程中发生错误:', error);
    // 尝试直接跳转到目标页面
    window.location.href = 'http://www.amvig.com.cn:9000/';
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
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.message {
  font-size: 1.2em;
  margin-top: 10px;
}

/* 为了模拟全屏背景 */
:root {
  background: linear-gradient(135deg, #74ebd5, #ACB6E5);
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
