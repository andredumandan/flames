const outcomes = [
  { letter: "F", label: "Friends", copy: "Classic seatmate energy. The notebook says this pair is better at tawanan than kilig." },
  { letter: "L", label: "Love", copy: "A very dramatic result for a very serious elementary school scientific method." },
  { letter: "A", label: "Affection", copy: "There is fondness here: soft, sweet, and probably written with a gel pen." },
  { letter: "M", label: "Marriage", copy: "The class has spoken. Please prepare snacks for the imaginary reception." },
  { letter: "E", label: "Enemy", copy: "High tension. Possible pencil-case rivalry. Try again after recess." },
  { letter: "S", label: "Siblings", copy: "More kulitan than kilig. The vibe is family-coded." }
];

const form = document.querySelector("#flames-form");
const nameOneInput = document.querySelector("#name-one");
const nameTwoInput = document.querySelector("#name-two");
const swapButton = document.querySelector("#swap-button");
const checkButton = document.querySelector(".primary-button");
const resultStamp = document.querySelector("#result-stamp");
const resultLabel = document.querySelector("#result-label");
const resultCopy = document.querySelector("#result-copy");
const flamesTrack = document.querySelector("#flames-track");
const countBadge = document.querySelector("#count-badge");
const scratchNameOne = document.querySelector("#scratch-name-one");
const scratchNameTwo = document.querySelector("#scratch-name-two");
const lettersOne = document.querySelector("#letters-one");
const lettersTwo = document.querySelector("#letters-two");
let animationTimer = 0;

function normalizeName(value) {
  return value.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/[a-z]/g) || [];
}

function compareNames(nameOne, nameTwo) {
  const first = normalizeName(nameOne).map((letter, index) => ({ letter, index, crossed: false }));
  const second = normalizeName(nameTwo).map((letter, index) => ({ letter, index, crossed: false }));
  const secondQueues = new Map();

  second.forEach((item) => {
    if (!secondQueues.has(item.letter)) secondQueues.set(item.letter, []);
    secondQueues.get(item.letter).push(item);
  });

  first.forEach((item) => {
    const match = secondQueues.get(item.letter)?.find((candidate) => !candidate.crossed);
    if (match) {
      item.crossed = true;
      match.crossed = true;
    }
  });

  return { first, second };
}

function getFlamesResult(count) {
  const remaining = [...outcomes];
  let index = 0;

  while (remaining.length > 1) {
    index = (index + count - 1) % remaining.length;
    remaining.splice(index, 1);
  }

  return remaining[0];
}

function getGameState() {
  const nameOne = nameOneInput.value.trim();
  const nameTwo = nameTwoInput.value.trim();
  const compared = compareNames(nameOne, nameTwo);
  const remainingCount = [...compared.first, ...compared.second].filter((item) => !item.crossed).length;

  return { nameOne, nameTwo, compared, remainingCount };
}

function renderLetters(container, letters) {
  container.replaceChildren();

  if (!letters.length) {
    const empty = document.createElement("span");
    empty.textContent = "-";
    empty.setAttribute("aria-label", "No letters");
    container.append(empty);
    return;
  }

  letters.forEach((item) => {
    const chip = document.createElement("span");
    chip.textContent = item.letter.toUpperCase();
    chip.classList.toggle("crossed", item.crossed);
    container.append(chip);
  });
}

function renderTrack(activeLetter) {
  flamesTrack.querySelectorAll("li").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.letter === activeLetter);
    item.classList.remove("is-tapping");
  });
}

function renderScratch({ nameOne, nameTwo, compared, remainingCount }) {
  scratchNameOne.textContent = nameOne || "Name 1";
  scratchNameTwo.textContent = nameTwo || "Name 2";
  renderLetters(lettersOne, compared.first);
  renderLetters(lettersTwo, compared.second);
  countBadge.textContent = `${remainingCount} ${remainingCount === 1 ? "letter" : "letters"} left`;
}

function clearAnimation() {
  window.clearInterval(animationTimer);
  animationTimer = 0;
  document.body.classList.remove("is-counting");
  checkButton.disabled = false;
}

function showPrompt(state) {
  clearAnimation();
  renderScratch(state);

  resultStamp.textContent = "?";
  resultLabel.textContent = !state.nameOne || !state.nameTwo ? "Write two names" : "Ready to count";
  resultCopy.textContent = !state.nameOne || !state.nameTwo
    ? "Cross out matching letters, count what remains, then let FLAMES decide."
    : "Press Check to count around FLAMES and reveal the result.";
  renderTrack("");
}

function showResult(result) {
  clearAnimation();
  resultStamp.textContent = result.letter;
  resultLabel.textContent = result.label;
  resultCopy.textContent = result.copy;
  renderTrack(result.letter);
}

function animateResult(state) {
  clearAnimation();
  renderScratch(state);

  if (!state.nameOne || !state.nameTwo || state.remainingCount === 0) {
    resultStamp.textContent = "?";
    resultLabel.textContent = !state.nameOne || !state.nameTwo ? "Write two names" : "All letters matched";
    resultCopy.textContent = !state.nameOne || !state.nameTwo
      ? "Cross out matching letters, count what remains, then let FLAMES decide."
      : "No remaining letters means the old-school counting ritual has nothing to count.";
    renderTrack("");
    return;
  }

  const result = getFlamesResult(state.remainingCount);
  const letters = outcomes.map((item) => item.letter);
  const ticks = Math.max(12, Math.min(28, state.remainingCount + 8));
  let step = 0;

  document.body.classList.add("is-counting");
  checkButton.disabled = true;
  resultLabel.textContent = "Counting...";
  resultCopy.textContent = `${state.remainingCount} letters left. Moving around FLAMES the old-school way.`;

  animationTimer = window.setInterval(() => {
    const letter = letters[step % letters.length];
    const activeTile = flamesTrack.querySelector(`[data-letter="${letter}"]`);

    resultStamp.textContent = letter;
    renderTrack(letter);
    activeTile?.classList.add("is-tapping");

    step += 1;
    if (step > ticks) {
      showResult(result);
    }
  }, 120);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  animateResult(getGameState());
});

form.addEventListener("reset", () => {
  window.setTimeout(() => showPrompt(getGameState()), 0);
});

nameOneInput.addEventListener("input", () => showPrompt(getGameState()));
nameTwoInput.addEventListener("input", () => showPrompt(getGameState()));

swapButton.addEventListener("click", () => {
  const current = nameOneInput.value;
  nameOneInput.value = nameTwoInput.value;
  nameTwoInput.value = current;
  showPrompt(getGameState());
});

showPrompt(getGameState());
