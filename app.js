const CLAU_ENTRENAMENTS = "entrenamentApp";
const CLAU_BIBLIOTECA = "entrenamentBiblioteca";
const exercicisInicials = [
  {
    id: "ex-rmu",
    nom: "Ring Muscle Up",
        seriesTotals: 10,
    repeticions: 1,
    metode: "EMOM",
    durada: 40,
    unitatDurada: "segons"
  },
  {
    id: "ex-pullup",
    nom: "Pull-up",
    seriesTotals: 5,
    repeticions: 10,
    metode: "",
    durada: null,
    unitatDurada: "minuts"
  },
  {
    id: "ex-highpull",
    nom: "High Pull",
    seriesTotals: 6,
    repeticions: 2,
    metode: "",
    durada: null,
    unitatDurada: "minuts"
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
const estatEntrenament = document.getElementById("estat-entrenament");
const textEstatEntrenament = document.getElementById("text-estat-entrenament");
const botoCompletarEntrenament = document.getElementById("boto-completar-entrenament");
const botoDesbloquejarEntrenament = document.getElementById("boto-desbloquejar-entrenament");

// Elements del temporitzador
const panellTemporitzador = document.getElementById("panell-temporitzador");
const botoObrirTemporitzador = document.getElementById("boto-obrir-temporitzador");
const tempsTemporitzador = document.getElementById("temps-temporitzador");
const botoIniciarTemporitzador = document.getElementById("boto-iniciar-temporitzador");
const botoReiniciarTemporitzador = document.getElementById("boto-reiniciar-temporitzador");

// Configuració del temporitzador
const botoCronometre = document.getElementById("boto-cronometre");
const botoCompteEnrere = document.getElementById("boto-compte-enrere");
const selectorTipusTemporitzador = document.querySelector(".selector-tipus-temporitzador");
const temporitzadorActiu = document.getElementById("temporitzador-actiu");
const configuracioCompteEnrere = document.getElementById("configuracio-compte-enrere");
const botoConfirmarCompteEnrere = document.getElementById("boto-confirmar-compte-enrere");
const botoCanviarModalitat = document.getElementById("boto-canviar-modalitat");
const botoTornarModalitats = document.getElementById("boto-tornar-modalitats");
const opcionsCompteEnrere = document.getElementById("opcions-compte-enrere");
const duradaMinuts = document.getElementById("durada-minuts");
const duradaSegons = document.getElementById("durada-segons");

const presetsTemporitzador = document.getElementById("presets-temporitzador");
const botoGestionarPresets = document.getElementById("boto-gestionar-presets");
const gestioPresets = document.getElementById("gestio-presets");
const nouPresetMinuts = document.getElementById("nou-preset-minuts");
const nouPresetSegons = document.getElementById("nou-preset-segons");
const botoAfegirPreset = document.getElementById("boto-afegir-preset");
const llistaGestioPresets = document.getElementById("llista-gestio-presets");

// Temps predefinits inicials, expressats en segons.
let llistaPresets = JSON.parse(
  localStorage.getItem("presetsTemporitzador")
) || [
  30,
  60,
  90,
  120,
  180,
  300
];

function desarPresetsTemporitzador() {
  localStorage.setItem(
    "presetsTemporitzador",
    JSON.stringify(llistaPresets)
  );
}

function netejarPresetSobrer() {
  llistaPresets = llistaPresets.filter(segons => segons !== 31);
  desarPresetsTemporitzador();
}

netejarPresetSobrer();

let anyCalendari;
let mesCalendari;
// Estat del temporitzador
let intervalTemporitzador = null;
let iniciTemporitzador = null;
let duradaTemporitzador = 0;
let tempsAcumulat = 0;
let tipusTemporitzador = null;
let temporitzadorEnMarxa = false;
let compteEnrereAcabat = false;
let contextAudioTemporitzador = null;

function inicialitzarCalendari() {
  const dataInicial = campData.value
    ? new Date(campData.value + "T12:00:00")
    : new Date();

  anyCalendari = dataInicial.getFullYear();
  mesCalendari = dataInicial.getMonth();

  dibuixarCalendari();
}

botoGestionarPresets.addEventListener("click", () => {
  gestioPresets.hidden = !gestioPresets.hidden;
});

botoAfegirPreset.addEventListener("click", () => {
  const minuts = Math.max(0, Math.min(99, Number(nouPresetMinuts.value) || 0));
  const segons = Math.max(0, Math.min(59, Number(nouPresetSegons.value) || 0));

  const nouTemps = minuts * 60 + segons;

  if (nouTemps <= 0) {
    alert("Indica una durada superior a zero.");
    return;
  }

  if (llistaPresets.includes(nouTemps)) {
    alert("Aquest temps ja existeix.");
    return;
  }

  llistaPresets.push(nouTemps);
  llistaPresets.sort((a, b) => a - b);

  desarPresetsTemporitzador();
  mostrarPresetsTemporitzador();

  nouPresetMinuts.value = 0;
  nouPresetSegons.value = 30;
});

function mostrarPresetsTemporitzador() {
  presetsTemporitzador.innerHTML = "";
  llistaGestioPresets.innerHTML = "";

  llistaPresets.forEach((segons, index) => {
    // Botó per seleccionar el temps.
    const boto = document.createElement("button");
    boto.textContent = formatarTemps(segons);
    boto.type = "button";

   boto.addEventListener("click", () => {
      duradaMinuts.value = Math.floor(segons / 60);
      duradaSegons.value = segons % 60;

      seleccionarCompteEnrere();
      confirmarCompteEnrere();
    });

    presetsTemporitzador.appendChild(boto);

    // Fila de gestió del preset.
    const fila = document.createElement("div");
    fila.className = "fila-preset";

    const etiqueta = document.createElement("span");
    etiqueta.textContent = formatarTemps(segons);
    const botoEditar = document.createElement("button");
    botoEditar.textContent = "Editar";
    botoEditar.type = "button";

botoEditar.addEventListener("click", () => {
  const nouValor = prompt(
    "Introdueix el nou temps (MM:SS):",
    formatarTemps(segons)
  );

  if (nouValor === null) return;

  const parts = nouValor.split(":");

  if (parts.length !== 2) {
    alert("Format incorrecte. Utilitza MM:SS.");
    return;
  }

  const minuts = Number(parts[0]);
  const segonsNous = Number(parts[1]);

  if (
    !Number.isInteger(minuts) ||
    !Number.isInteger(segonsNous) ||
    minuts < 0 || minuts > 99 ||
    segonsNous < 0 || segonsNous > 59 ||
    minuts * 60 + segonsNous <= 0
  ) {
    alert("El temps indicat no és vàlid.");
    return;
  }

  const nouTemps = minuts * 60 + segonsNous;

  if (llistaPresets.includes(nouTemps) && nouTemps !== segons) {
    alert("Aquest temps ja existeix.");
    return;
  }

  llistaPresets[index] = nouTemps;
  desarPresetsTemporitzador();
  mostrarPresetsTemporitzador();
});

    const botoPujar = document.createElement("button");
    botoPujar.textContent = "↑";
    botoPujar.type = "button";
    botoPujar.disabled = index === 0;

    botoPujar.addEventListener("click", () => {
      [llistaPresets[index - 1], llistaPresets[index]] =
        [llistaPresets[index], llistaPresets[index - 1]];

      desarPresetsTemporitzador();
      mostrarPresetsTemporitzador();
    });

    const botoBaixar = document.createElement("button");
    botoBaixar.textContent = "↓";
    botoBaixar.type = "button";
    botoBaixar.disabled = index === llistaPresets.length - 1;

    botoBaixar.addEventListener("click", () => {
      [llistaPresets[index], llistaPresets[index + 1]] =
        [llistaPresets[index + 1], llistaPresets[index]];

      desarPresetsTemporitzador();
      mostrarPresetsTemporitzador();
    });

    const botoEliminar = document.createElement("button");
    botoEliminar.textContent = "Eliminar";
    botoEliminar.type = "button";

    botoEliminar.addEventListener("click", () => {
      llistaPresets.splice(index, 1);

      desarPresetsTemporitzador();
      mostrarPresetsTemporitzador();
    });

    fila.appendChild(etiqueta);
    fila.appendChild(botoEditar);
    fila.appendChild(botoPujar);
    fila.appendChild(botoBaixar);
    fila.appendChild(botoEliminar);

    llistaGestioPresets.appendChild(fila);
  });
}

function emetreSoTemporitzador() {
  try {
    if (!contextAudioTemporitzador) {
      contextAudioTemporitzador = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }

    if (contextAudioTemporitzador.state === "suspended") {
      contextAudioTemporitzador.resume();
    }

    const oscil·lador = contextAudioTemporitzador.createOscillator();
    const volum = contextAudioTemporitzador.createGain();

    oscil·lador.type = "sine";
    oscil·lador.frequency.value = 880;

    volum.gain.value = 0.2;

    oscil·lador.connect(volum);
    volum.connect(contextAudioTemporitzador.destination);

    oscil·lador.start();
    oscil·lador.stop(contextAudioTemporitzador.currentTime + 0.5);

  } catch (error) {
    console.log("No s'ha pogut reproduir l'avís sonor:", error);
  }
}

function formatarTemps(segons) {
  const minuts = Math.floor(segons / 60);
  const segonsRestants = segons % 60;

  return (
    String(minuts).padStart(2, "0") +
    ":" +
    String(segonsRestants).padStart(2, "0")
  );
}

function actualitzarPantallaTemporitzador() {
  if (!temporitzadorEnMarxa || !iniciTemporitzador) return;

  const ara = Date.now();
  const transcorregut = tempsAcumulat +
    Math.floor((ara - iniciTemporitzador) / 1000);

  let tempsMostrar;

  if (tipusTemporitzador === "cronometre") {
    tempsMostrar = transcorregut;
  } else {
    tempsMostrar = Math.max(0, duradaTemporitzador - transcorregut);
  }

  tempsTemporitzador.textContent = formatarTemps(tempsMostrar);

  if (tipusTemporitzador === "compte-enrere" && tempsMostrar <= 0) {
  aturarTemporitzador();
  compteEnrereAcabat = true;
  botoIniciarTemporitzador.textContent = "Reiniciar";
  emetreSoTemporitzador();
  alert("Temps acabat!");
}
}

function aturarTemporitzador() {
  if (intervalTemporitzador !== null) {
    clearInterval(intervalTemporitzador);
    intervalTemporitzador = null;
  }

  if (temporitzadorEnMarxa && iniciTemporitzador) {
    tempsAcumulat += Math.floor(
      (Date.now() - iniciTemporitzador) / 1000
    );
  }

  iniciTemporitzador = null;
  temporitzadorEnMarxa = false;
}

function iniciarTemporitzador() {
  if (temporitzadorEnMarxa) return;
  if (!tipusTemporitzador) return;

  iniciTemporitzador = Date.now();
  temporitzadorEnMarxa = true;

  panellTemporitzador.hidden = false;
  botoIniciarTemporitzador.textContent = "Pausar";

  intervalTemporitzador = setInterval(
    actualitzarPantallaTemporitzador,
    250
  );

  actualitzarPantallaTemporitzador();
}

function reiniciarTemporitzador() {
  aturarTemporitzador();

  tempsAcumulat = 0;
  iniciTemporitzador = null;
  compteEnrereAcabat = false;

  if (tipusTemporitzador === "compte-enrere") {
    tempsTemporitzador.textContent = formatarTemps(duradaTemporitzador);
  } else {
    tempsTemporitzador.textContent = "00:00";
  }

  botoIniciarTemporitzador.textContent = "Iniciar";
}

function tancarTemporitzador() {
  aturarTemporitzador();

  tempsAcumulat = 0;
  iniciTemporitzador = null;
  duradaTemporitzador = 0;
  tipusTemporitzador = null;

  temporitzadorActiu.hidden = true;
  configuracioCompteEnrere.hidden = true;
  selectorTipusTemporitzador.hidden = false;
  panellTemporitzador.hidden = true;
  botoIniciarTemporitzador.textContent = "Iniciar";
  tempsTemporitzador.textContent = "00:00";
}

function seleccionarCronometre() {
  aturarTemporitzador();

  tipusTemporitzador = "cronometre";
  tempsAcumulat = 0;
  duradaTemporitzador = 0;
  compteEnrereAcabat = false;

  tempsTemporitzador.textContent = "00:00";

  configuracioCompteEnrere.hidden = true;
  temporitzadorActiu.hidden = false;
  panellTemporitzador.hidden = false;
  selectorTipusTemporitzador.hidden = true;

  botoIniciarTemporitzador.textContent = "Iniciar";
}

function confirmarCompteEnrere() {
  const minuts = Math.max(0, Math.min(99, Number(duradaMinuts.value) || 0));
  const segons = Math.max(0, Math.min(59, Number(duradaSegons.value) || 0));

  duradaMinuts.value = minuts;
  duradaSegons.value = segons;

  duradaTemporitzador = minuts * 60 + segons;

  if (duradaTemporitzador <= 0) {
    alert("Indica una durada superior a zero.");
    return;
  }

  tempsAcumulat = 0;
  compteEnrereAcabat = false;

  tempsTemporitzador.textContent = formatarTemps(duradaTemporitzador);

  configuracioCompteEnrere.hidden = true;
  document.getElementById("temporitzador-actiu").hidden = false;

  botoIniciarTemporitzador.textContent = "Iniciar";
}

function seleccionarCompteEnrere() {
  aturarTemporitzador();

  tipusTemporitzador = "compte-enrere";
  tempsAcumulat = 0;
  compteEnrereAcabat = false;

  configuracioCompteEnrere.hidden = false;
  document.getElementById("temporitzador-actiu").hidden = true;

  panellTemporitzador.hidden = false;
  selectorTipusTemporitzador.hidden = true;
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
const campTotal = document.getElementById("total-series");
const campNotaPermanent = document.getElementById("nota-permanent");
const campRepeticions = document.getElementById("repeticions-exercici");
const campMetode = document.getElementById("metode-exercici");
const campDurada = document.getElementById("durada-exercici");
const campUnitatDurada = document.getElementById("unitat-durada");
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
    entrenaments[data] = {
      exercicis: [],
      completat: false
    };
  }

  // Els entrenaments antics també reben l'estat inicial.
  if (typeof entrenaments[data].completat !== "boolean") {
    entrenaments[data].completat = false;
  }

  return entrenaments[data];
}

// Calcular i mostrar les estadístiques d'entrenament.
function mostrarEstadistiques() {
  const avui = new Date();
  const anyActual = avui.getFullYear();
  const mesActual = avui.getMonth();

  let totalAny = 0;
  let totalMes = 0;

  const activitatMensual = Array(12).fill(0);

  // Recorrem tots els entrenaments registrats.
  Object.entries(entrenaments).forEach(([data, entrenament]) => {
    if (!entrenament.completat) return;

    const coincidencia = data.match(/^(\d{4})-(\d{2})-\d{2}$/);
    if (!coincidencia) return;

    const any = Number(coincidencia[1]);
    const mes = Number(coincidencia[2]) - 1;

    // Només comptem els entrenaments de l'any actual.
    if (any !== anyActual || mes < 0 || mes > 11) return;

    totalAny++;
    activitatMensual[mes]++;

    if (mes === mesActual) {
      totalMes++;
    }
  });

  // Calculem la mitjana mensual fins al mes actual.
  const mitjana = totalAny / (mesActual + 1);

  document.getElementById("estadistica-mes").textContent = totalMes;
  document.getElementById("estadistica-any").textContent = totalAny;
  document.getElementById("estadistica-mitjana").textContent =
    mitjana.toLocaleString("ca-ES", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    });

  // Preparem les dades del gràfic.
  mostrarGraficActivitat(activitatMensual);
}

// Mostrar el gràfic d'activitat mensual.
function mostrarGraficActivitat(dades) {
  const contenidor = document.getElementById("grafic-activitat");

  const mesos = [
    "Gen", "Feb", "Mar", "Abr",
    "Mai", "Jun", "Jul", "Ago",
    "Set", "Oct", "Nov", "Des"
  ];

  const maxim = Math.max(...dades, 1);

  contenidor.innerHTML = dades.map((total, index) => {
    const altura = total > 0
      ? Math.max((total / maxim) * 100, 5)
      : 0;

    return `
      <div class="barra-mes">
        <span class="valor-mes">${total}</span>
        <div class="zona-barra">
          <div class="barra-activitat" style="height: ${altura}%"></div>
        </div>
        <span class="etiqueta-mes">${mesos[index]}</span>
      </div>
    `;
  }).join("");
}

// Actualitzem els controls segons l'estat de l'entrenament.
function mostrarEstatEntrenament() {
  const entrenament = obtenirEntrenament();
  const completat = entrenament.completat;

  textEstatEntrenament.textContent = completat
  ? "Entrenament completat ✓"
  : "Entrenament en curs";

   textEstatEntrenament.classList.toggle("estat-completat", completat);

  botoCompletarEntrenament.hidden = completat;
  botoDesbloquejarEntrenament.hidden = !completat;

  botoCompletarEntrenament.textContent = "🔓";
  botoCompletarEntrenament.title = "Entrenament obert · Clica per bloquejar";
  botoCompletarEntrenament.setAttribute(
    "aria-label",
    "Entrenament obert · Clica per bloquejar"
  );

  botoDesbloquejarEntrenament.textContent = "🔒";
  botoDesbloquejarEntrenament.title = "Entrenament bloquejat · Clica per desbloquejar";
  botoDesbloquejarEntrenament.setAttribute(
    "aria-label",
    "Entrenament bloquejat · Clica per desbloquejar"
  );
}

// Marquem l'entrenament com a completat.
botoCompletarEntrenament.addEventListener("click", () => {
  const entrenament = obtenirEntrenament();

  if (!confirm("Vols marcar aquest entrenament com a completat?")) {
    return;
  }

  entrenament.completat = true;

  desarEntrenaments();
  mostrarEstadistiques();
  mostrarEstatEntrenament();
  mostrarExercicis();
  mostrarSelector();
  mostrarBiblioteca();
});

// Desbloquegem l'entrenament.
botoDesbloquejarEntrenament.addEventListener("click", () => {
  const entrenament = obtenirEntrenament();

  if (!confirm("Vols desbloquejar aquest entrenament per poder editar-lo?")) {
    return;
  }

  entrenament.completat = false;

  desarEntrenaments();
  mostrarEstadistiques();
  mostrarEstatEntrenament();
  mostrarExercicis();
  mostrarSelector();
  mostrarBiblioteca();
});

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
  contenidor.innerHTML = `
    <p>Encara no hi ha cap entrenament anterior a la data seleccionada.</p>
  `;
  contenidor.hidden = false;
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

// Recordem quines targetes completades estan desplegades.
const exercicisDesplegats = new Set();
const exercicisPlegats = new Set();

// Mostrem els exercicis del dia.
function mostrarExercicis() {
  llista.innerHTML = "";
  const entrenament = obtenirEntrenament();
  const bloquejat = entrenament.completat;

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
      <strong>Ronda ${index + 1}</strong>
      ${campsConfigurats.map(camp => `
        <label aria-label="${definicioCamps[camp]}">
          <input
            type="text"
            data-serie="${index}"
            data-camp="${camp}"
            value="${escaparHTML(ex.registresSeries[index][camp] || "")}"
            ${bloquejat ? "disabled" : ""}
            placeholder="Anota ${definicioCamps[camp].toLowerCase()}"
          >
        </label>
      `).join("")}
    </div>
  `
).join("");
     const blocRegistres = campsConfigurats.length > 0
     ? `
    <div class="registres-series">
      ${campsSeries}
    </div>
    `
  : "";
    const targeta = document.createElement("article");
targeta.className = acabat
  ? "exercici completat"
  : fetes > 0
    ? "exercici en-curs"
    : "exercici";

    const desplegat = exercicisPlegats.has(ex.instanciaId)
       ? false
       : acabat
          ? exercicisDesplegats.has(ex.instanciaId)
          : true;

targeta.innerHTML = `
  <div class="capcalera-exercici">
    <div>
      <h3>${escaparHTML(ex.nom)}</h3>
    ${acabat
      ? `<p>${fetes} / ${total} rondes · <span class="text-completat">Completat ✓</span></p>`
      : `<p>${escaparHTML(resumExercici(ex))}</p>`
     } 
    </div>

    <button 
       type="button"
       class="boto-plegar"
       data-accio="plegar"
       aria-expanded="${desplegat}">
      ${desplegat ? "Plegar ▲" : "Desplegar ▼"}
     </button>
  </div>

  <div class="contingut-exercici" ${desplegat ? "" : "hidden"}>
        <div class="comptador">
          <span class="progres">${fetes} / ${total} rondes</span>
          <div>
            <button class="boto-desfer" data-accio="desfer"
              ${fetes === 0 || bloquejat ? "disabled" : ""}>−</button>

           <button class="boto-fet" data-accio="fet"
              ${acabat || bloquejat ? "disabled" : ""}>
              ${acabat ? "Completat ✓" : "+ Ronda feta"}
           </button>
          </div>
        </div>

      ${blocRegistres}

      <div class="notes-exercici nota-permanent">
        <label>
          Nota permanent de l'exercici
          <textarea
            data-accio="nota-permanent"
            ${bloquejat ? "disabled" : ""}
            placeholder="Ex. Provar d'incrementar 2,5 kg..."
          >${escaparHTML(ex.notaPermanent || "")}</textarea>
        </label>
      </div>

      <div class="notes-exercici">
        <label>
          Notes d'aquesta sessió
          <textarea
            data-accio="notes"
            ${bloquejat ? "disabled" : ""}
            placeholder="Ex. Incrementar pes en el proper entrenament..."
          >${escaparHTML(ex.notes || "")}</textarea>
        </label>
      </div>
      
       
<div class="accions-biblioteca">
  <button
    class="boto-secundari"
    data-accio="pujar"
    ${indexEx === 0 || bloquejat ? "disabled" : ""}
    aria-label="Moure exercici amunt"
    title="Moure amunt"
  >↑</button>

  <button
    class="boto-secundari"
    data-accio="baixar"
    ${indexEx === entrenament.exercicis.length - 1 || bloquejat ? "disabled" : ""}
    aria-label="Moure exercici avall"
    title="Moure avall"
  >↓</button>

  <button class="boto-secundari" data-accio="treure">
    Treure d'aquest dia
    ${bloquejat ? "disabled" : ""}
  </button>
</div>

</div>
    `;
targeta.querySelectorAll("input[data-camp]").forEach(camp => {
  camp.addEventListener("input", () => {
    const actual = obtenirEntrenament();
    if (actual.completat) return;
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
   
targeta.querySelector('[data-accio="notes"]').addEventListener("input", event => {
  const actual = obtenirEntrenament();

  if (actual.completat) return;

  const exerciciActual = actual.exercicis.find(
    item => item.instanciaId === ex.instanciaId
  );

  if (!exerciciActual) return;

  exerciciActual.notes = event.target.value;
  desarEntrenaments();
});

targeta.querySelector('[data-accio="nota-permanent"]').addEventListener("input", event => {
  const actual = obtenirEntrenament();

  if (actual.completat) return;

  const exerciciActual = actual.exercicis.find(
    item => item.instanciaId === ex.instanciaId
  );

  if (!exerciciActual) return;

  const nota = event.target.value;

  exerciciActual.notaPermanent = nota;

  const exerciciBiblioteca = biblioteca.find(
    item => item.id === exerciciActual.exerciciId
  );

  if (exerciciBiblioteca) {
    exerciciBiblioteca.notaPermanent = nota;
    desarBiblioteca();
  }

  desarEntrenaments();
  mostrarBiblioteca();
});

targeta.querySelectorAll("button").forEach(boto => {
  boto.addEventListener("click", () => {

  if (boto.dataset.accio === "plegar") {
    if (desplegat) {
      exercicisPlegats.add(ex.instanciaId);
      exercicisDesplegats.delete(ex.instanciaId);
    } else {
      exercicisPlegats.delete(ex.instanciaId);
      exercicisDesplegats.add(ex.instanciaId);
    }

    mostrarExercicis();
    return;
   }

    const actual = obtenirEntrenament();
    if (actual.completat) return;
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
  if (entrenament.completat) {
  alert("Aquest entrenament està bloquejat. Desbloqueja'l per afegir exercicis.");
  return;
  }
entrenament.exercicis.push({
  instanciaId: crearId(),
  exerciciId: ex.id,
  nom: ex.nom,
  seriesTotals: ex.seriesTotals,
  repeticions: ex.repeticions ?? null,
  metode: ex.metode || "",
  durada: ex.durada ?? null,
  unitatDurada: ex.unitatDurada || "segons",
  notaPermanent: ex.notaPermanent || "",
  notes: "",
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

// Construïm un resum de les característiques de l'exercici.
function resumExercici(ex) {
  const parts = [`${ex.seriesTotals} rondes`];

  if (ex.repeticions) {
    parts.push(`${ex.repeticions} repeticions`);
  }

  if (ex.metode) {
    parts.push(ex.metode);
  }

  if (ex.durada) {
    parts.push(`${ex.durada} ${ex.unitatDurada || "segons"}`);
  }

  return parts.join(" · ");
}

// Selector per afegir exercicis al dia.
function mostrarSelector() {
  selectorBiblioteca.innerHTML = "";
  const entrenament = obtenirEntrenament();
  const bloquejat = entrenament.completat;
  if (biblioteca.length === 0) {
    selectorBiblioteca.innerHTML =
      '<p class="missatge-buit">La biblioteca és buida. Crea un exercici a sota.</p>';
    return;
  }

  const select = document.createElement("select");
  select.id = "seleccio-exercici";
  select.setAttribute("aria-label", "Selecciona un exercici");

  [...biblioteca]
      .sort((a, b) => a.nom.localeCompare(b.nom, "ca", { sensitivity: "base" }))
      .forEach(ex => {
    const opcio = document.createElement("option");
    opcio.value = ex.id;
    opcio.textContent = `${ex.nom} — ${resumExercici(ex)}`;
    select.appendChild(opcio);
  });

  const boto = document.createElement("button");
  boto.type = "button";
  boto.className = "boto-fet";
  boto.textContent = bloquejat
     ? "Entrenament bloquejat"
     : "Afegir exercici al dia";
  boto.disabled = bloquejat;
  select.disabled = bloquejat;
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

  [...biblioteca]
     .sort((a, b) => a.nom.localeCompare(b.nom, "ca", { sensitivity: "base" }))
     .forEach(ex => {
    const targeta = document.createElement("article");
    targeta.className = "targeta-biblioteca";

    targeta.innerHTML = `
      <h3>${escaparHTML(ex.nom)}</h3>
      <p>${escaparHTML(resumExercici(ex))}</p>
      ${ex.notaPermanent
        ? `<p class="nota-permanent">📝 ${escaparHTML(ex.notaPermanent)}</p>`
        : ""}
      <div class="accions-biblioteca">
        <button
            class="boto-fet"
            data-accio="afegir"
            ${obtenirEntrenament().completat ? "disabled" : ""}
         >Afegir al dia</button>
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

  const nom = campNom.value.trim().toUpperCase();
  const total = Number.parseInt(campTotal.value, 10);
  const repeticions = campRepeticions.value === ""
    ? null
    : Number.parseInt(campRepeticions.value, 10);
  const metode = campMetode.value;
  const durada = campDurada.value === ""
    ? null
    : Number.parseInt(campDurada.value, 10);
  const unitatDurada = campUnitatDurada.value;
  const campsSeleccionats = Array.from(campsExercici)
    .filter(camp => camp.checked)
    .map(camp => camp.value);

  if (!nom || !Number.isInteger(total) || total < 1 || total > 200) {
    alert("Escriu un nom i un nombre de rondes entre 1 i 200.");
    return;
  }

  if (repeticions !== null &&
      (!Number.isInteger(repeticions) || repeticions < 1 || repeticions > 200)) {
    alert("Les repeticions han de ser entre 1 i 200.");
    return;
  }

  if (durada !== null &&
      (!Number.isInteger(durada) || durada < 1)) {
    alert("La durada ha de ser un nombre enter positiu.");
    return;
  }

  const dadesExercici = {
    nom,
    notaPermanent: campNotaPermanent.value.trim(),
    seriesTotals: total,
    repeticions,
    metode,
    durada,
    unitatDurada,
    camps: [...campsSeleccionats]
  };

  if (campId.value) {
    const ex = biblioteca.find(item => item.id === campId.value);
    if (ex) {
      Object.assign(ex, dadesExercici);
    }
  } else {
    biblioteca.push({
      id: crearId(),
      ...dadesExercici
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
  campNotaPermanent.value = ex.notaPermanent || "";
  campTotal.value = ex.seriesTotals;
  campRepeticions.value = ex.repeticions ?? "";
  campMetode.value = ex.metode || "";
  campDurada.value = ex.durada ?? "";
  campUnitatDurada.value = ex.unitatDurada || "segons";

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

  campRepeticions.value = "";
  campMetode.value = "";
  campDurada.value = "";
  campUnitatDurada.value = "segons";

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
campData.addEventListener("change", () => {
  mostrarExercicis();
  mostrarEstatEntrenament();
});

// Iniciem la pantalla.
inicialitzarCalendari();
mostrarExercicis();
mostrarEstatEntrenament();
mostrarSelector();
mostrarBiblioteca();
// --- Còpies de seguretat ---

const botoExportar = document.getElementById("boto-exportar");
const botoImportar = document.getElementById("boto-importar");
const fitxerImportacio = document.getElementById("fitxer-importacio");
const botoExportarBiblioteca = document.getElementById("boto-exportar-biblioteca");
const botoImportarBiblioteca = document.getElementById("boto-importar-biblioteca");
const fitxerImportacioBiblioteca = document.getElementById("fitxer-importacio-biblioteca");

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
botoExportarBiblioteca.addEventListener("click", () => {
  const copia = {
    versio: 1,
    tipus: "biblioteca-entrenaments",
    dataExportacio: new Date().toISOString(),
    biblioteca: biblioteca
  };

  const contingut = JSON.stringify(copia, null, 2);
  const fitxer = new Blob([contingut], { type: "application/json" });
  const url = URL.createObjectURL(fitxer);

  const enllac = document.createElement("a");
  const dataAvui = new Date().toISOString().slice(0, 10);

  enllac.href = url;
  enllac.download = `biblioteca-entrenaments-${dataAvui}.json`;

  document.body.appendChild(enllac);
  enllac.click();
  enllac.remove();

  URL.revokeObjectURL(url);
});
botoImportarBiblioteca.addEventListener("click", () => {
  fitxerImportacioBiblioteca.click();
});

fitxerImportacioBiblioteca.addEventListener("change", async () => {
  const fitxer = fitxerImportacioBiblioteca.files[0];

  if (!fitxer) return;

  try {
    const textFitxer = await fitxer.text();
    const copia = JSON.parse(textFitxer);

    if (
      !copia ||
      copia.versio !== 1 ||
      copia.tipus !== "biblioteca-entrenaments" ||
      !Array.isArray(copia.biblioteca)
    ) {
      throw new Error("El fitxer no té el format de biblioteca esperat.");
    }

    const bibliotecaValida = copia.biblioteca.every(ex =>
      ex &&
      typeof ex.id === "string" &&
      typeof ex.nom === "string" &&
      Number.isInteger(ex.seriesTotals) &&
      ex.seriesTotals >= 1 &&
      ex.seriesTotals <= 200
    );

    if (!bibliotecaValida) {
      throw new Error("La biblioteca conté exercicis no vàlids.");
    }

    const ids = copia.biblioteca.map(ex => ex.id);

    if (new Set(ids).size !== ids.length) {
      throw new Error("La biblioteca conté identificadors duplicats.");
    }

    const continuar = confirm(
      "Aquesta operació substituirà la biblioteca actual, però NO modificarà els entrenaments registrats. Continuem?"
    );

    if (!continuar) return;

    const bibliotecaAnterior = biblioteca;

    try {
      biblioteca = copia.biblioteca;
      desarBiblioteca();
    } catch (error) {
      biblioteca = bibliotecaAnterior;
      desarBiblioteca();

      throw new Error(
        "No s'ha pogut desar la biblioteca importada. Pot ser que el navegador no tingui prou espai."
      );
    }

    cancel·larEdicio();
    mostrarBiblioteca();
    mostrarSelector();
    mostrarExercicis();

    alert("Biblioteca importada correctament. Els entrenaments registrats no s'han modificat.");

  } catch (error) {
    alert("No s'ha pogut importar la biblioteca: " + error.message);

  } finally {
    fitxerImportacioBiblioteca.value = "";
  }
});

// Elements del menú i dels panells
const botoBiblioteca = document.getElementById("boto-biblioteca");
const panellBiblioteca = document.getElementById("panell-biblioteca");
const botoGestioDades = document.getElementById("boto-gestio-dades");
const panellGestioBiblioteca = document.getElementById("panell-gestio-biblioteca");
const panellCopiaSeguretat = document.getElementById("panell-copia-seguretat");
const panellEstadistiques = document.getElementById("panell-estadistiques");
const botoUltimEntrenament = document.getElementById("boto-ultim-entrenament");
const panellUltimEntrenament = document.getElementById("ultim-entrenament");
const botoCalendari = document.getElementById("boto-calendari");
const panellCalendari = document.getElementById("panell-calendari");


// Tancar tots els panells secundaris
function tancarPanellsSecundaris() {
  panellBiblioteca.hidden = true;
  panellGestioBiblioteca.hidden = true;
  panellCopiaSeguretat.hidden = true;
  panellEstadistiques.hidden = true;
  panellUltimEntrenament.hidden = true;
  panellCalendari.hidden = true;
}

function actualitzarMenuActiu(botoActiu = null) {
  const botonsMenu = [
    botoCalendari,
    botoUltimEntrenament,
    botoBiblioteca,
    botoGestioDades
  ];

  botonsMenu.forEach(boto => {
    boto.classList.remove("actiu");
  });

  if (botoActiu) {
    botoActiu.classList.add("actiu");
  }
}

// Obrir i tancar el calendari
botoCalendari.addEventListener("click", () => {
  const mostrar = panellCalendari.hidden;

  tancarPanellsSecundaris();
  panellCalendari.hidden = !mostrar;

  actualitzarMenuActiu(mostrar ? botoCalendari : null);
});

// Obrir i tancar la biblioteca
botoBiblioteca.addEventListener("click", () => {
  const mostrar = panellBiblioteca.hidden;

  tancarPanellsSecundaris();
  panellBiblioteca.hidden = !mostrar;

  actualitzarMenuActiu(mostrar ? botoBiblioteca : null);
});

// Obrir i tancar la gestió de dades
botoGestioDades.addEventListener("click", () => {
  const mostrar = panellGestioBiblioteca.hidden;

  tancarPanellsSecundaris();
  panellGestioBiblioteca.hidden = !mostrar;
  panellCopiaSeguretat.hidden = !mostrar;
  panellEstadistiques.hidden = !mostrar;
  if (mostrar) {
    mostrarEstadistiques();
  }
  actualitzarMenuActiu(mostrar ? botoGestioDades : null);
});

// Obrir i tancar l'últim entrenament
botoUltimEntrenament.addEventListener("click", () => {
  const mostrar = panellUltimEntrenament.hidden;

  tancarPanellsSecundaris();

  if (mostrar) {
    mostrarUltimEntrenament();
  }

  actualitzarMenuActiu(mostrar ? botoUltimEntrenament : null);
});

// Connectem els controls del temporitzador.

botoCronometre.addEventListener("click", seleccionarCronometre);

botoCompteEnrere.addEventListener("click", seleccionarCompteEnrere);
botoConfirmarCompteEnrere.addEventListener("click", confirmarCompteEnrere);
botoTornarModalitats.addEventListener("click", () => {
  configuracioCompteEnrere.hidden = true;
  selectorTipusTemporitzador.hidden = false;
});

botoCanviarModalitat.addEventListener("click", () => {
  
  aturarTemporitzador();
  reiniciarTemporitzador();

  temporitzadorActiu.hidden = true;
  configuracioCompteEnrere.hidden = true;
  selectorTipusTemporitzador.hidden = false;
});
botoIniciarTemporitzador.addEventListener("click", () => {
  if (compteEnrereAcabat) {
    reiniciarTemporitzador();
    return;
  }

  if (temporitzadorEnMarxa) {
    aturarTemporitzador();
    botoIniciarTemporitzador.textContent = "Reprendre";
  } else {
    iniciarTemporitzador();
  }
});

botoReiniciarTemporitzador.addEventListener("click", reiniciarTemporitzador);

mostrarPresetsTemporitzador();

botoObrirTemporitzador.addEventListener("click", () => {
  panellTemporitzador.hidden = !panellTemporitzador.hidden;

  botoObrirTemporitzador.classList.toggle(
    "actiu",
    !panellTemporitzador.hidden
  );
});