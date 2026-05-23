function verificarAutenticacao() {
    const path = window.location.pathname;
    if (path.indexOf('index.html') === -1 && path !== '/' && !path.endsWith('SGA/')) {
        const isLogged = sessionStorage.getItem('isLogged');
        const userType = sessionStorage.getItem('userType');
        
        if (!isLogged) {
            window.location.href = 'index.html';
            return;
        }

        if (userType === 'aluno' && path.indexOf('painel_aluno.html') === -1) {
            window.location.href = 'painel_aluno.html';
        } else if (userType === 'professor' && path.indexOf('painel_professor.html') === -1) {
            window.location.href = 'painel_professor.html';
        } else if (userType === 'admin' && (path.indexOf('painel_aluno.html') !== -1 || path.indexOf('painel_professor.html') !== -1)) {
            window.location.href = 'dashboard.html';
        }
    }
}
verificarAutenticacao();

function fazerLogout(event) {
    if(event) event.preventDefault();
    sessionStorage.removeItem('isLogged');
    sessionStorage.removeItem('userType');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('userName');
    window.location.href = 'index.html';
}


// Chaves utilizadas para armazenar as tabelas no navegador do usuário
const STORAGE_KEYS = {
    ALUNOS: 'sga_alunos',
    PROFESSORES: 'sga_professores',
    DISCIPLINAS: 'sga_disciplinas',
    NOTAS: 'sga_notas',
    TURMAS: 'sga_turmas'
};

let editId = null;

// Função global para buscar dados salvos no navegador. Retorna um array vazio se não houver dados.
function getDados(key) {
    const dados = localStorage.getItem(key);
    return dados ? JSON.parse(dados) : [];
}

// Função global para salvar ou atualizar dados no navegador convertendo o array para texto JSON.
function salvarDados(key, dados) {
    localStorage.setItem(key, JSON.stringify(dados));
}

// ---------------- ALUNOS ----------------

function cadastrarAluno() {
    const nome = document.getElementById('nome-aluno').value;
    const matricula = document.getElementById('matricula-aluno').value;
    const email = document.getElementById('email-aluno').value;
    const nascimento = document.getElementById('nascimento-aluno').value;
    const status = document.getElementById('status-aluno').value;

    let alunos = getDados(STORAGE_KEYS.ALUNOS);

   
    // Caso contrário, é a criação de um novo registro.
    if (editId) {
        alunos = alunos.map(a => a.id === editId ? { ...a, nome, matricula, email, nascimento, status } : a);
        mostrarToast('Aluno atualizado com sucesso!', 'success');
    } else {
        alunos.push({ id: Date.now(), nome, matricula, email, nascimento, status });
        mostrarToast('Aluno cadastrado com sucesso!', 'success');
    }

    salvarDados(STORAGE_KEYS.ALUNOS, alunos);
    document.getElementById('form-aluno').reset();
    editId = null;
    carregarAlunos();
    return false;
}

function editarAluno(id) {
    const alunos = getDados(STORAGE_KEYS.ALUNOS);
    const aluno = alunos.find(a => a.id === id);
    if (aluno) {
        document.getElementById('nome-aluno').value = aluno.nome;
        document.getElementById('matricula-aluno').value = aluno.matricula;
        document.getElementById('email-aluno').value = aluno.email;
        document.getElementById('nascimento-aluno').value = aluno.nascimento;
        document.getElementById('status-aluno').value = aluno.status;
        editId = id;
        window.scrollTo(0, 0);
    }
}

function verBoletim(alunoId) {
    const alunos = getDados(STORAGE_KEYS.ALUNOS);
    const aluno = alunos.find(a => a.id === alunoId);
    if (!aluno) return;

    document.getElementById('boletim-nome').textContent = aluno.nome;
    document.getElementById('boletim-matricula').textContent = aluno.matricula;

    const notas = getDados(STORAGE_KEYS.NOTAS).filter(n => parseInt(n.alunoId) === alunoId);
    const tbody = document.getElementById('tabela-boletim');
    if(!tbody) return;
    tbody.innerHTML = '';

    if (notas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma nota lançada.</td></tr>';
    } else {
        notas.forEach(n => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${n.turma}</td>
                <td>${parseFloat(n.nota1).toFixed(1)}</td>
                <td>${parseFloat(n.nota2).toFixed(1)}</td>
                <td><strong>${n.media}</strong></td>
                <td><span class="badge ${n.situacao === 'Aprovado' ? 'bg-success' : 'bg-danger'}">${n.situacao}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }

    const modal = new bootstrap.Modal(document.getElementById('modalBoletim'));
    modal.show();
}

function carregarAlunos() {
    const tabela = document.getElementById('tabela-alunos');
    if (!tabela) return;

    const alunos = getDados(STORAGE_KEYS.ALUNOS);
    tabela.innerHTML = '';

    alunos.forEach(aluno => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${aluno.matricula}</strong></td>
            <td>${aluno.nome}</td>
            <td>${aluno.email}</td>
            <td>${formatarData(aluno.nascimento)}</td>
            <td><span class="badge ${aluno.status === 'Ativo' ? 'bg-success' : 'bg-danger'}">${aluno.status}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-info me-1" title="Ver Boletim" onclick="verBoletim(${aluno.id})"><i class="bi bi-card-text"></i></button>
                <button class="btn btn-sm btn-outline-warning me-1" title="Editar" onclick="editarAluno(${aluno.id})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" title="Excluir" onclick="excluirDado('${STORAGE_KEYS.ALUNOS}', ${aluno.id}, carregarAlunos)"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tabela.appendChild(tr);
    });
}

// ---------------- PROFESSORES ----------------

function cadastrarProfessor() {
    const nome = document.getElementById('nome-professor').value;
    const registro = document.getElementById('registro-professor').value;
    const email = document.getElementById('email-professor').value;
    const especialidade = document.getElementById('especialidade-professor').value;
    const titulacao = document.getElementById('titulacao-professor').value;

    let professores = getDados(STORAGE_KEYS.PROFESSORES);

    if (editId) {
        professores = professores.map(p => p.id === editId ? { ...p, nome, registro, email, especialidade, titulacao } : p);
        mostrarToast('Professor atualizado com sucesso!', 'success');
    } else {
        professores.push({ id: Date.now(), nome, registro, email, especialidade, titulacao });
        mostrarToast('Professor cadastrado com sucesso!', 'success');
    }

    salvarDados(STORAGE_KEYS.PROFESSORES, professores);
    document.getElementById('form-professor').reset();
    editId = null;
    carregarProfessores();
    return false;
}

function editarProfessor(id) {
    const professores = getDados(STORAGE_KEYS.PROFESSORES);
    const prof = professores.find(p => p.id === id);
    if (prof) {
        document.getElementById('nome-professor').value = prof.nome;
        document.getElementById('registro-professor').value = prof.registro;
        document.getElementById('email-professor').value = prof.email;
        document.getElementById('especialidade-professor').value = prof.especialidade;
        document.getElementById('titulacao-professor').value = prof.titulacao;
        editId = id;
        window.scrollTo(0, 0);
    }
}

function carregarProfessores() {
    const tabela = document.getElementById('tabela-professores');
    if (!tabela) return;

    const professores = getDados(STORAGE_KEYS.PROFESSORES);
    tabela.innerHTML = '';

    professores.forEach(prof => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${prof.registro}</strong></td>
            <td>${prof.nome}</td>
            <td>${prof.email}</td>
            <td>${prof.especialidade}</td>
            <td><span class="badge bg-info text-dark">${prof.titulacao}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" title="Editar" onclick="editarProfessor(${prof.id})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" title="Excluir" onclick="excluirDado('${STORAGE_KEYS.PROFESSORES}', ${prof.id}, carregarProfessores)"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tabela.appendChild(tr);
    });
}

// ---------------- DISCIPLINAS ----------------

function cadastrarDisciplina() {
    const codigo = document.getElementById('codigo-disciplina').value;
    const nome = document.getElementById('nome-disciplina').value;
    const carga = document.getElementById('carga-disciplina').value;
    const periodo = document.getElementById('periodo-disciplina').value;
    const ementa = document.getElementById('ementa-disciplina').value;

    let disciplinas = getDados(STORAGE_KEYS.DISCIPLINAS);

    if (editId) {
        disciplinas = disciplinas.map(d => d.id === editId ? { ...d, codigo, nome, carga, periodo, ementa } : d);
        mostrarToast('Disciplina atualizada com sucesso!', 'success');
    } else {
        disciplinas.push({ id: Date.now(), codigo, nome, carga, periodo, ementa });
        mostrarToast('Disciplina cadastrada com sucesso!', 'success');
    }

    salvarDados(STORAGE_KEYS.DISCIPLINAS, disciplinas);
    document.getElementById('form-disciplina').reset();
    editId = null;
    carregarDisciplinas();
    return false;
}

function editarDisciplina(id) {
    const disciplinas = getDados(STORAGE_KEYS.DISCIPLINAS);
    const disc = disciplinas.find(d => d.id === id);
    if (disc) {
        document.getElementById('codigo-disciplina').value = disc.codigo;
        document.getElementById('nome-disciplina').value = disc.nome;
        document.getElementById('carga-disciplina').value = disc.carga;
        document.getElementById('periodo-disciplina').value = disc.periodo;
        document.getElementById('ementa-disciplina').value = disc.ementa;
        editId = id;
        window.scrollTo(0, 0);
    }
}

function carregarDisciplinas() {
    const tabela = document.getElementById('tabela-disciplinas');
    if (!tabela) return;

    const disciplinas = getDados(STORAGE_KEYS.DISCIPLINAS);
    tabela.innerHTML = '';

    disciplinas.forEach(disc => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${disc.codigo}</strong></td>
            <td>${disc.nome}</td>
            <td>${disc.carga}</td>
            <td>${disc.periodo}</td>
            <td>${disc.ementa}</td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" title="Editar" onclick="editarDisciplina(${disc.id})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" title="Excluir" onclick="excluirDado('${STORAGE_KEYS.DISCIPLINAS}', ${disc.id}, carregarDisciplinas)"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tabela.appendChild(tr);
    });
}

// ---------------- TURMAS ----------------

function cadastrarTurma() {
    const codigo = document.getElementById('codigo-turma').value;
    const disciplina = document.getElementById('disciplina-turma').options[document.getElementById('disciplina-turma').selectedIndex].text;
    const professor = document.getElementById('professor-turma').options[document.getElementById('professor-turma').selectedIndex].text;
    const sala = document.getElementById('sala-turma').value;
    const turno = document.getElementById('turno-turma').value;
    const vagas = document.getElementById('vagas-turma').value;

    let turmas = getDados(STORAGE_KEYS.TURMAS);

    if (editId) {
        turmas = turmas.map(t => t.id === editId ? { ...t, codigo, disciplina, professor, sala, turno, vagas } : t);
        mostrarToast('Turma atualizada com sucesso!', 'success');
    } else {
        turmas.push({ id: Date.now(), codigo, disciplina, professor, sala, turno, vagas });
        mostrarToast('Turma cadastrada com sucesso!', 'success');
    }

    salvarDados(STORAGE_KEYS.TURMAS, turmas);
    document.getElementById('form-turma').reset();
    editId = null;
    carregarTurmas();
    return false;
}

function editarTurma(id) {
    const turmas = getDados(STORAGE_KEYS.TURMAS);
    const t = turmas.find(x => x.id === id);
    if (t) {
        document.getElementById('codigo-turma').value = t.codigo;
        selecionarPorTexto('disciplina-turma', t.disciplina);
        selecionarPorTexto('professor-turma', t.professor);
        document.getElementById('sala-turma').value = t.sala;
        document.getElementById('turno-turma').value = t.turno;
        document.getElementById('vagas-turma').value = t.vagas;
        editId = id;
        window.scrollTo(0, 0);
    }
}

function carregarTurmas() {
    const tabela = document.getElementById('tabela-turmas');
    if (!tabela) return;

    const turmas = getDados(STORAGE_KEYS.TURMAS);
    tabela.innerHTML = '';

    turmas.forEach(turma => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${turma.codigo}</strong></td>
            <td>${turma.disciplina}</td>
            <td>${turma.professor}</td>
            <td>${turma.sala}</td>
            <td>${turma.turno}</td>
            <td>${turma.vagas}</td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" title="Editar" onclick="editarTurma(${turma.id})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" title="Excluir" onclick="excluirDado('${STORAGE_KEYS.TURMAS}', ${turma.id}, carregarTurmas)"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tabela.appendChild(tr);
    });
}

function carregarSelectsTurma() {
    const selectDisciplina = document.getElementById('disciplina-turma');
    const selectProfessor = document.getElementById('professor-turma');
    
    if (selectDisciplina) {
        const disciplinas = getDados(STORAGE_KEYS.DISCIPLINAS);
        selectDisciplina.innerHTML = '<option value="">Selecione...</option>';
        disciplinas.forEach(d => {
            selectDisciplina.innerHTML += `<option value="${d.id}">${d.codigo} - ${d.nome}</option>`;
        });
    }

    if (selectProfessor) {
        const professores = getDados(STORAGE_KEYS.PROFESSORES);
        selectProfessor.innerHTML = '<option value="">Selecione...</option>';
        professores.forEach(p => {
            selectProfessor.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
        });
    }
}

// ---------------- NOTAS ----------------
function cadastrarNota() {
    const turma = document.getElementById('turma-select').value;
    const alunoId = document.getElementById('aluno-select').value;
    const alunoNome = document.getElementById('aluno-select').options[document.getElementById('aluno-select').selectedIndex].text;
    const nota1 = parseFloat(document.getElementById('nota1').value);
    const nota2 = parseFloat(document.getElementById('nota2').value);

    const media = ((nota1 + nota2) / 2).toFixed(1);
    const situacao = media >= 6.0 ? 'Aprovado' : 'Reprovado';

    let notas = getDados(STORAGE_KEYS.NOTAS);

    if (editId) {
        notas = notas.map(n => n.id === editId ? { ...n, turma, alunoId, alunoNome, nota1, nota2, media, situacao } : n);
        mostrarToast('Nota atualizada com sucesso!', 'success');
    } else {
        notas.push({ id: Date.now(), turma, alunoId, alunoNome, nota1, nota2, media, situacao });
        mostrarToast('Nota cadastrada com sucesso!', 'success');
    }

    salvarDados(STORAGE_KEYS.NOTAS, notas);
    document.getElementById('form-nota').reset();
    editId = null;
    carregarNotas();
    return false;
}

function editarNota(id) {
    const notas = getDados(STORAGE_KEYS.NOTAS);
    const n = notas.find(x => x.id === id);
    if (n) {
        document.getElementById('turma-select').value = n.turma;
        document.getElementById('aluno-select').value = n.alunoId;
        document.getElementById('nota1').value = n.nota1;
        document.getElementById('nota2').value = n.nota2;
        editId = id;
        window.scrollTo(0, 0);
    }
}

function carregarNotas() {
    const tabela = document.getElementById('tabela-notas');
    if (!tabela) return;

    const notas = getDados(STORAGE_KEYS.NOTAS);
    tabela.innerHTML = '';

    notas.forEach(nota => {
        const badgeClass = nota.situacao === 'Aprovado' ? 'bg-success' : 'bg-danger';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${nota.alunoNome}</strong></td>
            <td>${nota.turma}</td>
            <td>${nota.nota1.toFixed(1)}</td>
            <td>${nota.nota2.toFixed(1)}</td>
            <td><strong>${nota.media}</strong></td>
            <td><span class="badge ${badgeClass}">${nota.situacao}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" title="Editar" onclick="editarNota(${nota.id})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" title="Excluir" onclick="excluirDado('${STORAGE_KEYS.NOTAS}', ${nota.id}, carregarNotas)"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tabela.appendChild(tr);
    });
}

function carregarSelectAlunos() {
    const select = document.getElementById('aluno-select');
    if (!select) return;

    const alunos = getDados(STORAGE_KEYS.ALUNOS);
    select.innerHTML = '<option value="">Selecione um aluno...</option>';
    
    alunos.forEach(aluno => {
        const option = document.createElement('option');
        option.value = aluno.id;
        option.textContent = `${aluno.matricula} - ${aluno.nome}`;
        select.appendChild(option);
    });
}

function carregarSelectTurmas() {
    const select = document.getElementById('turma-select');
    if (!select) return;

    const turmas = getDados(STORAGE_KEYS.TURMAS);
    if(turmas.length > 0) {
        select.innerHTML = '<option value="">Selecione...</option>';
        turmas.forEach(turma => {
            const option = document.createElement('option');
            option.value = `${turma.codigo} - ${turma.disciplina}`;
            option.textContent = `${turma.codigo} - ${turma.disciplina}`;
            select.appendChild(option);
        });
    } else {
        select.innerHTML = '<option value="">Nenhuma turma cadastrada</option>';
    }
}

// ---------------- DASHBOARD E GRÁFICO ----------------

function carregarDashboard() {
    const totalAlunos = document.getElementById('total-alunos');
    const totalProfessores = document.getElementById('total-professores');
    const totalDisciplinas = document.getElementById('total-disciplinas');
    const totalTurmas = document.getElementById('total-turmas');
    
    if (totalAlunos) totalAlunos.textContent = getDados(STORAGE_KEYS.ALUNOS).length;
    if (totalProfessores) totalProfessores.textContent = getDados(STORAGE_KEYS.PROFESSORES).length;
    if (totalDisciplinas) totalDisciplinas.textContent = getDados(STORAGE_KEYS.DISCIPLINAS).length;
    if (totalTurmas) totalTurmas.textContent = getDados(STORAGE_KEYS.TURMAS).length;

    const tabelaDashboard = document.getElementById('tabela-dashboard');
    if (tabelaDashboard) {
        const alunos = getDados(STORAGE_KEYS.ALUNOS);
        const ultimosAlunos = [...alunos].reverse().slice(0, 5);
        
        tabelaDashboard.innerHTML = '';
        ultimosAlunos.forEach(aluno => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${aluno.matricula}</strong></td>
                <td>${aluno.nome}</td>
                <td>${aluno.email}</td>
                <td>${formatarData(aluno.nascimento)}</td>
                <td><span class="badge ${aluno.status === 'Ativo' ? 'bg-success' : 'bg-danger'}">${aluno.status}</span></td>
            `;
            tabelaDashboard.appendChild(tr);
        });
    }

    carregarGrafico();
}

function carregarGrafico() {
    const canvas = document.getElementById('graficoStatus');
    if (!canvas) return;

    const alunos = getDados(STORAGE_KEYS.ALUNOS);
    const ativos = alunos.filter(a => a.status === 'Ativo').length;
    const inativos = alunos.length - ativos;

    const textColor = '#2c3e50';

    if (window.graficoDash) { window.graficoDash.destroy(); }

    if (typeof Chart !== 'undefined') {
        window.graficoDash = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Ativos', 'Inativos'],
                datasets: [{
                    data: [ativos, inativos],
                    backgroundColor: ['#27ae60', '#e74c3c'],
                    borderWidth: 0
                }]
            },
            options: {
                plugins: {
                    legend: { labels: { color: textColor } }
                }
            }
        });
    }
}

// ---------------- UTILITÁRIOS GERAIS ----------------

function formatarData(dataISO) {
    if (!dataISO) return '-';
    const partes = dataISO.split('-');
    if (partes.length !== 3) return dataISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function excluirDado(key, id, callbackCarregar) {
    if (confirm('Tem certeza que deseja excluir este registro?')) {
        let dados = getDados(key);
        dados = dados.filter(item => item.id !== id);
        salvarDados(key, dados);
        callbackCarregar();
        mostrarToast('Registro excluído!', 'danger');
    }
}

function selecionarPorTexto(selectId, texto) {
    const select = document.getElementById(selectId);
    if (!select) return;
    for (let i = 0; i < select.options.length; i++) {
        if (select.options[i].text === texto) {
            select.selectedIndex = i;
            break;
        }
    }
}

function pesquisarTabela(inputId, tabelaId) {
    const input = document.getElementById(inputId);
    const filter = input.value.toUpperCase();
    const tbody = document.getElementById(tabelaId);
    if (!tbody) return;
    
    const trs = tbody.getElementsByTagName('tr');
    
    for (let i = 0; i < trs.length; i++) {
        const tds = trs[i].getElementsByTagName('td');
        let match = false;
        for (let j = 0; j < tds.length - 1; j++) {
            if (tds[j]) {
                const txtValue = tds[j].textContent || tds[j].innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    match = true;
                    break;
                }
            }
        }
        trs[i].style.display = match ? "" : "none";
    }
}

function exportarCSV(storageKey, filename) {
    const dados = getDados(storageKey);
    if (dados.length === 0) {
        mostrarToast('Nenhum dado para exportar.', 'warning');
        return;
    }

    const cabecalhos = Object.keys(dados[0]).filter(k => k !== 'id');
    const csvRows = [];
    
    csvRows.push(cabecalhos.join(','));
    
    for (const row of dados) {
        const valores = cabecalhos.map(header => {
            const escapado = ('' + row[header]).replace(/"/g, '""');
            return `"${escapado}"`;
        });
        csvRows.push(valores.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename + ".csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function mostrarToast(mensagem, tipo = 'primary') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = '1055';
        document.body.appendChild(container);
    }

    const toastId = 'toast-' + Date.now();
    const icone = tipo === 'success' ? 'bi-check-circle-fill' : 
                  tipo === 'danger' ? 'bi-x-circle-fill' : 
                  tipo === 'warning' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';

    const html = `
        <div id="${toastId}" class="toast align-items-center text-bg-${tipo} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body fw-bold">
                    <i class="bi ${icone} me-2"></i>${mensagem}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', html);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}


function aplicarMascaras() {
    const inputMatricula = document.getElementById('matricula-aluno');
    if (inputMatricula) {
        inputMatricula.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, ''); // Remove não numéricos
        });
    }

    function formataNota(e) {
        let v = e.target.value;
        v = v.replace(/[^0-9.]/g, ''); 
        if ((v.match(/\./g) || []).length > 1) {
            v = v.substring(0, v.length - 1);
        }
        if (parseFloat(v) > 10) v = '10';
        e.target.value = v;
    }

    const inputNota1 = document.getElementById('nota1');
    const inputNota2 = document.getElementById('nota2');
    if (inputNota1) inputNota1.addEventListener('input', formataNota);
    if (inputNota2) inputNota2.addEventListener('input', formataNota);

    const inputNota1Prof = document.getElementById('nota1-prof');
    const inputNota2Prof = document.getElementById('nota2-prof');
    if (inputNota1Prof) inputNota1Prof.addEventListener('input', formataNota);
    if (inputNota2Prof) inputNota2Prof.addEventListener('input', formataNota);
}

function carregarInfoUsuario() {
    const userName = sessionStorage.getItem('userName');
    if (!userName) return;
    const infoUsuario = document.querySelector('.info-usuario');
    if (infoUsuario) {
        const span = infoUsuario.querySelector('span');
        const avatar = infoUsuario.querySelector('.avatar');
        if (span) span.innerHTML = `Bem-vindo(a), <strong>${userName}</strong>`;
        if (avatar) avatar.textContent = userName.charAt(0).toUpperCase();
    }
}

// ---------------- PAINEL ALUNO ----------------
function carregarPainelAluno() {
    if (window.location.pathname.indexOf('painel_aluno.html') === -1) return;

    const userId = parseInt(sessionStorage.getItem('userId'));
    const userName = sessionStorage.getItem('userName');
    const alunos = getDados(STORAGE_KEYS.ALUNOS);
    const aluno = alunos.find(a => a.id === userId);

    if (aluno) {
        const spanNome = document.getElementById('painel-aluno-nome');
        const spanMat = document.getElementById('painel-aluno-matricula');
        const spanEmail = document.getElementById('painel-aluno-email');
        
        if (spanNome) spanNome.textContent = aluno.nome;
        if (spanMat) spanMat.textContent = aluno.matricula;
        if (spanEmail) spanEmail.textContent = aluno.email;

        const avatarEl = document.querySelector('#perfil .avatar');
        if (avatarEl) avatarEl.textContent = aluno.nome.charAt(0).toUpperCase();

        // Carteirinha
        const cartNome = document.getElementById('cart-nome');
        const cartMat = document.getElementById('cart-mat');
        const cartNasc = document.getElementById('cart-nasc');
        const cartFoto = document.getElementById('cart-foto');

        if (cartNome) cartNome.textContent = aluno.nome;
        if (cartMat) cartMat.textContent = aluno.matricula;
        if (cartNasc) cartNasc.textContent = formatarData(aluno.nascimento);
        if (cartFoto) cartFoto.textContent = aluno.nome.charAt(0).toUpperCase();
    }

    // Carregar Turmas Matriculadas (Todas as turmas ativas do curso do aluno, ou apenas simular)
    
    const notasDoAluno = getDados(STORAGE_KEYS.NOTAS).filter(n => parseInt(n.alunoId) === userId || n.alunoNome === userName);
    const turmasIds = [...new Set(notasDoAluno.map(n => n.turma))];
    const todasTurmas = getDados(STORAGE_KEYS.TURMAS);
    
    const turmasDoAluno = todasTurmas.filter(t => turmasIds.includes(`${t.codigo} - ${t.disciplina}`));
    const tbodyTurmas = document.getElementById('tabela-minhas-turmas');
    
    if (tbodyTurmas) {
        tbodyTurmas.innerHTML = '';
        if (turmasDoAluno.length === 0) {
            tbodyTurmas.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Você ainda não está alocado em nenhuma turma com notas.</td></tr>';
        } else {
            turmasDoAluno.forEach(t => {
                tbodyTurmas.innerHTML += `
                    <tr>
                        <td><strong>${t.codigo}</strong></td>
                        <td>${t.disciplina}</td>
                        <td>${t.professor}</td>
                        <td>Sala ${t.sala} - ${t.turno}</td>
                    </tr>
                `;
            });
        }
    }

    const tbody = document.getElementById('tabela-meu-boletim');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    if (notasDoAluno.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma nota lançada ainda.</td></tr>';
    } else {
        notasDoAluno.forEach(n => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${n.turma}</td>
                <td>${parseFloat(n.nota1).toFixed(1)}</td>
                <td>${parseFloat(n.nota2).toFixed(1)}</td>
                <td><strong>${n.media}</strong></td>
                <td><span class="badge ${n.situacao === 'Aprovado' ? 'bg-success' : 'bg-danger'}">${n.situacao}</span></td>
            `;
            tbody.appendChild(tr);
        });
    }
}

// ---------------- PAINEL PROFESSOR ----------------
function carregarSelectsProf() {
    const userName = sessionStorage.getItem('userName'); 
    const turmas = getDados(STORAGE_KEYS.TURMAS).filter(t => t.professor === userName);
    const selectTurma = document.getElementById('turma-select-prof');
    if (selectTurma) {
        selectTurma.innerHTML = '<option value="">Selecione...</option>';
        turmas.forEach(t => {
            selectTurma.innerHTML += `<option value="${t.codigo} - ${t.disciplina}">${t.codigo} - ${t.disciplina}</option>`;
        });
    }

    const selectAluno = document.getElementById('aluno-select-prof');
    if (selectAluno) {
        const alunos = getDados(STORAGE_KEYS.ALUNOS).filter(a => a.status === 'Ativo');
        selectAluno.innerHTML = '<option value="">Selecione...</option>';
        alunos.forEach(a => {
            selectAluno.innerHTML += `<option value="${a.id}">${a.matricula} - ${a.nome}</option>`;
        });
    }
}

function cadastrarNotaProf() {
    const turma = document.getElementById('turma-select-prof').value;
    const alunoId = document.getElementById('aluno-select-prof').value;
    const selectAluno = document.getElementById('aluno-select-prof');
    const alunoNomeText = selectAluno.options[selectAluno.selectedIndex].text;
    const alunoNome = alunoNomeText.split(' - ')[1] || alunoNomeText; 
    const nota1 = parseFloat(document.getElementById('nota1-prof').value);
    const nota2 = parseFloat(document.getElementById('nota2-prof').value);

    const media = ((nota1 + nota2) / 2).toFixed(1);
    const situacao = media >= 6.0 ? 'Aprovado' : 'Reprovado';

    let notas = getDados(STORAGE_KEYS.NOTAS);

    if (editId) {
        notas = notas.map(n => n.id === editId ? { ...n, turma, alunoId, alunoNome, nota1, nota2, media, situacao } : n);
        mostrarToast('Nota atualizada com sucesso!', 'success');
    } else {
        notas.push({ id: Date.now(), turma, alunoId, alunoNome, nota1, nota2, media, situacao });
        mostrarToast('Nota lançada com sucesso!', 'success');
    }

    salvarDados(STORAGE_KEYS.NOTAS, notas);
    document.getElementById('form-nota-prof').reset();
    editId = null;
    carregarNotasProf();
    return false;
}

function editarNotaProf(id) {
    const notas = getDados(STORAGE_KEYS.NOTAS);
    const n = notas.find(x => x.id === id);
    if (n) {
        document.getElementById('turma-select-prof').value = n.turma;
        document.getElementById('aluno-select-prof').value = n.alunoId;
        document.getElementById('nota1-prof').value = n.nota1;
        document.getElementById('nota2-prof').value = n.nota2;
        editId = id;
        window.scrollTo(0, 0);
    }
}

function carregarNotasProf() {
    if (window.location.pathname.indexOf('painel_professor.html') === -1) return;

    const tbody = document.getElementById('tabela-notas-prof');
    if (!tbody) return;

    const userName = sessionStorage.getItem('userName');
    const turmasDoProfessor = getDados(STORAGE_KEYS.TURMAS).filter(t => t.professor === userName).map(t => `${t.codigo} - ${t.disciplina}`);
    
    const notas = getDados(STORAGE_KEYS.NOTAS).filter(n => turmasDoProfessor.includes(n.turma));
    
    tbody.innerHTML = '';
    notas.forEach(nota => {
        const badgeClass = nota.situacao === 'Aprovado' ? 'bg-success' : 'bg-danger';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${nota.alunoNome}</strong></td>
            <td>${nota.turma}</td>
            <td>${nota.nota1.toFixed(1)}</td>
            <td>${nota.nota2.toFixed(1)}</td>
            <td><strong>${nota.media}</strong></td>
            <td><span class="badge ${badgeClass}">${nota.situacao}</span></td>
            <td>
                <button class="btn btn-sm btn-outline-warning me-1" title="Editar" onclick="editarNotaProf(${nota.id})"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" title="Excluir" onclick="excluirDado('${STORAGE_KEYS.NOTAS}', ${nota.id}, carregarNotasProf)"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ---------------- PAINEL PROFESSOR EXTRA ----------------
function carregarPainelProfessor() {
    if (window.location.pathname.indexOf('painel_professor.html') === -1) return;

    const userName = sessionStorage.getItem('userName');
    
    // Atualiza nome e registro
    const spanNome = document.getElementById('painel-prof-nome');
    const spanReg = document.getElementById('painel-prof-registro');
    
    if (spanNome) spanNome.textContent = userName;
    
    const professores = getDados(STORAGE_KEYS.PROFESSORES);
    const prof = professores.find(p => p.nome === userName);
    if (prof && spanReg) {
        spanReg.textContent = prof.registro;
    }

    // Pega as turmas do professor
    const turmasDoProf = getDados(STORAGE_KEYS.TURMAS).filter(t => t.professor === userName);
    const turmasIds = turmasDoProf.map(t => `${t.codigo} - ${t.disciplina}`);
    
    const notasDoProf = getDados(STORAGE_KEYS.NOTAS).filter(n => turmasIds.includes(n.turma));
    
    // Atualiza os contadores
    const elTotTurmas = document.getElementById('prof-total-turmas');
    const elTotNotas = document.getElementById('prof-total-notas');
    if (elTotTurmas) elTotTurmas.textContent = turmasDoProf.length;
    if (elTotNotas) elTotNotas.textContent = notasDoProf.length;

    // Popula a tabela de Minhas Turmas
    const tbodyTurmas = document.getElementById('tabela-prof-turmas');
    if (tbodyTurmas) {
        tbodyTurmas.innerHTML = '';
        if (turmasDoProf.length === 0) {
            tbodyTurmas.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Você não possui turmas atribuídas.</td></tr>';
        } else {
            turmasDoProf.forEach(t => {
                tbodyTurmas.innerHTML += `
                    <tr>
                        <td><strong>${t.codigo}</strong></td>
                        <td>${t.disciplina}</td>
                        <td>Sala ${t.sala}</td>
                        <td>${t.turno}</td>
                    </tr>
                `;
            });
        }
    }

    // Função de Gráfico
    window.renderizarGraficoProf = function() {
        const ctx = document.getElementById('graficoDesempenhoProf');
        if (!ctx) return;
        
        let aprovados = 0;
        let reprovados = 0;
        
        notasDoProf.forEach(n => {
            if (n.situacao === 'Aprovado') aprovados++;
            else reprovados++;
        });

        if (window.meuGraficoProf) {
            window.meuGraficoProf.destroy();
        }

        if (aprovados === 0 && reprovados === 0) {
            return;
        }

        window.meuGraficoProf = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Aprovados', 'Reprovados'],
                datasets: [{
                    data: [aprovados, reprovados],
                    backgroundColor: ['#2ecc71', '#e74c3c'],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    };
}

// --- LÓGICA DE LOGIN ---
// Função responsável pela autenticação do usuário e roteamento
function fazerLogin(event) {
    event.preventDefault();
    const tipoAcesso = document.getElementById('tipoAcesso').value;
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;

    if (tipoAcesso === 'admin') {
        if (usuario === 'admin' && senha === 'admin') {
            sessionStorage.setItem('isLogged', 'true');
            sessionStorage.setItem('userType', 'admin');
            window.location.href = 'dashboard.html';
        } else {
            alert('Credenciais de Administrador inválidas.');
        }
    } else if (tipoAcesso === 'professor') {
        const professores = getDados(STORAGE_KEYS.PROFESSORES);
        const prof = professores.find(p => p.registro === usuario && p.registro === senha);
        if (prof) {
            sessionStorage.setItem('isLogged', 'true');
            sessionStorage.setItem('userType', 'professor');
            sessionStorage.setItem('userId', prof.id);
            sessionStorage.setItem('userName', prof.nome);
            window.location.href = 'painel_professor.html';
        } else {
            alert('Registro inválido ou não encontrado.');
        }
    } else if (tipoAcesso === 'aluno') {
        const alunos = getDados(STORAGE_KEYS.ALUNOS);
        const aluno = alunos.find(a => a.matricula === usuario && a.matricula === senha);
        if (aluno) {
            sessionStorage.setItem('isLogged', 'true');
            sessionStorage.setItem('userType', 'aluno');
            sessionStorage.setItem('userId', aluno.id);
            sessionStorage.setItem('userName', aluno.nome);
            window.location.href = 'painel_aluno.html';
        } else {
            alert('Matrícula inválida ou não encontrada.');
        }
    }
}

// ---------------- INIT ----------------
document.addEventListener('DOMContentLoaded', () => {
    carregarInfoUsuario();
    carregarPainelAluno();
    carregarPainelProfessor();
    carregarSelectsProf();
    carregarNotasProf();
    carregarAlunos();
    carregarProfessores();
    carregarDisciplinas();
    carregarSelectsTurma();
    carregarTurmas();
    carregarNotas();
    carregarSelectAlunos();
    carregarSelectTurmas();
    carregarDashboard();
    aplicarMascaras();
});
