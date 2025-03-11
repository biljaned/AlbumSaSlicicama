const taskForm = document.getElementById("task-form");
const confirmCloseDialog = document.getElementById("confirm-close-dialog");
const openTaskFormBtn = document.getElementById("open-task-form-btn");
const closeTaskFormBtn = document.getElementById("close-task-form-btn");
const addOrUpdateTaskBtn = document.getElementById("add-or-update-task-btn");
const cancelBtn = document.getElementById("cancel-btn");
const discardBtn = document.getElementById("discard-btn");
const tasksContainer = document.getElementById("tasks-container");
const titleInput = document.getElementById("title-input");
const dateInput = document.getElementById("date-input");
const descriptionInput = document.getElementById("description-input");

const taskData = JSON.parse(localStorage.getItem("data")) || [];
let currentTask = {};

const addOrUpdateTask = () => {
  const dataArrIndex = taskData.findIndex((item) => item.id === currentTask.id);
  const taskObj = {
    id: `${titleInput.value.toLowerCase().split(" ").join("-")}`,
    title: titleInput.value,
    date: "datum",
    description: "opis",
  };

  if (dataArrIndex === -1) {
    taskData.unshift(taskObj); // add
  } else {
    taskData[dataArrIndex] = taskObj; // update
  }

  localStorage.setItem("data", JSON.stringify(taskData));
  updateTaskContainer()
  reset() //resetuje prethodno upisano u modalu i 
  
};

const updateTaskContainer = () => {
  tasksContainer.innerHTML = "";

  taskData.forEach(
    ({ id, title }) => {
		// Podeli string title po zarezu i ukloni eventualne praznine
    const values = title.split(',').map(val => val.trim());
    // Kreiraj HTML za dinamičke dugmiće sa fiksnom širinom 4ch
    const dynamicButtons = values
      .map(val => `<button type="button" class="btn" style="width: 4ch;" onclick="this.classList.toggle('selected')">${val}</button>`)
      .join(' ');

        (tasksContainer.innerHTML += `
        <div class="task" id="${id}">
          <p><strong>Title:</strong> ${title}</p> 
		  <div class="dynamic-buttons">
          ${dynamicButtons}
        </div>         
          <button type="btn delete" class="btn" onclick="deleteTask(this)">Obriši</button> 
        </div>
      `)
    }
  );
};


const deleteTask = (buttonEl) => {
  // Pronalaženje roditeljskog elementa zadatka i njegovog ID-ja
  const taskEl = buttonEl.parentElement;
  const taskId = taskEl.id;

  // Pronalazak odgovarajućeg zadatka u nizu taskData
  const dataArrIndex = taskData.findIndex(item => item.id === taskId);
  if (dataArrIndex === -1) return;

  // Pronalazak kontejnera sa dinamičkim dugmićima unutar zadatka
  const dynamicButtonsContainer = taskEl.querySelector('.dynamic-buttons');
  if (!dynamicButtonsContainer) return;

  // Pribavi sve dugmiće unutar kontejnera
  const dynamicButtons = dynamicButtonsContainer.querySelectorAll('button');

  // Sakupi vrednosti dugmića koji nisu selektovani
  const remainingValues = Array.from(dynamicButtons)
    .filter(btn => !btn.classList.contains('selected'))
    .map(btn => btn.textContent.trim());

  if (remainingValues.length === 0) {
    // Ako nema preostalih dugmića, ukloni ceo zadatak
    taskData.splice(dataArrIndex, 1);
  } else {
    // Inače, ažuriraj title zadatka sa preostalim vrednostima (spojenim zarezom)
    taskData[dataArrIndex].title = remainingValues.join(',');
  }

  // Osveži localStorage i prikaz zadataka
  localStorage.setItem("data", JSON.stringify(taskData));
  updateTaskContainer();
};





const reset = () => {
  titleInput.value = "";
  taskForm.classList.toggle("hidden");
  currentTask = {};
}

//kada se ugasi prozor da bi se zadaci videli prilikom ponovnog pokretanja
if (taskData.length){updateTaskContainer()}

openTaskFormBtn.addEventListener("click", () =>
  taskForm.classList.toggle("hidden")
);

closeTaskFormBtn.addEventListener("click", () => {
  const formInputsContainValues = titleInput.value || dateInput.value || descriptionInput.value;
  const formInputValuesUpdated = titleInput.value !== currentTask.title || dateInput.value !== currentTask.date || descriptionInput.value !== currentTask.description;

  if (formInputsContainValues && formInputValuesUpdated) {
    confirmCloseDialog.showModal();
  } else {
    reset();
  }
});

cancelBtn.addEventListener("click", () => confirmCloseDialog.close());

discardBtn.addEventListener("click", () => {
  confirmCloseDialog.close();
  reset()
});

taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addOrUpdateTask();
});

taskForm.addEventListener("click", (e) => {
  // Proveri da li je kliknuto dugme sa klasom "delete"
  if (e.target.matches("button.btn.delete")) {
    e.preventDefault(); // sprečava eventualne default akcije, iako kod tipa "button" nije obavezno
    deleteTask(e.target);
  }
});
