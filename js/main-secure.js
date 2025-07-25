(async function () {
  const api = './secure-api.js';
  const utils = './utils.js';

  // تحميل ملفات الأدوات والمساعدة
  await Promise.all([
    import(api),
    import(utils)
  ]);

  const { Utils } = window;
  const form = document.getElementById("secureForm");
  const input = document.getElementById("passwordInput");
  const iframe = document.getElementById("secureFrame");
  const loading = document.getElementById("loadingScreen");
  const errorBox = document.getElementById("errorMessage");

  function showError(message) {
    errorBox.innerText = message;
    errorBox.style.display = "block";
    Utils.showNotification(message, 'error');
  }

  function hideError() {
    errorBox.style.display = "none";
  }

  function monitorConnection() {
    window.addEventListener("offline", () => {
      document.body.innerHTML = '<div style="background:black;position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999999"></div>';
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideError();
    const password = input.value.trim();
    if (!password) {
      showError("يرجى إدخال كلمة المرور");
      return;
    }

    Utils.showLoading();

    try {
      const response = await fetch("https://rico-secure-backend.onrender.com/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });

      const result = await response.json();
      if (!result.success) {
        showError(result.error || "كلمة المرور غير صحيحة");
        Utils.hideLoading();
        return;
      }

      iframe.src = result.url;
      document.getElementById("secureContainer").style.display = "none";
      iframe.style.display = "block";

      // ✅ حقن السكربت بعد التحميل
      iframe.onload = () => {
        const script = document.createElement("script");
        script.innerHTML = `...`; // (نفس سكربت Henshin Charge كما هو لم يتغير)
        iframe.contentWindow.document.body.appendChild(script);
      };

    } catch (error) {
      console.error("خطأ:", error);
      showError("حدث خطأ في الاتصال بالخادم");
    } finally {
      Utils.hideLoading();
    }
  });

  // ✅ فقط مراقبة انقطاع الإنترنت - بدون حظر DevTools
  monitorConnection();
})();
