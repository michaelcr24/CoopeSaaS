<template>
  <div class="module-page">

    <!-- Encabezado -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Personal</h2>
        <p class="page-subtitle">Gestión de colaboradores y recursos humanos</p>
      </div>
      <button v-if="activeTab === 'dashboard'" class="btn-primary" @click="openModal('nuevo')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Agregar colaborador
      </button>
    </div>

    <!-- Pestañas -->
    <div class="tabs-wrap">
      <div class="tabs-nav">
        <button
          v-for="tab in visibleTabs"
          :key="tab.key"
          class="tab-btn"
          :class="{ 'tab-btn--active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <span v-html="tab.icon"></span>
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- ══════════════════════════════════════════
         TAB: DASHBOARD
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'dashboard'">
      <div class="indicators-grid">
        <div v-for="ind in indicators" :key="ind.key" class="indicator-card">
          <div class="ind-icon" :style="{ background: ind.bg }">
            <span v-html="ind.icon"></span>
          </div>
          <div class="ind-body">
            <span class="ind-value">{{ ind.value }}</span>
            <span class="ind-label">{{ ind.label }}</span>
          </div>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="search" type="search" placeholder="Buscar por nombre, puesto..." class="search-input" />
        </div>
        <select v-model="filterDept" class="filter-select">
          <option value="">Todos los departamentos</option>
          <option>Administración</option>
          <option>Operaciones</option>
          <option>Finanzas</option>
        </select>
        <select v-model="filterStatus" class="filter-select">
          <option value="">Todos los estados</option>
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
        <div class="export-group">
          <button class="export-btn export-btn--excel" title="Exportar a Excel"
            @click="exportCSV(filteredEmployees, [{key:'name',label:'Nombre'},{key:'role',label:'Puesto'},{key:'dept',label:'Departamento'},{key:'date',label:'Fecha ingreso'}], 'colaboradores')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          </button>
          <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF('Colaboradores')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
          </button>
        </div>
      </div>

      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Puesto</th>
              <th>Departamento</th>
              <th>Fecha ingreso</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="emp in filteredEmployees" :key="emp.id">
              <td>
                <div class="cell-user">
                  <div class="cell-avatar" :style="{ background: emp.color }">{{ emp.initials }}</div>
                  <span>{{ emp.name }}</span>
                </div>
              </td>
              <td>{{ emp.role }}</td>
              <td>{{ emp.dept }}</td>
              <td>{{ emp.date }}</td>
              <td><span class="badge" :class="emp.active ? 'badge--green' : 'badge--gray'">{{ emp.active ? 'Activo' : 'Inactivo' }}</span></td>
              <td class="cell-actions">
                <button class="action-btn" title="Ver expediente" @click="activeTab='expedientes'">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="action-btn" title="Editar" @click="openModal('editar', emp)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </td>
            </tr>
            <tr v-if="filteredEmployees.length === 0">
              <td colspan="6" class="empty-row">No se encontraron colaboradores.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: EXPEDIENTES
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'expedientes'">
      <div class="exp-layout">
        <!-- Lista lateral -->
        <div class="exp-sidebar">
          <div class="exp-search-wrap">
            <svg class="search-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="search" placeholder="Buscar..." class="search-input search-input--sm" />
          </div>
          <div class="exp-list">
            <div
              v-for="emp in visibleEmployees"
              :key="emp.id"
              class="exp-item"
              :class="{ 'exp-item--active': selectedEmp?.id === emp.id }"
              @click="selectedEmp = emp"
            >
              <div class="cell-avatar cell-avatar--sm" :style="{ background: emp.color }">{{ emp.initials }}</div>
              <div class="exp-item-info">
                <span class="exp-item-name">{{ emp.name }}</span>
                <span class="exp-item-role">{{ emp.role }}</span>
              </div>
              <span class="badge badge--xs" :class="emp.active ? 'badge--green' : 'badge--gray'">
                {{ emp.active ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Detalle -->
        <div class="exp-detail" v-if="selectedEmp">
          <div class="exp-detail-header">
            <div class="cell-avatar cell-avatar--lg" :style="{ background: selectedEmp.color }">{{ selectedEmp.initials }}</div>
            <div>
              <h3 class="exp-name">{{ selectedEmp.name }}</h3>
              <p class="exp-role">{{ selectedEmp.role }} · {{ selectedEmp.dept }}</p>
            </div>
            <div class="exp-header-actions">
              <button class="export-btn export-btn--excel" title="Exportar a Excel" @click="exportCSV([selectedEmp],[{key:'name',label:'Nombre'},{key:'role',label:'Puesto'},{key:'dept',label:'Departamento'},{key:'date',label:'Fecha ingreso'}],'expediente')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
              </button>
              <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF('Expediente ' + selectedEmp.name)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
              </button>
              <button class="btn-outline btn-sm" @click="openModal('editar', selectedEmp)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Editar expediente
              </button>
            </div>
          </div>

          <div class="exp-sections">
            <div class="exp-section">
              <h4 class="exp-section-title">Información personal</h4>
              <div class="exp-grid">
                <div class="exp-field"><label>Identificación</label><span>1-0234-0567</span></div>
                <div class="exp-field"><label>Fecha de nacimiento</label><span>12/04/1985</span></div>
                <div class="exp-field"><label>Género</label><span>Femenino</span></div>
                <div class="exp-field"><label>Nacionalidad</label><span>Costarricense</span></div>
                <div class="exp-field"><label>Estado civil</label><span>Casada</span></div>
                <div class="exp-field"><label>Teléfono</label><span>8888-1234</span></div>
                <div class="exp-field exp-field--full"><label>Correo electrónico</label><span>colaborador@cooperativa.com</span></div>
                <div class="exp-field exp-field--full"><label>Dirección</label><span>San José, Costa Rica</span></div>
              </div>
            </div>

            <div class="exp-section">
              <h4 class="exp-section-title">Información laboral</h4>
              <div class="exp-grid">
                <div class="exp-field"><label>Código de empleado</label><span>EMP-001</span></div>
                <div class="exp-field"><label>Fecha de ingreso</label><span>{{ selectedEmp.date }}</span></div>
                <div class="exp-field"><label>Departamento</label><span>{{ selectedEmp.dept }}</span></div>
                <div class="exp-field"><label>Tipo de contrato</label><span>Tiempo completo</span></div>
                <div class="exp-field"><label>Jornada laboral</label><span>Lunes a Viernes 8h</span></div>
                <div class="exp-field"><label>Salario base</label><span>₡ 650,000</span></div>
              </div>
            </div>

            <div class="exp-section">
              <h4 class="exp-section-title">Contacto de emergencia</h4>
              <div class="exp-grid">
                <div class="exp-field"><label>Nombre</label><span>Roberto González</span></div>
                <div class="exp-field"><label>Relación</label><span>Esposo</span></div>
                <div class="exp-field"><label>Teléfono</label><span>8888-5678</span></div>
              </div>
            </div>
          </div>

          <div class="exp-actions">
            <button class="btn-outline">Editar expediente</button>
            <button class="btn-primary">Guardar cambios</button>
          </div>
        </div>

        <div class="exp-empty" v-else>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C5D5E5" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <p>Selecciona un colaborador para ver su expediente</p>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: VACACIONES
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'vacaciones'">
      <div class="vac-summary">
        <div class="vac-saldo">
          <span class="vac-num">12</span>
          <span class="vac-lbl">Días disponibles</span>
        </div>
        <div class="vac-saldo">
          <span class="vac-num">8</span>
          <span class="vac-lbl">Días utilizados</span>
        </div>
        <div class="vac-saldo">
          <span class="vac-num">5</span>
          <span class="vac-lbl">Solicitudes pendientes</span>
        </div>
        <div class="export-group">
          <button class="export-btn export-btn--excel" title="Exportar a Excel" @click="exportCSV(vacaciones,[{key:'name',label:'Colaborador'},{key:'inicio',label:'Inicio'},{key:'fin',label:'Fin'},{key:'dias',label:'Días'},{key:'status',label:'Estado'}],'vacaciones')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          </button>
          <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF('Vacaciones')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
          </button>
          <button class="btn-primary vac-btn" @click="openModal('vacacion')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva solicitud
          </button>
        </div>
      </div>

      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Días</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in visibleVacaciones" :key="v.id">
              <td>
                <div class="cell-user">
                  <div class="cell-avatar" :style="{ background: v.color }">{{ v.initials }}</div>
                  <span>{{ v.name }}</span>
                </div>
              </td>
              <td>{{ v.inicio }}</td>
              <td>{{ v.fin }}</td>
              <td>{{ v.dias }}</td>
              <td><span class="badge" :class="`badge--${v.statusClass}`">{{ v.status }}</span></td>
              <td class="cell-actions">
                <button v-if="v.statusClass === 'yellow'" class="action-btn action-btn--green" title="Aprobar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
                <button v-if="v.statusClass === 'yellow'" class="action-btn action-btn--red" title="Rechazar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: PERMISOS
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'permisos'">
      <div class="section-header-row">
        <h3 class="section-subtitle">Solicitudes de permisos</h3>
        <div class="header-actions">
          <button class="export-btn export-btn--excel" title="Exportar a Excel" @click="exportCSV(permisos,[{key:'name',label:'Colaborador'},{key:'tipo',label:'Tipo'},{key:'fecha',label:'Fecha'},{key:'horas',label:'Horas'},{key:'status',label:'Estado'}],'permisos')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          </button>
          <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF('Permisos')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
          </button>
          <button class="btn-primary" @click="openModal('permiso')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nuevo permiso
          </button>
        </div>
      </div>
      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr><th>Colaborador</th><th>Tipo</th><th>Fecha</th><th>Horas</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="p in visiblePermisos" :key="p.id">
              <td>
                <div class="cell-user">
                  <div class="cell-avatar" :style="{ background: p.color }">{{ p.initials }}</div>
                  <span>{{ p.name }}</span>
                </div>
              </td>
              <td><span class="badge badge--blue">{{ p.tipo }}</span></td>
              <td>{{ p.fecha }}</td>
              <td>{{ p.horas }}h</td>
              <td><span class="badge" :class="`badge--${p.statusClass}`">{{ p.status }}</span></td>
              <td class="cell-actions">
                <button v-if="p.statusClass === 'yellow'" class="action-btn action-btn--green" title="Aprobar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
                <button v-if="p.statusClass === 'yellow'" class="action-btn action-btn--red" title="Rechazar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: DOCUMENTOS
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'documentos'">
      <div class="section-header-row">
        <div>
          <h3 class="section-subtitle">Gestión documental</h3>
          <p class="section-desc">Documentos personales, laborales y académicos de los colaboradores</p>
        </div>
        <div class="header-actions">
          <button class="export-btn export-btn--excel" title="Exportar a Excel" @click="exportCSV(docGrupos.flatMap(g=>g.docs),[{key:'nombre',label:'Documento'},{key:'tipo',label:'Tipo'},{key:'fecha',label:'Fecha'},{key:'vencimiento',label:'Vencimiento'}],'documentos')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          </button>
          <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF('Documentos')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
          </button>
          <button class="btn-primary" @click="openModal('documento')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Subir documento
          </button>
        </div>
      </div>

      <div class="doc-filters">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" placeholder="Buscar documento o colaborador..." class="search-input" />
        </div>
        <select class="filter-select">
          <option value="">Todas las categorías</option>
          <option>Personales</option>
          <option>Laborales</option>
          <option>Académicos</option>
        </select>
        <select class="filter-select">
          <option value="">Todos los colaboradores</option>
          <option v-for="e in employees" :key="e.id">{{ e.name }}</option>
        </select>
      </div>

      <!-- Grupos por categoría -->
      <div class="doc-groups">
        <div v-for="grupo in visibleDocGrupos" :key="grupo.cat" class="doc-group">
          <div class="doc-group-header">
            <div class="doc-group-icon" :style="{ background: grupo.bg }">
              <span v-html="grupo.icon"></span>
            </div>
            <span class="doc-group-title">{{ grupo.cat }}</span>
            <span class="doc-group-count">{{ grupo.docs.length }} doc.</span>
          </div>
          <div class="data-card">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Colaborador</th>
                  <th>Tipo de documento</th>
                  <th>Fecha de carga</th>
                  <th>Vencimiento</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doc in grupo.docs" :key="doc.id">
                  <td>
                    <div class="cell-user">
                      <div class="cell-avatar" :style="{ background: doc.color }">{{ doc.initials }}</div>
                      <span>{{ doc.name }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="doc-tipo">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      {{ doc.tipo }}
                    </div>
                  </td>
                  <td>{{ doc.carga }}</td>
                  <td>
                    <span v-if="doc.vence" :class="doc.venceAlert ? 'doc-vence-alert' : 'doc-vence'">{{ doc.vence }}</span>
                    <span v-else class="doc-vence-na">—</span>
                  </td>
                  <td><span class="badge" :class="`badge--${doc.statusClass}`">{{ doc.status }}</span></td>
                  <td class="cell-actions">
                    <button class="action-btn" title="Descargar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                    <button class="action-btn" title="Ver">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                    <button class="action-btn action-btn--red" title="Eliminar">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: ASISTENCIA
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'asistencia'">
      <div class="section-header-row">
        <div>
          <h3 class="section-subtitle">Control de asistencia</h3>
          <p class="section-desc">Registro de entradas, salidas y horas trabajadas</p>
        </div>
        <div class="header-actions">
          <button class="export-btn export-btn--excel" title="Exportar a Excel" @click="exportCSV(asistencias,[{key:'name',label:'Colaborador'},{key:'fecha',label:'Fecha'},{key:'entrada',label:'Entrada'},{key:'salida',label:'Salida'},{key:'horas',label:'Horas'}],'asistencia')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          </button>
          <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF('Asistencia')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
          </button>
          <button class="btn-primary" @click="openModal('asistencia')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Registrar entrada/salida
          </button>
        </div>
      </div>

      <div class="asist-summary">
        <div class="asist-stat">
          <span class="asist-num">28</span>
          <span class="asist-lbl">Presentes hoy</span>
        </div>
        <div class="asist-stat">
          <span class="asist-num asist-num--red">2</span>
          <span class="asist-lbl">Ausencias hoy</span>
        </div>
        <div class="asist-stat">
          <span class="asist-num asist-num--yellow">3</span>
          <span class="asist-lbl">Tardías este mes</span>
        </div>
        <div class="asist-stat">
          <span class="asist-num asist-num--blue">42</span>
          <span class="asist-lbl">Horas extra mes</span>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" placeholder="Buscar colaborador..." class="search-input" />
        </div>
        <select class="filter-select">
          <option value="">Todos los colaboradores</option>
          <option v-for="e in employees" :key="e.id">{{ e.name }}</option>
        </select>
        <div class="date-range">
          <DatePicker model-value="2026-06-01" input-class="filter-select" />
          <span class="date-sep">—</span>
          <DatePicker model-value="2026-06-15" input-class="filter-select" />
        </div>
      </div>

      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Fecha</th>
              <th>Entrada</th>
              <th>Salida</th>
              <th>Horas trabajadas</th>
              <th>Horas extra</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in visibleAsistencias" :key="a.id">
              <td>
                <div class="cell-user">
                  <div class="cell-avatar" :style="{ background: a.color }">{{ a.initials }}</div>
                  <span>{{ a.name }}</span>
                </div>
              </td>
              <td>{{ a.fecha }}</td>
              <td>
                <span class="time-badge">{{ a.entrada }}</span>
              </td>
              <td>
                <span class="time-badge" v-if="a.salida">{{ a.salida }}</span>
                <span class="time-badge time-badge--pending" v-else>Pendiente</span>
              </td>
              <td>
                <span class="font-mono">{{ a.horas ? a.horas + 'h' : '—' }}</span>
              </td>
              <td>
                <span v-if="a.extra" class="badge badge--blue">+{{ a.extra }}h</span>
                <span v-else class="text-muted">—</span>
              </td>
              <td><span class="badge" :class="`badge--${a.statusClass}`">{{ a.status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: INCAPACIDADES
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'incapacidades'">
      <div class="section-header-row">
        <h3 class="section-subtitle">Registro de incapacidades</h3>
        <div class="header-actions">
          <button class="export-btn export-btn--excel" title="Exportar a Excel" @click="exportCSV(incapacidades,[{key:'name',label:'Colaborador'},{key:'inicio',label:'Inicio'},{key:'fin',label:'Fin'},{key:'dias',label:'Días'},{key:'institucion',label:'Institución'}],'incapacidades')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          </button>
          <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF('Incapacidades')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
          </button>
          <button class="btn-primary" @click="openModal('incapacidad')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva incapacidad
          </button>
        </div>
      </div>
      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Fecha inicio</th>
              <th>Fecha fin</th>
              <th>Días</th>
              <th>Institución emisora</th>
              <th>Diagnóstico</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="inc in visibleIncapacidades" :key="inc.id">
              <td>
                <div class="cell-user">
                  <div class="cell-avatar" :style="{ background: inc.color }">{{ inc.initials }}</div>
                  <span>{{ inc.name }}</span>
                </div>
              </td>
              <td>{{ inc.inicio }}</td>
              <td>{{ inc.fin }}</td>
              <td>{{ inc.dias }}</td>
              <td>{{ inc.institucion }}</td>
              <td><span class="text-muted-sm">{{ inc.diagnostico || '—' }}</span></td>
              <td><span class="badge" :class="`badge--${inc.statusClass}`">{{ inc.status }}</span></td>
              <td class="cell-actions">
                <button class="action-btn" title="Ver documento">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="action-btn" title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: CAPACITACIONES
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'capacitaciones'">
      <div class="section-header-row">
        <div>
          <h3 class="section-subtitle">Capacitaciones</h3>
          <p class="section-desc">Gestión del plan de capacitación y registro de participación</p>
        </div>
        <div class="header-actions">
          <button class="export-btn export-btn--excel" title="Exportar a Excel" @click="exportCSV(capacitaciones,[{key:'tema',label:'Tema'},{key:'modalidad',label:'Modalidad'},{key:'fecha',label:'Fecha'},{key:'instructor',label:'Instructor'},{key:'asistentes',label:'Asistentes'}],'capacitaciones')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          </button>
          <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF('Capacitaciones')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
          </button>
          <button class="btn-primary" @click="openModal('capacitacion')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva capacitación
          </button>
        </div>
      </div>

      <div class="cap-summary">
        <div class="cap-stat">
          <span class="cap-num">12</span>
          <span class="cap-lbl">Total realizadas</span>
        </div>
        <div class="cap-stat">
          <span class="cap-num cap-num--blue">3</span>
          <span class="cap-lbl">Programadas</span>
        </div>
        <div class="cap-stat">
          <span class="cap-num cap-num--green">248</span>
          <span class="cap-lbl">Horas acumuladas</span>
        </div>
        <div class="cap-stat">
          <span class="cap-num cap-num--teal">18</span>
          <span class="cap-lbl">Certificaciones vigentes</span>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" placeholder="Buscar por tema o instructor..." class="search-input" />
        </div>
        <select class="filter-select">
          <option value="">Todas las categorías</option>
          <option>Tecnología</option>
          <option>Finanzas</option>
          <option>Liderazgo</option>
          <option>Normativa</option>
          <option>Otro</option>
        </select>
        <select class="filter-select">
          <option value="">Todos los estados</option>
          <option>Programada</option>
          <option>En curso</option>
          <option>Finalizada</option>
        </select>
      </div>

      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tema / Nombre</th>
              <th>Categoría</th>
              <th>Modalidad</th>
              <th>Fecha</th>
              <th>Duración</th>
              <th>Instructor</th>
              <th>Asistentes</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cap in visibleCapacitaciones" :key="cap.id">
              <td>
                <div class="cap-nombre">
                  <span class="cap-titulo">{{ cap.nombre }}</span>
                  <span class="cap-depto">{{ cap.depto }}</span>
                </div>
              </td>
              <td><span class="badge badge--blue">{{ cap.categoria }}</span></td>
              <td>
                <span class="modalidad-badge" :class="`modalidad--${cap.modalidadClass}`">{{ cap.modalidad }}</span>
              </td>
              <td>{{ cap.fecha }}</td>
              <td>{{ cap.horas }}h</td>
              <td>{{ cap.instructor }}</td>
              <td>
                <div class="asistentes-cell">
                  <span class="asistentes-num">{{ cap.asistentes }}</span>
                  <span class="asistentes-lbl">personas</span>
                </div>
              </td>
              <td><span class="badge" :class="`badge--${cap.statusClass}`">{{ cap.status }}</span></td>
              <td class="cell-actions">
                <button class="action-btn" title="Ver detalle">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="action-btn" title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         TAB: EVALUACIONES
    ══════════════════════════════════════════ -->
    <template v-if="activeTab === 'evaluaciones'">
      <div class="section-header-row">
        <div>
          <h3 class="section-subtitle">Evaluación de desempeño</h3>
          <p class="section-desc">Evaluaciones periódicas por competencias y objetivos</p>
        </div>
        <div class="header-actions">
          <button class="export-btn export-btn--excel" title="Exportar a Excel" @click="exportCSV(evaluaciones,[{key:'name',label:'Colaborador'},{key:'periodo',label:'Período'},{key:'calificacion',label:'Calificación'},{key:'evaluador',label:'Evaluador'}],'evaluaciones')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="8" y1="9" x2="8" y2="21"/><line x1="14" y1="9" x2="14" y2="21"/><line x1="2" y1="15" x2="22" y2="15"/></svg>
          </button>
          <button class="export-btn export-btn--pdf" title="Exportar a PDF" @click="exportPDF('Evaluaciones')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
          </button>
          <button class="btn-primary" @click="openModal('evaluacion')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Nueva evaluación
          </button>
        </div>
      </div>

      <div class="filters-bar">
        <div class="search-wrap">
          <svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="search" placeholder="Buscar colaborador..." class="search-input" />
        </div>
        <select class="filter-select">
          <option value="">Todos los períodos</option>
          <option>Trimestral</option>
          <option>Semestral</option>
          <option>Anual</option>
        </select>
        <select class="filter-select">
          <option value="">Todos los tipos</option>
          <option>Autoevaluación</option>
          <option>Jefatura</option>
          <option>180°</option>
          <option>360°</option>
        </select>
        <select class="filter-select">
          <option value="">Todos los estados</option>
          <option>Pendiente</option>
          <option>En proceso</option>
          <option>Completada</option>
        </select>
      </div>

      <div class="data-card">
        <table class="data-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Período</th>
              <th>Tipo</th>
              <th>Evaluador</th>
              <th>Fecha</th>
              <th>Calificación</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ev in visibleEvaluaciones" :key="ev.id">
              <td>
                <div class="cell-user">
                  <div class="cell-avatar" :style="{ background: ev.color }">{{ ev.initials }}</div>
                  <span>{{ ev.name }}</span>
                </div>
              </td>
              <td>{{ ev.periodo }}</td>
              <td><span class="badge badge--blue">{{ ev.tipo }}</span></td>
              <td>{{ ev.evaluador }}</td>
              <td>{{ ev.fecha }}</td>
              <td>
                <div v-if="ev.calificacion" class="calificacion-cell">
                  <span class="calificacion-num" :class="`cal--${ev.calClass}`">{{ ev.calificacion }}</span>
                  <span class="calificacion-max">/100</span>
                </div>
                <span v-else class="text-muted">Pendiente</span>
              </td>
              <td><span class="badge" :class="`badge--${ev.statusClass}`">{{ ev.status }}</span></td>
              <td class="cell-actions">
                <button class="action-btn" title="Ver evaluación">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="action-btn" title="Completar evaluación" @click="openModal('evaluacion')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- ══════════════════════════════════════════
         MODAL
    ══════════════════════════════════════════ -->
    <Transition name="modal-fade">
      <div v-if="modal.open" class="modal-backdrop" @click.self="modal.open = false">
        <div class="modal-box">
          <button class="modal-close" @click="modal.open = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>

          <!-- Nuevo / Editar colaborador -->
          <template v-if="modal.type === 'nuevo' || modal.type === 'editar'">
            <h3 class="modal-title">{{ modal.type === 'nuevo' ? 'Agregar colaborador' : 'Editar colaborador' }}</h3>
            <p class="modal-subtitle">Información personal y laboral</p>
            <form class="modal-form" @submit.prevent="guardarEmpleado">
              <div class="form-section-title">Datos personales</div>
              <div class="form-row">
                <div class="form-field"><label>Nombre completo <span class="req">*</span></label><input v-model="empForm.nombre" type="text" placeholder="Ana Vargas Mora" required /></div>
                <div class="form-field"><label>Identificación <span class="req">*</span></label><input v-model="empForm.identificacion" type="text" placeholder="1-2345-6789" required /></div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Fecha de nacimiento</label><DatePicker v-model="empForm.fechaNacimiento" /></div>
                <div class="form-field"><label>Género</label>
                  <select v-model="empForm.genero"><option>Femenino</option><option>Masculino</option><option>Otro</option></select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Teléfono</label><input v-model="empForm.telefono" type="tel" placeholder="8888-9999" /></div>
                <div class="form-field"><label>Correo electrónico</label><input v-model="empForm.correo" type="email" placeholder="correo@cooperativa.com" /></div>
              </div>
              <div class="form-field form-field--full"><label>Dirección</label><input v-model="empForm.direccion" type="text" placeholder="Provincia, Cantón, Distrito" /></div>

              <div class="form-section-title" style="margin-top:18px">Datos laborales</div>
              <div class="form-row">
                <div class="form-field"><label>Puesto <span class="req">*</span></label><input v-model="empForm.puesto" type="text" placeholder="Gerente, Contador..." required /></div>
                <div class="form-field"><label>Departamento <span class="req">*</span></label>
                  <select v-model="empForm.departamento" required><option value="">Seleccionar</option><option>Administración</option><option>Operaciones</option><option>Finanzas</option></select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Fecha de ingreso</label><DatePicker v-model="empForm.fechaIngreso" /></div>
                <div class="form-field"><label>Tipo de contrato</label>
                  <select v-model="empForm.tipoContrato"><option>Tiempo completo</option><option>Tiempo parcial</option><option>Por servicios</option></select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Salario base (₡)</label><input v-model="empForm.salario" type="number" placeholder="500000" /></div>
                <div class="form-field"><label>Estado</label>
                  <select v-model="empForm.activo"><option value="true">Activo</option><option value="false">Inactivo</option></select>
                </div>
              </div>
              <div class="modal-actions">
                <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
                <button type="submit" class="btn-primary">Guardar</button>
              </div>
            </form>
          </template>

          <!-- Solicitud de vacaciones -->
          <template v-if="modal.type === 'vacacion'">
            <h3 class="modal-title">Solicitud de vacaciones</h3>
            <p class="modal-subtitle">Ingresa el período de vacaciones solicitado</p>
            <form class="modal-form" @submit.prevent="enviarVacacion">
              <div class="form-field">
                <label>Colaborador <span class="req">*</span></label>
                <select v-model="vacacionForm.empleadoId" required><option value="">Seleccionar</option><option v-for="e in employees" :key="e.id" :value="e.id">{{ e.name }}</option></select>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Fecha inicio <span class="req">*</span></label><DatePicker v-model="vacacionForm.inicio" required /></div>
                <div class="form-field"><label>Fecha fin <span class="req">*</span></label><DatePicker v-model="vacacionForm.fin" required /></div>
              </div>
              <div class="form-field"><label>Observaciones</label><textarea v-model="vacacionForm.motivo" rows="3" placeholder="Motivo o notas adicionales..."></textarea></div>
              <div v-if="solicitudError" class="req" style="font-size:12.5px;">{{ solicitudError }}</div>
              <div class="modal-actions">
                <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
                <button type="submit" class="btn-primary">Enviar solicitud</button>
              </div>
            </form>
          </template>

          <!-- Solicitud de permiso -->
          <template v-if="modal.type === 'permiso'">
            <h3 class="modal-title">Solicitud de permiso</h3>
            <p class="modal-subtitle">Registra el tipo de permiso solicitado</p>
            <form class="modal-form" @submit.prevent="enviarPermiso">
              <div class="form-field">
                <label>Colaborador <span class="req">*</span></label>
                <select v-model="permisoForm.empleadoId" required><option value="">Seleccionar</option><option v-for="e in employees" :key="e.id" :value="e.id">{{ e.name }}</option></select>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Tipo de permiso <span class="req">*</span></label>
                  <select v-model="permisoForm.tipo" required>
                    <option value="">Seleccionar</option>
                    <option>Con goce salarial</option>
                    <option>Sin goce salarial</option>
                    <option>Cita médica</option>
                    <option>Maternidad</option>
                    <option>Paternidad</option>
                    <option>Fallecimiento familiar</option>
                    <option>Estudio</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div class="form-field"><label>Fecha <span class="req">*</span></label><DatePicker v-model="permisoForm.fecha" required /></div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Horas <span class="req">*</span></label><input v-model="permisoForm.horas" type="number" min="1" max="8" placeholder="4" required /></div>
                <div class="form-field"><label>Evidencia (opcional)</label><input type="file" /></div>
              </div>
              <div class="form-field"><label>Motivo</label><textarea v-model="permisoForm.motivo" rows="2" placeholder="Descripción del motivo..."></textarea></div>
              <div v-if="solicitudError" class="req" style="font-size:12.5px;">{{ solicitudError }}</div>
              <div class="modal-actions">
                <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
                <button type="submit" class="btn-primary">Enviar solicitud</button>
              </div>
            </form>
          </template>

          <!-- Subir documento -->
          <template v-if="modal.type === 'documento'">
            <h3 class="modal-title">Subir documento</h3>
            <p class="modal-subtitle">Adjunta un documento al expediente del colaborador</p>
            <form class="modal-form" @submit.prevent="modal.open = false">
              <div class="form-field">
                <label>Colaborador <span class="req">*</span></label>
                <select required><option value="">Seleccionar</option><option v-for="e in employees" :key="e.id">{{ e.name }}</option></select>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Categoría <span class="req">*</span></label>
                  <select required>
                    <option value="">Seleccionar</option>
                    <option>Personales</option>
                    <option>Laborales</option>
                    <option>Académicos</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Tipo de documento <span class="req">*</span></label>
                  <select required>
                    <option value="">Seleccionar</option>
                    <optgroup label="Personales">
                      <option>Cédula de identidad</option>
                      <option>Pasaporte</option>
                      <option>Licencia de conducir</option>
                      <option>Certificación</option>
                    </optgroup>
                    <optgroup label="Laborales">
                      <option>Contrato laboral</option>
                      <option>Adenda contractual</option>
                      <option>Nombramiento</option>
                      <option>Carta disciplinaria</option>
                    </optgroup>
                    <optgroup label="Académicos">
                      <option>Título académico</option>
                      <option>Certificación de estudios</option>
                      <option>Constancia</option>
                    </optgroup>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Fecha de emisión</label><DatePicker /></div>
                <div class="form-field"><label>Fecha de vencimiento <span class="text-muted-sm">(si aplica)</span></label><DatePicker /></div>
              </div>
              <div class="form-field">
                <label>Archivo <span class="req">*</span></label>
                <div class="file-drop">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7A90A0" stroke-width="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p>Arrastra el archivo aquí o <label class="file-link">selecciona uno<input type="file" accept=".pdf,.doc,.docx,.jpg,.png" hidden /></label></p>
                  <small>PDF, Word, JPG o PNG — máx. 10 MB</small>
                </div>
              </div>
              <div class="form-field"><label>Observaciones</label><textarea rows="2" placeholder="Notas sobre el documento..."></textarea></div>
              <div class="modal-actions">
                <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
                <button type="submit" class="btn-primary">Guardar documento</button>
              </div>
            </form>
          </template>

          <!-- Registrar asistencia -->
          <template v-if="modal.type === 'asistencia'">
            <h3 class="modal-title">Registrar asistencia</h3>
            <p class="modal-subtitle">Ingreso manual de entrada o salida de un colaborador</p>
            <form class="modal-form" @submit.prevent="modal.open = false">
              <div class="form-field">
                <label>Colaborador <span class="req">*</span></label>
                <select required><option value="">Seleccionar</option><option v-for="e in employees" :key="e.id">{{ e.name }}</option></select>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Fecha <span class="req">*</span></label><DatePicker required /></div>
                <div class="form-field">
                  <label>Tipo de registro <span class="req">*</span></label>
                  <select required>
                    <option value="">Seleccionar</option>
                    <option>Entrada</option>
                    <option>Salida</option>
                    <option>Entrada y salida</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Hora de entrada</label><input type="time" /></div>
                <div class="form-field"><label>Hora de salida</label><input type="time" /></div>
              </div>
              <div class="form-field">
                <label>Método de registro</label>
                <select>
                  <option>Manual</option>
                  <option>Código QR</option>
                  <option>Aplicación móvil</option>
                  <option>Geolocalización</option>
                </select>
              </div>
              <div class="form-field"><label>Observaciones</label><textarea rows="2" placeholder="Justificación o nota del registro..."></textarea></div>
              <div class="modal-actions">
                <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
                <button type="submit" class="btn-primary">Registrar</button>
              </div>
            </form>
          </template>

          <!-- Nueva incapacidad -->
          <template v-if="modal.type === 'incapacidad'">
            <h3 class="modal-title">Registrar incapacidad</h3>
            <p class="modal-subtitle">Ingresa los datos del certificado de incapacidad</p>
            <form class="modal-form" @submit.prevent="modal.open = false">
              <div class="form-field">
                <label>Colaborador <span class="req">*</span></label>
                <select required><option value="">Seleccionar</option><option v-for="e in employees" :key="e.id">{{ e.name }}</option></select>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Fecha inicio <span class="req">*</span></label><DatePicker required /></div>
                <div class="form-field"><label>Fecha fin <span class="req">*</span></label><DatePicker required /></div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Institución emisora <span class="req">*</span></label>
                  <select required>
                    <option value="">Seleccionar</option>
                    <option>CCSS</option>
                    <option>INS</option>
                    <option>Médico privado</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div class="form-field"><label>N.º de certificado</label><input type="text" placeholder="Número del documento" /></div>
              </div>
              <div class="form-field"><label>Diagnóstico general <span class="text-muted-sm">(opcional)</span></label><input type="text" placeholder="Descripción general sin datos médicos sensibles" /></div>
              <div class="form-field">
                <label>Documento adjunto <span class="req">*</span></label>
                <input type="file" accept=".pdf,.jpg,.png" required />
              </div>
              <div class="form-field"><label>Observaciones</label><textarea rows="2" placeholder="Notas adicionales..."></textarea></div>
              <div class="modal-actions">
                <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
                <button type="submit" class="btn-primary">Registrar incapacidad</button>
              </div>
            </form>
          </template>

          <!-- Nueva capacitación -->
          <template v-if="modal.type === 'capacitacion'">
            <h3 class="modal-title">Nueva capacitación</h3>
            <p class="modal-subtitle">Registra una capacitación para el plan de formación</p>
            <form class="modal-form" @submit.prevent="guardarCapacitacion">
              <div class="form-field form-field--full">
                <label>Nombre / Tema <span class="req">*</span></label>
                <input v-model="capacitacionForm.nombre" type="text" placeholder="Ej: Excel avanzado para finanzas" required />
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Categoría <span class="req">*</span></label>
                  <select v-model="capacitacionForm.categoria" required>
                    <option value="">Seleccionar</option>
                    <option>Tecnología</option>
                    <option>Finanzas</option>
                    <option>Liderazgo</option>
                    <option>Normativa</option>
                    <option>Atención al asociado</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Modalidad <span class="req">*</span></label>
                  <select v-model="capacitacionForm.modalidad" required>
                    <option value="">Seleccionar</option>
                    <option>Presencial</option>
                    <option>Virtual</option>
                    <option>Mixta</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Fecha <span class="req">*</span></label><DatePicker v-model="capacitacionForm.fecha" required /></div>
                <div class="form-field"><label>Duración (horas) <span class="req">*</span></label><input v-model="capacitacionForm.horas" type="number" min="1" placeholder="8" required /></div>
              </div>
              <div class="form-row">
                <div class="form-field"><label>Instructor / Proveedor</label><input v-model="capacitacionForm.instructor" type="text" placeholder="Nombre del facilitador o empresa" /></div>
                <div class="form-field">
                  <label>Estado</label>
                  <select v-model="capacitacionForm.estado">
                    <option>Programada</option>
                    <option>En curso</option>
                    <option>Finalizada</option>
                  </select>
                </div>
              </div>
              <div class="form-field">
                <label>Departamentos participantes</label>
                <div class="checkbox-group">
                  <label class="checkbox-item"><input type="checkbox" /> Administración</label>
                  <label class="checkbox-item"><input type="checkbox" /> Finanzas</label>
                  <label class="checkbox-item"><input type="checkbox" /> Operaciones</label>
                  <label class="checkbox-item"><input type="checkbox" /> Todos</label>
                </div>
              </div>
              <div class="form-field"><label>Descripción</label><textarea rows="3" placeholder="Objetivos, contenido o notas sobre la capacitación..."></textarea></div>
              <div class="form-field"><label>Materiales / Adjunto</label><input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" /></div>
              <div v-if="capacitacionError" class="req" style="font-size:12.5px;">{{ capacitacionError }}</div>
              <div class="modal-actions">
                <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
                <button type="submit" class="btn-primary">Guardar capacitación</button>
              </div>
            </form>
          </template>

          <!-- Nueva evaluación -->
          <template v-if="modal.type === 'evaluacion'">
            <h3 class="modal-title">Nueva evaluación de desempeño</h3>
            <p class="modal-subtitle">Inicia el proceso de evaluación para un colaborador</p>
            <form class="modal-form" @submit.prevent="modal.open = false">
              <div class="form-row">
                <div class="form-field">
                  <label>Colaborador a evaluar <span class="req">*</span></label>
                  <select required><option value="">Seleccionar</option><option v-for="e in employees" :key="e.id">{{ e.name }}</option></select>
                </div>
                <div class="form-field">
                  <label>Evaluador <span class="req">*</span></label>
                  <select required><option value="">Seleccionar</option><option v-for="e in employees" :key="e.id">{{ e.name }}</option></select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-field">
                  <label>Período <span class="req">*</span></label>
                  <select required>
                    <option value="">Seleccionar</option>
                    <option>Trimestral</option>
                    <option>Semestral</option>
                    <option>Anual</option>
                  </select>
                </div>
                <div class="form-field">
                  <label>Tipo de evaluación <span class="req">*</span></label>
                  <select required>
                    <option value="">Seleccionar</option>
                    <option>Autoevaluación</option>
                    <option>Jefatura</option>
                    <option>180°</option>
                    <option>360°</option>
                  </select>
                </div>
              </div>
              <div class="form-field"><label>Fecha programada <span class="req">*</span></label><DatePicker required /></div>

              <div class="form-section-title" style="margin-top:4px">Competencias a evaluar</div>
              <div class="eval-competencias">
                <div class="comp-item" v-for="comp in ['Trabajo en equipo','Liderazgo','Comunicación','Productividad','Servicio al asociado']" :key="comp">
                  <span class="comp-label">{{ comp }}</span>
                  <div class="comp-stars">
                    <button type="button" v-for="n in 5" :key="n" class="star-btn">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C5D5E5" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div class="form-field"><label>Objetivos / Metas del período</label><textarea rows="3" placeholder="Describe las metas individuales o indicadores del colaborador..."></textarea></div>
              <div class="form-field"><label>Observaciones generales</label><textarea rows="2" placeholder="Notas del evaluador..."></textarea></div>
              <div class="modal-actions">
                <button type="button" class="btn-outline" @click="modal.open = false">Cancelar</button>
                <button type="submit" class="btn-primary">Crear evaluación</button>
              </div>
            </form>
          </template>

        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { exportCSV, exportPDF } from '../composables/useExport.js'
import { useRole } from '../composables/useRole.js'
import { useAuth } from '../composables/useAuth.js'
import { usePersonal } from '../composables/usePersonal.js'
import { isSupabaseConfigured } from '../lib/supabase.js'
import DatePicker from '../components/DatePicker.vue'

const { isAdmin, isOperador } = useRole()
const { cooperativaId } = useAuth()
const {
  listDepartamentos, listCargos, listEmpleados, createEmpleado, updateEmpleado,
  findOrCreateDepartamento, findOrCreateCargo,
  listPermisos, crearPermiso, resolverPermiso, listCapacitaciones, crearCapacitacion,
} = usePersonal()

const ANA_ID = 3

const activeTab = ref('dashboard')
const search = ref('')
const filterDept = ref('')
const filterStatus = ref('')
const selectedEmp = ref(null)

const modal = reactive({ open: false, type: '', data: null })

function ddmmyyyyToInputDate(d) {
  if (!d) return ''
  const [dd, mm, yyyy] = d.split('/')
  return dd && mm && yyyy ? `${yyyy}-${mm}-${dd}` : ''
}
function inputDateToDdmmyyyy(d) {
  if (!d) return ''
  const [yyyy, mm, dd] = d.split('-')
  return dd && mm && yyyy ? `${dd}/${mm}/${yyyy}` : ''
}
function initialsFromName(name) {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (parts[0] || '?').slice(0, 2).toUpperCase()
}
const AVATAR_COLORS = ['#133C65', '#1A9152', '#7B3FA0', '#C47F0C', '#C0392B', '#1565C0', '#00808C']

const EMPTY_EMP_FORM = {
  nombre: '', identificacion: '', fechaNacimiento: '', genero: 'Femenino',
  telefono: '', correo: '', direccion: '',
  puesto: '', departamento: '', fechaIngreso: '', tipoContrato: 'Tiempo completo',
  salario: '', activo: 'true',
}
const empForm = reactive({ ...EMPTY_EMP_FORM })

function openModal(type, data = null) {
  modal.type = type
  modal.data = data
  if (type === 'editar' && data) {
    Object.assign(empForm, {
      nombre: data.name || '',
      identificacion: data.identificacion || '',
      fechaNacimiento: data.fechaNacimiento || '',
      genero: data.genero || 'Femenino',
      telefono: data.telefono || '',
      correo: data.correo || '',
      direccion: data.direccion || '',
      puesto: data.role || '',
      departamento: data.dept || '',
      fechaIngreso: ddmmyyyyToInputDate(data.date),
      tipoContrato: data.tipoContrato || 'Tiempo completo',
      salario: data.salario || '',
      activo: String(data.active),
    })
  } else if (type === 'nuevo') {
    Object.assign(empForm, EMPTY_EMP_FORM)
  }
  modal.open = true
}

const empFormError = ref(null)
const empFormSaving = ref(false)

async function guardarEmpleado() {
  const activo = empForm.activo === 'true'

  if (!isSupabaseConfigured()) {
    if (modal.type === 'editar' && modal.data) {
      const emp = employees.value.find(e => e.id === modal.data.id)
      if (emp) {
        Object.assign(emp, {
          name: empForm.nombre,
          identificacion: empForm.identificacion,
          fechaNacimiento: empForm.fechaNacimiento,
          genero: empForm.genero,
          telefono: empForm.telefono,
          correo: empForm.correo,
          direccion: empForm.direccion,
          role: empForm.puesto,
          dept: empForm.departamento,
          date: inputDateToDdmmyyyy(empForm.fechaIngreso) || emp.date,
          tipoContrato: empForm.tipoContrato,
          salario: empForm.salario,
          active: activo,
          initials: initialsFromName(empForm.nombre),
        })
      }
    } else {
      employees.value.push({
        id: Math.max(0, ...employees.value.map(e => e.id)) + 1,
        name: empForm.nombre,
        initials: initialsFromName(empForm.nombre),
        color: AVATAR_COLORS[employees.value.length % AVATAR_COLORS.length],
        identificacion: empForm.identificacion,
        fechaNacimiento: empForm.fechaNacimiento,
        genero: empForm.genero,
        telefono: empForm.telefono,
        correo: empForm.correo,
        direccion: empForm.direccion,
        role: empForm.puesto,
        dept: empForm.departamento,
        date: inputDateToDdmmyyyy(empForm.fechaIngreso) || '—',
        tipoContrato: empForm.tipoContrato,
        salario: empForm.salario,
        active: activo,
      })
    }
    modal.open = false
    return
  }

  empFormSaving.value = true
  empFormError.value = null

  const { data: depto, error: deptoErr } = await findOrCreateDepartamento(cooperativaId.value, empForm.departamento)
  if (deptoErr) { empFormSaving.value = false; empFormError.value = deptoErr.message; return }
  const { data: cargo, error: cargoErr } = await findOrCreateCargo(cooperativaId.value, empForm.puesto, depto?.id)
  if (cargoErr) { empFormSaving.value = false; empFormError.value = cargoErr.message; return }

  const payload = { ...empForm, cargoId: cargo?.id, departamentoId: depto?.id, activo }
  const { error } = modal.type === 'editar' && modal.data
    ? await updateEmpleado(modal.data.id, payload)
    : await createEmpleado(cooperativaId.value, payload)

  empFormSaving.value = false
  if (error) { empFormError.value = error.message; return }

  await loadEmpleados()
  modal.open = false
}

const empleadosLoadError = ref(null)

async function loadEmpleados() {
  if (!isSupabaseConfigured()) return
  const { data, error } = await listEmpleados()
  if (error) { empleadosLoadError.value = error.message; return }
  employees.value = data || []
}

onMounted(async () => {
  await loadEmpleados()
  if (isOperador.value) {
    selectedEmp.value = employees.value.find(e => e.id === ANA_ID) ?? null
    activeTab.value = 'expedientes'
  }
})

watch(isOperador, (val) => {
  if (val) {
    selectedEmp.value = employees.value.find(e => e.id === ANA_ID) ?? null
    activeTab.value = 'expedientes'
  } else {
    selectedEmp.value = null
    activeTab.value = 'dashboard'
  }
})

/* ── Pestañas ───────────────────────────── */
const tabs = [
  { key: 'dashboard',    label: 'Inicio',        icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>` },
  { key: 'expedientes',  label: 'Expedientes',   icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>` }, // eslint-disable-line
  { key: 'documentos',   label: 'Documentos',    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` },
  { key: 'vacaciones',   label: 'Vacaciones',    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
  { key: 'permisos',     label: 'Permisos',      icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>` },
  { key: 'asistencia',   label: 'Asistencia',    icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
  { key: 'incapacidades',label: 'Incapacidades', icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>` },
  { key: 'capacitaciones',label:'Capacitaciones',icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
  { key: 'evaluaciones', label: 'Evaluaciones',  icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
]

/* ── Indicadores ────────────────────────── */
const INDICATOR_META = [
  { key: 'total',       label: 'Total colaboradores',     bg: 'rgba(19,60,101,0.1)',   icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#133C65" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
  { key: 'activos',     label: 'Activos',                 bg: 'rgba(26,145,82,0.1)',   icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1A9152" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` },
  { key: 'inactivos',   label: 'Inactivos',               bg: 'rgba(112,113,115,0.1)', icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#707173" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>` },
  { key: 'vacpend',     label: 'Vac. pendientes',         bg: 'rgba(21,101,192,0.1)',  icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1565C0" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>` },
  { key: 'permpend',    label: 'Permisos pendientes',     bg: 'rgba(123,63,160,0.1)',  icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7B3FA0" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>` },
  { key: 'capac',       label: 'Capacitaciones progr.',   bg: 'rgba(0,128,140,0.1)',   icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00808C" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
  { key: 'cumple',      label: 'Cumpleaños del mes',      bg: 'rgba(236,64,122,0.1)',  icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EC407A" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
]
// evalp/contratos: sin modelo de datos todavia (evaluaciones de desempeño,
// fecha de vencimiento de contrato); se omiten en vez de mostrar cifras falsas.

const indicatorValues = computed(() => {
  const mesActual = new Date().getMonth() + 1
  return {
    total: employees.value.length,
    activos: employees.value.filter(e => e.active).length,
    inactivos: employees.value.filter(e => !e.active).length,
    vacpend: vacaciones.value.filter(v => v.status === 'Pendiente').length,
    permpend: permisos.value.filter(p => p.status === 'Pendiente').length,
    capac: capacitaciones.value.filter(c => c.status === 'Programada').length,
    cumple: employees.value.filter(e => e.fechaNacimiento && Number(e.fechaNacimiento.slice(5, 7)) === mesActual).length,
  }
})

const indicators = computed(() => INDICATOR_META.map(m => ({ ...m, value: indicatorValues.value[m.key] ?? 0 })))

const visibleEmployees = computed(() =>
  isOperador.value ? employees.value.filter(e => e.id === ANA_ID) : employees.value
)

const visibleTabs = computed(() => {
  if (isOperador.value) {
    return tabs
      .filter(t => t.key !== 'dashboard' && t.key !== 'historial' && t.key !== 'reportes')
      .map(t => t.key === 'expedientes' ? { ...t, label: 'Expediente' } : t)
  }
  return tabs
})

/* ── Empleados ──────────────────────────── */
const DEMO_EMPLOYEES = [
  { id: 1, name: 'María Rodríguez', initials: 'MR', color: '#133C65', role: 'Gerente General',    dept: 'Administración', date: '01/03/2018', active: true },
  { id: 2, name: 'Carlos Solano',   initials: 'CS', color: '#1A9152', role: 'Contador',           dept: 'Finanzas',       date: '15/07/2019', active: true },
  { id: 3, name: 'Ana Vargas',      initials: 'AV', color: '#7B3FA0', role: 'Asistente Admin.',   dept: 'Administración', date: '20/01/2021', active: true },
  { id: 4, name: 'Luis Jiménez',    initials: 'LJ', color: '#C47F0C', role: 'Operador de Caja',   dept: 'Operaciones',    date: '10/05/2020', active: false },
  { id: 5, name: 'Patricia Mora',   initials: 'PM', color: '#C0392B', role: 'Oficial de Crédito', dept: 'Operaciones',    date: '03/09/2022', active: true },
]
const employees = ref(isSupabaseConfigured() ? [] : DEMO_EMPLOYEES)

const filteredEmployees = computed(() =>
  employees.value.filter(e => {
    const matchSearch = !search.value || e.name.toLowerCase().includes(search.value.toLowerCase()) || e.role.toLowerCase().includes(search.value.toLowerCase())
    const matchDept   = !filterDept.value || e.dept === filterDept.value
    const matchStatus = filterStatus.value === '' || String(e.active) === filterStatus.value
    return matchSearch && matchDept && matchStatus
  })
)

/* ── Vacaciones mock ────────────────────── */
const DEMO_VACACIONES = [
  { id: 1, name: 'María Rodríguez', initials: 'MR', color: '#133C65', inicio: '23/06/2026', fin: '04/07/2026', dias: 10, status: 'Pendiente', statusClass: 'yellow' },
  { id: 2, name: 'Carlos Solano',   initials: 'CS', color: '#1A9152', inicio: '07/07/2026', fin: '11/07/2026', dias: 5,  status: 'Aprobada',  statusClass: 'green' },
  { id: 3, name: 'Ana Vargas',      initials: 'AV', color: '#7B3FA0', inicio: '14/07/2026', fin: '17/07/2026', dias: 4,  status: 'Pendiente', statusClass: 'yellow' },
]
const vacaciones = ref(isSupabaseConfigured() ? [] : DEMO_VACACIONES)

/* ── Permisos mock ──────────────────────── */
const DEMO_PERMISOS = [
  { id: 1, name: 'Patricia Mora', initials: 'PM', color: '#C0392B', tipo: 'Cita médica',        fecha: '16/06/2026', horas: 4, status: 'Pendiente', statusClass: 'yellow' },
  { id: 2, name: 'Luis Jiménez',  initials: 'LJ', color: '#C47F0C', tipo: 'Con goce salarial',  fecha: '17/06/2026', horas: 8, status: 'Aprobado',  statusClass: 'green' },
  { id: 3, name: 'Ana Vargas',    initials: 'AV', color: '#7B3FA0', tipo: 'Estudio',            fecha: '20/06/2026', horas: 3, status: 'Pendiente', statusClass: 'yellow' },
]
const permisos = ref(isSupabaseConfigured() ? [] : DEMO_PERMISOS)

async function loadVacacionesYPermisos() {
  if (!isSupabaseConfigured()) return
  const [{ data: vacs }, { data: perms }] = await Promise.all([
    listPermisos({ vacaciones: true }),
    listPermisos({ vacaciones: false }),
  ])
  vacaciones.value = (vacs || []).map(p => ({ id: p.id, name: p.name, initials: p.initials, color: p.color, inicio: p.fecha, fin: p.fecha, dias: p.horas, status: p.status, statusClass: p.statusClass }))
  permisos.value = perms || []
}
onMounted(loadVacacionesYPermisos)

/* ── Nueva solicitud de vacaciones/permiso ── */
const vacacionForm = reactive({ empleadoId: '', inicio: '', fin: '', motivo: '' })
const permisoForm = reactive({ empleadoId: '', tipo: '', fecha: '', horas: 8, motivo: '' })
const solicitudError = ref(null)

async function enviarVacacion() {
  if (!isSupabaseConfigured()) { modal.open = false; return }
  if (!vacacionForm.empleadoId || !vacacionForm.inicio || !vacacionForm.fin) return
  solicitudError.value = null
  const dias = Math.max(1, Math.round((new Date(vacacionForm.fin) - new Date(vacacionForm.inicio)) / 86400000) + 1)
  const { error } = await crearPermiso(cooperativaId.value, {
    empleadoId: vacacionForm.empleadoId, tipo: 'Vacaciones', fecha: vacacionForm.inicio, horas: dias * 8, motivo: vacacionForm.motivo,
  })
  if (error) { solicitudError.value = error.message; return }
  Object.assign(vacacionForm, { empleadoId: '', inicio: '', fin: '', motivo: '' })
  await loadVacacionesYPermisos()
  modal.open = false
}

async function enviarPermiso() {
  if (!isSupabaseConfigured()) { modal.open = false; return }
  if (!permisoForm.empleadoId || !permisoForm.tipo || !permisoForm.fecha) return
  solicitudError.value = null
  const { error } = await crearPermiso(cooperativaId.value, permisoForm)
  if (error) { solicitudError.value = error.message; return }
  Object.assign(permisoForm, { empleadoId: '', tipo: '', fecha: '', horas: 8, motivo: '' })
  await loadVacacionesYPermisos()
  modal.open = false
}

/* ── Documentos mock ────────────────────── */
const docGrupos = [
  {
    cat: 'Documentos personales',
    bg: 'rgba(19,60,101,0.08)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#133C65" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    docs: [
      { id: 1, name: 'María Rodríguez', initials: 'MR', color: '#133C65', tipo: 'Cédula de identidad',   carga: '01/03/2018', vence: '15/09/2027', venceAlert: false, status: 'Vigente',  statusClass: 'green' },
      { id: 2, name: 'Carlos Solano',   initials: 'CS', color: '#1A9152', tipo: 'Licencia de conducir',  carga: '15/07/2019', vence: '30/06/2026', venceAlert: true,  status: 'Por vencer',statusClass: 'yellow' },
      { id: 3, name: 'Ana Vargas',      initials: 'AV', color: '#7B3FA0', tipo: 'Cédula de identidad',   carga: '20/01/2021', vence: '10/12/2028', venceAlert: false, status: 'Vigente',  statusClass: 'green' },
    ]
  },
  {
    cat: 'Documentos laborales',
    bg: 'rgba(26,145,82,0.08)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1A9152" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>`,
    docs: [
      { id: 4, name: 'María Rodríguez', initials: 'MR', color: '#133C65', tipo: 'Contrato laboral',    carga: '01/03/2018', vence: null,          venceAlert: false, status: 'Activo',  statusClass: 'green' },
      { id: 5, name: 'Patricia Mora',   initials: 'PM', color: '#C0392B', tipo: 'Nombramiento',        carga: '03/09/2022', vence: '03/09/2024',  venceAlert: true,  status: 'Vencido', statusClass: 'gray' },
      { id: 6, name: 'Luis Jiménez',    initials: 'LJ', color: '#C47F0C', tipo: 'Adenda contractual',  carga: '10/01/2024', vence: null,           venceAlert: false, status: 'Activo',  statusClass: 'green' },
    ]
  },
  {
    cat: 'Documentos académicos',
    bg: 'rgba(123,63,160,0.08)',
    icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7B3FA0" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    docs: [
      { id: 7, name: 'Carlos Solano', initials: 'CS', color: '#1A9152', tipo: 'Título universitario',     carga: '15/07/2019', vence: null,         venceAlert: false, status: 'Vigente', statusClass: 'green' },
      { id: 8, name: 'Ana Vargas',    initials: 'AV', color: '#7B3FA0', tipo: 'Certificación técnica',    carga: '05/06/2023', vence: '05/06/2025', venceAlert: true,  status: 'Por vencer', statusClass: 'yellow' },
    ]
  }
]

/* ── Asistencia mock ────────────────────── */
const asistencias = [
  { id: 1, name: 'María Rodríguez', initials: 'MR', color: '#133C65', fecha: '15/06/2026', entrada: '07:58', salida: '17:05', horas: 9,   extra: 1,    status: 'Completo',  statusClass: 'green' },
  { id: 2, name: 'Carlos Solano',   initials: 'CS', color: '#1A9152', fecha: '15/06/2026', entrada: '08:22', salida: '17:01', horas: 8.6, extra: null, status: 'Tardía',    statusClass: 'yellow' },
  { id: 3, name: 'Ana Vargas',      initials: 'AV', color: '#7B3FA0', fecha: '15/06/2026', entrada: '08:00', salida: null,    horas: null,extra: null, status: 'En oficina',statusClass: 'blue' },
  { id: 4, name: 'Patricia Mora',   initials: 'PM', color: '#C0392B', fecha: '15/06/2026', entrada: '07:55', salida: '16:58', horas: 9,   extra: 1,    status: 'Completo',  statusClass: 'green' },
  { id: 5, name: 'Luis Jiménez',    initials: 'LJ', color: '#C47F0C', fecha: '15/06/2026', entrada: null,   salida: null,    horas: null,extra: null, status: 'Ausente',   statusClass: 'gray' },
  { id: 6, name: 'María Rodríguez', initials: 'MR', color: '#133C65', fecha: '13/06/2026', entrada: '08:01', salida: '17:00', horas: 9,   extra: 1,    status: 'Completo',  statusClass: 'green' },
  { id: 7, name: 'Carlos Solano',   initials: 'CS', color: '#1A9152', fecha: '13/06/2026', entrada: '08:00', salida: '17:00', horas: 8,   extra: null, status: 'Completo',  statusClass: 'green' },
]

/* ── Incapacidades mock ─────────────────── */
const incapacidades = [
  { id: 1, name: 'Carlos Solano',   initials: 'CS', color: '#1A9152', inicio: '02/06/2026', fin: '05/06/2026', dias: 3, institucion: 'CCSS',           diagnostico: 'Cuadro respiratorio', status: 'Aprobada',  statusClass: 'green' },
  { id: 2, name: 'Ana Vargas',      initials: 'AV', color: '#7B3FA0', inicio: '10/06/2026', fin: '12/06/2026', dias: 2, institucion: 'Médico privado',  diagnostico: '',                    status: 'Aprobada',  statusClass: 'green' },
  { id: 3, name: 'Luis Jiménez',    initials: 'LJ', color: '#C47F0C', inicio: '15/06/2026', fin: '17/06/2026', dias: 3, institucion: 'CCSS',           diagnostico: '',                    status: 'Pendiente', statusClass: 'yellow' },
]

/* ── Capacitaciones mock ────────────────── */
const DEMO_CAPACITACIONES = [
  { id: 1, nombre: 'Excel avanzado para finanzas', depto: 'Finanzas', categoria: 'Tecnología',  modalidad: 'Virtual',     modalidadClass: 'virtual',     fecha: '05/05/2026', horas: 16, instructor: 'TechPro CR',     asistentes: 8,  status: 'Finalizada',  statusClass: 'green' },
  { id: 2, nombre: 'Atención al asociado',         depto: 'Operaciones', categoria: 'Servicio', modalidad: 'Presencial',   modalidadClass: 'presencial',  fecha: '12/05/2026', horas: 8,  instructor: 'Laura Soto',     asistentes: 14, status: 'Finalizada',  statusClass: 'green' },
  { id: 3, nombre: 'Normativa SUGEF actualizada',  depto: 'Todos',       categoria: 'Normativa',modalidad: 'Virtual',     modalidadClass: 'virtual',     fecha: '20/06/2026', horas: 4,  instructor: 'SUGEF',          asistentes: 28, status: 'Programada',  statusClass: 'blue' },
  { id: 4, nombre: 'Liderazgo y trabajo en equipo',depto: 'Admin.',      categoria: 'Liderazgo',modalidad: 'Mixta',       modalidadClass: 'mixta',       fecha: '10/07/2026', horas: 12, instructor: 'Consultores SA', asistentes: 6,  status: 'Programada',  statusClass: 'blue' },
  { id: 5, nombre: 'Prevención de riesgos',        depto: 'Todos',       categoria: 'Normativa',modalidad: 'Presencial',  modalidadClass: 'presencial',  fecha: '15/03/2026', horas: 6,  instructor: 'INS',            asistentes: 32, status: 'Finalizada',  statusClass: 'green' },
]
const capacitaciones = ref(isSupabaseConfigured() ? [] : DEMO_CAPACITACIONES)

async function loadCapacitaciones() {
  if (!isSupabaseConfigured()) return
  const { data, error } = await listCapacitaciones()
  if (!error) capacitaciones.value = data || []
}
onMounted(loadCapacitaciones)

const capacitacionForm = reactive({ nombre: '', categoria: '', modalidad: '', fecha: '', horas: '', instructor: '', estado: 'Programada' })
const capacitacionError = ref(null)

async function guardarCapacitacion() {
  if (!isSupabaseConfigured()) { modal.open = false; return }
  if (!capacitacionForm.nombre || !capacitacionForm.categoria || !capacitacionForm.modalidad || !capacitacionForm.fecha || !capacitacionForm.horas) return
  capacitacionError.value = null
  const { error } = await crearCapacitacion(cooperativaId.value, capacitacionForm)
  if (error) { capacitacionError.value = error.message; return }
  Object.assign(capacitacionForm, { nombre: '', categoria: '', modalidad: '', fecha: '', horas: '', instructor: '', estado: 'Programada' })
  await loadCapacitaciones()
  modal.open = false
}

/* ── Evaluaciones mock ──────────────────── */
const evaluaciones = [
  { id: 1, name: 'María Rodríguez', initials: 'MR', color: '#133C65', periodo: 'Semestral', tipo: 'Jefatura',      evaluador: 'Gerencia',        fecha: '30/06/2026', calificacion: null, calClass: '',      status: 'Pendiente',   statusClass: 'yellow' },
  { id: 2, name: 'Carlos Solano',   initials: 'CS', color: '#1A9152', periodo: 'Anual',     tipo: '360°',          evaluador: 'Comité RRHH',     fecha: '15/12/2025', calificacion: 87,   calClass: 'good',  status: 'Completada',  statusClass: 'green' },
  { id: 3, name: 'Ana Vargas',      initials: 'AV', color: '#7B3FA0', periodo: 'Semestral', tipo: 'Autoevaluación', evaluador: 'Ana Vargas',     fecha: '30/06/2026', calificacion: null, calClass: '',      status: 'En proceso',  statusClass: 'blue' },
  { id: 4, name: 'Patricia Mora',   initials: 'PM', color: '#C0392B', periodo: 'Anual',     tipo: 'Jefatura',      evaluador: 'Gerencia',        fecha: '15/12/2025', calificacion: 74,   calClass: 'mid',   status: 'Completada',  statusClass: 'green' },
  { id: 5, name: 'Luis Jiménez',    initials: 'LJ', color: '#C47F0C', periodo: 'Semestral', tipo: '180°',          evaluador: 'Comité RRHH',     fecha: '30/06/2026', calificacion: null, calClass: '',      status: 'Pendiente',   statusClass: 'yellow' },
]

/* ── Filtros por rol ─────────────────────── */
const visibleVacaciones      = computed(() => isOperador.value ? vacaciones.value.filter(v => v.name === 'Ana Vargas') : vacaciones.value)
const visiblePermisos        = computed(() => isOperador.value ? permisos.value.filter(p => p.name === 'Ana Vargas') : permisos.value)
const visibleAsistencias     = computed(() => isOperador.value ? asistencias.filter(a => a.name === 'Ana Vargas') : asistencias)
const visibleIncapacidades   = computed(() => isOperador.value ? incapacidades.filter(i => i.name === 'Ana Vargas') : incapacidades)
const visibleEvaluaciones    = computed(() => isOperador.value ? evaluaciones.filter(e => e.name === 'Ana Vargas') : evaluaciones)
const visibleDocGrupos       = computed(() => {
  if (!isOperador.value) return docGrupos
  return docGrupos
    .map(g => ({ ...g, docs: g.docs.filter(d => d.name === 'Ana Vargas') }))
    .filter(g => g.docs.length > 0)
})
const ANA_CAPS = [2, 3, 5]
const visibleCapacitaciones  = computed(() => isOperador.value ? capacitaciones.value.filter(c => ANA_CAPS.includes(c.id)) : capacitaciones.value)
</script>

<style scoped>
.module-page { display: flex; flex-direction: column; gap: 18px; }

/* Header */
.page-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.page-title { font-size: 21px; font-weight: 700; color: #133C65; letter-spacing: -0.3px; }
.dark .page-title { color: #E2E8F0; }
.page-subtitle { font-size: 13.5px; color: #4A6070; margin-top: 3px; }
.dark .page-subtitle { color: #94A3B8; }

/* ── Tabs ───────────────────────────────── */
.tabs-wrap {
  overflow-x: auto;
  border-bottom: 2px solid #E8EEF4;
  flex-shrink: 0;
}
.dark .tabs-wrap { border-color: #3D5069; }

.tabs-nav {
  display: flex;
  gap: 0;
  min-width: max-content;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: #7A90A0;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.15s, border-color 0.15s;
}
.tab-btn:hover { color: #133C65; }
.dark .tab-btn:hover { color: #E2E8F0; }

.tab-btn--active {
  color: #133C65;
  border-bottom-color: #133C65;
  font-weight: 700;
}
.dark .tab-btn--active { color: #93B8D8; border-bottom-color: #93B8D8; }

/* ── Indicators ─────────────────────────── */
.indicators-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

.indicator-card {
  background: white;
  border: 1px solid #E8EEF4;
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(19,60,101,0.06);
}
.dark .indicator-card { background: #1D293D; border-color: #3D5069; }

.ind-icon {
  width: 36px; height: 36px; border-radius: 9px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ind-body { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.ind-value {
  font-size: 22px; font-weight: 800; color: #133C65; line-height: 1;
  font-variant-numeric: tabular-nums; letter-spacing: -0.5px;
}
.dark .ind-value { color: #E2E8F0; }
.ind-label { font-size: 11px; color: #7A90A0; font-weight: 500; line-height: 1.3; }
.dark .ind-label { color: #64748B; }

/* ── Filters ────────────────────────────── */
.filters-bar { display: flex; gap: 10px; flex-wrap: wrap; }
.search-wrap { position: relative; flex: 1; min-width: 200px; max-width: 340px; }
.search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #7A90A0; pointer-events: none; }
.search-input {
  width: 100%; height: 38px; padding: 0 12px 0 34px;
  border: 1.5px solid #D4E4F4; border-radius: 8px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C; outline: none;
}
.dark .search-input { background: #1D293D; border-color: #3D5069; color: #E2E8F0; }
.search-input:focus { border-color: #133C65; }
.search-input--sm { height: 34px; font-size: 13px; }

.filter-select {
  height: 38px; padding: 0 10px;
  border: 1.5px solid #D4E4F4; border-radius: 8px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C; cursor: pointer; outline: none;
}
.dark .filter-select { background: #1D293D; border-color: #3D5069; color: #E2E8F0; }

/* ── Table ──────────────────────────────── */
.data-card {
  background: white; border-radius: 12px;
  border: 1px solid #E8EEF4; box-shadow: 0 1px 4px rgba(19,60,101,0.06); overflow: hidden;
}
.dark .data-card { background: #1D293D; border-color: #3D5069; }

.data-table { width: 100%; border-collapse: collapse; }
.data-table th {
  text-align: left; padding: 11px 16px;
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px;
  color: #7A90A0; background: #F8FAFC; border-bottom: 1px solid #E8EEF4;
}
.dark .data-table th { background: #162033; border-color: #3D5069; color: #64748B; }
.data-table td { padding: 12px 16px; font-size: 13.5px; color: #1A2B3C; border-bottom: 1px solid #F0F4F8; vertical-align: middle; }
.dark .data-table td { color: #E2E8F0; border-color: #3D5069; }
.data-table tbody tr:hover { background: #F8FAFC; }
.dark .data-table tbody tr:hover { background: rgba(255,255,255,0.04); }
.data-table tbody tr:last-child td { border-bottom: none; }

.cell-user { display: flex; align-items: center; gap: 10px; }
.cell-avatar {
  width: 30px; height: 30px; border-radius: 50%;
  color: white; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.cell-avatar--sm { width: 32px; height: 32px; font-size: 11px; }
.cell-avatar--lg { width: 52px; height: 52px; font-size: 16px; flex-shrink: 0; }

.cell-actions { white-space: nowrap; }

.badge { display: inline-block; font-size: 11.5px; font-weight: 600; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }
.badge--xs { font-size: 10px; padding: 2px 7px; }
.badge--green  { background: rgba(26,145,82,0.12); color: #1A6B42; }
.badge--yellow { background: rgba(196,127,12,0.12); color: #8A5800; }
.badge--gray   { background: rgba(112,113,115,0.12); color: #606060; }
.badge--blue   { background: rgba(19,60,101,0.1); color: #133C65; }
.dark .badge--green  { background: rgba(74,222,128,0.15);  color: #4ADE80; }
.dark .badge--yellow { background: rgba(251,191,36,0.18);  color: #FBBF24; }
.dark .badge--gray   { background: rgba(148,163,184,0.18); color: #94A3B8; }
.dark .badge--blue   { background: rgba(96,165,250,0.18);  color: #60A5FA; }
.dark .badge--red    { background: rgba(248,113,113,0.18); color: #F87171; }

.action-btn {
  background: none; border: none; color: #7A90A0; cursor: pointer;
  padding: 5px; border-radius: 6px; transition: color 0.12s, background 0.12s;
  display: inline-flex; align-items: center; justify-content: center; vertical-align: middle;
}
.action-btn:hover { color: #133C65; background: #EBF3FF; }
.dark .action-btn { color: #64748B; }
.dark .action-btn:hover { color: #93B8D8; background: rgba(147,184,216,0.12); }
.action-btn--green:hover { color: #1A9152; background: rgba(26,145,82,0.1); }
.action-btn--red:hover { color: #C0392B; background: rgba(192,57,43,0.1); }

.empty-row { text-align: center; color: #B0C0D0; padding: 32px; font-size: 13.5px; }

/* ── Expedientes ────────────────────────── */
.exp-layout { display: grid; grid-template-columns: 260px 1fr; gap: 18px; align-items: start; }

.exp-sidebar {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  box-shadow: 0 1px 4px rgba(19,60,101,0.06); overflow: hidden;
}
.dark .exp-sidebar { background: #1D293D; border-color: #3D5069; }

.exp-search-wrap {
  position: relative; padding: 12px 12px 8px;
  border-bottom: 1px solid #F0F4F8;
}
.dark .exp-search-wrap { border-color: #3D5069; }

.exp-list { display: flex; flex-direction: column; max-height: 480px; overflow-y: auto; }

.exp-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  cursor: pointer; border-bottom: 1px solid #F0F4F8; transition: background 0.12s;
}
.dark .exp-item { border-color: #3D5069; }
.exp-item:hover { background: #F8FAFC; }
.dark .exp-item:hover { background: rgba(255,255,255,0.04); }
.exp-item--active { background: #EBF3FF; }
.dark .exp-item--active { background: rgba(19,60,101,0.2); }
.exp-item:last-child { border-bottom: none; }

.exp-item-info { flex: 1; min-width: 0; }
.exp-item-name { display: block; font-size: 13px; font-weight: 600; color: #1A2B3C; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dark .exp-item-name { color: #E2E8F0; }
.exp-item-role { display: block; font-size: 11px; color: #7A90A0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.exp-detail {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  box-shadow: 0 1px 4px rgba(19,60,101,0.06); padding: 22px;
  display: flex; flex-direction: column; gap: 20px;
}
.dark .exp-detail { background: #1D293D; border-color: #3D5069; }

.exp-detail-header { display: flex; align-items: center; gap: 14px; }
.exp-name { font-size: 18px; font-weight: 700; color: #133C65; }
.dark .exp-name { color: #E2E8F0; }
.exp-role { font-size: 13px; color: #4A6070; margin-top: 2px; }

.exp-sections { display: flex; flex-direction: column; gap: 18px; }

.exp-section {
  border: 1px solid #F0F4F8; border-radius: 10px; padding: 16px;
}
.dark .exp-section { border-color: #3D5069; }

.exp-section-title {
  font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;
  color: #133C65; margin-bottom: 12px;
}
.dark .exp-section-title { color: #93B8D8; }

.exp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.exp-field { display: flex; flex-direction: column; gap: 3px; }
.exp-field--full { grid-column: 1 / -1; }

.exp-field label { font-size: 11.5px; font-weight: 600; color: #7A90A0; }
.exp-field span { font-size: 13.5px; color: #1A2B3C; font-weight: 500; }
.dark .exp-field span { color: #E2E8F0; }

.exp-actions { display: flex; gap: 10px; justify-content: flex-end; }

.exp-empty {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  padding: 60px 24px; display: flex; flex-direction: column; align-items: center; gap: 12px;
  color: #B0C0D0; font-size: 13.5px; text-align: center;
}
.dark .exp-empty { background: #1D293D; border-color: #3D5069; }

/* ── Vacaciones ─────────────────────────── */
.vac-summary {
  display: flex; align-items: center; gap: 16px;
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  padding: 16px 22px; box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .vac-summary { background: #1D293D; border-color: #3D5069; }

.vac-saldo { display: flex; flex-direction: column; align-items: center; gap: 2px; padding: 0 16px; border-right: 1px solid #E8EEF4; }
.dark .vac-saldo { border-color: #3D5069; }
.vac-saldo:last-of-type { border-right: none; }
.vac-num { font-size: 28px; font-weight: 800; color: #133C65; font-variant-numeric: tabular-nums; line-height: 1; }
.dark .vac-num { color: #E2E8F0; }
.vac-lbl { font-size: 11.5px; color: #7A90A0; }
.vac-btn { margin-left: auto; flex-shrink: 0; }

/* ── Section header row ─────────────────── */
/* ── Export buttons ─────────────────────── */
.export-group { display: flex; align-items: center; gap: 6px; margin-left: auto; }
.header-actions { display: flex; align-items: center; gap: 8px; }
.export-btn {
  width: 34px; height: 34px; background: none;
  border-radius: 7px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s; flex-shrink: 0;
}
.export-btn--excel { color: #217346; border: 1.5px solid #C8E6C9; }
.export-btn--excel:hover { background: rgba(33,115,70,0.08); border-color: #217346; }
.export-btn--pdf { color: #C0392B; border: 1.5px solid #FFCDD2; }
.export-btn--pdf:hover { background: rgba(192,57,43,0.08); border-color: #C0392B; }

/* exp-detail header actions */
.exp-header-actions { display: flex; align-items: center; gap: 8px; margin-left: auto; }

.section-header-row {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
}
.section-subtitle { font-size: 15px; font-weight: 700; color: #133C65; }
.dark .section-subtitle { color: #E2E8F0; }

/* ── Coming soon ────────────────────────── */
.coming-soon-card {
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  padding: 60px 24px; display: flex; flex-direction: column;
  align-items: center; gap: 12px; text-align: center;
}
.dark .coming-soon-card { background: #1D293D; border-color: #3D5069; }
.cs-icon {
  width: 56px; height: 56px; border-radius: 14px; background: rgba(19,60,101,0.08);
  display: flex; align-items: center; justify-content: center; color: #133C65;
}
.dark .cs-icon { background: rgba(147,184,216,0.1); color: #93B8D8; }
.cs-icon svg { width: 24px; height: 24px; }
.cs-title { font-size: 18px; font-weight: 700; color: #133C65; }
.dark .cs-title { color: #E2E8F0; }
.cs-desc { font-size: 13.5px; color: #7A90A0; max-width: 340px; }

/* ── Buttons ────────────────────────────── */
.btn-primary {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13.5px; font-weight: 600; color: white; background: #133C65;
  border: none; padding: 9px 18px; border-radius: 8px; cursor: pointer;
  transition: background 0.15s; white-space: nowrap; flex-shrink: 0;
}
.btn-primary:hover { background: #0D2A47; }

.btn-outline {
  display: inline-flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 600; color: #133C65;
  background: none; border: 1.5px solid #D4E4F4; padding: 8px 16px;
  border-radius: 8px; cursor: pointer; transition: all 0.15s;
}
.btn-outline:hover { background: #EBF3FF; border-color: #133C65; }

/* ── Modal ──────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(10,24,40,0.5);
  backdrop-filter: blur(3px); z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.modal-box {
  background: white; border-radius: 16px; padding: 30px;
  width: 100%; max-width: 640px; position: relative;
  box-shadow: 0 24px 80px rgba(19,60,101,0.22); max-height: 90vh; overflow-y: auto;
}
.dark .modal-box { background: #1D293D; }
.modal-close {
  position: absolute; top: 16px; right: 16px;
  width: 30px; height: 30px; border-radius: 7px;
  background: #F4F6F8; border: none; color: #7A90A0; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: background 0.12s;
}
.modal-close:hover { background: #E8EEF4; }
.dark .modal-close { background: #162033; }
.modal-title { font-size: 20px; font-weight: 700; color: #133C65; margin-bottom: 4px; }
.dark .modal-title { color: #E2E8F0; }
.modal-subtitle { font-size: 13.5px; color: #4A6070; margin-bottom: 20px; }

.modal-form { display: flex; flex-direction: column; gap: 14px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-section-title {
  font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;
  color: #7A90A0; border-bottom: 1px solid #F0F4F8; padding-bottom: 6px;
}
.dark .form-section-title { border-color: #3D5069; }
.form-field { display: flex; flex-direction: column; gap: 5px; }
.form-field--full { grid-column: 1 / -1; }
.form-field label { font-size: 12.5px; font-weight: 600; color: #4A6070; }
.dark .form-field label { color: #94A3B8; }
.form-field input, .form-field select, .form-field textarea {
  height: 38px; padding: 0 12px;
  border: 1.5px solid #D4E4F4; border-radius: 7px;
  font-size: 13.5px; font-family: inherit; background: white; color: #1A2B3C; outline: none;
  transition: border-color 0.15s;
}
.form-field textarea { height: auto; padding: 10px 12px; resize: vertical; }
.form-field input[type="file"] { padding: 6px 10px; height: auto; }
.dark .form-field input, .dark .form-field select, .dark .form-field textarea {
  background: #162033; border-color: #3D5069; color: #E2E8F0;
}
.form-field input:focus, .form-field select:focus, .form-field textarea:focus {
  border-color: #133C65;
}
.req { color: #C0392B; }
.modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* ── Documentos ─────────────────────────── */
.doc-filters { display: flex; gap: 10px; flex-wrap: wrap; }

.doc-groups { display: flex; flex-direction: column; gap: 20px; }

.doc-group-header {
  display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
}
.doc-group-icon {
  width: 30px; height: 30px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.doc-group-title { font-size: 14px; font-weight: 700; color: #133C65; }
.dark .doc-group-title { color: #E2E8F0; }
.doc-group-count {
  font-size: 11px; font-weight: 600; color: #7A90A0;
  background: #F0F4F8; border-radius: 20px; padding: 2px 8px;
}
.dark .doc-group-count { background: #2D3F55; }

.doc-tipo {
  display: flex; align-items: center; gap: 6px;
  font-weight: 500; color: #1A2B3C;
}
.dark .doc-tipo { color: #E2E8F0; }

.doc-vence { font-size: 12.5px; color: #1A2B3C; }
.dark .doc-vence { color: #E2E8F0; }
.doc-vence-alert { font-size: 12.5px; font-weight: 700; color: #C47F0C; }
.doc-vence-na { font-size: 12.5px; color: #B0C0D0; }

.file-drop {
  border: 2px dashed #D4E4F4; border-radius: 10px;
  padding: 24px 20px; display: flex; flex-direction: column;
  align-items: center; gap: 8px; text-align: center; background: #F8FAFC;
  cursor: pointer; transition: border-color 0.15s;
}
.dark .file-drop { background: #162033; border-color: #3D5069; }
.file-drop:hover { border-color: #133C65; }
.file-drop p { font-size: 13.5px; color: #4A6070; margin: 0; }
.dark .file-drop p { color: #94A3B8; }
.file-drop small { font-size: 11.5px; color: #B0C0D0; }
.file-link { color: #133C65; font-weight: 600; cursor: pointer; text-decoration: underline; }
.dark .file-link { color: #93B8D8; }

/* ── Asistencia ─────────────────────────── */
.asist-summary {
  display: flex; gap: 0;
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  overflow: hidden; box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .asist-summary { background: #1D293D; border-color: #3D5069; }

.asist-stat {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 18px 12px; border-right: 1px solid #E8EEF4;
}
.dark .asist-stat { border-color: #3D5069; }
.asist-stat:last-child { border-right: none; }

.asist-num {
  font-size: 30px; font-weight: 800; color: #133C65;
  font-variant-numeric: tabular-nums; line-height: 1;
}
.dark .asist-num { color: #E2E8F0; }
.asist-num--red    { color: #C0392B; }
.asist-num--yellow { color: #C47F0C; }
.asist-num--blue   { color: #1565C0; }
.asist-lbl { font-size: 12px; color: #7A90A0; font-weight: 500; }

.date-range { display: flex; align-items: center; gap: 6px; }
.date-sep { font-size: 13px; color: #7A90A0; }

.time-badge {
  display: inline-block; font-size: 13px; font-weight: 600;
  font-family: monospace; color: #133C65; letter-spacing: 0.5px;
}
.dark .time-badge { color: #93B8D8; }
.time-badge--pending { color: #B0C0D0; font-weight: 400; }

.font-mono { font-family: monospace; font-size: 13px; font-weight: 600; color: #1A2B3C; }
.dark .font-mono { color: #E2E8F0; }
.text-muted { font-size: 13px; color: #B0C0D0; }
.text-muted-sm { font-size: 12.5px; color: #7A90A0; }

/* ── Capacitaciones ─────────────────────── */
.cap-summary {
  display: flex; gap: 0;
  background: white; border: 1px solid #E8EEF4; border-radius: 12px;
  overflow: hidden; box-shadow: 0 1px 4px rgba(19,60,101,0.06);
}
.dark .cap-summary { background: #1D293D; border-color: #3D5069; }

.cap-stat {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 18px 12px; border-right: 1px solid #E8EEF4;
}
.dark .cap-stat { border-color: #3D5069; }
.cap-stat:last-child { border-right: none; }

.cap-num {
  font-size: 30px; font-weight: 800; color: #133C65;
  font-variant-numeric: tabular-nums; line-height: 1;
}
.dark .cap-num { color: #E2E8F0; }
.cap-num--blue  { color: #1565C0; }
.cap-num--green { color: #1A9152; }
.cap-num--teal  { color: #00808C; }
.cap-lbl { font-size: 12px; color: #7A90A0; font-weight: 500; }

.cap-nombre { display: flex; flex-direction: column; gap: 2px; }
.cap-titulo { font-size: 13.5px; font-weight: 600; color: #1A2B3C; }
.dark .cap-titulo { color: #E2E8F0; }
.cap-depto { font-size: 11.5px; color: #7A90A0; }

.modalidad-badge {
  display: inline-block; font-size: 11.5px; font-weight: 600;
  padding: 3px 9px; border-radius: 20px;
}
.modalidad--virtual    { background: rgba(21,101,192,0.1); color: #1565C0; }
.modalidad--presencial { background: rgba(26,145,82,0.1);  color: #1A6B42; }
.modalidad--mixta      { background: rgba(123,63,160,0.1); color: #7B3FA0; }

.asistentes-cell { display: flex; flex-direction: column; align-items: center; }
.asistentes-num { font-size: 16px; font-weight: 800; color: #133C65; font-variant-numeric: tabular-nums; }
.dark .asistentes-num { color: #E2E8F0; }
.asistentes-lbl { font-size: 10px; color: #7A90A0; }

/* ── Evaluaciones ───────────────────────── */
.calificacion-cell { display: flex; align-items: baseline; gap: 2px; }
.calificacion-num {
  font-size: 18px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1;
}
.cal--good { color: #1A9152; }
.cal--mid  { color: #C47F0C; }
.cal--low  { color: #C0392B; }
.calificacion-max { font-size: 11.5px; color: #7A90A0; }

.eval-competencias { display: flex; flex-direction: column; gap: 10px; }
.comp-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.comp-label { font-size: 13.5px; color: #1A2B3C; font-weight: 500; }
.dark .comp-label { color: #E2E8F0; }
.comp-stars { display: flex; gap: 4px; }
.star-btn {
  background: none; border: none; cursor: pointer; padding: 0;
  transition: transform 0.1s;
}
.star-btn:hover { transform: scale(1.2); }
.star-btn:hover svg { stroke: #C47F0C; }

/* ── Formulario extras ──────────────────── */
.section-desc { font-size: 13px; color: #7A90A0; margin-top: 2px; }

.badge--blue-light { background: rgba(21,101,192,0.1); color: #1565C0; }
.dark .badge--blue-light { background: rgba(147,197,253,0.18); color: #93C5FD; }

.checkbox-group { display: flex; flex-wrap: wrap; gap: 8px; padding: 6px 0; }
.checkbox-item {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: #1A2B3C; cursor: pointer;
}
.dark .checkbox-item { color: #E2E8F0; }
.checkbox-item input[type="checkbox"] { accent-color: #133C65; width: 15px; height: 15px; }

/* ── Responsive ─────────────────────────── */
@media (max-width: 1200px) {
  .indicators-grid { grid-template-columns: repeat(5, 1fr); }
}
@media (max-width: 1000px) {
  .indicators-grid { grid-template-columns: repeat(3, 1fr); }
  .exp-layout { grid-template-columns: 1fr; }
  .asist-summary, .cap-summary { flex-wrap: wrap; }
  .asist-stat, .cap-stat { border-right: none; border-bottom: 1px solid #E8EEF4; }
}
@media (max-width: 700px) {
  .indicators-grid { grid-template-columns: repeat(2, 1fr); }
  .form-row { grid-template-columns: 1fr; }
  .comp-item { flex-direction: column; align-items: flex-start; gap: 6px; }
}
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 10px; }
  .page-header .btn-primary { width: 100%; justify-content: center; }
  .data-card { overflow-x: auto; }
  .tab-list { overflow-x: auto; white-space: nowrap; padding-bottom: 2px; }
  .tab-list::-webkit-scrollbar { height: 0; }
  .modal-body, .modal-box { padding: 16px !important; }
}
</style>
