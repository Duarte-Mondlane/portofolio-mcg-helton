const typewriterTarget = document.querySelector(".typewriter");
const menuToggle = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const navAnchors = document.querySelectorAll(".nav-links a");
const reveals = document.querySelectorAll(".reveal");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (typewriterTarget) {
  const fullText = typewriterTarget.dataset.text ?? "";
  typewriterTarget.style.minWidth = `${fullText.length}ch`;

  if (prefersReducedMotion) {
    typewriterTarget.textContent = fullText;
  } else {
    let index = 0;
    let isDeleting = false;

    const runTypewriter = () => {
      typewriterTarget.textContent = fullText.slice(0, index);

      let delay = isDeleting ? 55 : 95;

      if (!isDeleting && index < fullText.length) {
        index += 1;
      } else if (!isDeleting && index === fullText.length) {
        isDeleting = true;
        delay = 1500;
      } else if (isDeleting && index > 0) {
        index -= 1;
      } else {
        isDeleting = false;
        delay = 320;
      }

      window.setTimeout(runTypewriter, delay);
    };

    window.setTimeout(runTypewriter, 280);
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
}

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
      threshold: 0.18,
    }
  );

  reveals.forEach((element) => revealObserver.observe(element));
} else {
  reveals.forEach((element) => element.classList.add("is-visible"));
}

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
