const taskForm = document.getElementById("task-form");
const taskFormBody = document.getElementById("task-form-body");
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
const checkbox = document.getElementById("album-checkbox");//checkbox
const taskLabel = document.querySelector(".task-form-label");
const titleInputMessage=document.getElementById("title-input-message");

const taskData = JSON.parse(localStorage.getItem("data")) || [];
let currentTask = {};

const addOrUpdateTask = () => {
  const dataArrIndex = taskData.findIndex((item) => item.id === currentTask.id);

  // Ako je ček boks selektovan
  if (checkbox.checked) {
    // Pretvori vrednost titleInput u broj
    const numberOfButtons = parseInt(titleInput.value, 10);

    // Proveri da li je vrednost validan broj veći od 0
    if (!isNaN(numberOfButtons) && numberOfButtons > 0) {
      // Generiši niz brojeva od 1 do numberOfButtons
      const numberSequence = Array.from({ length: numberOfButtons }, (_, i) => i + 1).join(',');

      // Kreiraj objekat sa generisanim nizom brojeva u title
      const taskObj = {
        id: `${numberSequence}`, // ID je sada niz brojeva
        title: numberSequence,   // Title je isto niz brojeva
      };

      if (dataArrIndex === -1) {
        taskData.unshift(taskObj); // Dodaj zadatak
      } else {
        taskData[dataArrIndex] = taskObj; // Ažuriraj postojeći zadatak
      }

    }
  } else {
    // Ako ček boks nije selektovan, koristi originalnu vrednost titleInput
    const taskObj = {
      id: `${titleInput.value.toLowerCase().split(" ").join("-")}`,
      title: titleInput.value,
    };

    if (dataArrIndex === -1) {
      taskData.unshift(taskObj); // Dodaj zadatak
    } else {
      taskData[dataArrIndex] = taskObj; // Ažuriraj postojeći zadatak
    }
  }

  localStorage.setItem("data", JSON.stringify(taskData));
  updateTaskContainer();
  reset(); // Resetuje prethodno upisano u modalu
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
        <p class="task-counter"><strong>Ukupno nedostaje:</strong> ${values.length} sličica</p>
          <p class="task-title"><strong>Spisak:</strong> 
      ${values.map(val => `<span class="nowrap">${val}</span>`).join(', ')}
    </p>
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
    
    // Prikazivanje obaveštenja ako je album popunjen (tj. nema više dugmića)
    const albumFullMessage = document.getElementById('album-full-message');
    albumFullMessage.style.display = 'block';
    
    // Možeš dodati tajmer da obaveštenje nestane nakon nekoliko sekundi
    setTimeout(() => {
      albumFullMessage.style.display = 'none';
    }, 5000);
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

  checkbox.addEventListener("change", function () {
    if (this.checked) {
      // Menja tekst labele
      taskLabel.textContent = "Upiši koliko sličica ima tvoj album";

      // Resetuje unos i postavlja placeholder
      titleInput.value = "";
      titleInput.placeholder = "Unesi broj manji od 1000";

      // Dodaje validaciju
      titleInput.addEventListener("input", validateInput);
    } else {
      // Vraća originalni tekst labele
      taskLabel.textContent = "Upiši brojeve sličica koje ti nedostaju odvojene zarezom";

      // Uklanja placeholder i validaciju
      titleInput.placeholder = "";
      titleInput.removeEventListener("input", validateInput);
    }
  });

  function validateInput(event) {
    let value = event.target.value;

    // Dozvoljava samo brojeve
    if (!/^\d*$/.test(value)) {
      event.target.value = value.replace(/\D/g, ""); // Briše sve osim brojeva
    }

    // Ograničava vrednost na manje od 1000
    if (value !== "" && parseInt(value, 10) >= 1000) {
      event.target.value = "999"; // Ako unese 1000 ili više, vraća na 999
    }
  }
  
	//Sakrivanje labele i ček boksa sa prvog prozora
  addOrUpdateTaskBtn.addEventListener("click", function () {
    const titleInputValue = titleInput.value.trim(); // Uzimamo vrednost iz inputa i uklanjamo vodeće i prateće praznine
	// Splitovanje stringa na osnovu razmaka ili zareza
	const prviBroj = parseInt(titleInputValue.split(/[\s,]+/)[0], 10); 
	// Razdvaja prema razmaku (\s) ili zarezu (,) i uzima prvi deo i pakuje u broj
	console.log("u event listeneru"+prviBroj);
	if (prviBroj<1000){
	
	checkbox.parentElement.style.display = "none"; // Sakriva labelu sa čekboksom
    openTaskFormBtn.style.display = "none"; // Sakriva dugme
	
	}
	else{
	
	titleInputMessage.style.display = "block"; // Prikazivanje poruke
    titleInputMessage.textContent = "Broj slicica mora biti manji od 1000."; // Obaveštenje
	}
	
  });