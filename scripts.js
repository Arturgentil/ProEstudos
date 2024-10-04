function showSection(sectionId) {
  document.querySelectorAll('.content').forEach(section => {
    section.classList.add('hidden');
  });
  document.getElementById(sectionId).classList.remove('hidden');
}

function adicionarMeta() {
  const novaMeta = document.getElementById('novaMeta').value;
  const porcentagemMeta = document.getElementById('porcentagemMeta').value;

  if (novaMeta && porcentagemMeta >= 0 && porcentagemMeta <= 100) {
    const li = document.createElement('li');
    li.classList.add('meta-item');
    li.innerHTML = `
      <span>${novaMeta} - <span class="metaPorcentagem">${porcentagemMeta}%</span></span>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${porcentagemMeta}%">${porcentagemMeta}%</div>
        </div>
      </div>
      <button class="editar-btn">Editar</button>
      <button class="apagar-btn">Apagar</button>
    `;
    document.getElementById('listaMetas').appendChild(li);
    document.getElementById('novaMeta').value = '';
    document.getElementById('porcentagemMeta').value = '';
    salvarMetasNoStorage(novaMeta, porcentagemMeta);

    // Adiciona event listeners aos botões
    li.querySelector('.editar-btn').addEventListener('click', () => editarMeta(li));
    li.querySelector('.apagar-btn').addEventListener('click', () => removerMeta(li));
  } else {
    alert('Por favor, preencha todos os campos corretamente.');
  }
}

function editarMeta(li) {
  const porcentagemSpan = li.querySelector('.metaPorcentagem');
  const metaSpan = li.querySelector('span');
  const porcentagemAtual = porcentagemSpan.innerText.replace('%', '');

  const novaPorcentagem = prompt('Digite a nova porcentagem (0-100):', porcentagemAtual);

  if (novaPorcentagem !== null && !isNaN(novaPorcentagem) && novaPorcentagem >= 0 && novaPorcentagem <= 100) {
    porcentagemSpan.innerText = novaPorcentagem + '%';
    const progressBar = li.querySelector('.progress-bar-fill');
    progressBar.style.width = novaPorcentagem + '%';
    progressBar.innerText = novaPorcentagem + '%';

    atualizarMetaNoStorage(metaSpan.innerText.split(' - ')[0], novaPorcentagem);
  } else {
    alert('Por favor, insira uma porcentagem válida entre 0 e 100.');
  }
}

function removerMeta(li) {
  li.remove();
  
  const meta = li.querySelector('span').innerText.split(' - ')[0];
  removerMetaDoStorage(meta);
}

function salvarMetasNoStorage(meta, porcentagem) {
  const metas = JSON.parse(localStorage.getItem('metas')) || [];
  metas.push({ meta, porcentagem });
  localStorage.setItem('metas', JSON.stringify(metas));
}

function atualizarMetaNoStorage(meta, novaPorcentagem) {
  const metas = JSON.parse(localStorage.getItem('metas')) || [];
  const index = metas.findIndex(m => m.meta === meta);
  if (index !== -1) {
    metas[index].porcentagem = novaPorcentagem;
    localStorage.setItem('metas', JSON.stringify(metas));
  }
}

function removerMetaDoStorage(meta) {
  let metas = JSON.parse(localStorage.getItem('metas')) || [];
  metas = metas.filter(m => m.meta !== meta);
  localStorage.setItem('metas', JSON.stringify(metas));
}

function carregarMetas() {
  const metas = JSON.parse(localStorage.getItem('metas')) || [];
  metas.forEach(({ meta, porcentagem }) => {
    const li = document.createElement('li');
    li.classList.add('meta-item');
    li.innerHTML = `
      <span>${meta} - <span class="metaPorcentagem">${porcentagem}%</span></span>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-bar-fill" style="width: ${porcentagem}%">${porcentagem}%</div>
        </div>
      </div>
      <button class="editar-btn">Editar</button>
      <button class="apagar-btn">Apagar</button>
    `;
    document.getElementById('listaMetas').appendChild(li);

    // Adiciona event listeners aos botões
    li.querySelector('.editar-btn').addEventListener('click', () => editarMeta(li));
    li.querySelector('.apagar-btn').addEventListener('click', () => removerMeta(li));
  });
}

function gerarCalendario() {
  const calendar = document.getElementById('calendar');
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  const dataAtual = new Date();
  const mesAtual = dataAtual.getMonth(); 
  const anoAtual = dataAtual.getFullYear();
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate(); 

  diasSemana.forEach(dia => {
    const diaElement = document.createElement('div');
    diaElement.classList.add('calendar-day');
    diaElement.textContent = dia;
    calendar.appendChild(diaElement);
  });

  for (let i = 1; i <= diasNoMes; i++) {
    const diaElement = document.createElement('div');
    diaElement.classList.add('calendar-day');
    diaElement.dataset.dia = i; 
    diaElement.innerHTML = `
      ${i}
      <div class="day-tasks">
        <input type="text" class="task-input" placeholder="Adicionar tarefa">
        <button onclick="adicionarTarefa(${i})">Adicionar</button>
        <ul class="task-list" id="tasks-${i}"></ul>
      </div>
    `;
    diaElement.addEventListener('click', () => abrirBlocoNotas(i));
    calendar.appendChild(diaElement);
  }
}

function abrirBlocoNotas(dia) {
  document.getElementById('notepad').classList.remove('hidden');
  document.getElementById('selected-date').innerText = `Dia ${dia}`;
  document.getElementById('notepad-content').value = localStorage.getItem(`notepad-${dia}`) || '';
  atualizarListaNotas();
  carregarTarefas(dia); // Carrega as tarefas ao abrir o bloco de notas

  const apagarBtn = document.getElementById('apagar-notas');
  apagarBtn.onclick = function() {
    if (confirm('Você realmente deseja apagar as notas?')) {
      localStorage.removeItem(`notepad-${dia}`);
      document.getElementById('notepad-content').value = '';
      atualizarListaNotas();
    }
  };
}

function salvarNotas() {
  const dia = document.getElementById('selected-date').innerText.split(' ')[1];
  const notas = document.getElementById('notepad-content').value;
  localStorage.setItem(`notepad-${dia}`, notas);
  alert('Notas salvas com sucesso!');
  atualizarListaNotas();
}

function adicionarTarefa(dia) {
  const taskInput = document.querySelector(`#tasks-${dia} .task-input`);
  const taskList = document.getElementById(`tasks-${dia}`);
  const tarefa = taskInput.value;

  if (tarefa) {
    const li = document.createElement('li');
    li.textContent = tarefa;
    taskList.appendChild(li);
    taskInput.value = '';

    const tarefas = JSON.parse(localStorage.getItem(`tarefas-${dia}`)) || [];
    tarefas.push(tarefa);
    localStorage.setItem(`tarefas-${dia}`, JSON.stringify(tarefas));
  }
}

function carregarTarefas(dia) {
  const taskList = document.getElementById(`tasks-${dia}`);
  taskList.innerHTML = '';

  const tarefas = JSON.parse(localStorage.getItem(`tarefas-${dia}`)) || [];
  tarefas.forEach(tarefa => {
    const li = document.createElement('li');
    li.textContent = tarefa;
    taskList.appendChild(li);
  });
}

function atualizarListaNotas() {
  const notesList = document.getElementById('notes-list');
  notesList.innerHTML = '';

  for (let i = 1; i <= 31; i++) {
    const nota = localStorage.getItem(`notepad-${i}`);
    if (nota) {
      const li = document.createElement('li');
      li.textContent = `Dia ${i}: ${nota}`; 
      notesList.appendChild(li);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  gerarCalendario();
  carregarMetas();
  atualizarListaNotas();
});
