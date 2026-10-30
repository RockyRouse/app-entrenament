
const CLAU_ENTRENAMENTS = "entrenamentApp";
const CLAU_BIBLIOTECA = "entrenamentBiblioteca";

const exercicisInicials = [
  {
    id: "ex-rmu",
    nom: "10R × 1 RMU",
    detall: "1 repetició per sèrie",
    seriesTotals: 10
  },
  {
    id: "ex-pullup",
    nom: "5R × 10 Pull-up",
    detall: "10 repeticions per sèrie",
    seriesTotals: 5
  },
  {
    id: "ex-highpull",
    nom: "6R × 2 High Pull",
    detall: "2 repeticions per sèrie",
    seriesTotals: 6
  }
];
const definicioCamps = {
  temps: "Temps",
  pes: "Pes",
  repeticions: "Repeticions",
  variant: "Goma / variant",
  distancia: "Distància",
  comentari: "Comentari",
  rpe: "RPE"
};
const llista = document.getElementById("llista-exercicis");
const campData = document.getElementById("data");
const calendari = document.getElementById("calendari");
const mesAny = document.getElementById("mes-any");
const botoMesAnterior = document.getElementById("mes-anterior");
const botoMesSeguent = document.getElementById("mes-seguent");

let anyCalendari;
let mesCalendari;

function inicialitzarCalendari() {
  const dataInicial = campData.value
    ? new Date(campData.value + "T12:00:00")
    : new Date();

  anyCalendari = dataInicial.getFullYear();
  mesCalendari = dataInicial.getMonth();

  dibuixarCalendari();
}
function dibuixarCalendari() {
  calendari.innerHTML = "";

  const nomsDies = ["Dl", "Dt", "Dc", "Dj", "Dv", "Ds", "Dg"];

  mesAny.textContent = new Date(
    anyCalendari,
    mesCalendari
  ).toLocaleDateString("ca-ES", {
    month: "long",
    year: "numeric"
  });

  // Capçalera dels dies de la setmana.
  nomsDies.forEach(nom => {
    const dia = document.createElement("div");
    dia.className = "dia-setmana";
    dia.textContent = nom;
    calendari.appendChild(dia);
  });

  // Primer dia del mes i nombre de dies.
  const primerDia = new Date(anyCalendari, mesCalendari, 1);
  const diesMes = new Date(anyCalendari, mesCalendari + 1, 0).getDate();

  // Dilluns = 0, dimarts = 1... diumenge = 6.
  const espaisInicials = (primerDia.getDay() + 6) % 7;

  // Espais buits abans del dia 1.
  for (let i = 0; i < espaisInicials; i++) {
    const buit = document.createElement("div");
    calendari.appendChild(buit);
  }

  // Dies del mes.
  for (let dia = 1; dia <= diesMes; dia++) {
   const boto = document.createElement("button");
   boto.type = "button";
   boto.className = "dia-calendari";
   boto.textContent = dia;

const dataDia = `${anyCalendari}-${String(mesCalendari + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

if (dataDia === campData.value) {
  boto.classList.add("seleccionat");
}
if (
  entrenaments[dataDia] &&
  Array.isArray(entrenaments[dataDia].exercicis) &&
  entrenaments[dataDia].exercicis.length > 0
) {
  boto.classList.add("te-entrenament");
}
boto.addEventListener("click", () => {
  campData.value = dataDia;
  campData.dispatchEvent(new Event("change"));
  dibuixarCalendari();
});

calendari.appendChild(boto);
  }
}
botoMesAnterior.addEventListener("click", () => {
  mesCalendari--;

  if (mesCalendari < 0) {
    mesCalendari = 11;
    anyCalendari--;
  }

  dibuixarCalendari();
});

botoMesSeguent.addEventListener("click", () => {
  mesCalendari++;

  if (mesCalendari > 11) {
    mesCalendari = 0;
    anyCalendari++;
  }

  dibuixarCalendari();
});
const selectorBiblioteca = document.getElementById("selector-biblioteca");
const llistaBiblioteca = document.getElementById("llista-biblioteca");
const formulari = document.getElementById("formulari-exercici");
const campId = document.getElementById("id-exercici");
const campNom = document.getElementById("nom-exercici");
const campDetall = document.getElementById("detall-exercici");
const campTotal = document.getElementById("total-series");
const botoDesar = document.getElementById("boto-desar-exercici");
const botoCancelar = document.getElementById("boto-cancel-lar");
const campsExercici = document.querySelectorAll(
  'input[name="camps-exercici"]'
);
// Creem un identificador per a cada exercici o instància.
function crearId() {
  return crypto.randomUUID();
}

// Carreguem les dades guardades.
function llegirDades(clau, valorPerDefecte) {
  try {
    const text = localStorage.getItem(clau);
    return text ? JSON.parse(text) : valorPerDefecte;
  } catch (error) {
    alert("No s'han pogut llegir les dades guardades: " + clau);
    return valorPerDefecte;
  }
}

let biblioteca = llegirDades(CLAU_BIBLIOTECA, null);
let entrenaments = llegirDades(CLAU_ENTRENAMENTS, {});

if (!Array.isArray(biblioteca)) {
  biblioteca = exercicisInicials.map(ex => ({ ...ex }));
  desarBiblioteca();
}

// Posem la data d'avui al camp de data.
const avui = new Date();
const any = avui.getFullYear();
const mes = String(avui.getMonth() + 1).padStart(2, "0");
const dia = String(avui.getDate()).padStart(2, "0");

campData.value = `${any}-${mes}-${dia}`;

// Convertim els registres de la versió anterior al nou format.
function migrarEntrenamentsAntics() {
  let canviat = false;

  for (const [data, registre] of Object.entries(entrenaments)) {
    if (!registre || Array.isArray(registre.exercicis)) {
      continue;
    }

    const exercicisDelDia = [];

    for (const [index, quantitat] of Object.entries(registre)) {
      if (!/^\d+$/.test(index)) continue;

      const exAntic = exercicisInicials[Number(index)];
      if (!exAntic) continue;

      exercicisDelDia.push({
        instanciaId: crearId(),
        exerciciId: exAntic.id,
        nom: exAntic.nom,
        detall: exAntic.detall,
        seriesTotals: exAntic.seriesTotals,
        seriesFetes: Math.max(
          0,
          Math.min(exAntic.seriesTotals, Number(quantitat) || 0)
        )
      });
    }

    entrenaments[data] = { exercicis: exercicisDelDia };
    canviat = true;
  }

  if (canviat) desarEntrenaments();
}

function desarBiblioteca() {
  localStorage.setItem(CLAU_BIBLIOTECA, JSON.stringify(biblioteca));
}

function desarEntrenaments() {
  localStorage.setItem(CLAU_ENTRENAMENTS, JSON.stringify(entrenaments));
}

migrarEntrenamentsAntics();

// Obtenim el registre de la data seleccionada.
function obtenirEntrenament() {
  const data = campData.value;

  if (!entrenaments[data] ||
      !Array.isArray(entrenaments[data].exercicis)) {
    entrenaments[data] = { exercicis: [] };
  }

  return entrenaments[data];
}
// Mostra els exercicis de l'últim entrenament anterior a la data seleccionada.
function mostrarUltimEntrenament() {
  const contenidor = document.getElementById("ultim-entrenament");
  if (!contenidor) return;

  const dataSeleccionada = campData.value;

  const datesAnteriors = Object.keys(entrenaments)
    .filter(data =>
      data < dataSeleccionada &&
      Array.isArray(entrenaments[data]?.exercicis) &&
      entrenaments[data].exercicis.length > 0
    )
    .sort()
    .reverse();

  if (datesAnteriors.length === 0) {
    contenidor.innerHTML = "";
    contenidor.hidden = true;
    return;
  }

  const dataUltim = datesAnteriors[0];
  const exercicis = entrenaments[dataUltim].exercicis;

  const [any, mes, dia] = dataUltim.split("-");

  contenidor.innerHTML = `
    <h3>Últim entrenament (${dia}/${mes}/${any})</h3>
    <ul>
      ${exercicis.map(ex => `<li>${escaparHTML(ex.nom)}</li>`).join("")}
    </ul>
  `;

  contenidor.hidden = false;
}
// Mostrem els exercicis del dia.
function mostrarExercicis() {
  llista.innerHTML = "";
  const entrenament = obtenirEntrenament();
  mostrarUltimEntrenament();

  if (entrenament.exercicis.length === 0) {
    llista.innerHTML =
      '<p class="missatge-buit">Encara no has afegit cap exercici a aquest dia.</p>';
    return;
  }

 entrenament.exercicis.forEach((ex, indexEx) => {
    const fetes = Number(ex.seriesFetes) || 0;
    const total = Number(ex.seriesTotals) || 1;
    const acabat = fetes >= total;
if (!Array.isArray(ex.registresSeries)) {
  ex.registresSeries = Array(total).fill("");
}

while (ex.registresSeries.length < total) {
  ex.registresSeries.push("");
}

if (!Array.isArray(ex.camps)) {
  const teNotesAntigues =
    Array.isArray(ex.registresSeries) &&
    ex.registresSeries.some(
      valor => typeof valor === "string" && valor.trim() !== ""
    );

  ex.camps = teNotesAntigues ? ["comentari"] : [];
}

if (!Array.isArray(ex.registresSeries)) {
  ex.registresSeries = Array.from(
    { length: total },
    () => ({})
  );
}

while (ex.registresSeries.length < total) {
  ex.registresSeries.push({});
}

// Conservem les anotacions de text de la versió anterior.
ex.registresSeries = ex.registresSeries.map(valor => {
  if (typeof valor === "string") {
    return { comentari: valor };
  }

  return valor && typeof valor === "object" ? valor : {};
});

const campsConfigurats = ex.camps.filter(
  camp => definicioCamps[camp]
);

const campsSeries = Array.from(
  { length: total },
  (_, index) => `
    <div class="registre-serie">
      <strong>Sèrie ${index + 1}</strong>
      ${campsConfigurats.map(camp => `
        <label>
          ${definicioCamps[camp]}
          <input
            type="text"
            data-serie="${index}"
            data-camp="${camp}"
            value="${escaparHTML(ex.registresSeries[index][camp] || "")}"
            placeholder="Anota ${definicioCamps[camp].toLowerCase()}"
          >
        </label>
      `).join("")}
    </div>
  `
).join("");
    const targeta = document.createElement("article");
    targeta.className = "exercici";

    targeta.innerHTML = `
      <h3>${escaparHTML(ex.nom)}</h3>
      <p>${escaparHTML(ex.detall || "")}</p>
      <div class="comptador">
        <span class="progres">${fetes} / ${total} sèries</span>
        <div>
          <button class="boto-desfer" data-accio="desfer"
            ${fetes === 0 ? "disabled" : ""}>−</button>
          <button class="boto-fet" data-accio="fet"
            ${acabat ? "disabled" : ""}>
            ${acabat ? "Completat ✓" : "+ Sèrie feta"}
          </button>
        </div>
            </div>

      <div class="registres-series">
        <h4>Registre per sèrie</h4>
        ${campsSeries}
      </div>

      
       
<div class="accions-biblioteca">
  <button
    class="boto-secundari"
    data-accio="pujar"
    ${indexEx === 0 ? "disabled" : ""}
    aria-label="Moure exercici amunt"
    title="Moure amunt"
  >↑</button>

  <button
    class="boto-secundari"
    data-accio="baixar"
    ${indexEx === entrenament.exercicis.length - 1 ? "disabled" : ""}
    aria-label="Moure exercici avall"
    title="Moure avall"
  >↓</button>

  <button class="boto-secundari" data-accio="treure">
    Treure d'aquest dia
  </button>
</div>

    `;
targeta.querySelectorAll("input[data-camp]").forEach(camp => {
  camp.addEventListener("input", () => {
    const actual = obtenirEntrenament();

    const index = actual.exercicis.findIndex(
      item => item.instanciaId === ex.instanciaId
    );

    if (index === -1) return;

    const indexSerie = Number(camp.dataset.serie);
    const nomCamp = camp.dataset.camp;
    const exerciciActual = actual.exercicis[index];

    if (!Array.isArray(exerciciActual.registresSeries)) {
      exerciciActual.registresSeries = Array.from(
        { length: Number(exerciciActual.seriesTotals) || 1 },
        () => ({})
      );
    }

    if (
      typeof exerciciActual.registresSeries[indexSerie] !== "object" ||
      exerciciActual.registresSeries[indexSerie] === null
    ) {
      exerciciActual.registresSeries[indexSerie] = {};
    }

    exerciciActual.registresSeries[indexSerie][nomCamp] = camp.value;

    desarEntrenaments();
  });
});
   
targeta.querySelectorAll("button").forEach(boto => {
  boto.addEventListener("click", () => {
    const actual = obtenirEntrenament();

    const index = actual.exercicis.findIndex(
      item => item.instanciaId === ex.instanciaId
    );

    if (index === -1) return;

    if (boto.dataset.accio === "fet") {
      actual.exercicis[index].seriesFetes = Math.min(
        total,
        fetes + 1
      );

    } else if (boto.dataset.accio === "desfer") {
      actual.exercicis[index].seriesFetes = Math.max(
        0,
        fetes - 1
      );

    } else if (boto.dataset.accio === "pujar" && index > 0) {
      const anterior = actual.exercicis[index - 1];

      actual.exercicis[index - 1] = actual.exercicis[index];
      actual.exercicis[index] = anterior;

    } else if (
      boto.dataset.accio === "baixar" &&
      index < actual.exercicis.length - 1
    ) {
      const seguent = actual.exercicis[index + 1];

      actual.exercicis[index + 1] = actual.exercicis[index];
      actual.exercicis[index] = seguent;

    } else if (boto.dataset.accio === "treure") {
      if (
        !confirm("Vols treure aquest exercici d'aquest entrenament?")
      ) {
        return;
      }

      actual.exercicis.splice(index, 1);
    }

    desarEntrenaments();
    dibuixarCalendari();
    mostrarExercicis();
  });
});

  llista.appendChild(targeta);
});
}

// Afegim al dia una còpia de l'exercici de la biblioteca.
function afegirAlDia(id) {
  const ex = biblioteca.find(item => item.id === id);
  if (!ex) return;

  const entrenament = obtenirEntrenament();

entrenament.exercicis.push({
  instanciaId: crearId(),
  exerciciId: ex.id,
  nom: ex.nom,
  detall: ex.detall,
  seriesTotals: ex.seriesTotals,
  seriesFetes: 0,
  camps: [...(ex.camps || [])],
  registresSeries: Array.from(
    { length: ex.seriesTotals },
    () => ({})
  )
});

  desarEntrenaments();
  mostrarExercicis();
}

// Selector per afegir exercicis al dia.
function mostrarSelector() {
  selectorBiblioteca.innerHTML = "";

  if (biblioteca.length === 0) {
    selectorBiblioteca.innerHTML =
      '<p class="missatge-buit">La biblioteca és buida. Crea un exercici a sota.</p>';
    return;
  }

  const select = document.createElement("select");
  select.id = "seleccio-exercici";
  select.setAttribute("aria-label", "Selecciona un exercici");

  biblioteca.forEach(ex => {
    const opcio = document.createElement("option");
    opcio.value = ex.id;
    opcio.textContent = `${ex.nom} — ${ex.seriesTotals} sèries`;
    select.appendChild(opcio);
  });

  const boto = document.createElement("button");
  boto.type = "button";
  boto.className = "boto-fet";
  boto.textContent = "Afegir exercici al dia";
  boto.addEventListener("click", () => afegirAlDia(select.value));

  selectorBiblioteca.append(select, boto);
}

// Mostrem i gestionem la biblioteca.
function mostrarBiblioteca() {
  llistaBiblioteca.innerHTML = "";

  if (biblioteca.length === 0) {
    llistaBiblioteca.innerHTML =
      '<p class="missatge-buit">Encara no hi ha exercicis a la biblioteca.</p>';
    return;
  }

  biblioteca.forEach(ex => {
    const targeta = document.createElement("article");
    targeta.className = "targeta-biblioteca";

    targeta.innerHTML = `
      <h3>${escaparHTML(ex.nom)}</h3>
      <p>${escaparHTML(ex.detall || "")}</p>
      <p>${ex.seriesTotals} sèries</p>
      <div class="accions-biblioteca">
        <button class="boto-fet" data-accio="afegir">Afegir al dia</button>
        <button class="boto-secundari" data-accio="editar">Editar</button>
        <button class="boto-secundari" data-accio="duplicar">Duplicar</button>
        <button class="boto-eliminar" data-accio="eliminar">Eliminar</button>
      </div>
    `;

    targeta.querySelector('[data-accio="afegir"]').addEventListener(
      "click", () => afegirAlDia(ex.id)
    );

    targeta.querySelector('[data-accio="editar"]').addEventListener(
      "click", () => prepararEdicio(ex)
    );
    targeta.querySelector('[data-accio="duplicar"]').addEventListener(
     "click", () => duplicarExercici(ex)
    );
    targeta.querySelector('[data-accio="eliminar"]').addEventListener(
      "click", () => eliminarExercici(ex.id)
    );

    llistaBiblioteca.appendChild(targeta);
  });
}

// Guardem un exercici nou o actualitzem el seleccionat.
formulari.addEventListener("submit", event => {
  event.preventDefault();

  const nom = campNom.value.trim();
  const detall = campDetall.value.trim();
  const total = Number.parseInt(campTotal.value, 10);
  const campsSeleccionats = Array.from(campsExercici)
  .filter(camp => camp.checked)
  .map(camp => camp.value);
  if (!nom || !Number.isInteger(total) || total < 1 || total > 200) {
    alert("Escriu un nom i un nombre de sèries entre 1 i 200.");
    return;
  }

  if (campId.value) {
    const ex = biblioteca.find(item => item.id === campId.value);
    if (ex) {
      ex.nom = nom;
      ex.detall = detall;
      ex.seriesTotals = total;
      ex.camps = [...campsSeleccionats];
    }
  } else {
   biblioteca.push({
  id: crearId(),
  nom,
  detall,
  seriesTotals: total,
  camps: [...campsSeleccionats]
});
  }

  desarBiblioteca();
  cancel·larEdicio();
  mostrarBiblioteca();
  mostrarSelector();
});

// Carreguem les dades d'un exercici al formulari.
function prepararEdicio(ex) {
  campId.value = ex.id;
  campNom.value = ex.nom;
  campDetall.value = ex.detall || "";
  campTotal.value = ex.seriesTotals;
  botoDesar.textContent = "Desar canvis";
  botoCancelar.hidden = false;
  campsExercici.forEach(camp => {
  camp.checked = (ex.camps || []).includes(camp.value);
});
  campNom.focus();
  formulari.scrollIntoView({ behavior: "smooth", block: "center" });
}
// Duplica un exercici de la biblioteca amb un identificador nou.
function duplicarExercici(ex) {
  const copia = {
    ...ex,
    id: crypto.randomUUID(),
    nom: ex.nom + " (còpia)"
  };

  biblioteca.push(copia);
  desarBiblioteca();
  mostrarBiblioteca();
}
function cancel·larEdicio() {
  formulari.reset();
  campId.value = "";
  campTotal.value = 10;
  botoDesar.textContent = "Afegir a la biblioteca";
  botoCancelar.hidden = true;
  campsExercici.forEach(camp => {
  camp.checked = false;
});
}

botoCancelar.addEventListener("click", cancel·larEdicio);

// Eliminar de la biblioteca no elimina còpies d'entrenaments antics.
function eliminarExercici(id) {
  const ex = biblioteca.find(item => item.id === id);
  if (!ex) return;

  if (!confirm(`Vols eliminar "${ex.nom}" de la biblioteca? Els entrenaments ja desats es conservaran.`)) {
    return;
  }

  biblioteca = biblioteca.filter(item => item.id !== id);
  desarBiblioteca();

  if (campId.value === id) cancel·larEdicio();

  mostrarBiblioteca();
  mostrarSelector();
}

// Protegim el HTML quan mostrem noms i detalls escrits per l'usuari.
function escaparHTML(text) {
  return String(text).replace(/[&<>"']/g, caracter => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[caracter]);
}

// En canviar la data, mostrem el registre d'aquell dia.
campData.addEventListener("change", mostrarExercicis);

// Iniciem la pantalla.
inicialitzarCalendari();
mostrarExercicis();
mostrarSelector();
mostrarBiblioteca();
// --- Còpies de seguretat ---

const botoExportar = document.getElementById("boto-exportar");
const botoImportar = document.getElementById("boto-importar");
const fitxerImportacio = document.getElementById("fitxer-importacio");

botoExportar.addEventListener("click", () => {
  const copia = {
    versio: 1,
    dataExportacio: new Date().toISOString(),
    biblioteca: biblioteca,
    entrenaments: entrenaments
  };

  const contingut = JSON.stringify(copia, null, 2);
  const fitxer = new Blob([contingut], {
    type: "application/json"
  });

  const url = URL.createObjectURL(fitxer);
  const enllac = document.createElement("a");

  const dataAvui = new Date().toISOString().slice(0, 10);
  enllac.href = url;
  enllac.download = `copia-entrenaments-${dataAvui}.json`;

  document.body.appendChild(enllac);
  enllac.click();
  enllac.remove();

  URL.revokeObjectURL(url);
});
botoImportar.addEventListener("click", () => {
  fitxerImportacio.click();
});

fitxerImportacio.addEventListener("change", async () => {
  const fitxer = fitxerImportacio.files[0];

  if (!fitxer) return;

  try {
    const textFitxer = await fitxer.text();
    const copia = JSON.parse(textFitxer);

    // Comprovem que el fitxer tingui l'estructura esperada.
    if (
      !copia ||
      copia.versio !== 1 ||
      !Array.isArray(copia.biblioteca) ||
      !copia.entrenaments ||
      typeof copia.entrenaments !== "object" ||
      Array.isArray(copia.entrenaments)
    ) {
      throw new Error("El fitxer no té el format esperat.");
    }

    // Comprovem també que els exercicis tinguin dades vàlides.
    const bibliotecaValida = copia.biblioteca.every(ex =>
      ex &&
      typeof ex.id === "string" &&
      typeof ex.nom === "string" &&
      typeof ex.detall === "string" &&
      Number.isInteger(ex.seriesTotals) &&
      ex.seriesTotals >= 1 &&
      ex.seriesTotals <= 200
    );

    if (!bibliotecaValida) {
      throw new Error("La biblioteca conté exercicis no vàlids.");
    }

    if (
      !confirm(
        "Importar aquesta còpia substituirà la biblioteca i els entrenaments actuals. " +
        "Si vols conservar-los, exporta primer una còpia de seguretat. Continuem?"
      )
    ) {
      return;
    }

    // Conservem una còpia temporal de les dades actuals
    // per si hi ha algun error en desar les importades.
    const bibliotecaAnterior = biblioteca;
    const entrenamentsAnteriors = entrenaments;

    try {
      biblioteca = copia.biblioteca;
      entrenaments = copia.entrenaments;

      desarBiblioteca();
      desarEntrenaments();
    } catch (error) {
      biblioteca = bibliotecaAnterior;
      entrenaments = entrenamentsAnteriors;

      desarBiblioteca();
      desarEntrenaments();

      throw new Error(
        "No s'han pogut desar les dades importades. " +
        "Pot ser que el navegador no tingui prou espai."
      );
    }

    cancel·larEdicio();
    inicialitzarCalendari();
    mostrarBiblioteca();
    mostrarSelector();
    mostrarExercicis();

    alert("Còpia de seguretat importada correctament.");
  } catch (error) {
    alert("No s'ha pogut importar el fitxer: " + error.message);
  } finally {
    // Permet tornar a seleccionar el mateix fitxer.
    fitxerImportacio.value = "";
  }
});