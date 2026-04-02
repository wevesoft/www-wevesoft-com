const form = document.getElementById("contactForm");
const formMessage = document.getElementById("formMessage");
const navLinks = document.querySelectorAll(".nav-link[href^='#']");
const themeToggle = document.getElementById("themeToggle");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileMenu = document.getElementById("mobileMenu");

const THEME_KEY = "weve-theme";
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xaqlbypl";

/** 카카오 JavaScript 키 — 카카오 디벨로퍼스에서 발급한 값으로 바꿔주세요. */
const KAKAO_JS_KEY = "YOUR_JS_KEY";
const KAKAO_CHANNEL_PUBLIC_ID = "_bcxgxdX";
const KAKAO_CHAT_FALLBACK_URL = "https://pf.kakao.com/_bcxgxdX/chat";

function positionMobileMenu() {
  if (!mobileMenu) return;
  const header = document.querySelector(".header");
  const headerHeight = header ? header.offsetHeight : 72;
  mobileMenu.style.top = `${headerHeight}px`;
  mobileMenu.style.maxHeight = `calc(100vh - ${headerHeight}px)`;
}

function setTheme(theme) {
  const normalized = theme === "light" ? "light" : "dark";
  document.body.dataset.theme = normalized;
  localStorage.setItem(THEME_KEY, normalized);

  if (themeToggle) {
    if (typeof themeToggle.checked === "boolean") {
      themeToggle.checked = normalized === "light";
    }
    themeToggle.setAttribute(
      "aria-checked",
      normalized === "light" ? "true" : "false"
    );
  }
}

function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") {
    setTheme(saved);
    return;
  }

  const prefersLight =
    window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  setTheme(prefersLight ? "light" : "dark");
}

initTheme();

if (themeToggle) {
  themeToggle.addEventListener("change", () => {
    setTheme(themeToggle.checked ? "light" : "dark");
  });
}

function getHeaderOffset() {
  const header = document.querySelector(".header");
  return header ? header.offsetHeight + 10 : 0;
}

function smoothScrollTo(targetId) {
  const target = document.querySelector(targetId);
  if (!target) return;

  const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
  window.scrollTo({ top, behavior: "smooth" });
}

if (navLinks.length) {
  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const targetId = link.getAttribute("href");
      if (!targetId) return;
      smoothScrollTo(targetId);
      history.replaceState(null, "", targetId);

      if (mobileMenu && mobileMenu.classList.contains("open")) {
        mobileMenu.classList.remove("open");
        if (mobileMenuBtn) {
          mobileMenuBtn.setAttribute("aria-expanded", "false");
        }
      }
    });
  });
}

if (mobileMenuBtn && mobileMenu) {
  positionMobileMenu();
  window.addEventListener("resize", positionMobileMenu, { passive: true });

  mobileMenuBtn.addEventListener("click", () => {
    const isOpen = mobileMenu.classList.contains("open");
    mobileMenu.classList.toggle("open", !isOpen);
    mobileMenuBtn.setAttribute("aria-expanded", String(!isOpen));
    positionMobileMenu();
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (
      mobileMenu.classList.contains("open") &&
      target &&
      !mobileMenu.contains(target) &&
      !mobileMenuBtn.contains(target)
    ) {
      mobileMenu.classList.remove("open");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu.classList.contains("open")) {
      mobileMenu.classList.remove("open");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
    }
  });
}

function initRevealAnimations() {
  const nodes = document.querySelectorAll("[data-animate]");
  if (!nodes.length) return;

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      root: null,
      // 아래쪽을 살짝 줄여, 화면 안으로 들어온 뒤에 등장하도록
      rootMargin: "0px 0px -10% 0px",
      // 긴 섹션/카드도 교차 비율 15% 미만이면 콜백이 안 뜨는 경우가 있어 0 사용
      threshold: 0,
    }
  );

  nodes.forEach((node) => revealObserver.observe(node));

  const syncVisible = () => {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const edge = Math.min(120, vh * 0.12);
    nodes.forEach((node) => {
      if (node.classList.contains("in-view")) return;
      const rect = node.getBoundingClientRect();
      if (rect.top < vh - edge && rect.bottom > edge) {
        node.classList.add("in-view");
        revealObserver.unobserve(node);
      }
    });
  };

  requestAnimationFrame(() => {
    syncVisible();
    requestAnimationFrame(syncVisible);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncVisible).catch(() => {});
  }

  window.addEventListener("load", syncVisible, { passive: true });
}

initRevealAnimations();

const sectionElements = Array.from(navLinks)
  .map((link) => {
    const id = link.getAttribute("href");
    return id ? document.querySelector(id) : null;
  })
  .filter(Boolean);

if (sectionElements.length && navLinks.length) {
  const setActiveLink = () => {
    const scrollPos = window.scrollY + getHeaderOffset() + 40;
    let currentId = navLinks[0].getAttribute("href") || "#services";

    sectionElements.forEach((section) => {
      if (scrollPos >= section.offsetTop) {
        currentId = `#${section.id}`;
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === currentId);
    });
  };

  window.addEventListener("scroll", setActiveLink, { passive: true });
  setActiveLink();
}

function formatKoreanPhone(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function getServiceLabel(service) {
  return (
    {
      automation: "자동화 서비스 구축",
      si: "SI(시스템 통합)",
      ai: "AI 개발",
      all: "통합 컨설팅",
      other: "기타",
    }[service] || service
  );
}

function isValidEmailFormat(email) {
  const s = String(email || "").trim();
  if (!s) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

if (form) {
  const phoneInput = form.querySelector('input[name="phone"]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const nameInput = form.querySelector('input[name="name"]');
  const serviceInput = form.querySelector('select[name="service"]');
  const messageInput = form.querySelector('textarea[name="message"]');
  const agreeInput = form.querySelector('input[name="agree"]');
  const emailInput = form.querySelector('input[name="email"]');
  const confirmModal = document.getElementById("contactConfirmModal");
  const confirmSummary = document.getElementById("confirmSummary");
  const confirmCancel = document.getElementById("confirmCancel");
  const confirmSend = document.getElementById("confirmSend");
  const emailInvalidModal = document.getElementById("emailInvalidModal");
  const emailInvalidOk = document.getElementById("emailInvalidOk");

  let pendingPayload = null;

  const updateSubmitState = () => {
    if (!submitBtn) return;
    const nameFilled = String(nameInput?.value || "").trim().length > 0;
    const phoneDigits = String(phoneInput?.value || "").replace(/\D/g, "");
    const phoneFilled = phoneDigits.length >= 10;
    const serviceFilled = String(serviceInput?.value || "").trim().length > 0;
    const messageFilled = String(messageInput?.value || "").trim().length > 0;
    const agreed = Boolean(agreeInput?.checked);
    submitBtn.disabled = !(nameFilled && phoneFilled && serviceFilled && messageFilled && agreed);
  };

  function fillConfirmSummary(payload) {
    if (!confirmSummary) return;
    confirmSummary.replaceChildren();
    const rows = [
      ["담당자명", payload.name],
      ["연락처", payload.phone],
      ["이메일", payload.email ? payload.email : "(없음)"],
      ["관심 서비스", getServiceLabel(payload.service)],
      ["문의 내용", payload.message],
      ["개인정보 동의", payload.agree ? "동의" : "미동의"],
    ];
    rows.forEach(([label, value]) => {
      const dt = document.createElement("dt");
      dt.textContent = label;
      const dd = document.createElement("dd");
      dd.textContent = value;
      confirmSummary.append(dt, dd);
    });
  }

  function openConfirmModal() {
    if (!confirmModal) return;
    confirmModal.hidden = false;
    confirmModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    confirmSend?.focus();
  }

  function closeConfirmModal() {
    if (!confirmModal) return;
    confirmModal.hidden = true;
    confirmModal.setAttribute("aria-hidden", "true");
    if (emailInvalidModal?.hidden !== false) {
      document.body.style.overflow = "";
    }
    pendingPayload = null;
    submitBtn?.focus();
  }

  function openEmailInvalidModal() {
    if (!emailInvalidModal) return;
    emailInvalidModal.hidden = false;
    emailInvalidModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    emailInvalidOk?.focus();
  }

  function closeEmailInvalidModal() {
    if (!emailInvalidModal) return;
    emailInvalidModal.hidden = true;
    emailInvalidModal.setAttribute("aria-hidden", "true");
    if (confirmModal?.hidden !== false) {
      document.body.style.overflow = "";
    }
    emailInput?.focus();
  }

  async function sendToFormspree(payload) {
    const serviceLabel = getServiceLabel(payload.service);
    const formspreeBody = {
      _subject: `[위브소프트 문의] ${payload.name} · ${serviceLabel}`,
      name: payload.name,
      phone: payload.phone,
      service: serviceLabel,
      message: payload.message,
      agree: payload.agree ? "동의" : "미동의",
      createdAt: payload.createdAt,
    };
    if (payload.email) {
      formspreeBody.email = payload.email;
    }

    const response = await fetch(FORMSPREE_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formspreeBody),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const msg =
        (result && result.error) ||
        (Array.isArray(result.errors) && result.errors[0] && result.errors[0].message) ||
        "전송에 실패했습니다. 잠시 후 다시 시도해주세요.";
      formMessage.textContent = msg;
      return false;
    }

    form.reset();
    formMessage.textContent = "문의가 정상 접수되었습니다. 빠르게 연락드리겠습니다.";
    updateSubmitState();
    return true;
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement)) return;
      target.value = formatKoreanPhone(target.value);
      updateSubmitState();
    });
  }

  [nameInput, serviceInput, messageInput, agreeInput].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", updateSubmitState);
    el.addEventListener("change", updateSubmitState);
  });
  updateSubmitState();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim(),
      service: String(formData.get("service") || "").trim(),
      message: String(formData.get("message") || "").trim(),
      agree: formData.get("agree") === "on",
      createdAt: new Date().toISOString(),
    };

    if (
      !payload.name ||
      !payload.phone ||
      !payload.service ||
      !payload.message ||
      !payload.agree
    ) {
      formMessage.textContent = "필수 항목을 모두 입력해주세요.";
      return;
    }

    if (!isValidEmailFormat(payload.email)) {
      formMessage.textContent = "";
      openEmailInvalidModal();
      return;
    }

    pendingPayload = payload;
    fillConfirmSummary(payload);
    formMessage.textContent = "";
    openConfirmModal();
  });

  confirmCancel?.addEventListener("click", () => {
    closeConfirmModal();
  });

  confirmModal?.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.dataset && target.dataset.modalClose === "true") {
      closeConfirmModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (emailInvalidModal && !emailInvalidModal.hidden) {
      closeEmailInvalidModal();
      return;
    }
    if (confirmModal && !confirmModal.hidden) {
      closeConfirmModal();
    }
  });

  emailInvalidOk?.addEventListener("click", () => {
    closeEmailInvalidModal();
  });

  emailInvalidModal?.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.dataset && target.dataset.modalClose === "true") {
      closeEmailInvalidModal();
    }
  });

  confirmSend?.addEventListener("click", async () => {
    if (!pendingPayload) return;
    confirmSend.disabled = true;
    formMessage.textContent = "전송 중입니다…";
    try {
      const ok = await sendToFormspree(pendingPayload);
      if (ok) {
        closeConfirmModal();
      }
    } catch (error) {
      console.error(error);
      formMessage.textContent =
        "전송 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
    } finally {
      confirmSend.disabled = false;
      updateSubmitState();
    }
  });
}

function openKakaoChat() {
  if (typeof Kakao === "undefined") {
    window.open(KAKAO_CHAT_FALLBACK_URL, "_blank", "noopener,noreferrer");
    return;
  }
  const key = KAKAO_JS_KEY && KAKAO_JS_KEY !== "YOUR_JS_KEY" ? KAKAO_JS_KEY : "";
  if (!key) {
    window.open(KAKAO_CHAT_FALLBACK_URL, "_blank", "noopener,noreferrer");
    return;
  }
  try {
    if (!Kakao.isInitialized()) {
      Kakao.init(key);
    }
    Kakao.Channel.chat({
      channelPublicId: KAKAO_CHANNEL_PUBLIC_ID,
    });
  } catch (err) {
    console.warn(err);
    window.open(KAKAO_CHAT_FALLBACK_URL, "_blank", "noopener,noreferrer");
  }
}
