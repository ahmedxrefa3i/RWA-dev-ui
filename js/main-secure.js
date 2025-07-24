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

  function blockDevTools() {
    const devtools = /./;
    devtools.toString = function () {
      document.body.innerHTML = '<div style="background:black;position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999999"></div>';
      return '';
    };
    console.log('%c', devtools);
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

      // ✅ تحميل الرابط
      iframe.src = result.url;
      document.getElementById("secureContainer").style.display = "none";
      iframe.style.display = "block";

      // ✅ حقن السكربت بعد التحميل
      iframe.onload = () => {
        const script = document.createElement("script");
        script.innerHTML = `
          (function () {
            const propName = "henshin_charge";
            const multiplier = 10;
            let active = true;
            const originalValues = new WeakMap();

            function isNumeric(val) {
              return typeof val === "number" && isFinite(val);
            }

            function log(msg, color = "cyan") {
              console.log(\`%c[HENSHIN_CHARGE] \${msg}\`, \`color:\${color}; font-weight:bold;\`);
            }

            function deepScan(obj, visited = new WeakSet()) {
              if (!active || visited.has(obj) || typeof obj !== "object" || obj === null) return;
              visited.add(obj);
              for (const key in obj) {
                try {
                  const val = obj[key];
                  if (typeof val === "object" && val !== null) deepScan(val, visited);
                  if (isNumeric(val) && key.toLowerCase().includes(propName)) {
                    if (!originalValues.has(obj)) originalValues.set(obj, {});
                    const objOriginals = originalValues.get(obj);
                    if (!objOriginals.hasOwnProperty(key)) {
                      objOriginals[key] = val;
                      obj[key] = val * multiplier;
                      log(\`✅ \${key}: \${val} → \${obj[key]}\`, "lime");
                    }
                  }
                } catch {}
              }
            }

            const panel = document.createElement("div");
            panel.style.cssText = \`
              position:fixed; top:20px; left:20px; z-index:999999;
              background:#003366; color:white; padding:10px;
              border-radius:8px; box-shadow:0 0 10px #000;
              font-family:sans-serif; font-size:12px;
              width:220px;
            \`;

            const header = document.createElement("div");
            header.textContent = "⚡ Henshin Charge";
            header.style.cssText = \`
              font-weight:bold; background:#005599; padding:5px;
              cursor:move; text-align:center; border-radius:5px;
            \`;
            panel.appendChild(header);

            const status = document.createElement("div");
            status.textContent = "✅ مفعل";
            status.style.cssText = "text-align:center; margin:6px 0; font-weight:bold; color:lime;";
            panel.appendChild(status);

            const toggleBtn = document.createElement("button");
            toggleBtn.textContent = "تشغيل / إيقاف";
            toggleBtn.style.cssText = \`
              width:100%; padding:6px; font-size:13px; border:none;
              border-radius:5px; background:#0066cc; color:white;
              cursor:pointer; font-weight:bold;
            \`;
            toggleBtn.onclick = () => {
              active = !active;
              if (active) {
                status.textContent = "✅ مفعل";
                status.style.color = "lime";
                log(\`تفعيل تعديل \${propName}\`, "aqua");
              } else {
                status.textContent = "❌ غير مفعل";
                status.style.color = "red";
                log(\`إيقاف تعديل \${propName}\`, "orange");
              }
            };
            panel.appendChild(toggleBtn);

            const footer = document.createElement("div");
            footer.style.cssText = "text-align:right; margin-top:6px;";
            footer.innerHTML = \`
              <button id="minBtn">🗕</button>
              <button id="closeBtn">❌</button>
            \`;
            panel.appendChild(footer);

            document.body.appendChild(panel);

            let isDragging = false, offsetX = 0, offsetY = 0;
            header.onmousedown = e => {
              isDragging = true;
              offsetX = e.clientX - panel.offsetLeft;
              offsetY = e.clientY - panel.offsetTop;
              document.onmousemove = e2 => {
                if (isDragging) {
                  panel.style.left = \`\${e2.clientX - offsetX}px\`;
                  panel.style.top = \`\${e2.clientY - offsetY}px\`;
                }
              };
              document.onmouseup = () => {
                isDragging = false;
                document.onmousemove = null;
              };
            };

            let minimized = false;
            document.getElementById("minBtn").onclick = () => {
              minimized = !minimized;
              toggleBtn.style.display = minimized ? "none" : "block";
              status.style.display = minimized ? "none" : "block";
              footer.style.textAlign = minimized ? "center" : "right";
            };
            document.getElementById("closeBtn").onclick = () => panel.remove();

            setInterval(() => {
              if (active) deepScan(window);
            }, 2000);
          })();
        `;
        iframe.contentWindow.document.body.appendChild(script);
      };

    } catch (error) {
      console.error("خطأ:", error);
      showError("حدث خطأ في الاتصال بالخادم");
    } finally {
      Utils.hideLoading();
    }
  });

  // إزالة الحماية من DevTools
  // مع استمرار حجب المحتوى عند القطع
  monitorConnection();
})();
