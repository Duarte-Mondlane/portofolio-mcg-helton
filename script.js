const typewriterTarget = document.querySelector(".typewriter");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navAnchors = Array.from(document.querySelectorAll(".nav-links a"));
const reveals = Array.from(document.querySelectorAll(".reveal"));
const sections = Array.from(document.querySelectorAll("main section[id]"));
const tiltCards = Array.from(document.querySelectorAll(".tilt-card"));
const projectButtons = Array.from(document.querySelectorAll(".project-open"));
const projectModal = document.querySelector("#project-modal");
const projectModalMedia = document.querySelector("#project-modal-media");
const projectModalTag = document.querySelector("#project-modal-tag");
const projectModalTitle = document.querySelector("#project-modal-title");
const projectModalDescription = document.querySelector("#project-modal-description");
const projectModalLink = document.querySelector("#project-modal-link");
const projectCloseControls = Array.from(document.querySelectorAll("[data-project-close]"));
const modalCloseButton = document.querySelector(".project-modal__close");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lastProjectTrigger = null;

const setActiveLink = (id) => {
  navAnchors.forEach((anchor) => {
    const isActive = anchor.getAttribute("href") === `#${id}`;
    anchor.classList.toggle("is-active", isActive);

    if (isActive) {
      anchor.setAttribute("aria-current", "page");
    } else {
      anchor.removeAttribute("aria-current");
    }
  });
};

if (typewriterTarget) {
  const fullText = typewriterTarget.dataset.text ?? "";
  typewriterTarget.style.minWidth = `${fullText.length + 1}ch`;

  if (prefersReducedMotion) {
    typewriterTarget.textContent = fullText;
  } else {
    let index = 0;

    const runTypewriter = () => {
      typewriterTarget.textContent = fullText.slice(0, index);

      if (index < fullText.length) {
        index += 1;
        window.setTimeout(runTypewriter, 90);
        return;
      }

      window.setTimeout(() => {
        typewriterTarget.textContent = "";
        index = 0;
        window.setTimeout(runTypewriter, 280);
      }, 1600);
    };

    window.setTimeout(runTypewriter, 360);
  }
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navAnchors.forEach((anchor) => {
    anchor.addEventListener("click", () => {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      navLinks.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
}

reveals.forEach((element, index) => {
  element.style.transitionDelay = `${(index % 3) * 80}ms`;
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  reveals.forEach((element) => revealObserver.observe(element));
} else {
  reveals.forEach((element) => element.classList.add("is-visible"));
}

if (sections.length) {
  setActiveLink(sections[0].id);

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length) {
          setActiveLink(visibleEntries[0].target.id);
        }
      },
      {
        threshold: [0.35, 0.55, 0.75],
        rootMargin: "-20% 0px -45% 0px",
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  } else {
    const updateActiveSection = () => {
      const offset = window.scrollY + window.innerHeight * 0.4;
      let currentSectionId = sections[0].id;

      sections.forEach((section) => {
        if (offset >= section.offsetTop) {
          currentSectionId = section.id;
        }
      });

      setActiveLink(currentSectionId);
    };

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    updateActiveSection();
  }
}

const canTilt =
  !prefersReducedMotion && tiltCards.length > 0 && window.matchMedia("(pointer: fine)").matches;

if (canTilt) {
  tiltCards.forEach((card) => {
    let frameId = 0;

    const resetTilt = () => {
      window.cancelAnimationFrame(frameId);
      card.style.transform = "";
      card.style.boxShadow = "";
    };

    card.addEventListener("mousemove", (event) => {
      const bounds = card.getBoundingClientRect();
      const relativeX = (event.clientX - bounds.left) / bounds.width;
      const relativeY = (event.clientY - bounds.top) / bounds.height;
      const rotateY = (relativeX - 0.5) * 10;
      const rotateX = (0.5 - relativeY) * 10;

      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        card.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(
          2
        )}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-8px)`;
        card.style.boxShadow = "0 30px 60px rgba(0, 0, 0, 0.36)";
      });
    });

    card.addEventListener("mouseleave", resetTilt);
    card.addEventListener("blur", resetTilt, true);
  });
}

const clearProjectModalMedia = () => {
  if (!projectModalMedia) {
    return;
  }

  while (projectModalMedia.firstChild) {
    projectModalMedia.removeChild(projectModalMedia.firstChild);
  }

  projectModalMedia.classList.remove("project-modal__media--model");
};

const buildProjectModalMedia = ({ type, src, poster, alt, title }) => {
  if (!projectModalMedia) {
    return;
  }

  clearProjectModalMedia();

  if (type === "video") {
    const video = document.createElement("video");
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;

    const source = document.createElement("source");
    source.src = src;
    source.type = "video/mp4";

    video.appendChild(source);
    projectModalMedia.appendChild(video);
    return;
  }

  if (type === "model") {
    const viewer = document.createElement("model-viewer");
    viewer.setAttribute("src", src);
    viewer.setAttribute("poster", poster ?? "");
    viewer.setAttribute("alt", alt || title);
    viewer.setAttribute("camera-controls", "");
    viewer.setAttribute("auto-rotate", "");
    viewer.setAttribute("shadow-intensity", "1");
    viewer.setAttribute("exposure", "1.05");
    viewer.setAttribute("interaction-prompt", "none");
    projectModalMedia.classList.add("project-modal__media--model");
    projectModalMedia.appendChild(viewer);
    return;
  }

  const image = document.createElement("img");
  image.src = src;
  image.alt = alt || title;
  projectModalMedia.appendChild(image);
};

const openProjectModal = (trigger) => {
  if (
    !projectModal ||
    !projectModalTag ||
    !projectModalTitle ||
    !projectModalDescription ||
    !projectModalLink
  ) {
    return;
  }

  const {
    projectType,
    projectSrc,
    projectPoster,
    projectLink,
    projectTag,
    projectTitle,
    projectDescription,
    projectAlt,
  } = trigger.dataset;

  lastProjectTrigger = trigger;
  buildProjectModalMedia({
    type: projectType,
    src: projectSrc,
    poster: projectPoster,
    alt: projectAlt,
    title: projectTitle,
  });

  projectModalTag.textContent = projectTag ?? "";
  projectModalTitle.textContent = projectTitle ?? "";
  projectModalDescription.textContent = projectDescription ?? "";
  projectModalLink.href = projectLink ?? "#";
  projectModalLink.textContent =
    projectType === "video"
      ? "Ver vídeo"
      : projectType === "model"
        ? "Abrir modelo"
        : "Ver imagem";

  projectModal.hidden = false;
  document.body.classList.add("modal-open");

  window.requestAnimationFrame(() => {
    projectModal.classList.add("is-open");
    modalCloseButton?.focus();
  });
};

const closeProjectModal = () => {
  if (!projectModal || projectModal.hidden) {
    return;
  }

  projectModal.classList.remove("is-open");
  document.body.classList.remove("modal-open");

  window.setTimeout(() => {
    projectModal.hidden = true;
    clearProjectModalMedia();
    lastProjectTrigger?.focus();
  }, 220);
};

projectButtons.forEach((button) => {
  button.addEventListener("click", () => openProjectModal(button));
});

projectCloseControls.forEach((control) => {
  control.addEventListener("click", closeProjectModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeProjectModal();
  }
});

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      formStatus.textContent = "Preenche todos os campos antes de enviar.";
      contactForm.reportValidity();
      return;
    }

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    const mailSubject = encodeURIComponent(subject);
    const mailBody = encodeURIComponent(
      `Nome: ${name}\nEmail: ${email}\n\nMensagem:\n${message}`
    );

    formStatus.textContent = "A abrir o teu cliente de email para enviar a mensagem.";
    window.location.href = `mailto:eltonazevedo1919@gmail.com?subject=${mailSubject}&body=${mailBody}`;
  });

  contactForm.addEventListener("reset", () => {
    window.setTimeout(() => {
      formStatus.textContent = "";
    }, 0);
  });
}
