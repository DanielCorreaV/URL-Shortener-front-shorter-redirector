const API_BASE_URL = "https://jguawzn6ka.execute-api.us-east-1.amazonaws.com";
const STATS_FRONTEND_URL = "https://d4mzuntmcbuga.cloudfront.net";
const AUTH_URL = "https://d2ahv6rm0lok1j.cloudfront.net";

let loadedAssets = [];

document.addEventListener("DOMContentLoaded", () => {
  extractUrlCredentials();
  lucide.createIcons();
  checkSession();
});

function extractUrlCredentials() {
  const urlParams = new URLSearchParams(window.location.search);
  const tokenParam = urlParams.get("token");
  const userParam = urlParams.get("username");

  if (tokenParam && userParam) {
    localStorage.setItem("shrtn_token", decodeURIComponent(tokenParam));
    localStorage.setItem("shrtn_username", decodeURIComponent(userParam));
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

function checkSession() {
  const token = localStorage.getItem("shrtn_token");
  const username = localStorage.getItem("shrtn_username");

  if (token && username) {
    document.getElementById("userProfileName").innerText = username;
    document.getElementById("userAvatar").innerText = username
      .substring(0, 2)
      .toUpperCase();
    fetchUserAssets();
  } else {
    alert("Sesión no válida. Por favor inicia sesión.");
  }
}

async function fetchUserAssets() {
  const container = document.getElementById("userLinksSidebar");
  container.innerHTML = `
    <div class="text-center py-6 text-xs text-slate-400 flex flex-col gap-2 justify-center items-center">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
        Sincronizando la nube...
    </div>`;

  try {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("shrtn_token")}`,
      },
    });
    if (!response.ok) throw new Error();
    loadedAssets = await response.json();
    renderSidebarLinks();
  } catch (error) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-red-500 font-medium px-2">⚠️ Error de enlace con la API.</div>`;
  }
}

function renderSidebarLinks() {
  const container = document.getElementById("userLinksSidebar");
  container.innerHTML = "";

  if (!loadedAssets || loadedAssets.length === 0) {
    container.innerHTML = `<div class="text-center py-6 text-xs text-slate-400 italic px-2">No tienes códigos generados.</div>`;
    return;
  }

  loadedAssets.forEach((asset) => {
    const div = document.createElement("div");
    div.className = `w-full text-left p-3 rounded-xl border border-slate-100 bg-white flex items-center justify-between gap-3 text-slate-700 font-medium text-sm`;

    const token = encodeURIComponent(localStorage.getItem("shrtn_token") || "");
    const user = encodeURIComponent(
      localStorage.getItem("shrtn_username") || "",
    );
    const targetUrl = `${STATS_FRONTEND_URL}?token=${token}&username=${user}&code=${asset.code}`;

    div.innerHTML = `
        <div class="truncate">
            <p class="font-semibold text-slate-800 font-mono">/${asset.code}</p>
            <p class="text-[11px] text-slate-400 truncate mt-0.5">${asset.long_url.replace(/https?:\/\//, "")}</p>
        </div>
        <a href="${targetUrl}" 
           class="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-xl border border-slate-200 transition-all" title="Ver Analíticas">
            <i data-lucide="bar-chart-2" class="w-4 h-4"></i>
        </a>
    `;
    container.appendChild(div);
  });
  lucide.createIcons();
}

let lastGeneratedUrl = "";

async function handleCreateLink(e) {
  e.preventDefault();
  const longUrlField = document.getElementById("longUrlInput");
  const longUrl = longUrlField.value.trim();

  try {
    const response = await fetch(`${API_BASE_URL}/shorten`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("shrtn_token")}`,
      },
      body: JSON.stringify({ long_url: longUrl }),
    });

    if (!response.ok) throw new Error();

    const data = await response.json();

    longUrlField.value = "";
    await fetchUserAssets();

    lastGeneratedUrl = `${API_BASE_URL}/r/${data.code || ""}`;
    const successCard = document.getElementById("successCard");
    if (successCard) {
      document.getElementById("generatedUrlText").innerText = lastGeneratedUrl;
      successCard.classList.remove("hidden");
    }
  } catch (err) {
    alert("Error al acortar la URL.");
  }
}

function redirectToStats() {
  const token = encodeURIComponent(localStorage.getItem("shrtn_token") || "");
  const user = encodeURIComponent(localStorage.getItem("shrtn_username") || "");
  window.location.href = `${STATS_FRONTEND_URL}?token=${token}&username=${user}`;
}

function copyGeneratedUrl() {
  if (!lastGeneratedUrl) return;
  navigator.clipboard
    .writeText(lastGeneratedUrl)
    .then(() => alert("¡Copiado!"));
}

function logout() {
  localStorage.clear();
  window.location.href = AUTH_URL;
}
