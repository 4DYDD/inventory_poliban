let inputEdit = document.querySelector(".input--edit");
let inputAdd = document.querySelector(".input--add");
let addDatanya = document.querySelector(".addDatanya");

function goTo(url, { delay }) {
  if (delay) {
    setTimeout(() => {
      window.location.href = url;
    }, delay);
  } else {
    window.location.href = url;
  }
}

function tutup(element) {
  console.log("TOMBOL DITINGGAL");
  let input = element.querySelector("input");
  input.disabled = true;

  function buka() {
    input.disabled = false;
    this.removeEventListener("mouseover", buka);
  }
  this.addEventListener("mouseover", buka);
}

let alertnya = document.querySelector("#alertnya");
function naiklagi() {
  alertnya.style.top = "-10%";
  alertnya.style.animation = "none";
  alertnya.style.animation = "slideup 0.3s ease-in both";
}

window.addEventListener("click", (event) => {
  let target = event.target;
  console.log(target);

  if (Tambah.element) {
    if (
      !Tambah.element.contains(target) &&
      !Tambah.pemicu.contains(target) &&
      Tambah.status == "buka"
    ) {
      Tambah.show({});
    }
  }

  if (Edit.element) {
    if (!Edit.element.contains(target) && Edit.status == "buka") {
      Edit.show({});
    }
  }

  if (alertnya && !alertnya.contains(target)) {
    naiklagi();
  }
});

class elementCRUD {
  constructor(element, pemicu) {
    this.pemicu = pemicu;
    this.status = "tutup";
    this.element = element;
    this.delay = undefined;
  }
  tutup() {
    this.status = "tutup";
    this.element.style.transform = "translate(0%, -50%)";
    this.element.style.left = "100%";
  }
  buka() {
    if (this.delay) {
      console.log(this.delay);
      setTimeout(() => {
        this.status = "buka";
        this.element.style.transform = "translate(-50%, -50%)";
        this.element.style.left = "50%";
      }, this.delay);
    } else {
      this.status = "buka";
      this.element.style.transform = "translate(-50%, -50%)";
      this.element.style.left = "50%";
    }
  }
  show({ delay = undefined }) {
    if (delay) {
      this.delay = delay;
    }
    if (this.status == "tutup") {
      this.buka();
    } else {
      this.tutup();
    }
  }
}

const Tambah = new elementCRUD(
  document.querySelector(".input--add"),
  document.querySelector(".addDatanya")
);
const Edit = new elementCRUD(document.querySelector(".input--edit"));
