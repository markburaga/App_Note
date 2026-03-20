const authModal = document.getElementById("authModal");
const authTitle = document.getElementById("authModalTitle");
const authOpenButtons = document.querySelectorAll("[data-auth-open]");
const authCloseButtons = document.querySelectorAll("[data-auth-close]");
const animatedElements = document.querySelectorAll("[data-animate]");
const animatedGroups = document.querySelectorAll("[data-animate-group]");

if (authModal && authTitle) {
  const setModalMode = (mode) => {
    const isSignIn = mode === "signin";
    authTitle.textContent = isSignIn ? "Вход в Notes" : "Регистрация в Notes";
    authModal.dataset.mode = isSignIn ? "signin" : "signup";

    const submitButton = authModal.querySelector(".auth-form__submit");
    const switchText = authModal.querySelector(".auth-form__switch");
    const switchButton = authModal.querySelector(".auth-form__switch-btn");
    const signUpOnlyFields = authModal.querySelectorAll(".auth-form__row--signup-only input, .auth-form__field--signup-only input, .auth-form__checkbox--signup-only input");

    if (submitButton && switchText && switchButton) {
      submitButton.textContent = isSignIn ? "Войти в аккаунт" : "Создать аккаунт";
      switchText.firstChild.textContent = isSignIn ? "Нет аккаунта? " : "Уже есть аккаунт? ";
      switchButton.textContent = isSignIn ? "Зарегистрироваться" : "Войти";
      switchButton.dataset.authOpen = isSignIn ? "signup" : "signin";
    }

    signUpOnlyFields.forEach((field) => {
      field.required = !isSignIn;
      if (isSignIn) {
        field.checked = false;
      }
    });
  };

  const openModal = (mode = "signup") => {
    setModalMode(mode);
    authModal.classList.add("is-open");
    authModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeModal = () => {
    authModal.classList.remove("is-open");
    authModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  authOpenButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(button.dataset.authOpen);
    });
  });

  authCloseButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && authModal.classList.contains("is-open")) {
      closeModal();
    }
  });
}

if (animatedElements.length) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    animatedElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  } else {
    document.body.classList.add("motion-ready");

    animatedGroups.forEach((group) => {
      const groupChildren = group.querySelectorAll("[data-animate]");
      groupChildren.forEach((element, index) => {
        element.style.setProperty("--motion-delay", `${index * 90}ms`);
      });
    });

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            currentObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    animatedElements.forEach((element) => {
      observer.observe(element);
    });

    const firstScreenElements = document.querySelectorAll(".header [data-animate], .boost [data-animate]");
    firstScreenElements.forEach((element) => {
      element.classList.add("is-visible");
    });
  }
}
